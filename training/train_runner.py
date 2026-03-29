import argparse
from pathlib import Path

from src.api.config import DEFAULT_DATASET_DIR, MODELS_DIR
from src.ml.training import TrainingConfig, train_model


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train skin disease image classifier.")
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATASET_DIR)
    parser.add_argument("--model-dir", type=Path, default=MODELS_DIR)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, nargs=2, default=[224, 224])
    parser.add_argument("--validation-split", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--model-name", type=str, default="skin_cnn")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config = TrainingConfig(
        data_dir=args.data_dir,
        model_dir=args.model_dir,
        image_size=(args.image_size[0], args.image_size[1]),
        batch_size=args.batch_size,
        epochs=args.epochs,
        validation_split=args.validation_split,
        seed=args.seed,
        model_name=args.model_name,
    )

    result = train_model(config)
    print("Training completed")
    print(result)


if __name__ == "__main__":
    main()
