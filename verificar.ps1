# Verificador de configuración de Cloudflare

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🔍 Verificador de Configuración NabbyShop        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\Users\jhoni\Desktop\Pagina nabbishop"
$checks = 0
$passed = 0

# Función para mostrar chequeo
function Test-Item {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$FixCommand = ""
    )
    
    global:$checks++
    Write-Host "[$checks] $Name ... " -ForegroundColor Yellow -NoNewline
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host "✓" -ForegroundColor Green
            global:$passed++
            return $true
        } else {
            Write-Host "✗" -ForegroundColor Red
            if ($FixCommand) {
                Write-Host "       Ejecuta: $FixCommand" -ForegroundColor Cyan
            }
            return $false
        }
    } catch {
        Write-Host "✗" -ForegroundColor Red
        Write-Host "       Error: $_" -ForegroundColor Red
        if ($FixCommand) {
            Write-Host "       Ejecuta: $FixCommand" -ForegroundColor Cyan
        }
        return $false
    }
}

Write-Host "Verificando componentes necesarios..." -ForegroundColor White
Write-Host ""

# Verificaciones
Test-Item "Python instalado" {
    $python = & python --version 2>&1
    $python -match "Python"
} | Out-Null

Test-Item "Carpeta del proyecto existe" {
    Test-Path $projectPath
} | Out-Null

Test-Item "Archivo nabbyshop-final.html" {
    Test-Path "$projectPath\nabbyshop-final.html"
} | Out-Null

Test-Item "Servidor serve.py" {
    Test-Path "$projectPath\serve.py"
} | Out-Null

Test-Item "Cloudflared instalado" {
    $cf = & cloudflared --version 2>&1
    $cf -match "cloudflared"
} | Out-Null

Test-Item "Script setup_cloudflare.ps1" {
    Test-Path "$projectPath\setup_cloudflare.ps1"
} | Out-Null

Test-Item "Script share_link.ps1" {
    Test-Path "$projectPath\share_link.ps1"
} | Out-Null

Test-Item "Script nabbyshop-menu.ps1" {
    Test-Path "$projectPath\nabbyshop-menu.ps1"
} | Out-Null

Test-Item "Documentación COMPARTIR_LINK.md" {
    Test-Path "$projectPath\COMPARTIR_LINK.md"
} | Out-Null

Test-Item "Documentación CLOUDFLARE_SETUP.md" {
    Test-Path "$projectPath\CLOUDFLARE_SETUP.md"
} | Out-Null

Test-Item "Puerto 8000 disponible" {
    $testConn = Test-NetConnection -ComputerName localhost -Port 8000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    -not $testConn.TcpTestSucceeded
} | Out-Null

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor White
Write-Host "║                    RESULTADO FINAL                       ║" -ForegroundColor White
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor White
Write-Host ""

$percentage = [math]::Round(($passed / $checks) * 100)

Write-Host "Verificaciones pasadas: " -NoNewline
if ($passed -eq $checks) {
    Write-Host "$passed/$checks ✓" -ForegroundColor Green
} else {
    Write-Host "$passed/$checks" -ForegroundColor Yellow
}

Write-Host ""

if ($passed -eq $checks) {
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✓ ¡TODO ESTÁ LISTO PARA COMPARTIR TU TIENDA!           ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Próximo paso: Ejecuta" -ForegroundColor Cyan
    Write-Host "  .\nabbyshop-menu.ps1" -ForegroundColor Green
    
} elseif ($passed -ge ($checks * 0.8)) {
    Write-Host "⚠ Hay algunos componentes faltantes. Por favor instálalos." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ejecuta:" -ForegroundColor Cyan
    Write-Host "  .\setup_cloudflare.ps1" -ForegroundColor Green
    
} else {
    Write-Host "✗ Faltan muchos componentes. Revisa la instalación." -ForegroundColor Red
}

Write-Host ""
