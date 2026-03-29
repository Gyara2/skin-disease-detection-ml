from flask import Flask

from .config import MAX_UPLOAD_SIZE_MB, ensure_runtime_directories
from .routes import api_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_SIZE_MB * 1024 * 1024

    ensure_runtime_directories()
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
