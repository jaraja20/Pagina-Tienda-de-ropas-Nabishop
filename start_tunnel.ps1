# Script para iniciar Cloudflare Tunnel para NabbyShop

Write-Host "====================================" -ForegroundColor Green
Write-Host "Iniciando Cloudflare Tunnel" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Verificar que cloudflared esté instalado
try {
    $version = & cloudflared --version 2>$null
    Write-Host "✓ Cloudflared: $version" -ForegroundColor Green
} catch {
    Write-Host "✗ Cloudflared no está instalado" -ForegroundColor Red
    Write-Host "Ejecuta primero: setup_cloudflare.ps1" -ForegroundColor Yellow
    exit 1
}

# Obtener el puerto del servidor local
$port = 8000
$localUrl = "http://localhost:$port"

Write-Host "`nConfiguración:" -ForegroundColor Cyan
Write-Host "- URL Local: $localUrl"
Write-Host "- Tunnel: nabbyshop"
Write-Host "- Estado: Conectando..."

Write-Host "`n====================================" -ForegroundColor Green
Write-Host "Iniciando tunnel..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Iniciar el tunnel
# Este comando mantendrá abierta la conexión
cloudflared tunnel run nabbyshop --url $localUrl

Write-Host "`n✗ Tunnel desconectado" -ForegroundColor Red
