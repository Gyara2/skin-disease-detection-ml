# models.py - Definiciones de arquitecturas de modelos de deep learning
# Este archivo contiene funciones para construir modelos de redes neuronales convolucionales (CNN)
# optimizadas para la clasificación de imágenes de enfermedades de la piel.

from tensorflow import keras

def build_cnn_model(
    num_classes: int,
    input_shape: tuple[int, int, int] = (224, 224, 3),
    learning_rate: float = 1e-3,
) -> keras.Model:
    """
    Construye y compila un modelo CNN básico para clasificación de imágenes.

    La arquitectura consiste en:
    - Capas convolucionales con max pooling para extracción de características
    - Capa de flatten para convertir a vector 1D
    - Capas densas fully-connected con dropout para clasificación
    - Activación softmax en la salida para clasificación multi-clase

    Args:
        num_classes: Número de clases a clasificar (tamaño de la capa de salida)
        input_shape: Forma de entrada (altura, ancho, canales). Default: (224, 224, 3) para RGB
        learning_rate: Tasa de aprendizaje para el optimizador Adam. Default: 1e-3

    Returns:
        Modelo Keras compilado y listo para entrenamiento/inferencia

    Arquitectura detallada:
    - Input -> Rescaling(1/255) -> Conv2D(32) -> MaxPool -> Conv2D(64) -> MaxPool ->
      Conv2D(128) -> MaxPool -> Flatten -> Dense(128) -> Dropout(0.3) -> Dense(num_classes, softmax)
    """
    model = keras.Sequential(
        [
            # Capa de entrada con forma especificada
            keras.layers.Input(shape=input_shape),

            # Reescalado de píxeles de [0,255] a [0,1]
            keras.layers.Rescaling(1.0 / 255.0),

            # Primera capa convolucional: 32 filtros, kernel 3x3, activación ReLU
            keras.layers.Conv2D(32, 3, activation="relu"),

            # Max pooling para reducir dimensionalidad
            keras.layers.MaxPooling2D(),

            # Segunda capa convolucional: 64 filtros
            keras.layers.Conv2D(64, 3, activation="relu"),
            keras.layers.MaxPooling2D(),

            # Tercera capa convolucional: 128 filtros
            keras.layers.Conv2D(128, 3, activation="relu"),
            keras.layers.MaxPooling2D(),

            # Aplanar las características convolucionales a vector 1D
            keras.layers.Flatten(),

            # Capa densa fully-connected con 128 neuronas
            keras.layers.Dense(128, activation="relu"),

            # Dropout para regularización y evitar overfitting
            keras.layers.Dropout(0.3),

            # Capa de salida con activación softmax para clasificación multi-clase
            keras.layers.Dense(num_classes, activation="softmax"),
        ]
    )

    # Compilar el modelo con optimizador Adam, pérdida sparse categorical crossentropy
    # y métrica de accuracy
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model
