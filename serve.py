import http.server
import socketserver
import webbrowser
import os
import json
import base64
from urllib.parse import urlparse, parse_qs
from pathlib import Path

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(DIRECTORY, 'nabby_data.json')

def load_data():
    """Cargar datos persistentes"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    return {'custom_products': {}, 'catalog_edits': {}}

def save_data(data):
    """Guardar datos persistentes"""
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
            data = load_data()
            self.wfile.write(json.dumps(data).encode('utf-8'))
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
            
            # API para guardar productos
            if self.path == '/api/save-products':
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
            
            # API para guardar ediciones
            if self.path == '/api/save-edits':
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

