$ErrorActionPreference = "Stop"

Write-Host "===================================================="
Write-Host " Verifying Internship Management Platform Services"
Write-Host "===================================================="

$GatewayUrl = if ($env:GATEWAY_URL) { $env:GATEWAY_URL } else { "http://localhost:8083" }
$EurekaUrl = if ($env:EUREKA_URL) { $env:EUREKA_URL } else { "http://localhost:8761" }

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$MaxAttempts = 30,
        [int]$DelaySeconds = 5
    )
    Write-Host -NoNewline "Checking $Name ($Url) ... "
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri $Url -TimeoutSec 15 -UseBasicParsing
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
                Write-Host "OK" -ForegroundColor Green
                return $true
            }
        } catch {
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    Write-Host "FAILED" -ForegroundColor Red
    return $false
}

$failed = $false
if (-not (Test-Endpoint -Name "Eureka Discovery Server" -Url "$EurekaUrl/actuator/health")) { $failed = $true }
if (-not (Test-Endpoint -Name "API Gateway" -Url "$GatewayUrl/actuator/health")) { $failed = $true }
if (-not (Test-Endpoint -Name "Gateway -> Student Service Route" -Url "$GatewayUrl/student")) { $failed = $true }
if (-not (Test-Endpoint -Name "Gateway -> Internship Service Route" -Url "$GatewayUrl/internships")) { $failed = $true }
if (-not (Test-Endpoint -Name "Gateway -> Company Service Route" -Url "$GatewayUrl/companies")) { $failed = $true }

if ($failed) {
    Write-Host "===================================================="
    Write-Host " VERIFICATION FAILED: ONE OR MORE SERVICES DOWN!" -ForegroundColor Red
    Write-Host "===================================================="
    exit 1
} else {
    Write-Host "===================================================="
    Write-Host " ALL HEALTH AND ROUTING CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "===================================================="
    exit 0
}
