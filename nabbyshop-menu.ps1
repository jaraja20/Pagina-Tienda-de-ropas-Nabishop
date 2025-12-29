# Script interactivo en español para Cloudflare

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                  🚀 NabbyShop Link                     ║" -ForegroundColor Magenta
Write-Host "║              Compartir tu tienda online               ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

$projectPath = "c:\Users\jhoni\Desktop\Pagina nabbishop"

Write-Host "¿Qué deseas hacer?" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. 🔧 Instalar Cloudflared (primera vez)" -ForegroundColor Yellow
Write-Host "  2. 🔗 Generar link temporal para compartir" -ForegroundColor Green
Write-Host "  3. 📖 Ver guía rápida" -ForegroundColor Blue
Write-Host "  4. ❌ Salir" -ForegroundColor Red
Write-Host ""

$choice = Read-Host "Selecciona una opción (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║              Instalando Cloudflared...                ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        
        & "$projectPath\setup_cloudflare.ps1"
        
        Write-Host ""
        Write-Host "✓ Instalación completada" -ForegroundColor Green
        Write-Host ""
        Write-Host "Próximo paso:" -ForegroundColor Yellow
        Write-Host "  Ejecuta nuevamente este script y selecciona opción 2" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host ""
        Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║         🔗 Preparando link de compartir...            ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Verificando requisitos..." -ForegroundColor Yellow
        
        # Verificar cloudflared
        try {
            $version = & cloudflared --version 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Cloudflared no disponible"
            }
            Write-Host "  ✓ Cloudflared instalado" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Cloudflared no está instalado" -ForegroundColor Red
            Write-Host ""
            Write-Host "  Por favor, primero ejecuta la opción 1 (instalar)" -ForegroundColor Yellow
            break
        }
        
        # Verificar servidor
        Write-Host "  ✓ Verificando servidor..." -ForegroundColor Green
        
        $serverRunning = $false
        try {
            $testConnection = Test-NetConnection -ComputerName localhost -Port 8000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            if ($testConnection.TcpTestSucceeded) {
                Write-Host "  ✓ Servidor activo en puerto 8000" -ForegroundColor Green
                $serverRunning = $true
            }
        } catch { }
        
        if (-not $serverRunning) {
            Write-Host "  ⚠ Servidor no está activo" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "  Por favor, abre OTRA terminal y ejecuta:" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "    cd `"$projectPath`"" -ForegroundColor Cyan
            Write-Host "    python serve.py" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  Luego presiona Enter aquí para continuar..." -ForegroundColor Yellow
            Read-Host "Presiona Enter cuando el servidor esté listo"
        }
        
        Write-Host ""
        Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║           🌐 Generando link temporalmente...          ║" -ForegroundColor Cyan
        Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Verás un URL como:" -ForegroundColor Yellow
        Write-Host "  https://random-name-1234.trycloudflare.com" -ForegroundColor Green
        Write-Host ""
        Write-Host "¡Cópialo y comparte en tus redes!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "El link será válido mientras esta ventana esté abierta." -ForegroundColor Gray
        Write-Host ""
        Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
        Write-Host ""
        
        # Ejecutar tunnel
        cloudflared tunnel --url http://localhost:8000
        
        Write-Host ""
        Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "✓ Sesión de compartir finalizada" -ForegroundColor Green
    }
    
    "3" {
        Write-Host ""
        Write-Host "Abriendo guía rápida..." -ForegroundColor Cyan
        
        $guiaPath = "$projectPath\GUIA_RAPIDA.txt"
        if (Test-Path $guiaPath) {
            Get-Content $guiaPath
        } else {
            Write-Host "Archivo de guía no encontrado" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "¡Hasta pronto! 👋" -ForegroundColor Green
        Write-Host ""
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "Opción no válida. Por favor selecciona 1-4" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Presiona Enter para volver al menú..." -ForegroundColor Yellow
Read-Host ""

# Volver al menú (recursivamente)
& $PSCommandPath
