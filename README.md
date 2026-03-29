# Skin Disease Model Detector (SDMD)

## Objetivo

El objetivo de este proyecto es desarrollar un sistema basado en aprendizaje automático capaz de analizar imágenes de lesiones cutáneas y proporcionar una **evaluación orientativa** basada en patrones visuales aprendidos por el modelo.

El sistema tiene fines **experimentales y de apoyo**, y **no sustituye en ningún caso el diagnóstico médico** realizado por un profesional sanitario.

## Descripción general

El usuario accederá a un cliente web desde el cual podrá cargar una imagen de una lesión cutánea.  
Dicha imagen será procesada por un modelo de machine learning que devolverá una estimación probabilística sobre posibles afecciones cutáneas, presentada como información orientativa.

Las imágenes proporcionadas por el usuario se utilizarán exclusivamente para la inferencia del modelo y no se almacenarán de forma persistente.

## Miembros

- Álvaro Guirado Cárdenas
- Diego Hernando Torralba
- Javier García Hernández
- Raúl Gallardo Risco

## Organización del repositorio

El repositorio se estructura en distintos bloques funcionales, cada uno orientado a una parte concreta del sistema:

- `ml/` → desarrollo, análisis, entrenamiento y evaluación del modelo de machine learning
- `dashboard/` → cliente web para la interacción con el usuario
- `monitoring/` → métricas, seguimiento y observabilidad del sistema
- `docs/` → documentación técnica y de diseño

Esta organización busca facilitar la escalabilidad, el mantenimiento y la separación clara de responsabilidades dentro del proyecto.

## Implementación actual

Se ha implementado una API REST con Flask y dos módulos reutilizables:

- Entrenamiento de modelo con TensorFlow/Keras a partir de imágenes etiquetadas por carpetas.
- Inferencia de clasificación sobre imagen subida por el cliente.

Estructura relevante:

- `src/api/` - capa REST (`/api/health`, `/api/predict`, `/api/train`, `/api/jobs/<job_id>`)
- `src/ml/training.py` - lógica de entrenamiento reutilizable
- `src/ml/inference.py` - lógica de predicción reutilizable
- `training/train_runner.py` - ejecución manual de entrenamiento por CLI
- `main.py` - punto de entrada de la API Flask
- `environment/requirements.txt` - dependencias del proyecto

## Requisitos

- Python 3.10 o superior
- Dataset de imágenes en carpetas por clase, por ejemplo:

```text
data/raw/train/
	acne/
		img1.jpg
		img2.jpg
	eczema/
		img3.jpg
```

## Instalación

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r environment/requirements.txt
```

## Ejecutar API Flask

```bash
python main.py
```

API disponible en `http://127.0.0.1:5000`.

## Endpoints

### Health check

```bash
curl -X GET http://127.0.0.1:5000/api/health
```

### Predicción de imagen

```bash
curl -X POST http://127.0.0.1:5000/api/predict \
	-F "image=@/ruta/a/imagen.jpg"
```

Respuesta esperada:

```json
{
	"predicted_class": "acne",
	"confidence": 0.91,
	"top_k": [
		{"class": "acne", "probability": 0.91},
		{"class": "eczema", "probability": 0.07},
		{"class": "psoriasis", "probability": 0.02}
	]
}
```

Opcionalmente puedes indicar rutas explícitas de artefactos:

```bash
curl -X POST http://127.0.0.1:5000/api/predict \
	-F "image=@/ruta/a/imagen.jpg" \
	-F "model_path=/ruta/a/modelo.keras" \
	-F "class_names_path=/ruta/a/classes.json"
```

### Lanzar entrenamiento (asíncrono)

```bash
curl -X POST http://127.0.0.1:5000/api/train \
	-H "Content-Type: application/json" \
	-d '{
		"data_dir": "data/raw/train",
		"epochs": 10,
		"batch_size": 32,
		"image_size": [224, 224],
		"validation_split": 0.2,
		"seed": 42,
		"model_name": "skin_cnn"
	}'
```

Respuesta inmediata (HTTP 202):

```json
{
	"job_id": "...",
	"status": "queued",
	"status_url": "/api/jobs/<job_id>"
}
```

### Consultar estado de entrenamiento

```bash
curl -X GET http://127.0.0.1:5000/api/jobs/<job_id>
```

Estados posibles: `queued`, `running`, `success`, `failed`.

## Entrenamiento por script (CLI)

```bash
python training/train_runner.py \
	--data-dir data/raw/train \
	--model-dir data/models \
	--epochs 10 \
	--batch-size 32 \
	--image-size 224 224
```

## Artefactos generados

Cada entrenamiento guarda en `data/models/`:

- Modelo entrenado: `<model_name>_<timestamp>.keras`
- Mapa de clases: `<model_name>_<timestamp>_classes.json`
- Metadatos y métricas: `<model_name>_<timestamp>_metadata.json`

## Nota importante

Este sistema es experimental y orientativo. No sustituye el diagnóstico médico profesional.
