// Sistema de Favoritos - NabbyShop
// ================================

class FavoritesSystem {
    constructor() {
        this.favorites = this.loadFavorites();
        this.initFavoritesModal();
        this.attachEventListeners();
    }

    // Cargar favoritos
    loadFavorites() {
        const stored = localStorage.getItem('nabby_favorites');
        return stored ? JSON.parse(stored) : [];
    }

    // Guardar favoritos
    saveFavorites() {
        localStorage.setItem('nabby_favorites', JSON.stringify(this.favorites));
    }

    // Agregar a favoritos
    addToFavorites(product) {
        // Verificar si ya existe
        const exists = this.favorites.some(p => p.id === product.id);
        
        if (!exists) {
            this.favorites.push(product);
            this.saveFavorites();
            this.updateFavoritesBadge();
            return true;
        }
        return false;
    }

    // Remover de favoritos
    removeFromFavorites(productId) {
        this.favorites = this.favorites.filter(p => p.id !== productId);
        this.saveFavorites();
        this.updateFavoritesBadge();
    }

    // Verificar si un producto está en favoritos
    isFavorite(productId) {
        return this.favorites.some(p => p.id === productId);
    }

    // Actualizar badge de favoritos
    updateFavoritesBadge() {
        // Crear o actualizar badge
        let badge = document.querySelector('.favorites-badge');
        if (!badge) {
            const heartIcon = document.querySelector('[title="Favoritos"]');
            if (heartIcon) {
                badge = document.createElement('span');
                badge.className = 'favorites-badge';
                heartIcon.parentElement.style.position = 'relative';
                heartIcon.parentElement.appendChild(badge);
            }
        }
        
        if (badge && this.favorites.length > 0) {
            badge.textContent = this.favorites.length;
            badge.style.display = 'inline-block';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }

    // Crear modal de favoritos
    initFavoritesModal() {
        if (document.getElementById('favorites-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'favorites-modal';
        modal.className = 'favorites-modal';
        modal.innerHTML = `
            <div class="favorites-modal-content">
                <button class="favorites-modal-close">&times;</button>
                
                <h2>Mis Favoritos</h2>
                
                <div id="favorites-list" class="favorites-list">
                    <!-- Los favoritos se cargarán aquí -->
                </div>
                
                <div class="favorites-actions">
                    <button id="add-all-to-cart" class="btn btn-primary" style="display: none;">
                        <i class="fas fa-shopping-bag"></i> Agregar Todo al Carrito
                    </button>
                    <button id="clear-favorites" class="btn btn-secondary" style="display: none;">
                        <i class="fas fa-trash"></i> Limpiar Favoritos
                    </button>
                </div>

                <div id="empty-message" class="empty-message" style="display: none;">
                    <p>No tienes productos en favoritos.</p>
                    <p><a href="#" onclick="favoritesSystem.closeFavoritesModal(); return false;">Continuar comprando</a></p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachEventListeners();
    }

    // Adjuntar event listeners
    attachEventListeners() {
        // Cerrar modal
        const closeBtn = document.querySelector('.favorites-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeFavoritesModal());
        }

        // Cerrar modal al hacer click fuera
        const modal = document.getElementById('favorites-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeFavoritesModal();
                }
            });
        }

        // Click en el corazón en el header
        const heartIcon = document.querySelector('[title="Favoritos"]');
        if (heartIcon) {
            heartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.openFavoritesModal();
            });
        }

        // Botones de acciones
        const addAllBtn = document.getElementById('add-all-to-cart');
        if (addAllBtn) {
            addAllBtn.addEventListener('click', () => this.addAllToCart());
        }

        const clearBtn = document.getElementById('clear-favorites');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que deseas limpiar todos los favoritos?')) {
                    this.favorites = [];
                    this.saveFavorites();
                    this.renderFavoritesList();
                }
            });
        }
    }

    // Obtener primera imagen de un producto
    getProductImage(product) {
        if (typeof window.imagesMapping === 'undefined') return null;
        
        const colorImages = window.imagesMapping[product.colorCode];
        if (!colorImages || !colorImages[product.number]) return null;
        
        const images = colorImages[product.number];
        if (images && images.length > 0) {
            return `imagenes/Ropas/${product.colorCode}/${product.number}/${images[0]}`;
        }
        return null;
    }

    // Renderizar lista de favoritos
    renderFavoritesList() {
        const list = document.getElementById('favorites-list');
        const emptyMessage = document.getElementById('empty-message');
        const addAllBtn = document.getElementById('add-all-to-cart');
        const clearBtn = document.getElementById('clear-favorites');

        if (this.favorites.length === 0) {
            list.style.display = 'none';
            emptyMessage.style.display = 'block';
            addAllBtn.style.display = 'none';
            clearBtn.style.display = 'none';
            return;
        }

        list.style.display = 'grid';
        emptyMessage.style.display = 'none';
        addAllBtn.style.display = 'block';
        clearBtn.style.display = 'block';

        list.innerHTML = this.favorites.map(product => {
            const imageUrl = this.getProductImage(product) || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22250%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22250%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23999%22%3EImagen%3C/text%3E%3C/svg%3E';
            
            return `
            <div class="favorite-item">
                <div class="favorite-item-image">
                    <img src="${imageUrl}" 
                         alt="${product.title}"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22250%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22250%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23999%22%3EImagen%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="favorite-item-info">
                    <h4 class="favorite-title">${product.title}</h4>
                    <p class="favorite-color">Color: ${product.color}</p>
                    <p class="favorite-price">$${product.price.toFixed(2)}</p>
                    <div class="favorite-item-actions">
                        <button class="btn btn-small btn-primary" onclick="favoritesSystem.addOneToCart('${product.id}')">
                            <i class="fas fa-shopping-bag"></i> Agregar
                        </button>
                        <button class="btn btn-small btn-danger" onclick="favoritesSystem.removeFromFavorites('${product.id}'); favoritesSystem.renderFavoritesList();">
                            <i class="fas fa-trash"></i> Quitar
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    // Agregar uno al carrito desde favoritos
    addOneToCart(productId) {
        const product = this.favorites.find(p => p.id === productId);
        if (product && typeof cartSystem !== 'undefined') {
            cartSystem.addToCart({
                ...product,
                selectedSize: product.sizes[0], // Tamaño por defecto
                quantity: 1
            });
            alert('✓ Agregado al carrito');
        }
    }

    // Agregar todos al carrito
    addAllToCart() {
        if (typeof cartSystem === 'undefined') {
            alert('Sistema de carrito no disponible');
            return;
        }

        if (this.favorites.length === 0) {
            alert('No hay productos en favoritos');
            return;
        }

        this.favorites.forEach(product => {
            cartSystem.addToCart({
                ...product,
                selectedSize: product.sizes[0], // Tamaño por defecto
                quantity: 1
            });
        });

        alert(`✓ ${this.favorites.length} producto${this.favorites.length > 1 ? 's' : ''} agregado${this.favorites.length > 1 ? 's' : ''} al carrito`);
        this.closeFavoritesModal();
    }

    // Abrir modal
    openFavoritesModal() {
        this.renderFavoritesList();
        document.getElementById('favorites-modal').classList.add('active');
    }

    // Cerrar modal
    closeFavoritesModal() {
        document.getElementById('favorites-modal').classList.remove('active');
    }

    // Obtener total de favoritos
    getTotalFavorites() {
        return this.favorites.length;
    }
}

// Crear instancia global
const favoritesSystem = new FavoritesSystem();

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FavoritesSystem;
}
