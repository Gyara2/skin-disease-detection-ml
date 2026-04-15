# main.py - Punto de entrada principal de la aplicación clasificador
# Este archivo inicializa y ejecuta la aplicación Flask para el clasificador
# de enfermedades de la piel, configurando el servidor web.

import sys
from pathlib import Path

# Asegurar que el directorio actual de la app esté en sys.path cuando se ejecute directamente
# Esto permite importar módulos locales como 'api' sin problemas de rutas
APP_DIR = Path(__file__).resolve().parent
if str(APP_DIR) not in sys.path:
    sys.path.insert(0, str(APP_DIR))

# Importar y crear la aplicación Flask desde el módulo api
from api.app import create_app

# Crear instancia de la aplicación con toda la configuración
app = create_app()


if __name__ == "__main__":
    # Ejecutar el servidor Flask en modo desarrollo
    # - host="0.0.0.0": Aceptar conexiones desde cualquier interfaz de red
    # - port=5000: Puerto donde escuchar peticiones
    # - debug=True: Habilitar modo debug para desarrollo (recarga automática, errores detallados)
    app.run(host="0.0.0.0", port=5000, debug=True)
