# FreelanceHub — RAILWAY build (repo-root context).
#
# Railway builds with the repo root as context, so backend paths are
# prefixed with freelancer-backend/. Local `docker compose` does NOT use
# this file — it builds ./freelancer-backend via freelancer-backend/Dockerfile.
# Keep the two Dockerfiles' build/run stages in sync.

# Build stage
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY freelancer-backend/pom.xml .
COPY freelancer-backend/src ./src
RUN mvn -B clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.net.preferIPv4Stack=true"
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8080}/api/jobs > /dev/null 2>&1 || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
