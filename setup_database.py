"""
Script para crear la base de datos nabbyshop automáticamente
Ejecuta: python setup_database.py
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    """Crear la base de datos si no existe"""
    
    print("=" * 70)
    print("CONFIGURADOR AUTOMÁTICO DE BASE DE DATOS - NABBYSHOP")
    print("=" * 70)
    
    # Conectar a postgres por defecto (sin especificar DB)
    try:
        print("\n1️⃣  Conectando a PostgreSQL como usuario 'postgres'...")
        conn = psycopg2.connect(
            host="localhost",
            user="postgres",
            password="root",
            port="5432"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        print("✅ Conexión exitosa\n")
        
    except psycopg2.OperationalError as e:
        print(f"❌ Error de conexión: {e}")
        print("\n⚠️ Soluciones:")
        print("   1. Verifica que PostgreSQL esté corriendo")
        print("   2. Si cambiaste la contraseña de 'postgres', edita este archivo:")
        print("      Línea: password='postgres'")
        print("   3. Abre cmd y prueba: psql -U postgres")
        return False
    
    try:
        # Verificar si la BD existe
        print("2️⃣  Verificando si 'nabbyshop' existe...")
        cur.execute("SELECT 1 FROM pg_database WHERE datname='nabbyshop'")
        
        if cur.fetchone():
            print("✅ La base de datos 'nabbyshop' ya existe\n")
        else:
            print("⚠️  'nabbyshop' no existe, creando...\n")
            cur.execute("CREATE DATABASE nabbyshop")
            print("✅ Base de datos 'nabbyshop' creada\n")
        
        cur.close()
        conn.close()
        
        # Ahora conectar a la BD nabbyshop y crear las tablas
        print("3️⃣  Conectando a 'nabbyshop'...")
        conn = psycopg2.connect(
            host="localhost",
            user="postgres",
            password="root",
            port="5432",
            database="nabbyshop"
        )
        cur = conn.cursor()
        print("✅ Conectado a 'nabbyshop'\n")
        
        # Leer y ejecutar el SQL
        print("4️⃣  Ejecutando script SQL...")
        with open("create_database.sql", "r", encoding="utf-8") as f:
            sql_script = f.read()
        
        # Dividir por puntos y coma para evitar errores
        sql_commands = [cmd.strip() for cmd in sql_script.split(';') if cmd.strip()]
        
        for i, command in enumerate(sql_commands, 1):
            try:
                cur.execute(command)
                # Solo mostrar comandos importantes
                if 'CREATE TABLE' in command or 'CREATE INDEX' in command:
                    table_name = command.split()[-1] if 'CREATE TABLE' in command else 'INDEX'
                    print(f"   ✓ {command.split('IF NOT EXISTS')[1][:50] if 'IF NOT EXISTS' in command else command[:50]}...")
            except Exception as e:
                if 'already exists' in str(e):
                    pass  # Ignorar errores de "ya existe"
                else:
                    print(f"   ⚠️  {str(e)[:80]}")
        
        conn.commit()
        cur.close()
        conn.close()
        
        print("\n✅ Todas las tablas creadas\n")
        
        # Test final
        print("5️⃣  Verificando tablas creadas...")
        conn = psycopg2.connect(
            host="localhost",
            user="postgres",
            password="root",
            port="5432",
            database="nabbyshop"
        )
        cur = conn.cursor()
        
        cur.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        
        tables = [t[0] for t in cur.fetchall()]
        print(f"\n✅ Base de datos lista con {len(tables)} tablas:\n")
        
        for i, table in enumerate(tables, 1):
            print(f"   {i:2}. {table}")
        
        cur.close()
        conn.close()
        
        print("\n" + "=" * 70)
        print("🎉 ¡CONFIGURACIÓN COMPLETADA!")
        print("=" * 70)
        print("\nPróximo paso:")
        print("   python test_db.py")
        print("\nO inicia el servidor:")
        print("   python serve.py")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    try:
        create_database()
    except KeyboardInterrupt:
        print("\n\n⚠️  Operación cancelada por el usuario")
