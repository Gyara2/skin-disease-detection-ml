# inference.py - Módulo para realizar inferencias con modelos de clasificación de imágenes
# Este archivo contiene la clase Predictor que carga modelos TensorFlow/Keras
# y realiza predicciones en imágenes de enfermedades de la piel.

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, UnidentifiedImageError
from tensorflow import keras

from .utils import load_class_names


@dataclass(slots=True)
class PredictionResult:
    """Resultado de una predicción individual con clase, confianza y top-k resultados."""
    predicted_class: str  # Nombre de la clase predicha con mayor confianza
    confidence: float     # Probabilidad/confianza de la predicción (0-1)
    top_k: list[dict]     # Lista de las top-k predicciones con clase y probabilidad


class Predictor:
    """
    Clase para realizar predicciones usando un modelo de clasificación de imágenes.

    Maneja la carga lazy de modelos y nombres de clases, preprocesamiento de imágenes,
    y ejecución de inferencias con TensorFlow/Keras.
    """

    def __init__(
        self,
        model_path: Path,
        class_names_path: Path,
        image_size: tuple[int, int] = (224, 224),
    ) -> None:
        """
        Inicializa el predictor con rutas a modelo y clases.

        Args:
            model_path: Ruta al archivo del modelo Keras (.keras)
            class_names_path: Ruta al archivo JSON con nombres de clases
            image_size: Tamaño al que redimensionar las imágenes (ancho, alto)
        """
        self.model_path = model_path
        self.class_names_path = class_names_path
        self.image_size = image_size
        self._model: keras.Model | None = None  # Modelo cargado (lazy loading)
        self._class_names: list[str] | None = None  # Nombres de clases (lazy loading)

    def _load_artifacts(self) -> None:
        """
        Carga el modelo y nombres de clases de forma lazy.

        Solo carga cuando se necesita por primera vez. Incluye validaciones
        para archivos Git LFS y existencia de archivos.
        """
        # Cargar modelo si no está cargado
        if self._model is None:
            if not self.model_path.exists():
                raise FileNotFoundError(f"Model file not found: {self.model_path}")

            # Verificar que no sea un archivo Git LFS pointer
            try:
                header = self.model_path.read_text(encoding="utf-8", errors="ignore")[:200]
            except OSError:
                header = ""
            if "git-lfs.github.com/spec/v1" in header:
                raise FileNotFoundError(
                    "Model artifact is a Git LFS pointer, not the real .keras file. "
                    "Run `git lfs pull` in the repository to download model binaries."
                )

            self._model = keras.models.load_model(self.model_path)

        # Cargar nombres de clases si no están cargados
        if self._class_names is None:
            if not self.class_names_path.exists():
                raise FileNotFoundError(f"Class names file not found: {self.class_names_path}")
            self._class_names = load_class_names(self.class_names_path)

    def predict_bytes(self, image_bytes: bytes, top_k: int = 3) -> PredictionResult:
        """
        Realiza una predicción a partir de bytes de imagen.

        Args:
            image_bytes: Bytes de la imagen a clasificar
            top_k: Número de predicciones top a retornar

        Returns:
            PredictionResult con clase predicha, confianza y top-k resultados

        Raises:
            ValueError: Si la imagen no es válida
        """
        self._load_artifacts()

        # Abrir y validar imagen
        try:
            image = Image.open(BytesIO(image_bytes)).convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError("Uploaded file is not a valid image.") from exc

        # Preprocesar imagen: redimensionar y normalizar
        image = image.resize(self.image_size)
        image_array = np.array(image, dtype=np.float32) / 255.0
        image_array = np.expand_dims(image_array, axis=0)  # Añadir dimensión batch

        # Realizar predicción
        probabilities = self._model.predict(image_array, verbose=0)[0]
        sorted_indices = np.argsort(probabilities)[::-1]  # Ordenar por probabilidad descendente

        # Construir resultados top-k
        results = []
        for idx in sorted_indices[:top_k]:
            results.append(
                {
                    "class": self._class_names[int(idx)],
                    "probability": float(probabilities[int(idx)]),
                }
            )

        # Retornar resultado con mejor predicción
        best = results[0]
        return PredictionResult(
            predicted_class=best["class"],
            confidence=best["probability"],
            top_k=results,
        )

    def predict_file(self, image_path: Path, top_k: int = 3) -> PredictionResult:
        """
        Realiza una predicción a partir de un archivo de imagen.

        Args:
            image_path: Ruta al archivo de imagen
            top_k: Número de predicciones top a retornar

        Returns:
            PredictionResult con resultados de predicción
        """
        image_bytes = image_path.read_bytes()
        return self.predict_bytes(image_bytes=image_bytes, top_k=top_k)

    def predict_probabilities(self, image_bytes: bytes) -> dict[str, float]:
        """
        Retorna probabilidades para todas las clases sin formatear resultados.

        Útil para APIs que necesitan todas las probabilidades crudas.

        Args:
            image_bytes: Bytes de la imagen a clasificar

        Returns:
            Diccionario con nombre de clase -> probabilidad para todas las clases

        Raises:
            ValueError: Si la imagen no es válida o clases no están cargadas
        """
        self._load_artifacts()

        # Abrir y validar imagen
        try:
            image = Image.open(BytesIO(image_bytes)).convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError("Uploaded file is not a valid image.") from exc

        # Preprocesar imagen
        image = image.resize(self.image_size)
        image_array = np.array(image, dtype=np.float32) / 255.0
        image_array = np.expand_dims(image_array, axis=0)

        # Realizar predicción
        probabilities = self._model.predict(image_array, verbose=0)[0]
        if self._class_names is None:
            raise ValueError("Class names are not loaded.")

        # Retornar diccionario clase -> probabilidad para todas las clases
        return {
            self._class_names[int(idx)]: float(probabilities[int(idx)])
            for idx in range(len(self._class_names))
        }
