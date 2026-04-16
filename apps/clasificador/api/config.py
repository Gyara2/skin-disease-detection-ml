# config.py - Configuraciones de rutas y constantes para la aplicación clasificador
# Este archivo define las rutas absolutas a directorios y archivos importantes,
# detectando automáticamente si se ejecuta en el repositorio local o dentro de un contenedor Docker.
# También incluye constantes como el límite de subida de archivos.

from pathlib import Path

# Determinar la raíz del proyecto dinámicamente
# Si estamos en el repositorio local (api/clasificador), PROJECT_ROOT es 3 niveles arriba
# Si estamos en Docker (/app), PROJECT_ROOT es 1 nivel arriba
resolved_path = Path(__file__).resolve()
if resolved_path.parent.name == "api" and resolved_path.parent.parent.name == "clasificador":
    PROJECT_ROOT = resolved_path.parents[3]
else:
    PROJECT_ROOT = resolved_path.parents[1]

# Determinar la raíz del clasificador
# En el repositorio: PROJECT_ROOT/apps/clasificador
# En Docker: PROJECT_ROOT (ya que se copia todo a /app)
CLASIFICADOR_ROOT = (
    PROJECT_ROOT / "apps" / "clasificador"
    if (PROJECT_ROOT / "apps" / "clasificador").exists()
    else PROJECT_ROOT
)

# Directorios principales
DATA_DIR = CLASIFICADOR_ROOT / "data"  # Directorio para datos de entrenamiento y procesamiento
RAW_DATA_DIR = DATA_DIR / "raw"  # Datos crudos sin procesar
MODELS_DIR = CLASIFICADOR_ROOT / "models"  # Directorio donde se guardan los modelos entrenados

# Rutas por defecto para datasets y modelos
DEFAULT_DATASET_DIR = RAW_DATA_DIR / "train"  # Directorio por defecto para datos de entrenamiento
DEFAULT_MODEL_PATH = MODELS_DIR / "skin_cnn.keras"  # Ruta por defecto del modelo Keras
DEFAULT_CLASS_NAMES_PATH = MODELS_DIR / "skin_cnn_classes.json"  # Ruta por defecto de las clases del modelo

# Constantes de configuración
MAX_UPLOAD_SIZE_MB = 10  # Límite máximo de subida de archivos en MB


def ensure_runtime_directories() -> None:
    """
    Asegura que los directorios necesarios para el funcionamiento de la aplicación existan.

    Esta función crea el directorio de modelos si no existe, incluyendo directorios padre.
    Se llama durante la inicialización de la aplicación Flask.
    """
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
