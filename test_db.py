"""
Test rápido de la conexión a PostgreSQL
Ejecuta: python test_db.py
"""

from db_connection import DatabaseConfig, NabbyShopDB
import json

def test_connection():
    """Test 1: Verificar conexión básica"""
    print("=" * 60)
    print("TEST 1: Verificando conexión a PostgreSQL...")
    print("=" * 60)
    
    try:
        conn = DatabaseConfig.get_connection()
        conn.close()
        print("✅ Conexión exitosa a PostgreSQL!")
        return True
    except Exception as e:
        print(f"❌ Error en conexión: {e}")
        print("\nSoluciones:")
        print("1. Verifica que PostgreSQL esté corriendo")
        print("2. Actualiza las credenciales en db_connection.py")
        print("3. Asegúrate que la BD 'nabbyshop' exista")
        return False

def test_tables():
    """Test 2: Verificar que las tablas existan"""
    print("\n" + "=" * 60)
    print("TEST 2: Verificando tablas...")
    print("=" * 60)
    
    try:
        import psycopg2
        conn = DatabaseConfig.get_connection()
        cur = conn.cursor()
        
        # Obtener lista de tablas
        cur.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        
        tables = cur.fetchall()
        
        if tables:
            print(f"✅ Se encontraron {len(tables)} tablas:")
            for table in tables:
                print(f"   - {table[0]}")
        else:
            print("❌ No se encontraron tablas")
            print("   Ejecuta create_database.sql en pgAdmin")
        
        cur.close()
        conn.close()
        return len(tables) > 0
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_insert_product():
    """Test 3: Intentar insertar un producto de prueba"""
    print("\n" + "=" * 60)
    print("TEST 3: Insertando producto de prueba...")
    print("=" * 60)
    
    try:
        test_product = {
            'title': 'Producto Test',
            'description': 'Este es un producto de prueba',
            'price': 100,
            'type': 'Mujer',
            'color': 'azul',
            'colorCode': 'azul',
            'inStock': True,
            'stock_quantity': 10,
            'sizes': ['S', 'M', 'L'],
            'images': []
        }
        
        result = NabbyShopDB.create_product(test_product)
        
        if result.get('success'):
            print(f"✅ Producto insertado con ID: {result.get('product_id')}")
            return True
        else:
            print(f"❌ Error al insertar: {result.get('error')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_products():
    """Test 4: Obtener todos los productos"""
    print("\n" + "=" * 60)
    print("TEST 4: Obteniendo productos...")
    print("=" * 60)
    
    try:
        products = NabbyShopDB.get_all_products()
        print(f"✅ Se obtuvieron {len(products)} productos")
        
        if products:
            print("\nPrimeros productos:")
            for i, p in enumerate(products[:3], 1):
                print(f"   {i}. {p.get('title')} - ${p.get('price')}")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def run_all_tests():
    """Ejecutar todos los tests"""
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 12 + "🧪 TESTS DE POSTGRESQL - NABBYSHOP" + " " * 11 + "║")
    print("╚" + "═" * 58 + "╝")
    
    tests = [
        ("Conexión", test_connection),
        ("Tablas", test_tables),
        ("Insertar", test_insert_product),
        ("Leer", test_get_products),
    ]
    
    results = {}
    for name, test_func in tests:
        results[name] = test_func()
    
    # Resumen
    print("\n" + "=" * 60)
    print("RESUMEN DE TESTS")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{name:20} {status}")
    
    print(f"\nResultado: {passed}/{total} tests pasados")
    
    if passed == total:
        print("\n🎉 ¡Todo funcionando correctamente!")
        print("Puedes ejecutar: python serve.py")
    else:
        print("\n⚠️ Algunos tests fallaron. Revisa los errores arriba.")

if __name__ == "__main__":
    run_all_tests()
