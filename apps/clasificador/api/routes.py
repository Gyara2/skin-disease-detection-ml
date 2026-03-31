from __future__ import annotations

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
from ..ml.inference import Predictor
from ..ml.training import TrainingConfig, train_model
from ..ml.utils import is_allowed_image_filename

api_bp = Blueprint("api", __name__)

executor = ThreadPoolExecutor(max_workers=1)
jobs_lock = Lock()
jobs: dict[str, "TrainingJob"] = {}
active_future: Future | None = None

predictors_lock = Lock()
predictors: dict[str, Predictor] = {}


@dataclass(slots=True)
class TrainingJob:
    job_id: str
    status: str
    created_at: str
    updated_at: str
    params: dict[str, Any]
    result: dict[str, Any] | None = None
    error: str | None = None
    traceback: str | None = None


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _set_job(job: TrainingJob) -> None:
    with jobs_lock:
        jobs[job.job_id] = job


def _update_job(job_id: str, **fields: Any) -> None:
    with jobs_lock:
        job = jobs.get(job_id)
        if not job:
            return
        for key, value in fields.items():
            setattr(job, key, value)
        job.updated_at = _utc_now_iso()


def _serialize_job(job: TrainingJob) -> dict[str, Any]:
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
    image_size_payload = payload.get("image_size", [224, 224])
    if not isinstance(image_size_payload, list) or len(image_size_payload) != 2:
        raise ValueError("image_size must be a list with two integers, e.g. [224, 224].")

    train_dir = payload.get("train_dir")
    val_dir = payload.get("val_dir")
    test_dir = payload.get("test_dir")
    explicit_split_values = [train_dir, val_dir, test_dir]
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


@api_bp.get("/health")
def health() -> tuple[Any, int]:
    return jsonify({"status": "ok"}), 200


@api_bp.post("/predict")
def predict() -> tuple[Any, int]:
    if "image" not in request.files:
        return jsonify({"error": "Missing file field 'image'."}), 400

    file = request.files["image"]
    if not file or not file.filename:
        return jsonify({"error": "No image filename provided."}), 400

    if not is_allowed_image_filename(file.filename):
        return jsonify({"error": "Unsupported image extension."}), 400

    model_path = Path(request.form.get("model_path", str(DEFAULT_MODEL_PATH)))
    class_names_path = Path(request.form.get("class_names_path", str(DEFAULT_CLASS_NAMES_PATH)))

    cache_key = f"{model_path.resolve()}::{class_names_path.resolve()}"
    with predictors_lock:
        predictor = predictors.get(cache_key)
        if predictor is None:
            predictor = Predictor(model_path=model_path, class_names_path=class_names_path)
            predictors[cache_key] = predictor

    try:
        prediction = predictor.predict_bytes(file.read())
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"Prediction failed: {exc}"}), 500

    return (
        jsonify(
            {
                "predicted_class": prediction.predicted_class,
                "confidence": prediction.confidence,
                "top_k": prediction.top_k,
            }
        ),
        200,
    )


@api_bp.post("/train")
def launch_training() -> tuple[Any, int]:
    global active_future

    payload = request.get_json(silent=True) or {}

    if active_future and not active_future.done():
        return jsonify({"error": "A training job is already running."}), 409

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
    with jobs_lock:
        job = jobs.get(job_id)

    if not job:
        return jsonify({"error": "Job not found."}), 404

    return jsonify(_serialize_job(job)), 200
