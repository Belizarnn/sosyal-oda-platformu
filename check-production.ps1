# Canlı ortam health + entegrasyon kontrolü
$Api = "https://sosyal-oda-platformu.onrender.com"
$App = "https://sosyal-oda-platformu.vercel.app"

Write-Host ""
Write-Host "Sosyal Oda — Production Kontrol" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

function Test-Endpoint {
  param([string]$Name, [string]$Url)
  try {
    $response = Invoke-RestMethod -Uri $Url -TimeoutSec 90
    Write-Host "[OK] $Name" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 -Compress
  } catch {
    Write-Host "[HATA] $Name" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor DarkRed
  }
  Write-Host ""
}

Test-Endpoint "API /health" "$Api/health"
Test-Endpoint "API /health/db" "$Api/health/db"
Test-Endpoint "API /health/integrations" "$Api/health/integrations"

try {
  $app = Invoke-WebRequest -Uri $App -TimeoutSec 30 -UseBasicParsing
  if ($app.StatusCode -eq 200) {
    Write-Host "[OK] Frontend $App" -ForegroundColor Green
  }
} catch {
  Write-Host "[HATA] Frontend" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor DarkRed
}

Write-Host ""
Write-Host "Kurulum rehberi: PRODUCTION_SETUP.md" -ForegroundColor DarkGray
