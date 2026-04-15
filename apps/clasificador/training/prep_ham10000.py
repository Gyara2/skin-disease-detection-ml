import argparse
import csv
import json
import random
import shutil
from collections import Counter, defaultdict
from pathlib import Path

HAM10000_CLASSES = ("akiec", "bcc", "bkl", "df", "mel", "nv", "vasc")
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".bmp", ".webp")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prepare HAM10000 into class folders with train/val/test splits.",
    )
    parser.add_argument("--metadata-csv", type=Path, required=True)
    parser.add_argument("--images-dir", type=Path, nargs="+", required=True)
    parser.add_argument("--output-dir", type=Path, default=Path("data/raw/ham10000/splits"))
    parser.add_argument("--train-ratio", type=float, default=0.7)
    parser.add_argument("--val-ratio", type=float, default=0.15)
    parser.add_argument("--test-ratio", type=float, default=0.15)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--mode",
        choices=("copy", "symlink"),
        default="copy",
        help="copy files or create symlinks in split folders",
    )
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def _validate_ratios(train_ratio: float, val_ratio: float, test_ratio: float) -> None:
    if train_ratio <= 0 or val_ratio <= 0 or test_ratio <= 0:
        raise ValueError("All split ratios must be > 0.")
    total = train_ratio + val_ratio + test_ratio
    if abs(total - 1.0) > 1e-8:
        raise ValueError("train_ratio + val_ratio + test_ratio must equal 1.0")


def _index_images(images_dirs: list[Path]) -> dict[str, Path]:
    image_map: dict[str, Path] = {}
    for base_dir in images_dirs:
        if not base_dir.exists():
            raise FileNotFoundError(f"Images directory does not exist: {base_dir}")
        for image_path in base_dir.rglob("*"):
            if not image_path.is_file() or image_path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue
            image_id = image_path.stem
            if image_id in image_map:
                raise ValueError(
                    f"Duplicated image_id '{image_id}' found in both {image_map[image_id]} and {image_path}"
                )
            image_map[image_id] = image_path
    return image_map


def _read_metadata(metadata_csv: Path, image_map: dict[str, Path]) -> list[dict[str, str]]:
    if not metadata_csv.exists():
        raise FileNotFoundError(f"Metadata CSV does not exist: {metadata_csv}")

    rows: list[dict[str, str]] = []
    missing_images: list[str] = []

    with metadata_csv.open("r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        required_columns = {"image_id", "dx"}
        if not required_columns.issubset(reader.fieldnames or set()):
            raise ValueError("Metadata CSV must contain 'image_id' and 'dx' columns.")

        for row in reader:
            image_id = (row.get("image_id") or "").strip()
            label = (row.get("dx") or "").strip()
            if not image_id or not label:
                continue
            if label not in HAM10000_CLASSES:
                continue
            if image_id not in image_map:
                missing_images.append(image_id)
                continue
            rows.append({"image_id": image_id, "dx": label})

    if missing_images:
        preview = ", ".join(missing_images[:10])
        raise FileNotFoundError(
            f"Metadata references {len(missing_images)} images not found in --images-dir. Examples: {preview}"
        )

    if not rows:
        raise ValueError("No valid HAM10000 rows were found after filtering metadata.")

    return rows


def _stratified_split(
    rows: list[dict[str, str]],
    train_ratio: float,
    val_ratio: float,
    seed: int,
) -> list[dict[str, str]]:
    by_class: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        by_class[row["dx"]].append(row)

    rng = random.Random(seed)
    output_rows: list[dict[str, str]] = []

    for class_name in HAM10000_CLASSES:
        class_rows = by_class.get(class_name, [])
        if not class_rows:
            continue

        rng.shuffle(class_rows)
        total = len(class_rows)
        train_count = int(total * train_ratio)
        val_count = int(total * val_ratio)

        if train_count == 0 and total > 0:
            train_count = 1
        if train_count + val_count >= total:
            val_count = max(0, total - train_count - 1)

        for idx, row in enumerate(class_rows):
            if idx < train_count:
                split = "train"
            elif idx < train_count + val_count:
                split = "val"
            else:
                split = "test"
            output_rows.append({**row, "split": split})

    return output_rows


def _prepare_output_dir(output_dir: Path, overwrite: bool) -> None:
    if output_dir.exists() and overwrite:
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)


def _materialize_split(
    rows: list[dict[str, str]],
    image_map: dict[str, Path],
    output_dir: Path,
    mode: str,
) -> list[dict[str, str]]:
    manifest: list[dict[str, str]] = []

    for row in rows:
        split = row["split"]
        class_name = row["dx"]
        image_id = row["image_id"]
        source_path = image_map[image_id]
        target_dir = output_dir / split / class_name
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / source_path.name

        if target_path.exists() or target_path.is_symlink():
            target_path.unlink()

        if mode == "symlink":
            target_path.symlink_to(source_path.resolve())
        else:
            shutil.copy2(source_path, target_path)

        manifest.append(
            {
                "image_id": image_id,
                "dx": class_name,
                "split": split,
                "source_path": str(source_path),
                "target_path": str(target_path),
            }
        )

    return manifest


def _validate_no_overlap(rows: list[dict[str, str]]) -> None:
    split_to_ids: dict[str, set[str]] = {"train": set(), "val": set(), "test": set()}
    for row in rows:
        split_to_ids[row["split"]].add(row["image_id"])

    intersections = {
        "train_val": split_to_ids["train"] & split_to_ids["val"],
        "train_test": split_to_ids["train"] & split_to_ids["test"],
        "val_test": split_to_ids["val"] & split_to_ids["test"],
    }
    for key, values in intersections.items():
        if values:
            raise ValueError(f"Data leakage detected in {key}: {len(values)} overlapping image_ids.")


def _write_manifest_and_summary(output_dir: Path, manifest: list[dict[str, str]]) -> None:
    manifest_path = output_dir / "split_manifest.csv"
    with manifest_path.open("w", encoding="utf-8", newline="") as handle:
        fieldnames = ["image_id", "dx", "split", "source_path", "target_path"]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(manifest)

    split_counts = Counter(row["split"] for row in manifest)
    class_counts = Counter(row["dx"] for row in manifest)
    class_split_counts: dict[str, dict[str, int]] = {class_name: {"train": 0, "val": 0, "test": 0} for class_name in HAM10000_CLASSES}
    for row in manifest:
        class_split_counts[row["dx"]][row["split"]] += 1

    summary = {
        "total_images": len(manifest),
        "split_counts": dict(split_counts),
        "class_counts": dict(class_counts),
        "class_split_counts": class_split_counts,
    }
    summary_path = output_dir / "split_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")


def main() -> None:
    args = parse_args()
    _validate_ratios(args.train_ratio, args.val_ratio, args.test_ratio)

    image_map = _index_images(args.images_dir)
    rows = _read_metadata(args.metadata_csv, image_map)
    split_rows = _stratified_split(rows, args.train_ratio, args.val_ratio, args.seed)
    _validate_no_overlap(split_rows)

    _prepare_output_dir(args.output_dir, args.overwrite)
    manifest = _materialize_split(split_rows, image_map, args.output_dir, args.mode)
    _write_manifest_and_summary(args.output_dir, manifest)

    print("HAM10000 preparation completed")
    print(f"Output dir: {args.output_dir}")
    print(f"Images processed: {len(manifest)}")


if __name__ == "__main__":
    main()
