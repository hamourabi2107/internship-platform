#!/usr/bin/env bash
set -euo pipefail

echo "===================================================="
echo " Deploying Platform with Docker Compose"
echo "===================================================="

docker compose down
docker compose up -d --build

echo "Waiting for services to become healthy..."
docker compose ps
