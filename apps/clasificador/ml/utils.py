import json
from pathlib import Path
from typing import Sequence

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def ensure_directory(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save_class_names(class_names: Sequence[str], destination: Path) -> None:
    destination.write_text(json.dumps(list(class_names), indent=2), encoding="utf-8")


def load_class_names(source: Path) -> list[str]:
    data = json.loads(source.read_text(encoding="utf-8"))
    if not isinstance(data, list) or not data:
        raise ValueError("Class names file must contain a non-empty list.")
    return [str(item) for item in data]


def is_allowed_image_filename(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_IMAGE_EXTENSIONS
