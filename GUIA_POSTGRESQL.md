# 🗄️ GUÍA DE CONFIGURACIÓN DE POSTGRESQL - NABBYSHOP

## ✅ PASOS A SEGUIR

### PASO 1: Verificar que PostgreSQL y pgAdmin estén instalados
```powershell
# En Windows, busca en "Servicios" que PostgreSQL esté corriendo
# O en terminal:
pg_isready -h localhost
# Deberías ver: accepting connections
```

---

### PASO 2: Crear la Base de Datos

#### 2.1 Abre pgAdmin
- URL: `http://localhost/pgadmin` o `http://localhost:5050`
- Usuario: `postgres` (por defecto)
- Contraseña: La que pusiste en la instalación

#### 2.2 Crea un nuevo servidor si no existe
1. Click derecho en **Servers**
2. Selecciona **Create → Server**
3. Nombre: `Local` (o el que quieras)
4. Tab **Connection**:
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: Tu contraseña de PostgreSQL

#### 2.3 Crea la base de datos
1. Expande tu servidor en el árbol izquierdo
2. Click derecho en **Databases**
3. **Create → Database**
4. Nombre: `nabbyshop`
5. Propietario: `postgres`
6. Click **Save**

#### 2.4 Ejecuta el script SQL
1. Click en la base de datos `nabbyshop`
2. **Tools → Query Tool**
3. Abre el archivo: `create_database.sql` (está en tu carpeta del proyecto)
4. Copia y pega TODO el contenido
5. Presiona **F5** o click en **Execute**

✅ Deberías ver: "Query returned successfully"

---

### PASO 3: Actualizar Credenciales de Conexión

#### 3.1 Abre el archivo `db_connection.py`
Busca la sección `DatabaseConfig`:

```python
class DatabaseConfig:
    HOST = "localhost"           # Déjalo igual
    PORT = "5432"               # Puerto por defecto
    DATABASE = "nabbyshop"       # El nombre que creaste
    USER = "postgres"            # Tu usuario PostgreSQL
    PASSWORD = "postgres"        # ⚠️ CÁMBIALO A TU CONTRASEÑA
```

**Si cambiaste la contraseña de PostgreSQL, actualízala aquí.**

#### 3.2 Guarda el archivo

---

### PASO 4: Verificar la Conexión

#### 4.1 Abre una terminal PowerShell
```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
python db_connection.py
```

#### 4.2 Resultado esperado
```
✅ Conexión a PostgreSQL exitosa!
```

Si hay error, verás:
```
❌ Error conectando a PostgreSQL: ...
```

**Soluciones comunes:**
- ❌ "FATAL: password authentication failed" → Actualiza PASSWORD en db_connection.py
- ❌ "could not connect to server" → PostgreSQL no está corriendo
- ❌ "database "nabbyshop" does not exist" → Crea la BD (Paso 2)

---

### PASO 5: Ejecutar el Servidor

```powershell
cd "c:\Users\jhoni\Desktop\Pagina nabbishop"
python serve.py
```

Resultado:
```
Serving at http://localhost:8000/nabbyshop-final.html
```

✅ Se abrirá automáticamente en tu navegador

---

### PASO 6: Probar que Funciona

#### 6.1 En la web, agrega un producto
1. Ve a **Admin Panel** (si lo tienes)
2. Carga una imagen desde el portapapeles
3. Completa los datos del producto
4. Click en **Guardar**

#### 6.2 Recarga la página
Si la persistencia funciona, el producto **debe estar ahí**

#### 6.3 Abre otra pestaña del navegador
Si el producto aparece aquí también, **PostgreSQL está guardando correctamente** ✅

---

## 🔍 VERIFICAR LOS DATOS EN PGADMIN

1. Abre pgAdmin
2. Navega: `Servers → Local → Databases → nabbyshop → Schemas → public → Tables`
3. Haz click en `products` (o `cart_items`, `favorites`, etc)
4. Click en **Data**
5. Verás todos los datos guardados en la BD

---

## 📝 ESTRUCTURA DE TABLAS PRINCIPALES

### `products` (Productos)
- `id` - ID único
- `title` - Nombre del producto
- `price` - Precio
- `color` - Color
- `in_stock` - ¿Disponible?
- `created_at` - Fecha de creación

### `product_images` (Imágenes)
- `id` - ID único
- `product_id` - Referencia al producto
- `image_data` - Imagen en bytes (base64)
- `image_name` - Nombre de archivo

### `cart_items` (Carrito)
- `id` - ID único
- `user_id` - Usuario
- `product_id` - Producto
- `quantity` - Cantidad
- `size` - Talla

### `favorites` (Favoritos)
- `id` - ID único
- `user_id` - Usuario
- `product_id` - Producto

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Problema: "Error conectando a PostgreSQL"
**Solución:**
1. Abre **Servicios** (services.msc)
2. Busca "PostgreSQL"
3. Click derecho → **Iniciar**

### Problema: "Error de contraseña"
**Solución:**
```python
# En db_connection.py, actualiza:
PASSWORD = "tu_contraseña_real"  # No "postgres"
```

### Problema: "Base de datos no existe"
**Solución:**
Repite Paso 2 (Crear la BD)

### Problema: Los datos no se guardan
**Solución:**
1. Verifica que NO haya errores en la terminal de Python
2. Asegúrate de que PostgreSQL esté corriendo
3. Revisa en pgAdmin que los datos aparezcan en la tabla `products`

---

## 📚 FUNCIONES DISPONIBLES EN db_connection.py

### Productos
- `NabbyShopDB.get_all_products()` - Obtener todos
- `NabbyShopDB.create_product(data)` - Crear nuevo
- `NabbyShopDB.update_product(id, data)` - Actualizar
- `NabbyShopDB.delete_product(id)` - Eliminar
- `NabbyShopDB.get_product_images(id)` - Obtener imágenes

### Carrito
- `NabbyShopDB.add_to_cart(user_id, product_id, qty, size)`
- `NabbyShopDB.get_cart(user_id)`
- `NabbyShopDB.remove_from_cart(cart_id)`

### Favoritos
- `NabbyShopDB.add_to_favorites(user_id, product_id)`
- `NabbyShopDB.get_favorites(user_id)`
- `NabbyShopDB.remove_from_favorites(user_id, product_id)`

---

## 🚀 PRÓXIMOS PASOS (OPCIONAL)

### Si quieres integrar el carrito con BD:
Actualiza `cart.js` para guardar en `/api/save-cart` en lugar de localStorage

### Si quieres usuarios autenticados:
Usa la tabla `users` y agrega login en `auth.js`

### Si quieres historial de compras:
Los datos están en `orders` y `order_items`

---

**¿Preguntas? Revisa los archivos:**
- `db_connection.py` - Documentado con comentarios
- `serve.py` - APIs actualizadas
- `create_database.sql` - Esquema completo
