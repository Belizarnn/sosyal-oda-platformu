# 5000 ve 3000 portlarini kullanan surecleri durdurur (EADDRINUSE icin)
$ports = @(5000, 3000)
$stopped = 0

foreach ($port in $ports) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($conn in $connections) {
    $pid = $conn.OwningProcess
    if ($pid -and $pid -ne 0) {
      Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
      Write-Host "Port $port durduruldu (PID: $pid)" -ForegroundColor Yellow
      $stopped++
    }
  }
}

if ($stopped -eq 0) {
  Write-Host "5000 ve 3000 portlarinda calisan surec yok." -ForegroundColor Gray
} else {
  Write-Host "Tamam. Simdi .\dev.ps1 ile tekrar baslatabilirsin." -ForegroundColor Green
}
