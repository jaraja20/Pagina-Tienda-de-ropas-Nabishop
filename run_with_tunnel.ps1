# Script completo para ejecutar NabbyShop + Cloudflare Tunnel
# Este script abre el servidor y el tunnel automáticamente

Write-Host "╔════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   NabbyShop - Cloudflare Setup    ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════╝" -ForegroundColor Magenta

$projectPath = "c:\Users\jhoni\Desktop\Pagina nabbishop"

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "$projectPath\nabbyshop-final.html")) {
    Write-Host "`n✗ No se encontró el proyecto en $projectPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ Proyecto encontrado en: $projectPath" -ForegroundColor Green

# Verificar cloudflared
Write-Host "`nVerificando Cloudflared..." -ForegroundColor Yellow
try {
    $version = & cloudflared --version 2>$null
    Write-Host "✓ Cloudflared instalado: $version" -ForegroundColor Green
} catch {
    Write-Host "`n✗ Cloudflared no está instalado" -ForegroundColor Red
    Write-Host "`nPor favor, descargalo desde:" -ForegroundColor Yellow
    Write-Host "https://developers.cloudflare.com/cloudflare-one/connections/connect-applications/install-and-setup/installation/" -ForegroundColor Cyan
    Write-Host "`nO ejecuta: .\setup_cloudflare.ps1" -ForegroundColor Cyan
    exit 1
}

# Crear carpeta .cloudflared si no existe
$cloudflaredDir = "$projectPath\.cloudflared"
if (-not (Test-Path $cloudflaredDir)) {
    New-Item -ItemType Directory -Path $cloudflaredDir | Out-Null
    Write-Host "✓ Carpeta .cloudflared creada" -ForegroundColor Green
}

Write-Host "`n╔════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Iniciando Servicios...        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════╝" -ForegroundColor Cyan

# Iniciar servidor en la terminal actual
Write-Host "`n[1/2] Iniciando servidor web en puerto 8000..." -ForegroundColor Cyan

Set-Location $projectPath

# Iniciar tunnel en una nueva ventana PowerShell
Write-Host "[2/2] Iniciando Cloudflare Tunnel en nueva ventana..." -ForegroundColor Cyan

$tunnelScript = @"
cd "$projectPath"
Write-Host ""
Write-Host "╔════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Cloudflare Tunnel Activo        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Iniciando tunnel..." -ForegroundColor Yellow
Write-Host ""
cloudflared tunnel run --url http://localhost:8000
"@

# Guardar script temporal
$tempScript = "$env:TEMP\cloudflare_tunnel_temp.ps1"
Set-Content -Path $tempScript -Value $tunnelScript

# Iniciar tunnel en nueva ventana
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "& '$tempScript'"

Write-Host ""
Write-Host "╔════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ¡Todo listo!                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✓ Servidor web: http://localhost:8000" -ForegroundColor Cyan
Write-Host "✓ Tunnel: Abierto en nueva ventana" -ForegroundColor Cyan
Write-Host ""
Write-Host "En la ventana del tunnel verás un link como:" -ForegroundColor Yellow
Write-Host "https://random-name-1234.trycloudflare.com" -ForegroundColor Green
Write-Host ""
Write-Host "Cópialo y comparte para que otros accedan a tu tienda!" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C aquí para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor
Write-Host "═" * 35 -ForegroundColor DarkGray
python serve.py
