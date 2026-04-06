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

## Organización del repositorio

El repositorio se estructura en distintos bloques funcionales, cada uno orientado a una parte concreta del sistema:

- `apps/model/` → desarrollo, análisis, entrenamiento y evaluación del modelo de machine learning
- `apps/frontend/` → cliente web para la interacción con el usuario
- `apps/backend` → backend del sistema

Esta organización busca facilitar la escalabilidad, el mantenimiento y la separación clara de responsabilidades dentro del proyecto.
