# Günlük local geliştirme — backend + frontend (ayrı pencereler)
$Root = $PSScriptRoot

Write-Host ""
Write-Host "Sosyal Oda — gelistirme sunuculari baslatiliyor..." -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "Durdurmak icin: .\stop-dev.ps1 veya pencereleri kapat" -ForegroundColor DarkGray
Write-Host ""

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$Root\backend'; Write-Host 'Backend (5000)' -ForegroundColor Blue; npm run dev"
)

Start-Sleep -Seconds 1

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$Root\frontend'; Write-Host 'Frontend (3000)' -ForegroundColor Green; npm run dev"
)
