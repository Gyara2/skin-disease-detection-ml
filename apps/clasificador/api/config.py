from pathlib import Path

resolved_path = Path(__file__).resolve()
if resolved_path.parent.name == "api" and resolved_path.parent.parent.name == "clasificador":
    PROJECT_ROOT = resolved_path.parents[3]
else:
    PROJECT_ROOT = resolved_path.parents[1]

CLASIFICADOR_ROOT = (
    PROJECT_ROOT / "apps" / "clasificador"
    if (PROJECT_ROOT / "apps" / "clasificador").exists()
    else PROJECT_ROOT
)

DATA_DIR = CLASIFICADOR_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
MODELS_DIR = CLASIFICADOR_ROOT / "models"
DEFAULT_DATASET_DIR = RAW_DATA_DIR / "train"
DEFAULT_MODEL_PATH = MODELS_DIR / "skin_cnn.keras"
DEFAULT_CLASS_NAMES_PATH = MODELS_DIR / "skin_cnn_classes.json"
MAX_UPLOAD_SIZE_MB = 10


def ensure_runtime_directories() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
