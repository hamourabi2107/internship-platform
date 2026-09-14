#!/usr/bin/env bash
set -euo pipefail

echo "===================================================="
echo " Verifying Internship Management Platform Services"
echo "===================================================="

GATEWAY_URL="${GATEWAY_URL:-http://localhost:8083}"
EUREKA_URL="${EUREKA_URL:-http://localhost:8761}"

check_endpoint() {
    local name="$1"
    local url="$2"
    local max_attempts="${3:-12}"
    local delay="${4:-5}"

    echo -n "Checking ${name} (${url}) ... "
    for attempt in $(seq 1 "$max_attempts"); do
        if curl -s -f -m 5 "$url" > /dev/null 2>&1; then
            echo "OK"
            return 0
        fi
        sleep "$delay"
    done
    echo "FAILED"
    return 1
}

FAILED=0

check_endpoint "Eureka Discovery Server" "${EUREKA_URL}/actuator/health" 10 3 || FAILED=1
check_endpoint "API Gateway" "${GATEWAY_URL}/actuator/health" 10 3 || FAILED=1
check_endpoint "Gateway -> Student Service Route" "${GATEWAY_URL}/student" 10 3 || FAILED=1
check_endpoint "Gateway -> Internship Service Route" "${GATEWAY_URL}/internships" 10 3 || FAILED=1
check_endpoint "Gateway -> Company Service Route" "${GATEWAY_URL}/companies" 10 3 || FAILED=1

if [ "$FAILED" -eq 0 ]; then
    echo "===================================================="
    echo " ALL HEALTH AND ROUTING CHECKS PASSED SUCCESSFULLY!"
    echo "===================================================="
    exit 0
else
    echo "===================================================="
    echo " VERIFICATION FAILED: ONE OR MORE SERVICES DOWN!"
    echo "===================================================="
    exit 1
fi
