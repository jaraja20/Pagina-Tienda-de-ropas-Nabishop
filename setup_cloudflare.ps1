# Script para configurar Cloudflare Tunnel
# Este script descargará e instalará cloudflared y creará un tunnel

Write-Host "====================================" -ForegroundColor Green
Write-Host "Configurando Cloudflare Tunnel" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# 1. Descargar cloudflared si no existe
$cloudflaredPath = "C:\Program Files (x86)\Cloudflare\Cloudflared\cloudflared.exe"

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "`nDescargando cloudflared..." -ForegroundColor Yellow
    
    # Descargar desde el repositorio oficial
    $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    $outputPath = "$env:TEMP\cloudflared.exe"
    
    try {
        # Usar PowerShell para descargar
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
        
        Write-Host "Instalando cloudflared..." -ForegroundColor Yellow
        & $outputPath install
        
        Write-Host "✓ Cloudflared instalado correctamente" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error al descargar/instalar cloudflared: $_" -ForegroundColor Red
        Write-Host "Por favor, descárgalo manualmente desde: https://developers.cloudflare.com/cloudflare-one/connections/connect-applications/install-and-setup/installation/" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✓ Cloudflared ya está instalado" -ForegroundColor Green
}

Write-Host "`n====================================" -ForegroundColor Green
Write-Host "Cloudflare Tunnel está listo" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "`nInstrucciones:" -ForegroundColor Cyan
Write-Host "1. Abre una terminal y ejecuta: cloudflared tunnel login"
Write-Host "2. Luego ejecuta: cloudflared tunnel create nabbyshop"
Write-Host "3. Finalmente ejecuta: cloudflared tunnel run nabbyshop"
Write-Host "`nO usa el script 'start_tunnel.ps1' para iniciarlo automáticamente" -ForegroundColor Cyan
