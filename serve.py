import http.server
import socketserver
import webbrowser
import os
import json
import base64
from urllib.parse import urlparse, parse_qs
from pathlib import Path

# Importar módulo de base de datos
try:
    from db_connection import NabbyShopDB, DatabaseConfig
    USE_DATABASE = True
except ImportError:
    USE_DATABASE = False
    print("⚠️ Módulo db_connection no encontrado. Usando JSON como fallback.")

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(DIRECTORY, 'nabby_data.json')

def load_data():
    """Cargar datos persistentes (JSON fallback)"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    return {'custom_products': {}, 'catalog_edits': {}}

def save_data(data):
    """Guardar datos persistentes (JSON fallback)"""
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error guardando datos: {e}")
        return False

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self):
        # Si acceden a la raíz, redirigir a nabbyshop-final.html
        if self.path == '/' or self.path == '':
            self.send_response(301)
            self.send_header('Location', '/nabbyshop-final.html')
            self.end_headers()
            return
        
        # API para obtener datos
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if USE_DATABASE:
                try:
                    products = NabbyShopDB.get_all_products()
                    data = {'products': products}
                except Exception as e:
                    print(f"Error obteniendo datos de BD: {e}")
                    data = load_data()
            else:
                data = load_data()
            
            self.wfile.write(json.dumps(data, default=str).encode('utf-8'))
            return
        
        # Continuar con el comportamiento normal
        super().do_GET()
    
    def do_POST(self):
        """Manejar POST para guardar datos"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            # Parsear JSON
            request_data = json.loads(body.decode('utf-8'))
            
            # API para crear/guardar productos
            if self.path == '/api/save-products':
                if USE_DATABASE:
                    try:
                        # Guardar cada producto
                        products = request_data.get('products', [])
                        for product in products:
                            result = NabbyShopDB.create_product(product)
                        
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            'status': 'success',
                            'message': f'{len(products)} producto(s) guardado(s) en la BD'
                        }).encode('utf-8'))
                        return
                    except Exception as e:
                        raise Exception(f"Error en BD: {str(e)}")
                else:
                    data = load_data()
                    data['custom_products'] = request_data.get('custom_products', {})
                    if save_data(data):
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))
                    else:
                        raise Exception("No se pudo guardar")
                    return
            
            # API para actualizar productos
            if self.path.startswith('/api/update-product/'):
                if USE_DATABASE:
                    try:
                        product_id = int(self.path.split('/')[-1])
                        result = NabbyShopDB.update_product(product_id, request_data)
                        
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps(result).encode('utf-8'))
                        return
                    except Exception as e:
                        raise Exception(f"Error actualizando: {str(e)}")
            
            # API para guardar ediciones
            if self.path == '/api/save-edits':
                if USE_DATABASE:
                    # Guardar en catálogo de ediciones
                    data = load_data()
                    data['catalog_edits'] = request_data.get('catalog_edits', {})
                    if save_data(data):
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))
                else:
                    data = load_data()
                    data['catalog_edits'] = request_data.get('catalog_edits', {})
                    if save_data(data):
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))
                    else:
                        raise Exception("No se pudo guardar")
                return
        
        except Exception as e:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Manejar CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == "__main__":
    webbrowser.open(f"http://localhost:{PORT}/nabbyshop-final.html")
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}/nabbyshop-final.html")
        httpd.serve_forever()

