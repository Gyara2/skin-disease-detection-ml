import sys
from pathlib import Path

# Ensure the parent apps/ directory is on sys.path when running this file directly.
APPS_DIR = Path(__file__).resolve().parent.parent
if str(APPS_DIR) not in sys.path:
    sys.path.insert(0, str(APPS_DIR))

from clasificador.api import create_app

app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
