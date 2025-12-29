# Script rápido para compartir NabbyShop por Cloudflare
# Uso: .\share_link.ps1

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║     NabbyShop - Compartir Link          ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

$projectPath = "c:\Users\jhoni\Desktop\Pagina nabbishop"

# Verificar cloudflared
Write-Host "Verificando requisitos..." -ForegroundColor Yellow

try {
    $version = & cloudflared --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Cloudflared no disponible"
    }
} catch {
    Write-Host "`n✗ Cloudflared no está instalado" -ForegroundColor Red
    Write-Host "`nInstálalo ejecutando: .\setup_cloudflare.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Cloudflared detectado" -ForegroundColor Green

# Verificar servidor
Write-Host "Verificando servidor local..." -ForegroundColor Yellow
try {
    $testConnection = Test-NetConnection -ComputerName localhost -Port 8000 -WarningAction SilentlyContinue
    if ($testConnection.TcpTestSucceeded) {
        Write-Host "✓ Servidor corriendo en puerto 8000" -ForegroundColor Green
    } else {
        throw "Puerto 8000 no disponible"
    }
} catch {
    Write-Host "`n⚠ Servidor no está corriendo" -ForegroundColor Yellow
    Write-Host "`nPor favor, ejecuta en otra terminal:" -ForegroundColor Cyan
    Write-Host "  cd `"$projectPath`"" -ForegroundColor Cyan
    Write-Host "  python serve.py" -ForegroundColor Cyan
    Write-Host "`nLuego vuelve a ejecutar este script" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Iniciando sesión de compartir...       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Abriendo túnel Cloudflare..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Espera a que aparezca un URL como:" -ForegroundColor Yellow
Write-Host "https://random-name-1234.trycloudflare.com" -ForegroundColor Green
Write-Host ""
Write-Host "¡Cópialo y comparte!" -ForegroundColor Green
Write-Host ""
Write-Host "─────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# Ejecutar tunnel en modo quick tunnel (sin necesidad de configuración previa)
cloudflared tunnel --url http://localhost:8000

Write-Host ""
Write-Host "─────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""
Write-Host "✓ Sesión finalizada" -ForegroundColor Green
