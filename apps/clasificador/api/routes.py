# routes.py - Definición de rutas API para el clasificador de enfermedades de la piel
# Este archivo define el blueprint de Flask con rutas para predicción, entrenamiento y monitoreo.
# Incluye manejo de trabajos de entrenamiento asíncronos y cache de predictores.

from __future__ import annotations

import base64
import traceback
from concurrent.futures import Future, ThreadPoolExecutor
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import uuid4

from flask import Blueprint, jsonify, request

from .config import (
    DEFAULT_CLASS_NAMES_PATH,
    DEFAULT_DATASET_DIR,
    DEFAULT_MODEL_PATH,
    MODELS_DIR,
)
from ml.inference import Predictor
from ml.training import TrainingConfig, train_model
from ml.utils import is_allowed_image_filename

# Blueprint para agrupar todas las rutas API bajo el prefijo /api
api_bp = Blueprint("api", __name__)

# Executor para manejar trabajos de entrenamiento de forma asíncrona
executor = ThreadPoolExecutor(max_workers=1)

# Locks para sincronización thread-safe
jobs_lock = Lock()  # Para acceder al diccionario de trabajos
jobs: dict[str, "TrainingJob"] = {}  # Almacén de trabajos de entrenamiento
active_future: Future | None = None  # Trabajo activo actualmente

predictors_lock = Lock()  # Para acceder al cache de predictores
predictors: dict[str, Predictor] = {}  # Cache de instancias Predictor por modelo


@dataclass(slots=True)
class TrainingJob:
    """Representa un trabajo de entrenamiento con su estado y resultados."""
    job_id: str
    status: str  # 'queued', 'running', 'success', 'failed'
    created_at: str
    updated_at: str
    params: dict[str, Any]  # Parámetros del entrenamiento
    result: dict[str, Any] | None = None  # Resultado del entrenamiento exitoso
    error: str | None = None  # Mensaje de error si falló
    traceback: str | None = None  # Traceback completo del error


def _utc_now_iso() -> str:
    """Retorna la fecha/hora actual en formato ISO UTC."""
    return datetime.now(timezone.utc).isoformat()


def _set_job(job: TrainingJob) -> None:
    """Guarda un trabajo en el diccionario global de forma thread-safe."""
    with jobs_lock:
        jobs[job.job_id] = job


def _update_job(job_id: str, **fields: Any) -> None:
    """Actualiza campos de un trabajo existente de forma thread-safe."""
    with jobs_lock:
        job = jobs.get(job_id)
        if not job:
            return
        for key, value in fields.items():
            setattr(job, key, value)
        job.updated_at = _utc_now_iso()


def _serialize_job(job: TrainingJob) -> dict[str, Any]:
    """Convierte un TrainingJob a diccionario para respuesta JSON."""
    return {
        "job_id": job.job_id,
        "status": job.status,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "params": job.params,
        "result": job.result,
        "error": job.error,
    }


def _coerce_training_config(payload: dict[str, Any]) -> TrainingConfig:
    """
    Convierte y valida los parámetros del payload JSON en una configuración de entrenamiento.

    Args:
        payload: Diccionario con parámetros de entrenamiento desde la petición HTTP

    Returns:
        TrainingConfig: Configuración validada para el entrenamiento

    Raises:
        ValueError: Si los parámetros son inválidos
    """
    image_size_payload = payload.get("image_size", [224, 224])
    if not isinstance(image_size_payload, list) or len(image_size_payload) != 2:
        raise ValueError("image_size must be a list with two integers, e.g. [224, 224].")

    train_dir = payload.get("train_dir")
    val_dir = payload.get("val_dir")
    test_dir = payload.get("test_dir")
    explicit_split_values = [train_dir, val_dir, test_dir]
    # Si se especifica alguno de los directorios de split, deben especificarse todos
    if any(value is not None for value in explicit_split_values) and not all(
        value is not None for value in explicit_split_values
    ):
        raise ValueError("train_dir, val_dir and test_dir must be provided together.")

    return TrainingConfig(
        data_dir=Path(payload.get("data_dir", str(DEFAULT_DATASET_DIR))),
        model_dir=Path(payload.get("model_dir", str(MODELS_DIR))),
        train_dir=Path(train_dir) if train_dir is not None else None,
        val_dir=Path(val_dir) if val_dir is not None else None,
        test_dir=Path(test_dir) if test_dir is not None else None,
        image_size=(int(image_size_payload[0]), int(image_size_payload[1])),
        batch_size=int(payload.get("batch_size", 32)),
        epochs=int(payload.get("epochs", 10)),
        validation_split=float(payload.get("validation_split", 0.2)),
        seed=int(payload.get("seed", 42)),
        model_name=str(payload.get("model_name", "skin_cnn")),
    )


def _run_training_job(job_id: str, payload: dict[str, Any]) -> None:
    """
    Ejecuta un trabajo de entrenamiento de forma asíncrona.

    Actualiza el estado del trabajo durante su ejecución y maneja errores.

    Args:
        job_id: ID único del trabajo
        payload: Parámetros del entrenamiento
    """
    _update_job(job_id, status="running")
    try:
        config = _coerce_training_config(payload)
        result = train_model(config)
        _update_job(job_id, status="success", result=result)
    except Exception as exc:  # noqa: BLE001
        _update_job(
            job_id,
            status="failed",
            error=str(exc),
            traceback=traceback.format_exc(),
        )


