# Cloudflare Tunnel Setup para NabbyShop

Este archivo contiene instrucciones para configurar Cloudflare Tunnel y compartir tu tienda online con links públicos temporales.

## ¿Qué es Cloudflare Tunnel?

Cloudflare Tunnel te permite:
- ✅ Compartir tu sitio local con otros sin exponerlo a internet
- ✅ Generar links públicos temporales
- ✅ Acceso seguro con autenticación opcional
- ✅ Sin necesidad de abrir puertos en tu router
- ✅ Dominio gratuito y HTTPS automático

## Instalación Rápida

### Opción 1: Script Automatizado (Recomendado)

1. Abre PowerShell como Administrador
2. Navega a la carpeta del proyecto:
   ```powershell
   cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
   ```

3. Ejecuta el script de configuración:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\setup_cloudflare.ps1
   ```

### Opción 2: Instalación Manual

1. Descarga cloudflared desde:
   https://developers.cloudflare.com/cloudflare-one/connections/connect-applications/install-and-setup/installation/

2. Ejecuta el instalador

3. Abre PowerShell y ejecuta:
   ```powershell
   cloudflared tunnel login
   ```

## Uso

### Paso 1: Iniciar el servidor local

```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
python serve.py
```

Debería mostrar:
```
Serving on port 8000
http://localhost:8000
```

### Paso 2: Iniciar el Tunnel (Nueva Terminal)

```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
.\start_tunnel.ps1
```

O manualmente:
```powershell
cloudflared tunnel run nabbyshop --url http://localhost:8000
```

### Paso 3: Obtener el Link Público

Cuando el tunnel esté activo, verás algo como:
```
Your quick tunnel has been created! Visit it at (this will be available shortly)
https://random-name-1234.trycloudflare.com
```

## Copiar el Link para Compartir

Cuando ves el mensaje de tunnel activo, aparecerá un URL como:
```
https://random-name-1234.trycloudflare.com
```

Cópialo y comparte para que otros accedan a tu tienda.

## Generar Links Públicos Temporales

Cloudflare Tunnel genera automáticamente:
- **Links que expiran**: Cada sesión de tunnel es diferente
- **Acceso seguro**: Solo quienes tengan el link pueden acceder
- **Sin configuración compleja**: Todo es automático

### Para usar enlaces de sesión específica:

Los links son válidos mientras el tunnel esté corriendo. Cuando cierres el tunnel (`Ctrl+C`), el link ya no funciona.

Para link permanente, necesitas un dominio personalizado en Cloudflare:

1. Compra un dominio o usa uno existente
2. Apunta los nameservers a Cloudflare
3. Crea un registro DNS CNAME
4. Configura el tunnel para ese dominio

## Ejemplos de Uso

### Compartir para testing:

```powershell
# Terminal 1: Servidor
python serve.py

# Terminal 2: Tunnel
.\start_tunnel.ps1

# Comparte el link que aparezca
# https://random-name-1234.trycloudflare.com
```

### Detener el tunnel:

Presiona `Ctrl+C` en la terminal del tunnel

## Troubleshooting

### "cloudflared" no se reconoce
- Solución: Reinicia PowerShell o agrégalo al PATH manualmente

### Error de conexión
- Verifica que el servidor local esté corriendo (puerto 8000)
- Revisa tu conexión a internet

### El link no funciona
- El tunnel debe estar activo (correr el script start_tunnel.ps1)
- Espera 30 segundos después de iniciar el tunnel

## Comandos Útiles

```powershell
# Ver versión
cloudflared --version

# Ver tunnels disponibles
cloudflared tunnel list

# Crear un nuevo tunnel
cloudflared tunnel create nombre

# Ver configuración
cloudflared tunnel info

# Eliminar un tunnel
cloudflared tunnel delete nombre
```

## Seguridad

- ✅ Los links son aleatorios y difíciles de adivinar
- ✅ HTTPS automático
- ✅ No expones tu IP
- ✅ Puedes agregar autenticación adicional

## Más Información

- Documentación oficial: https://developers.cloudflare.com/cloudflare-one/connections/connect-applications/
- Dashboard: https://dash.cloudflare.com/

---

¡Disfruta compartiendo tu tienda online! 🚀
