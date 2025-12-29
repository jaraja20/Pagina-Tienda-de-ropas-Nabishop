import re

with open('nabbyshop-final.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Reemplazar usando regex más flexible
html = re.sub(
    r'src="data:image/png;base64,[^"]*" alt="NabbyShop Logo"',
    'src="imagenes/iconos/icono-transparente.png" alt="NabbyShop Logo"',
    html
)

# Reemplazar la mariposa
html = re.sub(
    r'src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANMAAAC[^"]*"',
    'src="imagenes/mariposas/mariposa-morado-oscuro.png"',
    html
)

with open('nabbyshop-final.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('✓ Imágenes reemplazadas')
