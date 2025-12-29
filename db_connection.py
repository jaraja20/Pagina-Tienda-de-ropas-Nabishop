"""
=================================================
Módulo de Conexión a PostgreSQL
=================================================
Gestiona la conexión y operaciones CRUD con la base de datos
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import json
import base64
from datetime import datetime

class DatabaseConfig:
    """Configuración de conexión a PostgreSQL"""
    
    # ⚠️ REEMPLAZA ESTOS VALORES CON LOS TUYOS
    HOST = "localhost"           # o 127.0.0.1
    PORT = "5432"               # Puerto por defecto de PostgreSQL
    DATABASE = "nabbyshop"       # Nombre de la BD que creamos
    USER = "postgres"            # Usuario por defecto
    PASSWORD = "root"            # Cambia si tu contraseña es diferente
    
    @staticmethod
    def get_connection():
        """Obtener conexión a la base de datos"""
        try:
            conn = psycopg2.connect(
                host=DatabaseConfig.HOST,
                port=DatabaseConfig.PORT,
                database=DatabaseConfig.DATABASE,
                user=DatabaseConfig.USER,
                password=DatabaseConfig.PASSWORD
            )
            return conn
        except psycopg2.OperationalError as e:
            print(f"❌ Error conectando a PostgreSQL: {e}")
            print("Asegúrate de que:")
            print("1. PostgreSQL está corriendo")
            print("2. La base de datos 'nabbyshop' existe")
            print("3. Las credenciales (usuario/contraseña) son correctas")
            raise


class NabbyShopDB:
    """Clase para operaciones con la base de datos"""
    
    # ================== PRODUCTOS ==================
    
    @staticmethod
    def get_all_products():
        """Obtener todos los productos"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute("""
                SELECT p.*, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                ORDER BY p.created_at DESC
            """)
            
            products = cur.fetchall()
            cur.close()
            conn.close()
            
            return [dict(p) for p in products]
        except Exception as e:
            print(f"Error obteniendo productos: {e}")
            return []
    
    @staticmethod
    def get_product_by_id(product_id):
        """Obtener un producto específico"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute("SELECT * FROM products WHERE id = %s", (product_id,))
            product = cur.fetchone()
            cur.close()
            conn.close()
            
            return dict(product) if product else None
        except Exception as e:
            print(f"Error obteniendo producto: {e}")
            return None
    
    @staticmethod
    def create_product(data):
        """Crear un nuevo producto"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor()
            
            # Insertar producto
            cur.execute("""
                INSERT INTO products 
                (title, description, price, type, color, color_code, in_stock, stock_quantity)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                data.get('title'),
                data.get('description'),
                data.get('price'),
                data.get('type'),
                data.get('color'),
                data.get('colorCode'),
                data.get('inStock', True),
                data.get('stock_quantity', 0)
            ))
            
            product_id = cur.fetchone()[0]
            
            # Insertar tallas
            sizes = data.get('sizes', [])
            for size in sizes:
                cur.execute(
                    "INSERT INTO product_sizes (product_id, size) VALUES (%s, %s)",
                    (product_id, size)
                )
            
            # Insertar imágenes (en base64)
            images = data.get('images', [])
            for idx, image in enumerate(images):
                if 'src' in image and image['src'].startswith('data:'):
                    # Convertir base64 a bytes
                    base64_str = image['src'].split(',')[1]
                    image_bytes = base64.b64decode(base64_str)
                    
                    cur.execute("""
                        INSERT INTO product_images 
                        (product_id, image_data, image_name, image_type, is_main)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        product_id,
                        image_bytes,
                        image.get('name', f'image-{idx}.jpg'),
                        'jpeg',
                        idx == 0
                    ))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {"success": True, "product_id": product_id}
        except Exception as e:
            print(f"Error creando producto: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def update_product(product_id, data):
        """Actualizar un producto"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor()
            
            cur.execute("""
                UPDATE products 
                SET title=%s, description=%s, price=%s, type=%s, 
                    color=%s, color_code=%s, in_stock=%s, 
                    stock_quantity=%s, updated_at=CURRENT_TIMESTAMP
                WHERE id=%s
            """, (
                data.get('title'),
                data.get('description'),
                data.get('price'),
                data.get('type'),
                data.get('color'),
                data.get('colorCode'),
                data.get('inStock', True),
                data.get('stock_quantity', 0),
                product_id
            ))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {"success": True}
        except Exception as e:
            print(f"Error actualizando producto: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def delete_product(product_id):
        """Eliminar un producto"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor()
            
            cur.execute("DELETE FROM products WHERE id = %s", (product_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {"success": True}
        except Exception as e:
            print(f"Error eliminando producto: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_product_images(product_id):
        """Obtener imágenes de un producto"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute(
                "SELECT * FROM product_images WHERE product_id = %s ORDER BY is_main DESC",
                (product_id,)
            )
            
            images = cur.fetchall()
            cur.close()
            conn.close()
            
            # Convertir bytes a base64
            result = []
            for img in images:
                img_dict = dict(img)
                if img_dict.get('image_data'):
                    img_dict['image_data'] = 'data:image/jpeg;base64,' + base64.b64encode(img_dict['image_data']).decode()
                result.append(img_dict)
            
            return result
        except Exception as e:
            print(f"Error obteniendo imágenes: {e}")
            return []
    
    # ================== CARRITO ==================
    
    @staticmethod
    def add_to_cart(user_id, product_id, quantity, size=None):
        """Agregar producto al carrito"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor()
            
            cur.execute("""
                INSERT INTO cart_items (user_id, product_id, quantity, size)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id, product_id, size) 
                DO UPDATE SET quantity = quantity + %s
            """, (user_id, product_id, quantity, size, quantity))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {"success": True}
        except Exception as e:
            print(f"Error agregando al carrito: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_cart(user_id):
        """Obtener carrito del usuario"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute("""
                SELECT ci.*, p.title, p.price, p.color
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.user_id = %s
                ORDER BY ci.added_at DESC
            """, (user_id,))
            
            items = cur.fetchall()
            cur.close()
            conn.close()
            
            return [dict(item) for item in items]
        except Exception as e:
            print(f"Error obteniendo carrito: {e}")
            return []
    
    @staticmethod
    def remove_from_cart(cart_item_id):
        """Remover item del carrito"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor()
            
            cur.execute("DELETE FROM cart_items WHERE id = %s", (cart_item_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {"success": True}
        except Exception as e:
            print(f"Error removiendo del carrito: {e}")
            return {"success": False, "error": str(e)}
    
    # ================== FAVORITOS ==================
    
    @staticmethod
    def add_to_favorites(user_id, product_id):
        """Agregar producto a favoritos"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor()
            
            cur.execute("""
                INSERT INTO favorites (user_id, product_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            """, (user_id, product_id))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {"success": True}
        except Exception as e:
            print(f"Error agregando a favoritos: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_favorites(user_id):
        """Obtener favoritos del usuario"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute("""
                SELECT p.*
                FROM favorites f
                JOIN products p ON f.product_id = p.id
                WHERE f.user_id = %s
                ORDER BY f.added_at DESC
            """, (user_id,))
            
            items = cur.fetchall()
            cur.close()
            conn.close()
            
            return [dict(item) for item in items]
        except Exception as e:
            print(f"Error obteniendo favoritos: {e}")
            return []
    
    @staticmethod
    def remove_from_favorites(user_id, product_id):
        """Remover de favoritos"""
        try:
            conn = DatabaseConfig.get_connection()
            cur = conn.cursor()
            
            cur.execute(
                "DELETE FROM favorites WHERE user_id = %s AND product_id = %s",
                (user_id, product_id)
            )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {"success": True}
        except Exception as e:
            print(f"Error removiendo de favoritos: {e}")
            return {"success": False, "error": str(e)}


# Test de conexión
if __name__ == "__main__":
    try:
        conn = DatabaseConfig.get_connection()
        print("✅ Conexión a PostgreSQL exitosa!")
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")