def _resolve_default_prediction_artifacts() -> tuple[Path, Path]:
    """
    Resuelve las rutas por defecto para modelo y clases de predicción.

    Primero intenta usar los archivos por defecto, luego busca el modelo más reciente
    en el directorio de modelos con su archivo de clases correspondiente.

    Returns:
        Tupla de (ruta_modelo, ruta_clases)
    """
    default_model_path = DEFAULT_MODEL_PATH
    default_class_names_path = DEFAULT_CLASS_NAMES_PATH

    # Si existen los archivos por defecto, úsalos
    if default_model_path.exists() and default_class_names_path.exists():
        return default_model_path, default_class_names_path

    # Buscar el modelo más reciente (por fecha de modificación)
    model_candidates = sorted(
        MODELS_DIR.glob("*.keras"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )

    for model_path in model_candidates:
        class_names_path = model_path.with_name(f"{model_path.stem}_classes.json")
        if class_names_path.exists():
            return model_path, class_names_path

    # Si no se encuentra ninguno, devolver los por defecto
    return default_model_path, default_class_names_path


@api_bp.get("/health")
def health() -> tuple[Any, int]:
    """
    Endpoint de health check.

    Returns:
        JSON con status "ok" y código HTTP 200
    """
    return jsonify({"status": "ok"}), 200


@api_bp.post("/predict")
def predict() -> tuple[Any, int]:
    """
    Endpoint para realizar predicciones de enfermedades de la piel.

    Espera un JSON con:
    - image_base64: imagen codificada en base64
    - id_imagen: identificador único de la imagen
    - model_path (opcional): ruta al modelo a usar
    - class_names_path (opcional): ruta al archivo de clases

    Returns:
        JSON con probabilidades de cada clase y código HTTP 200, o error
    """
    payload = request.get_json(silent=True) or {}

    # Validar campos requeridos
    if "image_base64" not in payload:
        return jsonify({"error": "Missing 'image_base64' field."}), 400

    if "id_imagen" not in payload:
        return jsonify({"error": "Missing 'id_imagen' field."}), 400

    # Decodificar imagen base64
    try:
        image_bytes = base64.b64decode(payload["image_base64"])
    except Exception as exc:
        return jsonify({"error": f"Invalid base64 image: {exc}"}), 400

    id_imagen = payload["id_imagen"]

    # Resolver rutas de modelo y clases
    default_model_path, default_class_names_path = _resolve_default_prediction_artifacts()
    model_path = Path(payload.get("model_path", str(default_model_path)))
    class_names_path = Path(payload.get("class_names_path", str(default_class_names_path)))

    # Cache de predictores por modelo
    cache_key = f"{model_path.resolve()}::{class_names_path.resolve()}"
    with predictors_lock:
        predictor = predictors.get(cache_key)
        if predictor is None:
            predictor = Predictor(model_path=model_path, class_names_path=class_names_path)
            predictors[cache_key] = predictor

    # Realizar predicción
    try:
        probabilities = predictor.predict_probabilities(image_bytes)
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"Prediction failed: {exc}"}), 500

    # Preparar respuesta
    response_data = {"id_imagen": id_imagen}
    response_data.update(probabilities)

    return jsonify(response_data), 200


@api_bp.post("/train")
def launch_training() -> tuple[Any, int]:
    """
    Endpoint para iniciar un trabajo de entrenamiento de modelo.

    Espera un JSON con parámetros de entrenamiento (ver TrainingConfig).
    Solo permite un trabajo activo a la vez.

    Returns:
        JSON con job_id y URL de status, código HTTP 202
    """
    global active_future

    payload = request.get_json(silent=True) or {}

    # Verificar si ya hay un trabajo activo
    if active_future and not active_future.done():
        return jsonify({"error": "A training job is already running."}), 409

    # Crear nuevo trabajo
    job_id = str(uuid4())
    now = _utc_now_iso()
    job = TrainingJob(
        job_id=job_id,
        status="queued",
        created_at=now,
        updated_at=now,
        params=payload,
    )
    _set_job(job)

    # Ejecutar trabajo de forma asíncrona
    active_future = executor.submit(_run_training_job, job_id, payload)

    return (
        jsonify(
            {
                "job_id": job_id,
                "status": "queued",
                "status_url": f"/api/jobs/{job_id}",
            }
        ),
        202,
    )


@api_bp.get("/jobs/<job_id>")
def get_job_status(job_id: str) -> tuple[Any, int]:
    """
    Endpoint para consultar el estado de un trabajo de entrenamiento.

    Args:
        job_id: ID del trabajo a consultar

    Returns:
        JSON con información del trabajo, código HTTP 200 o 404 si no existe
    """
    with jobs_lock:
        job = jobs.get(job_id)

    if not job:
        return jsonify({"error": "Job not found."}), 404

    return jsonify(_serialize_job(job)), 200
