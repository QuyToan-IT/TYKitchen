FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads
EXPOSE 8083
ENTRYPOINT ["java","-jar","/app/app.jar"]