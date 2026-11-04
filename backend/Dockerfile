# --- Build -------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY .mvn .mvn
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src src
RUN mvn -B -q package -DskipTests && cp target/tg-autoloc-backend-*.jar app.jar

# --- Runtime -----------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /data/uploads && chown -R app:app /data
COPY --from=build /app/app.jar app.jar
USER app
ENV STORAGE_LOCAL_PATH=/data/uploads \
    JAVA_OPTS="-XX:MaxRAMPercentage=75"
VOLUME /data/uploads
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
    CMD wget -qO- http://localhost:8080/actuator/health/liveness || exit 1
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
