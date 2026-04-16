# train_runner.py - Script de línea de comandos para ejecutar entrenamiento de modelos
# Este archivo proporciona una interfaz CLI para entrenar modelos de clasificación
# de enfermedades de la piel, permitiendo configurar todos los parámetros de entrenamiento.

import argparse
from pathlib import Path

from api.config import DEFAULT_DATASET_DIR, MODELS_DIR
from ml.training import TrainingConfig, train_model


def parse_args() -> argparse.Namespace:
    """
    Parsea los argumentos de línea de comandos para el entrenamiento.

    Returns:
        Namespace con todos los parámetros de configuración parseados
    """
    parser = argparse.ArgumentParser(description="Train skin disease image classifier.")

    # Configuración de datos
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DEFAULT_DATASET_DIR,
        help="Directorio raíz del dataset (para split automático)"
    )
    parser.add_argument(
        "--train-dir",
        type=Path,
        help="Directorio de entrenamiento (opcional, para split explícito)"
    )
    parser.add_argument(
        "--val-dir",
        type=Path,
        help="Directorio de validación (opcional, para split explícito)"
    )
    parser.add_argument(
        "--test-dir",
        type=Path,
        help="Directorio de test (opcional, para split explícito)"
    )

    # Configuración del modelo y salida
    parser.add_argument(
        "--model-dir",
        type=Path,
        default=MODELS_DIR,
        help="Directorio donde guardar modelos entrenados"
    )
    parser.add_argument(
        "--model-name",
        type=str,
        default="skin_cnn",
        help="Prefijo para nombrar archivos del modelo"
    )

    # Hiperparámetros de entrenamiento
    parser.add_argument(
        "--epochs",
        type=int,
        default=10,
        help="Número máximo de épocas de entrenamiento"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=32,
        help="Tamaño del batch para entrenamiento"
    )
    parser.add_argument(
        "--image-size",
        type=int,
        nargs=2,
        default=[224, 224],
        help="Tamaño al que redimensionar imágenes (ancho alto)"
    )
    parser.add_argument(
        "--validation-split",
        type=float,
        default=0.2,
        help="Fracción de datos para validación (split automático)"
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Semilla para reproducibilidad"
    )

    return parser.parse_args()


def main() -> None:
    """
    Función principal que ejecuta el entrenamiento del modelo.

    Parsea argumentos, crea la configuración y ejecuta el entrenamiento,
    mostrando los resultados al finalizar.
    """
    # Parsear argumentos de línea de comandos
    args = parse_args()

    # Crear configuración de entrenamiento desde argumentos
    config = TrainingConfig(
        data_dir=args.data_dir,
        model_dir=args.model_dir,
        train_dir=args.train_dir,
        val_dir=args.val_dir,
        test_dir=args.test_dir,
        image_size=(args.image_size[0], args.image_size[1]),
        batch_size=args.batch_size,
        epochs=args.epochs,
        validation_split=args.validation_split,
        seed=args.seed,
        model_name=args.model_name,
    )

    # Ejecutar entrenamiento
    result = train_model(config)

    # Mostrar resultados
    print("Training completed")
    print(result)


if __name__ == "__main__":
    main()
