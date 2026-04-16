# app.py - Configuración principal de la aplicación Flask para el clasificador de enfermedades de la piel
# Este archivo define la función create_app que inicializa y configura la aplicación Flask,
# incluyendo la configuración de límites de subida, directorios necesarios y registro de rutas API.

from flask import Flask

from .config import MAX_UPLOAD_SIZE_MB, ensure_runtime_directories
from .routes import api_bp


def create_app() -> Flask:
    """
    Crea y configura la aplicación Flask para el clasificador.

    Esta función inicializa una instancia de Flask, configura el límite máximo de tamaño
    de contenido para subidas de archivos, asegura que los directorios necesarios existan,
    y registra el blueprint de la API con el prefijo '/api'.

    Returns:
        Flask: La aplicación Flask configurada y lista para ejecutar.
    """
    app = Flask(__name__)

    # Configurar el límite máximo de contenido para subidas de archivos (en bytes)
    # MAX_UPLOAD_SIZE_MB se define en config.py y se multiplica por 1024*1024 para obtener MB
    app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_SIZE_MB * 1024 * 1024

    # Asegurar que los directorios necesarios (como models/) existan
    ensure_runtime_directories()

    # Registrar el blueprint de la API con el prefijo '/api'
    # Esto hace que todas las rutas definidas en api_bp estén disponibles bajo /api/
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
