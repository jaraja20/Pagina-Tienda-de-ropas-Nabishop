import os
import json
from pathlib import Path

base_path = r"C:\Users\jhoni\Desktop\Pagina nabbishop\imagenes\Ropas"
colors = ["rojo", "rosa", "azul", "celeste", "amarillo", "Verde"]

result = {}

for color in colors:
    color_path = os.path.join(base_path, color)
    prendas = {}
    
    if os.path.exists(color_path):
        # Obtener carpetas de prendas (numéricas)
        prenda_folders = sorted([d for d in os.listdir(color_path) if os.path.isdir(os.path.join(color_path, d))], key=lambda x: int(x))
        
        for prenda_folder in prenda_folders:
            prenda_path = os.path.join(color_path, prenda_folder)
            # Obtener archivos en la carpeta
            files = sorted([f for f in os.listdir(prenda_path) if os.path.isfile(os.path.join(prenda_path, f))])
            prendas[int(prenda_folder)] = files
    
    result[color] = prendas

# Guardar como JSON
with open(r"C:\Users\jhoni\Desktop\Pagina nabbishop\imagenes_mapping.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("Archivo generado: imagenes_mapping.json")
print(json.dumps(result, indent=2, ensure_ascii=False))
