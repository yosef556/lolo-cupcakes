# Stage 1: Build stage with Maven and OpenJDK 21
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Install maven
RUN apk add --no-cache maven

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built jar from builder
COPY --from=build /workspace/target/*.jar app.jar

ENV PORT=8080
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
