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
    predicted_class: str
    confidence: float
    top_k: list[dict]


class Predictor:
    def __init__(
        self,
        model_path: Path,
        class_names_path: Path,
        image_size: tuple[int, int] = (224, 224),
    ) -> None:
        self.model_path = model_path
        self.class_names_path = class_names_path
        self.image_size = image_size
        self._model: keras.Model | None = None
        self._class_names: list[str] | None = None

    def _load_artifacts(self) -> None:
        if self._model is None:
            if not self.model_path.exists():
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            self._model = keras.models.load_model(self.model_path)

        if self._class_names is None:
            if not self.class_names_path.exists():
                raise FileNotFoundError(f"Class names file not found: {self.class_names_path}")
            self._class_names = load_class_names(self.class_names_path)

    def predict_bytes(self, image_bytes: bytes, top_k: int = 3) -> PredictionResult:
        self._load_artifacts()

        try:
            image = Image.open(BytesIO(image_bytes)).convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError("Uploaded file is not a valid image.") from exc

        image = image.resize(self.image_size)
        image_array = np.array(image, dtype=np.float32) / 255.0
        image_array = np.expand_dims(image_array, axis=0)

        probabilities = self._model.predict(image_array, verbose=0)[0]
        sorted_indices = np.argsort(probabilities)[::-1]

        results = []
        for idx in sorted_indices[:top_k]:
            results.append(
                {
                    "class": self._class_names[int(idx)],
                    "probability": float(probabilities[int(idx)]),
                }
            )

        best = results[0]
        return PredictionResult(
            predicted_class=best["class"],
            confidence=best["probability"],
            top_k=results,
        )

    def predict_file(self, image_path: Path, top_k: int = 3) -> PredictionResult:
        image_bytes = image_path.read_bytes()
        return self.predict_bytes(image_bytes=image_bytes, top_k=top_k)
