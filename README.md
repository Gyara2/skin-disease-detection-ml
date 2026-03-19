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

## Arquitectura

El sistema consta de varias aplicaciones, cada una de ellas en su propio contenedor de Docker, comunicándose entre sí dentro de la red interna que Docker establece y exponiendo al exterior los clientes que serán el punto de acceso de los usuarios: uno para médicos y pacientes y otro para que los técnicos puedan ver el rendimiento del sistema. De esta forma se consigue una mayor seguridad, ya que los usuarios no tienen forma de interaccionar directamente con la base de datos ni con los servicios. 

- GUI médicos/pacientes: SPA desarrollada en React que permite a los pacientes consultar su historial de casos y a los médicos consultar el historial de casos de todos los pacientes, así como crear nuevos diagnósticos en base a imágenes de lesiones y registrar nuevos pacientes.
  
- Servicio casos pacientes: aplicación de Spring que tiene una API REST para comunicarse con GUI médicos/pacientes así como con Modelo clasificación de lesiones cutáneas. Se comunica con la DB usuarios y casos para almacenar y recuperar información sobre los usuarios y sus casos. Expone métricas para que sean almacenadas por Almacenamiento de métricas.

- Modelo clasificación de lesiones cutáneas: aplicación de Flask que gestiona el modelo de ML que realiza la clasificación de imágenes de lesiones de la piel. Se comunica con Servicio casos pacientes a través de una API REST.

- Almacenamiento de métricas: una instancia de Prometheus que almacena las métricas expuestas desde Servicio casos pacientes para que puedan ser consultadas por Dashboard técnicos.

- Dashboard técnicos: una instancia de Grafana accesible por los técnicos para consultar los dashboards de las métricas del sistema. Su fuente de datos es la instancia de Prometheus Almacenamiento de métricas.

## Tecnologías

Se han escogido las siguientes tecnologías teniendo en cuenta, en primer lugar, su aptitud para conseguir los objetivos del sistema y en segundo lugar la familiaridad de los componentes del equipo con ellas. La cantidad de tiempo limitada para el desarrollo del sistema hace que sea arriesgado optar por alternativas desconocidas para ver si presentan una mejora significativa en los resultados.

### Lenguajes 

- Python: para desarrollar el servicio que incluye el modelo de IA. Python es el lenguaje más empleado en el desarrollo de librerías dedicadas a la inteligencia artificial y el Big Data. Además de un extenso catálogo de librerías, existe una comunidad muy grande de usuarios que comparten su experiencia, facilitando el aprendizaje de éstas. 

- Java: para desarrollar la aplicación de backend que gestiona el grueso de la lógica de negocio. El framework Spring, desarrollado en este lenguaje, permite desarrollar una aplicación con funcionalidades a medida de forma rápida y segura. 

- HTML + CSS: diseño de las interfaz de pacientes y médicos. Uso imprescindible de estos lenguajes para el diseño web moderno.

- TS: desarrollo del cliente web para pacientes y médicos. La aportación del tipado que TS impone sobre JS ayuda a la hora de desarrollar código libre de bugs y errores. 

### Frameworks

- Spring: aplicación principal del backend encargada del grueso de la lógica de negocio. A partir de la herramienta Spring Boot y sus starters, se puede levantar la base de la aplicación en un instante. Se podría haber utilizado también Python para el backend, empleando frameworks como Django, pero la existencia de Spring Boot facilita en gran medida desarrollar una aplicación típica que sirva de núcleo del sistema. 

- Flask: aplicación ligera encargada de gestionar el modelo de IA y exponerlo a la aplicación de backend principal. Mantener el modelo en esta aplicación desarrollada en Python, usando una API como interfaz con el resto del sistema nos permitirá aprovechar lo mejor de los dos mundos (Python y Java) sin acoplar los desarrollos. Únicamente habrá que definir bien las comunicaciones vía API entre ambas partes.

- React: cliente web para médicos y pacientes. Permite el desarrollo de aplicaciones single page muy robustas y dinámicas. Dado el tipo de interacciones de los usuarios con nuestro sistema, un framework de SPA resultará en mejor rendimiento y experiencia de uso. 

### Librerías principales

- PyTorch/Tensor Flow: desarrollo del modelo de ML.

- Flask-RESTful: API REST del servicio del modelo.

- Spring Security: autenticación y autorización.

- Spring Web: API REST de la aplicación principal de backend

- JUnit + Mockito: test unitario en Spring

- SpringDoc OpenAPI: permite documentar fácilmente la API, generando una página web de Swagger donde poder explorar ésta en detalle. 

- Tailwind: facilita la incorporación de estilos a los componentes propios del framework React. Agilizará el desarrollo.

### Tipo de base de datos

- MySQL: base de datos relacional que nos permitirá guardar la información de los usuarios y sus casos de forma estructurada, tanto para realizar el seguimiento de los casos como para poder recuperar información para medir el rendimiento del modelo. Nos ha parecido el tipo de base de datos adecuado, ya que tienen mucho peso las entidades y, en segundo lugar, las relaciones entre estas.

### Herramientas auxiliares

- Grafana: para desarrollar dashboards en los que visualizar las métricas de la aplicación almacenadas en Prometheus. Es muy buena opción en nuestro caso, ya que existe versión libre que no presenta limitaciones significativas.

- Prometheus: recopila y almacena las métricas de la aplicación principal del backend. Similar a Grafana, es un software libre que nos aporta gran valor sin necesidad de incurrir en costes.

- Docker: permitirá utilizar una arquitectura de contenedores comunicados dentro de una red interna. Se expondrán al exterior los clientes para los diferentes usuarios y se mantendrán el resto de componentes aislados del exterior.

## Ejecución del sistema

El sistema estará configurado para funcionar como un stack de docker compose.

Los pasos para levantarlo son:

1. Tener docker instalado en el SO del host
2. Disponer de acceso a internet o de las imágenes necesarias ya descargadas en el host
3. Posicionarse en la ubicación del archivo sdmd.yaml
4. Ejecutar el comando que levanta el stack: ```docker compose up -d```

El archivo sdmd.yaml contiene todas las configuraciones necesarias para que los distintos contenedores se levanten en el orden adecuado y puedan comunicarse entre sí. 
