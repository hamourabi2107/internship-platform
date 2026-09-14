#!/usr/bin/env bash
set -euo pipefail

echo "===================================================="
echo " Building All Spring Boot Services & Angular App"
echo "===================================================="

SERVICES=("eureka-server" "api-gateway" "student-service" "internship-service" "company-service")

for service in "${SERVICES[@]}"; do
    echo "--- Building ${service} ---"
    (cd "${service}" && mvn clean package)
    echo "--- ${service} built successfully ---"
done

echo "--- Building Angular Frontend ---"
(cd frontend && npm ci && npm run build)
echo "--- Angular Frontend built successfully ---"

echo "===================================================="
echo " All builds completed successfully!"
echo "===================================================="
