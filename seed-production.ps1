# Production Neon veritabanina demo seed (backend/.env DATABASE_URL kullanir)
$Root = $PSScriptRoot

Write-Host ""
Write-Host "Production Demo Seed" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""
Write-Host "backend/.env icindeki DATABASE_URL kullanilacak." -ForegroundColor Gray
Write-Host "Demo sifre: password123" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Devam etmek icin E yazin (Enter = iptal)"
if ($confirm -ne "E" -and $confirm -ne "e") {
  Write-Host "Iptal edildi." -ForegroundColor Yellow
  exit 0
}

Push-Location "$Root\backend"
$env:NODE_ENV = "production"
$env:ALLOW_DEMO_SEED = "true"

npm run prisma:seed
$exitCode = $LASTEXITCODE

Pop-Location

if ($exitCode -eq 0) {
  Write-Host ""
  Write-Host "Tamam. Giris: sudenaz@example.com / password123" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "Seed basarisiz. DATABASE_URL ve migration durumunu kontrol edin." -ForegroundColor Red
}

exit $exitCode
