FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# Este build usa el JAR generado en la raíz del proyecto Maven.
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
