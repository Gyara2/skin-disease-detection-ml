from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
MODELS_DIR = DATA_DIR / "models"
DEFAULT_DATASET_DIR = RAW_DATA_DIR / "train"
DEFAULT_MODEL_PATH = MODELS_DIR / "skin_cnn.keras"
DEFAULT_CLASS_NAMES_PATH = MODELS_DIR / "skin_cnn_classes.json"
MAX_UPLOAD_SIZE_MB = 10


def ensure_runtime_directories() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
