# utils.py - Funciones utilitarias para el clasificador de imágenes
# Este archivo contiene funciones auxiliares para manejo de archivos,
# validación de imágenes, y operaciones comunes en el procesamiento de datos.

import json
from pathlib import Path
from typing import Sequence

# Extensiones de archivo de imagen permitidas para validación
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def ensure_directory(path: Path) -> None:
    """
    Asegura que un directorio existe, creándolo si es necesario.

    Crea el directorio y todos los directorios padre necesarios.
    No falla si el directorio ya existe.

    Args:
        path: Ruta del directorio a crear
    """
    path.mkdir(parents=True, exist_ok=True)


def save_class_names(class_names: Sequence[str], destination: Path) -> None:
    """
    Guarda una lista de nombres de clases en un archivo JSON.

    Args:
        class_names: Secuencia de nombres de clases a guardar
        destination: Ruta del archivo donde guardar (se crea si no existe)
    """
    destination.write_text(json.dumps(list(class_names), indent=2), encoding="utf-8")


def load_class_names(source: Path) -> list[str]:
    """
    Carga nombres de clases desde un archivo JSON.

    Args:
        source: Ruta del archivo JSON con los nombres de clases

    Returns:
        Lista de nombres de clases como strings

    Raises:
        ValueError: Si el archivo no contiene una lista no vacía
        FileNotFoundError: Si el archivo no existe
        JSONDecodeError: Si el archivo no es JSON válido
    """
    data = json.loads(source.read_text(encoding="utf-8"))
    if not isinstance(data, list) or not data:
        raise ValueError("Class names file must contain a non-empty list.")
    return [str(item) for item in data]


def is_allowed_image_filename(filename: str) -> bool:
    """
    Verifica si un nombre de archivo tiene una extensión de imagen permitida.

    Args:
        filename: Nombre del archivo a verificar

    Returns:
        True si la extensión está en ALLOWED_IMAGE_EXTENSIONS, False en caso contrario
    """
    return Path(filename).suffix.lower() in ALLOWED_IMAGE_EXTENSIONS
