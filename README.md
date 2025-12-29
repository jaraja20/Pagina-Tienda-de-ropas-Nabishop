# NabbyShop - Sistema Completo

## ✅ Características Implementadas

### 1. Sistema de Autenticación
- **Login/Registro**: Modal con dos tabs
- **Dos roles**: Admin y Comprador
- **Credenciales demo**:
  - Admin: `admin` / `admin123`
  - Comprador: `comprador` / `comprador123`
- El icono de usuario cambia de color según el rol

### 2. Módulos de Ropa Clickeables
- Haz click en cualquier prenda para abrir modal detalle
- Muestra: título, precio, descripción, tamaños, estado de stock
- **Para Admins**: Editar información directamente sin tocar código
- Botón "Agregar al Carrito"
- Botón "Consultar por WhatsApp"

### 3. Sistema de Favoritos
- Corazón en header para ver favoritos
- Agregar/remover productos de favoritos
- Agregar uno o todos al carrito desde favoritos
- Badge con contador de favoritos

### 4. Carrito de Compras
- Icono carrito en header
- Agregar productos con tamaño seleccionado
- Modificar cantidades
- Ver subtotal, envío (gratis >$50) y total
- Botones: "Proceder al Pago" y "Continuar Comprando"

## 📁 Archivos

- `nabbyshop-final.html` - Página principal (estilos + estructura)
- `auth.js` - Sistema de autenticación
- `products.js` - Detalle de productos y edición admin
- `favorites.js` - Sistema de favoritos
- `cart.js` - Carrito de compras

## 🚀 Cómo Usar

1. Abre `http://localhost:8000/nabbyshop-final.html`
2. Haz click en el icono de usuario para login
3. Haz click en cualquier prenda para ver detalles
4. Usa el corazón para favoritos
5. Usa la bolsa para carrito

## 💾 Datos

Todo se guarda en **localStorage** del navegador:
- Usuarios
- Productos
- Carrito
- Favoritos

## 🔧 Para Editar Productos (Admin)

1. Login con admin
2. Click en prenda
3. Edita en la sección "Editar Producto (Modo Admin)"
4. Click "Guardar Cambios"

## 🌐 Compartir tu Tienda Online

### Opción 1: Usar el Menú Interactivo (Más Fácil)

```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
.\nabbyshop-menu.ps1
```

Sigue el menú interactivo en español.

### Opción 2: Manual Rápido

**Terminal 1 - Servidor:**
```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
python serve.py
```

**Terminal 2 - Generar Link:**
```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
.\share_link.ps1
```

Verás un URL como: `https://random-name-1234.trycloudflare.com`

**¡Cópialo y comparte!**

### Primera Vez: Instalar Cloudflared

```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup_cloudflare.ps1
```

---

## 📚 Documentación Completa

- **COMPARTIR_LINK.md** - Guía rápida en español
- **CLOUDFLARE_SETUP.md** - Documentación detallada
- **GUIA_RAPIDA.txt** - Pasos paso a paso

