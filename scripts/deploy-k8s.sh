#!/usr/bin/env bash
set -euo pipefail

echo "===================================================="
echo " Deploying Platform to Kubernetes / Minikube"
echo "===================================================="

KUBECTL="kubectl"
if ! command -v kubectl &>/dev/null; then
    if command -v minikube &>/dev/null; then
        KUBECTL="minikube kubectl --"
    else
        echo "Error: Neither kubectl nor minikube found in PATH."
        exit 1
    fi
fi

echo "Loading local images into Minikube if available..."
if command -v minikube &>/dev/null; then
    minikube image load eureka-server:latest || true
    minikube image load api-gateway:latest || true
    minikube image load student-service:latest || true
    minikube image load internship-service:latest || true
    minikube image load company-service:latest || true
fi

echo "Applying Kubernetes manifests..."
$KUBECTL apply -f k8s/01-configmap.yml
$KUBECTL apply -f k8s/02-secrets.yml
$KUBECTL apply -f k8s/03-databases.yml
$KUBECTL apply -f k8s/04-eureka.yml
$KUBECTL apply -f k8s/05-services.yml
$KUBECTL apply -f k8s/06-gateway.yml

echo "Checking deployment status..."
$KUBECTL get pods
$KUBECTL get services
