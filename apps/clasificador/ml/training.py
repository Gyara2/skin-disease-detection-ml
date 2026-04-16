# training.py - Módulo para entrenamiento de modelos de clasificación de imágenes
# Este archivo contiene la lógica completa para entrenar modelos CNN en datasets
# de imágenes de enfermedades de la piel, con soporte para splits explícitos o automáticos.

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
    """
    Configuración completa para el entrenamiento de un modelo de clasificación.

    Define todos los parámetros necesarios para el proceso de entrenamiento,
    incluyendo rutas de datos, hiperparámetros del modelo y configuración de datos.
    """
    data_dir: Path           # Directorio raíz del dataset (para split automático)
    model_dir: Path          # Directorio donde guardar modelos y artefactos
    train_dir: Path | None = None    # Directorio de entrenamiento (opcional, para split explícito)
    val_dir: Path | None = None      # Directorio de validación (opcional, para split explícito)
    test_dir: Path | None = None     # Directorio de test (opcional, para split explícito)
    image_size: tuple[int, int] = (224, 224)  # Tamaño al que redimensionar imágenes
    batch_size: int = 32     # Tamaño del batch para entrenamiento
    epochs: int = 10         # Número máximo de épocas
    validation_split: float = 0.2  # Fracción de datos para validación (split automático)
    seed: int = 42           # Semilla para reproducibilidad
    model_name: str = "skin_cnn"  # Prefijo para nombrar archivos del modelo


def _load_dataset(config: TrainingConfig, directory: Path, *, shuffle: bool) -> tf.data.Dataset:
    """
    Carga un dataset de imágenes desde un directorio usando tf.data.

    Args:
        config: Configuración de entrenamiento
        directory: Directorio con subdirectorios por clase
        shuffle: Si mezclar los datos

    Returns:
        Dataset de TensorFlow listo para entrenamiento/inferencia
    """
    return tf.keras.utils.image_dataset_from_directory(
        directory,
        seed=config.seed,
        image_size=config.image_size,
        batch_size=config.batch_size,
        label_mode="int",  # Etiquetas como enteros (índices de clase)
        shuffle=shuffle,
    )


def _serialize_training_config(config: TrainingConfig) -> dict:
    """
    Serializa la configuración de entrenamiento para guardar en metadata.

    Convierte Paths a strings y tuplas a listas para serialización JSON.
    """
    serialized = asdict(config)
    # Convertir Paths a strings
    for field in ("data_dir", "model_dir", "train_dir", "val_dir", "test_dir"):
        value = serialized[field]
        serialized[field] = str(value) if value is not None else None
    # Convertir tupla image_size a lista
    serialized["image_size"] = list(config.image_size)
    return serialized


def train_model(config: TrainingConfig) -> dict:
    """
    Entrena un modelo CNN para clasificación de imágenes de enfermedades de la piel.

    Soporta tanto splits explícitos (directorios train/val/test separados) como
    split automático desde un directorio único. Guarda el modelo, clases y metadata.

    Args:
        config: Configuración completa del entrenamiento

    Returns:
        Diccionario con resultados del entrenamiento y rutas de artefactos

    Raises:
        ValueError: Si la configuración de splits es inválida
        FileNotFoundError: Si los directorios especificados no existen
    """
    # Asegurar que el directorio de modelos existe
    ensure_directory(config.model_dir)

    # Determinar si usar splits explícitos o automáticos
    explicit_split_dirs = [config.train_dir, config.val_dir, config.test_dir]
    has_any_explicit_split = any(directory is not None for directory in explicit_split_dirs)

    # Validar configuración de splits explícitos
    if has_any_explicit_split and not all(directory is not None for directory in explicit_split_dirs):
        raise ValueError("train_dir, val_dir and test_dir must be provided together.")

    # Cargar datasets según el modo de split
    if has_any_explicit_split:
        # Modo split explícito: usar directorios separados
        assert config.train_dir is not None
        assert config.val_dir is not None
        assert config.test_dir is not None

        # Verificar que todos los directorios existen
        for split_name, split_dir in (
            ("train", config.train_dir),
            ("val", config.val_dir),
            ("test", config.test_dir),
        ):
            if not split_dir.exists():
                raise FileNotFoundError(f"{split_name} directory does not exist: {split_dir}")

        # Cargar datasets desde directorios separados
        train_ds = _load_dataset(config, config.train_dir, shuffle=True)
        val_ds = _load_dataset(config, config.val_dir, shuffle=False)
        test_ds = _load_dataset(config, config.test_dir, shuffle=False)

        # Verificar consistencia de clases entre splits
        if train_ds.class_names != val_ds.class_names:
            raise ValueError("train_dir and val_dir must contain the same class folders.")
        if train_ds.class_names != test_ds.class_names:
            raise ValueError("train_dir and test_dir must contain the same class folders.")
    else:
        # Modo split automático: dividir desde data_dir
        if not config.data_dir.exists():
            raise FileNotFoundError(f"Dataset directory does not exist: {config.data_dir}")

        # Crear splits training/validation automáticamente
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
        test_ds = None  # No hay test set en modo automático

    # Extraer nombres de clases y validar
    class_names = train_ds.class_names
    if not class_names:
        raise ValueError("No classes found in dataset directory.")

    # Optimizar performance de datasets con prefetch
    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(autotune)
    val_ds = val_ds.prefetch(autotune)

    # Construir modelo CNN
    model = build_cnn_model(
        num_classes=len(class_names),
        input_shape=(config.image_size[0], config.image_size[1], 3),
    )

    # Generar timestamp y rutas de artefactos
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    model_path = config.model_dir / f"{config.model_name}_{timestamp}.keras"
    class_names_path = config.model_dir / f"{config.model_name}_{timestamp}_classes.json"
    metadata_path = config.model_dir / f"{config.model_name}_{timestamp}_metadata.json"

    # Configurar callbacks para entrenamiento
    callbacks = [
        # Early stopping para evitar overfitting
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=3,  # Detener si no mejora en 3 épocas
            restore_best_weights=True,  # Restaurar mejores pesos
        ),
        # Guardar mejor modelo durante entrenamiento
        keras.callbacks.ModelCheckpoint(
            filepath=str(model_path),
            monitor="val_loss",
            save_best_only=True,  # Solo guardar si mejora
        ),
    ]

    # Entrenar modelo
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=config.epochs,
        callbacks=callbacks,
        verbose=1,  # Mostrar progreso
    )

    # Evaluar modelo en conjunto de validación
    loss, accuracy = model.evaluate(val_ds, verbose=0)

    # Guardar nombres de clases
    save_class_names(class_names, class_names_path)

    # Recopilar métricas de entrenamiento
    metrics = {
        "val_loss": float(loss),
        "val_accuracy": float(accuracy),
        "history": {key: [float(v) for v in values] for key, values in history.history.items()},
    }

    # Evaluar en test set si está disponible (modo split explícito)
    if test_ds is not None:
        test_loss, test_accuracy = model.evaluate(test_ds, verbose=0)
        metrics["test_loss"] = float(test_loss)
        metrics["test_accuracy"] = float(test_accuracy)

    # Crear y guardar metadata completa del entrenamiento
    metadata = {
        "created_at_utc": timestamp,
        "class_names": class_names,
        "training_config": _serialize_training_config(config),
        "artifacts": {
            "model_path": str(model_path),
            "class_names_path": str(class_names_path),
        },
        "metrics": metrics,
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    # Retornar resumen del entrenamiento
    return {
        "status": "success",
        "model_path": str(model_path),
        "class_names_path": str(class_names_path),
        "metadata_path": str(metadata_path),
        "metrics": metrics,
    }
