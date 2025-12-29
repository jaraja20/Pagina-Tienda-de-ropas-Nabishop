// Sistema de Productos - NabbyShop
// ================================

class ProductsSystem {
    constructor() {
        this.products = this.loadProducts();
        this.currentProduct = null;
        this.initProductModal();
    }

    // Cargar productos del localStorage
    loadProducts() {
        const stored = localStorage.getItem('nabby_products');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Crear productos por defecto basados en la estructura
        const defaultProducts = {};
        const colors = ['rojo', 'rosa', 'azul', 'celeste', 'amarillo', 'verde'];
        const colorNames = {
            rojo: 'Rojo',
            rosa: 'Rosa',
            azul: 'Azul',
            celeste: 'Celeste',
            amarillo: 'Amarillo',
            verde: 'Verde'
        };
        
        const itemCounts = {
            rojo: 9, rosa: 8, azul: 6, celeste: 6, amarillo: 6, verde: 6
        };
        
        // Cargar ediciones del catálogo
        const catalogEdits = JSON.parse(localStorage.getItem('nabby_catalog_edits') || '{}');

        colors.forEach(color => {
            defaultProducts[color] = {};
            for (let i = 1; i <= itemCounts[color]; i++) {
                const productId = `${color}-${i}`;
                const edits = catalogEdits[productId] || {};
                
                defaultProducts[color][i] = {
                    id: productId,
                    color: edits.color || colorNames[color],
                    colorCode: edits.color || color,
                    number: i,
                    title: edits.title || `${colorNames[color]} Prenda ${i}`,
                    price: edits.price !== undefined ? edits.price : Math.floor(Math.random() * (80 - 20 + 1)) + 20,
                    description: edits.description || `Hermosa prenda de color ${colorNames[color].toLowerCase()}. Diseño moderno con excelente calidad. Perfecta para tu estilo urbano aesthetic.`,
                    sizes: edits.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                    inStock: edits.inStock !== undefined ? edits.inStock : true,
                    types: edits.types || ['remeras']
                };
            }
        });
        
        this.saveProducts(defaultProducts);
        return defaultProducts;
    }

    // Guardar productos
    saveProducts(products) {
        localStorage.setItem('nabby_products', JSON.stringify(products));
    }

