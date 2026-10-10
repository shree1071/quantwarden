# ==============================================================================
# QUANTWARDEN PROTOTYPE DEMO LAUNCHER
# Automated end-to-end demonstration script
# ==============================================================================

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   QUANTWARDEN — SOVEREIGN POST-QUANTUM CRYPTOGRAPHY PLATFORM DEMO      " -ForegroundColor Green
Write-Host "   NIST FIPS 203 (ML-KEM) · FIPS 204 (ML-DSA) · HNDL Defense            " -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Web Server Status
Write-Host "[1/4] Checking Domain Sentinel Web Server (Port 3000)..." -ForegroundColor White
$webRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if (-not $webRunning) {
    Write-Host "       Starting web server in background..." -ForegroundColor Yellow
    Start-Process -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory "C:\Users\shree\quantguard-domain-scanner" -WindowStyle Hidden
    Start-Sleep -Seconds 2
} else {
    Write-Host "       Web server is already active on http://localhost:3000" -ForegroundColor Green
}

# Open Web Dashboard in Default Browser
Write-Host "       Launching Web Dashboard in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Start-Sleep -Seconds 2

# 2. Run Live Wire-Level TLS Probe
Write-Host ""
Write-Host "[2/4] Executing Live Wire-Level PQC TLS 1.3 Probe against airlinecabz.com..." -ForegroundColor White
Write-Host "       Negotiating X25519MLKEM768 (0x11EC) & analyzing leaf endpoints..." -ForegroundColor Gray
Write-Host ""

node C:\Users\shree\quantguard-cli\bin\quantguard.js probe airlinecabz.com

# 3. Run Codebase AST Vulnerability Scan & CBOM Generation
Write-Host ""
Write-Host "[3/4] Running Codebase AST Scan & Generating CycloneDX 1.6 CBOM..." -ForegroundColor White
Write-Host ""

node C:\Users\shree\quantguard-cli\bin\quantguard.js cbom C:\Users\shree\quantguard-vscode\mock_workspace --out C:\Users\shree\quantguard-vscode\mock_workspace\.quantguard\cbom.json

# 4. Preview Autonomous AI Refactoring Patch
Write-Host ""
Write-Host "[4/4] Demonstrating Autonomous Remediation Engine (NIST FIPS 203/204 Codemod)..." -ForegroundColor White
Write-Host ""

node C:\Users\shree\quantguard-cli\bin\quantguard.js remediate C:\Users\shree\quantguard-vscode\mock_workspace

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "   PROTOTYPE DEMONSTRATION COMPLETE                                     " -ForegroundColor Green
Write-Host "   - Web Sentinel:    http://localhost:3000                             " -ForegroundColor White
Write-Host "   - GitHub Repo:     https://github.com/shreeharshazarthi/quantwarden  " -ForegroundColor White
Write-Host "========================================================================" -ForegroundColor Green
Write-Host ""
