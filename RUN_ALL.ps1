$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendRoot = Join-Path $projectRoot 'frontend'

Set-Location $projectRoot

Write-Host '1/5 Generating sample data...' -ForegroundColor Cyan
python generate_sample_data.py

Write-Host '2/5 Running backend tests...' -ForegroundColor Cyan
python -m unittest discover -s tests -p "test*.py"

Write-Host '3/5 Building frontend...' -ForegroundColor Cyan
Set-Location $frontendRoot
npm run build
Set-Location $projectRoot

Write-Host '4/5 Starting backend on http://127.0.0.1:8000 ...' -ForegroundColor Cyan
$backendHealthy = $false
try {
    $health = Invoke-RestMethod 'http://127.0.0.1:8000/health' -TimeoutSec 3
    $backendHealthy = $health.status -eq 'ok'
} catch {
    $backendHealthy = $false
}

if (-not $backendHealthy) {
    Start-Process powershell.exe -ArgumentList @(
        '-NoExit',
        '-ExecutionPolicy', 'Bypass',
        '-Command', "Set-Location '$projectRoot'; python -m uvicorn app:app --host 127.0.0.1 --port 8000"
    )
} else {
    Write-Host 'Backend is already running.' -ForegroundColor Yellow
}

Write-Host '5/5 Starting frontend on http://127.0.0.1:5173 ...' -ForegroundColor Cyan
$frontendRunning = $false
try {
    $frontendRunning = (Invoke-WebRequest 'http://127.0.0.1:5173/' -UseBasicParsing -TimeoutSec 3).StatusCode -eq 200
} catch {
    $frontendRunning = $false
}

if (-not $frontendRunning) {
    Start-Process powershell.exe -ArgumentList @(
        '-NoExit',
        '-ExecutionPolicy', 'Bypass',
        '-Command', "Set-Location '$frontendRoot'; npm run dev -- --host 127.0.0.1"
    )
} else {
    Write-Host 'Frontend is already running.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Pixel-Moon is ready.' -ForegroundColor Green
Write-Host 'Dashboard: http://127.0.0.1:5173/'
Write-Host 'API docs:  http://127.0.0.1:8000/docs'
Write-Host ''
Write-Host 'Close the backend/frontend terminal windows or press Ctrl+C in them to stop the servers.' -ForegroundColor DarkGray


#Set-Location "C:\Users\Aditya Sasamal\OneDrive\Desktop\operation_moon2.0\operation_moon"#
#powershell -ExecutionPolicy Bypass -File .\RUN_ALL.ps1#