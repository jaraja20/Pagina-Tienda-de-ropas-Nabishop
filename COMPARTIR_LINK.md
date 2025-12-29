# 🚀 Compartir NabbyShop con Cloudflare Tunnel

## Forma Más Rápida (Recomendado)

### Paso 1: Instalar Cloudflared (una sola vez)

Abre PowerShell como Administrador y ejecuta:

```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup_cloudflare.ps1
```

### Paso 2: Compartir el Link

Abre **DOS terminales**:

**Terminal 1 - Servidor Web:**
```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
python serve.py
```

**Terminal 2 - Crear Link Temporal:**
```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
.\share_link.ps1
```

Verás un URL como:
```
https://random-name-1234.trycloudflare.com
```

**¡Cópialo y comparte!** 🎉

---

## Alternativas

### Opción: Todo en una sola ventana

```powershell
.\run_with_tunnel.ps1
```

Este script abre todo automáticamente (servidor + tunnel).

---

## ¿Cómo funciona?

- ✅ **Tunnel seguro**: Tu dirección IP nunca se expone
- ✅ **Link temporal**: Válido solo mientras el tunnel esté activo
- ✅ **HTTPS automático**: Encriptación incluida
- ✅ **Sin configuración**: Todo automático

---

## Detener la Sesión

Presiona `Ctrl+C` en cualquier terminal para detener el tunnel.

---

## Troubleshooting

**Error: "Set-ExecutionPolicy: Access Denied"**
- Abre PowerShell como Administrador

**Error: "cloudflared no se reconoce"**
- Reinicia PowerShell después de instalar
- O espera 1 minuto para que se registre en el sistema

**El link no funciona**
- Verifica que ambas terminales (servidor y tunnel) estén activas
- Espera 30 segundos después de ejecutar share_link.ps1

---

## Para Información Detallada

Ver: `CLOUDFLARE_SETUP.md`

---

**¡Listo para compartir tu tienda online!** 🛍️