    // Crear modal de producto
    initProductModal() {
        if (document.getElementById('product-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'product-modal';
        modal.className = 'product-modal';
        modal.innerHTML = `
            <div class="product-modal-content">
                <button class="product-modal-close">&times;</button>
                
                <div class="product-modal-container">
                    <!-- Galería de imágenes -->
                    <div class="product-gallery">
                        <div class="product-main-image">
                            <img id="product-main-img" src="" alt="Producto">
                        </div>
                        <div class="product-thumbnails" id="product-thumbnails"></div>
                    </div>

                    <!-- Información del producto -->
                    <div class="product-info">
                        <div class="product-info-content" id="product-info-content"></div>

                        <!-- Edición para admin -->
                        <div id="admin-edit-section" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--light-gray);">
                            <h3>Editar Producto (Modo Admin)</h3>
                            <div class="form-group">
                                <label for="edit-title">Título</label>
                                <input type="text" id="edit-title" class="product-edit-field">
                            </div>
                            <div class="form-group">
                                <label for="edit-price">Precio ($)</label>
                                <input type="number" id="edit-price" class="product-edit-field" min="0" step="0.01">
                            </div>
                            <div class="form-group">
                                <label for="edit-description">Descripción</label>
                                <textarea id="edit-description" class="product-edit-field" rows="4"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="edit-instock">En Stock</label>
                                <select id="edit-instock" class="product-edit-field">
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                            <button id="save-product-btn" class="btn btn-primary">Guardar Cambios</button>
                        </div>

                        <!-- Acciones del usuario -->
                        <div class="product-actions">
                            <div class="action-group">
                                <button id="add-to-cart-btn" class="btn btn-primary">
                                    <i class="fas fa-shopping-bag"></i> Agregar al Carrito
                                </button>
                                <button id="add-to-favorites-btn" class="btn btn-secondary">
                                    <i class="fas fa-heart"></i> Agregar a Favoritos
                                </button>
                            </div>

                            <!-- WhatsApp contact -->
                            <div class="whatsapp-contact">
                                <a id="whatsapp-link" href="#" class="btn btn-whatsapp" target="_blank">
                                    <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachEventListeners();
    }

    // Adjuntar event listeners
    attachEventListeners() {
        // Cerrar modal
        document.querySelector('.product-modal-close').addEventListener('click', 
            () => this.closeProductModal());

        // Cerrar modal al hacer click fuera
        document.getElementById('product-modal').addEventListener('click', (e) => {
            if (e.target.id === 'product-modal') {
                this.closeProductModal();
            }
        });

        // Botones de acción
        document.getElementById('add-to-cart-btn').addEventListener('click', 
            () => this.handleAddToCart());
        document.getElementById('add-to-favorites-btn').addEventListener('click', 
            () => this.handleAddToFavorites());
        document.getElementById('save-product-btn').addEventListener('click', 
            () => this.saveProductChanges());
    }

    // Mostrar detalle de producto
    showProductDetail(productId) {
        // Extraer color y número del ID
        const [color, number] = productId.split('-');
        
        if (!this.products[color] || !this.products[color][number]) {
            console.error('Producto no encontrado');
            return;
        }

        this.currentProduct = this.products[color][number];
        this.renderProductDetail();
        this.openProductModal();
    }

    // Renderizar detalle del producto
    renderProductDetail() {
        const product = this.currentProduct;
        const isAdmin = authSystem && authSystem.isAdmin();

        // Obtener imágenes del producto desde el mapeo global (definido en nabbyshop-final.html)
        let images = [];
        
        // Esperar a que el mapeo esté disponible
        if (typeof window.imagesMapping !== 'undefined' && 
            window.imagesMapping[product.colorCode] && 
            window.imagesMapping[product.colorCode][product.number]) {
            const files = window.imagesMapping[product.colorCode][product.number];
            images = files.map(file => ({
                path: `imagenes/Ropas/${product.colorCode}/${product.number}/${file}`,
                filename: file
            }));
        }

        // Si no hay imágenes en el mapeo, intentar con nombres estándar
        if (images.length === 0) {
            // Probar con los archivos del directorio
            for (let i = 1; i <= 5; i++) {
                images.push({
                    path: `imagenes/Ropas/${product.colorCode}/${product.number}/image${i}.jpg`,
                    filename: `image${i}.jpg`
                });
            }
        }

        // Generar thumbnails con todas las imágenes disponibles
        const thumbnailsHTML = images.map((img, idx) => `
            <div class="thumbnail ${idx === 0 ? 'active' : ''}" data-src="${img.path}" onclick="document.getElementById('product-main-img').src='${img.path}'; document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active')); this.classList.add('active');">
                <img src="${img.path}" alt="Foto ${idx + 1}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ccc%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
            </div>
        `).join('');

        // Contenido principal del producto
        const infoHTML = `
            <div class="product-header">
                <h2 class="product-title">${product.title}</h2>
                <p class="product-color">Color: <strong>${product.color}</strong></p>
            </div>

            <div class="product-price">
                <span class="price-currency">$</span>
                <span class="price-amount">${product.price.toFixed(2)}</span>
            </div>

            <div class="product-status">
                <span class="stock-status ${product.inStock ? 'in-stock' : 'out-stock'}">
                    ${product.inStock ? '✓ En Stock' : '✗ Agotado'}
                </span>
            </div>

            <div class="product-description">
                <h4>Descripción</h4>
                <p>${product.description}</p>
            </div>

            <div class="product-sizes">
                <h4>Tamaños disponibles</h4>
                <div class="sizes-grid">
                    ${product.sizes.map(size => `
                        <button class="size-btn" data-size="${size}">${size}</button>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('product-thumbnails').innerHTML = thumbnailsHTML;
        document.getElementById('product-info-content').innerHTML = infoHTML;
        
        // Establecer imagen principal (la primera disponible)
        const mainImageSrc = images.length > 0 ? images[0].path : `imagenes/Ropas/${product.colorCode}/${product.number}/image1.jpg`;
        document.getElementById('product-main-img').src = mainImageSrc;
        document.getElementById('product-main-img').onerror = function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22400%22 height=%22500%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImagen no disponible%3C/text%3E%3C/svg%3E';
        };

        // Actualizar link de WhatsApp
        const whatsappLink = document.getElementById('whatsapp-link');
        const message = encodeURIComponent(`Hola, me interesa el producto: ${product.title} (Color: ${product.color}) - $${product.price}`);
        whatsappLink.href = `https://wa.me/?text=${message}`;

        // Mostrar/ocultar sección de edición
        const adminSection = document.getElementById('admin-edit-section');
        if (isAdmin) {
            adminSection.style.display = 'block';
            document.getElementById('edit-title').value = product.title;
            document.getElementById('edit-price').value = product.price;
            document.getElementById('edit-description').value = product.description;
            document.getElementById('edit-instock').value = product.inStock;
        } else {
            adminSection.style.display = 'none';
        }

        // Desactivar botón si no hay stock
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (!product.inStock) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Agotado';
        } else {
            addToCartBtn.disabled = false;
            addToCartBtn.innerHTML = '<i class="fas fa-shopping-bag"></i> Agregar al Carrito';
        }

        // Event listeners para size buttons
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Guardar cambios de producto (Admin)
    saveProductChanges() {
        if (!this.currentProduct) return;

        const title = document.getElementById('edit-title').value;
        const price = parseFloat(document.getElementById('edit-price').value);
        const description = document.getElementById('edit-description').value;
        const inStock = document.getElementById('edit-instock').value === 'true';

        this.currentProduct.title = title;
        this.currentProduct.price = price;
        this.currentProduct.description = description;
        this.currentProduct.inStock = inStock;

        // Guardar en localStorage
        const color = this.currentProduct.colorCode;
        const number = this.currentProduct.number;
        this.products[color][number] = this.currentProduct;
        this.saveProducts(this.products);

        // Re-renderizar
        this.renderProductDetail();
        alert('✓ Producto guardado correctamente');
    }

    // Agregar al carrito
    handleAddToCart() {
        if (!this.currentProduct) return;

        const sizeBtn = document.querySelector('.size-btn.active');
        const size = sizeBtn ? sizeBtn.dataset.size : null;

        if (!size) {
            alert('Por favor selecciona un tamaño');
            return;
        }

        // Usar el sistema de carrito si está disponible
        if (typeof cartSystem !== 'undefined') {
            cartSystem.addToCart({
                ...this.currentProduct,
                selectedSize: size,
                quantity: 1
            });
            alert('✓ Agregado al carrito');
        } else {
            alert('✓ Agregado al carrito');
        }
    }

    // Agregar a favoritos
    handleAddToFavorites() {
        if (!this.currentProduct) return;

        // Usar el sistema de favoritos si está disponible
        if (typeof favoritesSystem !== 'undefined') {
            favoritesSystem.addToFavorites(this.currentProduct);
            alert('✓ Agregado a favoritos');
        } else {
            alert('✓ Agregado a favoritos');
        }
    }

    // Abrir modal
    openProductModal() {
        document.getElementById('product-modal').classList.add('active');
    }

    // Cerrar modal
    closeProductModal() {
        document.getElementById('product-modal').classList.remove('active');
        this.currentProduct = null;
    }

    // Obtener producto por ID
    getProduct(productId) {
        const [color, number] = productId.split('-');
        return this.products[color]?.[number] || null;
    }
}

// Crear instancia global
const productsSystem = new ProductsSystem();

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsSystem;
}
