from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path

import tensorflow as tf
from tensorflow import keras

from .models import build_cnn_model
from .utils import ensure_directory, save_class_names


@dataclass(slots=True)
class TrainingConfig:
    data_dir: Path
    model_dir: Path
    image_size: tuple[int, int] = (224, 224)
    batch_size: int = 32
    epochs: int = 10
    validation_split: float = 0.2
    seed: int = 42
    model_name: str = "skin_cnn"


def train_model(config: TrainingConfig) -> dict:
    if not config.data_dir.exists():
        raise FileNotFoundError(f"Dataset directory does not exist: {config.data_dir}")

    ensure_directory(config.model_dir)

    train_ds = tf.keras.utils.image_dataset_from_directory(
        config.data_dir,
        validation_split=config.validation_split,
        subset="training",
        seed=config.seed,
        image_size=config.image_size,
        batch_size=config.batch_size,
        label_mode="int",
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        config.data_dir,
        validation_split=config.validation_split,
        subset="validation",
        seed=config.seed,
        image_size=config.image_size,
        batch_size=config.batch_size,
        label_mode="int",
    )

    class_names = train_ds.class_names
    if not class_names:
        raise ValueError("No classes found in dataset directory.")

    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(autotune)
    val_ds = val_ds.prefetch(autotune)

    model = build_cnn_model(
        num_classes=len(class_names),
        input_shape=(config.image_size[0], config.image_size[1], 3),
    )

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    model_path = config.model_dir / f"{config.model_name}_{timestamp}.keras"
    class_names_path = config.model_dir / f"{config.model_name}_{timestamp}_classes.json"
    metadata_path = config.model_dir / f"{config.model_name}_{timestamp}_metadata.json"

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=3,
            restore_best_weights=True,
        ),
        keras.callbacks.ModelCheckpoint(
            filepath=str(model_path),
            monitor="val_loss",
            save_best_only=True,
        ),
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=config.epochs,
        callbacks=callbacks,
        verbose=1,
    )

    loss, accuracy = model.evaluate(val_ds, verbose=0)
    save_class_names(class_names, class_names_path)

    metrics = {
        "val_loss": float(loss),
        "val_accuracy": float(accuracy),
        "history": {key: [float(v) for v in values] for key, values in history.history.items()},
    }

    metadata = {
        "created_at_utc": timestamp,
        "class_names": class_names,
        "training_config": {
            **asdict(config),
            "data_dir": str(config.data_dir),
            "model_dir": str(config.model_dir),
            "image_size": list(config.image_size),
        },
        "artifacts": {
            "model_path": str(model_path),
            "class_names_path": str(class_names_path),
        },
        "metrics": metrics,
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    return {
        "status": "success",
        "model_path": str(model_path),
        "class_names_path": str(class_names_path),
        "metadata_path": str(metadata_path),
        "metrics": metrics,
    }
