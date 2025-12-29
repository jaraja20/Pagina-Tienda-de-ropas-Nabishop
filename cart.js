// Sistema de Carrito - NabbyShop
// =============================

class CartSystem {
    constructor() {
        this.cartItems = this.loadCart();
        this.initCartModal();
        this.updateCartBadge();
    }

    // Cargar carrito del localStorage
    loadCart() {
        const stored = localStorage.getItem('nabby_cart');
        return stored ? JSON.parse(stored) : [];
    }

    // Guardar carrito
    saveCart() {
        localStorage.setItem('nabby_cart', JSON.stringify(this.cartItems));
        this.updateCartBadge();
    }

    // Agregar al carrito
    addToCart(product) {
        // Verificar si el producto ya está en el carrito con el mismo tamaño
        const existingItem = this.cartItems.find(
            item => item.id === product.id && item.selectedSize === product.selectedSize
        );

        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.cartItems.push({
                ...product,
                quantity: product.quantity || 1,
                cartItemId: Date.now() // ID único para cada línea del carrito
            });
        }

        this.saveCart();
    }

    // Remover del carrito
    removeFromCart(cartItemId) {
        this.cartItems = this.cartItems.filter(item => item.cartItemId !== cartItemId);
        this.saveCart();
    }

    // Actualizar cantidad
    updateQuantity(cartItemId, quantity) {
        const item = this.cartItems.find(item => item.cartItemId === cartItemId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(cartItemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
        this.renderCartItems();
    }

    // Limpiar carrito
    clearCart() {
        this.cartItems = [];
        this.saveCart();
    }

    // Calcular total
    getTotal() {
        return this.cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Calcular cantidad total de items
    getTotalItems() {
        return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    // Actualizar badge del carrito
    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        const total = this.getTotalItems();
        
        if (badge) {
            badge.textContent = total > 0 ? total : '0';
        }
    }

    // Crear modal del carrito
    initCartModal() {
        if (document.getElementById('cart-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'cart-modal';
        modal.className = 'cart-modal';
        modal.innerHTML = `
            <div class="cart-modal-content">
                <button class="cart-modal-close">&times;</button>
                
                <h2>Carrito de Compras</h2>
                
                <div id="cart-items-list" class="cart-items-list">
                    <!-- Los items se cargarán aquí -->
                </div>

                <div id="cart-summary" class="cart-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span id="subtotal">$0.00</span>
                    </div>
                    <div class="summary-row">
                        <span>Envío:</span>
                        <span id="shipping">Gratis</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span id="total-price">$0.00</span>
                    </div>
                </div>

                <div class="cart-actions">
                    <button id="checkout-btn" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">
                        <i class="fas fa-credit-card"></i> Proceder al Pago
                    </button>
                    <button id="continue-shopping-btn" class="btn btn-secondary" style="width: 100%;">
                        <i class="fas fa-arrow-left"></i> Continuar Comprando
                    </button>
                </div>

                <div id="empty-cart-message" class="empty-cart-message" style="display: none;">
                    <p>Tu carrito está vacío</p>
                    <a href="#" onclick="cartSystem.closeCartModal(); return false;">Ir a comprar</a>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachEventListeners();
    }

    // Adjuntar event listeners
    attachEventListeners() {
        // Cerrar modal
        const closeBtn = document.querySelector('.cart-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCartModal());
        }

        // Cerrar modal al hacer click fuera
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeCartModal();
                }
            });
        }

        // Click en el icono del carrito
        const cartIcon = document.querySelector('[title="Carrito"]');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCartModal();
            });
        }

        // Botones de acción
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }

        const continueShoppingBtn = document.getElementById('continue-shopping-btn');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => this.closeCartModal());
        }
    }

    // Obtener primera imagen de un producto
    getProductImage(item) {
        if (typeof window.imagesMapping === 'undefined') return null;
        
        const colorImages = window.imagesMapping[item.colorCode];
        if (!colorImages || !colorImages[item.number]) return null;
        
        const images = colorImages[item.number];
        if (images && images.length > 0) {
            return `imagenes/Ropas/${item.colorCode}/${item.number}/${images[0]}`;
        }
        return null;
    }

    // Renderizar lista de items del carrito
    renderCartItems() {
        const list = document.getElementById('cart-items-list');
        const emptyMessage = document.getElementById('empty-cart-message');
        const summary = document.getElementById('cart-summary');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (this.cartItems.length === 0) {
            list.style.display = 'none';
            emptyMessage.style.display = 'block';
            summary.style.display = 'none';
            checkoutBtn.style.display = 'none';
            return;
        }

        list.style.display = 'block';
        emptyMessage.style.display = 'none';
        summary.style.display = 'block';
        checkoutBtn.style.display = 'block';

        list.innerHTML = this.cartItems.map(item => {
            const imageUrl = this.getProductImage(item) || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
            
            return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${imageUrl}" 
                         alt="${item.title}"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-size">Tamaño: ${item.selectedSize}</p>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="cartSystem.updateQuantity(${item.cartItemId}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" readonly class="qty-input">
                    <button class="qty-btn" onclick="cartSystem.updateQuantity(${item.cartItemId}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-subtotal">
                    <p class="subtotal-price">$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="cart-item-remove" onclick="cartSystem.removeFromCart(${item.cartItemId}); cartSystem.renderCartItems();">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        }).join('');

        // Actualizar resumen
        this.updateCartSummary();
    }

    // Actualizar resumen del carrito
    updateCartSummary() {
        const subtotal = this.getTotal();
        const shipping = subtotal > 50 ? 0 : 5.99;
        const total = subtotal + shipping;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
        document.getElementById('total-price').textContent = `$${total.toFixed(2)}`;
    }

    // Manejar checkout
    handleCheckout() {
        if (this.cartItems.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        // Aquí se podría integrar con un sistema de pagos
        alert(`✓ Proceder con el pago de $${this.getTotal().toFixed(2)}`);
        // En producción: integrar con stripe, paypal, etc.
    }

    // Abrir modal del carrito
    openCartModal() {
        this.renderCartItems();
        document.getElementById('cart-modal').classList.add('active');
    }

    // Cerrar modal del carrito
    closeCartModal() {
        document.getElementById('cart-modal').classList.remove('active');
    }
}

// Crear instancia global
const cartSystem = new CartSystem();

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartSystem;
}
