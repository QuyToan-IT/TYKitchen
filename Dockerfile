FROM openjdk:17-jdk-alpine
VOLUME /tmp
COPY backend/article-service/target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
