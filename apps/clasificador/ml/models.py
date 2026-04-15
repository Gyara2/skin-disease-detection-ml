from tensorflow import keras


def build_cnn_model(
    num_classes: int,
    input_shape: tuple[int, int, int] = (224, 224, 3),
    learning_rate: float = 1e-3,
) -> keras.Model:
    model = keras.Sequential(
        [
            keras.layers.Input(shape=input_shape),
            keras.layers.Rescaling(1.0 / 255.0),
            keras.layers.Conv2D(32, 3, activation="relu"),
            keras.layers.MaxPooling2D(),
            keras.layers.Conv2D(64, 3, activation="relu"),
            keras.layers.MaxPooling2D(),
            keras.layers.Conv2D(128, 3, activation="relu"),
            keras.layers.MaxPooling2D(),
            keras.layers.Flatten(),
            keras.layers.Dense(128, activation="relu"),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(num_classes, activation="softmax"),
        ]
    )

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model
