# prep_ham10000.py - Preparación del dataset HAM10000 para entrenamiento
# Este script procesa el dataset HAM10000, creando splits estratificados train/val/test
# organizados en carpetas por clase, con opciones de copia o enlaces simbólicos.

import argparse
import csv
import json
import random
import shutil
from collections import Counter, defaultdict
from pathlib import Path

# Clases del dataset HAM10000 (enfermedades de la piel)
HAM10000_CLASSES = ("akiec", "bcc", "bkl", "df", "mel", "nv", "vasc")

# Extensiones de archivo de imagen soportadas
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".bmp", ".webp")


def parse_args() -> argparse.Namespace:
    """
    Parsea los argumentos de línea de comandos para la preparación del dataset.

    Returns:
        Namespace con todos los argumentos parseados
    """
    parser = argparse.ArgumentParser(
        description="Prepare HAM10000 into class folders with train/val/test splits.",
    )
    parser.add_argument(
        "--metadata-csv",
        type=Path,
        required=True,
        help="Path to HAM10000 metadata CSV file"
    )
    parser.add_argument(
        "--images-dir",
        type=Path,
        nargs="+",
        required=True,
        help="One or more directories containing HAM10000 images"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("data/raw/ham10000/splits"),
        help="Output directory for organized splits"
    )
    parser.add_argument(
        "--train-ratio",
        type=float,
        default=0.7,
        help="Fraction of data for training (default: 0.7)"
    )
    parser.add_argument(
        "--val-ratio",
        type=float,
        default=0.15,
        help="Fraction of data for validation (default: 0.15)"
    )
    parser.add_argument(
        "--test-ratio",
        type=float,
        default=0.15,
        help="Fraction of data for testing (default: 0.15)"
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducible splits"
    )
    parser.add_argument(
        "--mode",
        choices=("copy", "symlink"),
        default="copy",
        help="copy files or create symlinks in split folders"
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite output directory if it exists"
    )
    return parser.parse_args()


def _validate_ratios(train_ratio: float, val_ratio: float, test_ratio: float) -> None:
    """
    Valida que los ratios de split sean válidos.

    Args:
        train_ratio: Proporción para entrenamiento
        val_ratio: Proporción para validación
        test_ratio: Proporción para test

    Raises:
        ValueError: Si los ratios no son positivos o no suman 1
    """
    if train_ratio <= 0 or val_ratio <= 0 or test_ratio <= 0:
        raise ValueError("All split ratios must be > 0.")
    total = train_ratio + val_ratio + test_ratio
    if abs(total - 1.0) > 1e-8:
        raise ValueError("train_ratio + val_ratio + test_ratio must equal 1.0")


def _index_images(images_dirs: list[Path]) -> dict[str, Path]:
    """
    Indexa todas las imágenes encontradas en los directorios especificados.

    Args:
        images_dirs: Lista de directorios donde buscar imágenes

    Returns:
        Diccionario image_id -> ruta completa de la imagen

    Raises:
        FileNotFoundError: Si algún directorio no existe
        ValueError: Si hay IDs de imagen duplicados
    """
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
    """
    Lee y valida el archivo CSV de metadata de HAM10000.

    Args:
        metadata_csv: Ruta al archivo CSV de metadata
        image_map: Mapa de imágenes indexadas

    Returns:
        Lista de diccionarios con image_id y dx (diagnóstico)

    Raises:
        FileNotFoundError: Si el CSV no existe o faltan imágenes
        ValueError: Si el CSV no tiene las columnas requeridas
    """
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
    """
    Crea splits estratificados manteniendo la distribución de clases.

    Args:
        rows: Lista de filas con image_id y dx
        train_ratio: Proporción para entrenamiento
        val_ratio: Proporción para validación
        seed: Semilla para reproducibilidad

    Returns:
        Lista de filas con campo adicional 'split' ('train', 'val', 'test')
    """
    # Agrupar por clase
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

        # Asegurar al menos 1 imagen en train si hay datos
        if train_count == 0 and total > 0:
            train_count = 1
        # Ajustar val_count si excede el total disponible
        if train_count + val_count >= total:
            val_count = max(0, total - train_count - 1)

        # Asignar split a cada imagen
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
    """
    Prepara el directorio de salida, eliminándolo si overwrite=True.

    Args:
        output_dir: Directorio a preparar
        overwrite: Si eliminar el directorio existente
    """
    if output_dir.exists() and overwrite:
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)


def _materialize_split(
    rows: list[dict[str, str]],
    image_map: dict[str, Path],
    output_dir: Path,
    mode: str,
) -> list[dict[str, str]]:
    """
    Crea la estructura de directorios y copia/enlaza las imágenes.

    Args:
        rows: Filas con split asignado
        image_map: Mapa de imágenes indexadas
        output_dir: Directorio base de salida
        mode: 'copy' para copiar archivos, 'symlink' para crear enlaces

    Returns:
        Manifiesto con información de cada imagen procesada
    """
    manifest: list[dict[str, str]] = []

    for row in rows:
        split = row["split"]
        class_name = row["dx"]
        image_id = row["image_id"]
        source_path = image_map[image_id]
        target_dir = output_dir / split / class_name
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / source_path.name

        # Eliminar archivo existente si hay
        if target_path.exists() or target_path.is_symlink():
            target_path.unlink()

        # Copiar o crear enlace simbólico
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
    """
    Valida que no haya solapamiento entre los splits train/val/test.

    Args:
        rows: Filas con split asignado

    Raises:
        ValueError: Si hay imágenes duplicadas entre splits
    """
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
    """
    Escribe el manifiesto CSV y el resumen JSON de los splits.

    Args:
        output_dir: Directorio donde escribir los archivos
        manifest: Lista de imágenes procesadas con metadata
    """
    # Escribir manifiesto CSV
    manifest_path = output_dir / "split_manifest.csv"
    with manifest_path.open("w", encoding="utf-8", newline="") as handle:
        fieldnames = ["image_id", "dx", "split", "source_path", "target_path"]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(manifest)

    # Calcular estadísticas
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
    """
    Función principal que ejecuta todo el pipeline de preparación.
    """
    args = parse_args()
    _validate_ratios(args.train_ratio, args.val_ratio, args.test_ratio)

    # Indexar imágenes
    image_map = _index_images(args.images_dir)

    # Leer y validar metadata
    rows = _read_metadata(args.metadata_csv, image_map)

    # Crear splits estratificados
    split_rows = _stratified_split(rows, args.train_ratio, args.val_ratio, args.seed)

    # Validar que no haya solapamiento
    _validate_no_overlap(split_rows)

    # Preparar directorio de salida
    _prepare_output_dir(args.output_dir, args.overwrite)

    # Materializar los splits (copiar/enlazar archivos)
    manifest = _materialize_split(split_rows, image_map, args.output_dir, args.mode)

    # Escribir manifiesto y resumen
    _write_manifest_and_summary(args.output_dir, manifest)

    # Reporte final
    print("HAM10000 preparation completed")
    print(f"Output dir: {args.output_dir}")
    print(f"Images processed: {len(manifest)}")


if __name__ == "__main__":
    main()
