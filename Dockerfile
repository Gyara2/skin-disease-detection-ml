FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# Esto asume que usas Maven. Si usas Gradle, cambia 'target' por 'build/libs'
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]