// Sistema de Navegación - NabbyShop
// ==================================

class NavigationSystem {
    constructor() {
        this.currentCategory = null;
        this.clothingTypes = [];
        this.init();
    }

    init() {
        // Esperar a que el DOM y admin esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupNavigation());
        } else {
            this.setupNavigation();
        }
    }

    setupNavigation() {
        // Cargar tipos de ropa del admin system
        setTimeout(() => {
            if (typeof adminSystem !== 'undefined') {
                this.clothingTypes = adminSystem.clothingTypes;
                this.populateSubmenus();
            }
        }, 500);

        // Cerrar submenú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                document.querySelectorAll('.submenu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });

        // Configurar click para toggle (móvil y desktop)
        document.querySelectorAll('.nav-item.has-submenu').forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const submenu = item.querySelector('.submenu');
                    const isActive = submenu.classList.contains('active');
                    
                    // Cerrar otros submenús
                    document.querySelectorAll('.submenu.active').forEach(menu => {
                        if (menu !== submenu) {
                            menu.classList.remove('active');
                        }
                    });
                    
                    // Toggle del submenú actual
                    submenu.classList.toggle('active');
                });
            }
        });
    }

    // Poblar submenús dinámicamente
    populateSubmenus() {
        const categories = {
            'mujer': ['Mujer'],
            'hombre': ['Hombre'],
            'accesorios': ['Accesorios']
        };

        for (const [category, labels] of Object.entries(categories)) {
            const submenu = document.getElementById(`submenu-${category}`);
            if (submenu) {
                submenu.innerHTML = this.clothingTypes
                    .filter(type => type.visible)
                    .map(type => `
                        <a href="#" class="submenu-item" onclick="navigationSystem.showCategory('${type.id}', event)">
                            ${type.name}
                        </a>
                    `).join('');
            }
        }
    }

    // Alternar submenú (para mobile)
    toggleSubmenu(event) {
        event.preventDefault();
        const submenu = event.target.closest('.nav-item').querySelector('.submenu');
        
        // Cerrar otros submenús
        document.querySelectorAll('.submenu.active').forEach(menu => {
            if (menu !== submenu) {
                menu.classList.remove('active');
            }
        });
        
        submenu.classList.toggle('active');
    }

    // Mostrar categoría
    showCategory(category, event) {
        if (event) {
            event.preventDefault();
        }

        this.currentCategory = category;
        const categoryView = document.getElementById('category-view');
        const mainContent = document.querySelector('.main-content');
        
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        
        // Obtener todos los productos que pertenecen a esta categoría
        const products = this.getProductsByCategory(category);
        
        let html = `
            <div class="category-header">
                <button class="back-btn" onclick="navigationSystem.goHome()">
                    <i class="fas fa-arrow-left"></i> Volver
                </button>
                <h1>${this.getCategoryTitle(category)}</h1>
                <p class="product-count">${products.length} productos encontrados</p>
            </div>
            
            <div class="category-products">
        `;

        if (products.length === 0) {
            html += '<p class="no-products">No hay productos en esta categoría</p>';
        } else {
            html += products.map(product => `
                <div class="product-card" onclick="productsSystem.showProductDetail('${product.id}')">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22250%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22250%22/%3E%3C/svg%3E'">
                        <button class="favorite-btn" onclick="event.stopPropagation(); favoritesSystem.addToFavorites(${JSON.stringify(product).replace(/"/g, '&quot;')}); this.classList.toggle('active');">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        <h3>${product.title}</h3>
                        <p class="product-color">${product.color}</p>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <div class="product-types">
                            ${product.types.map(type => `<span class="type-badge">${type}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        html += '</div>';
        
        categoryView.innerHTML = html;
        categoryView.style.display = 'block';
        
        // Scroll al inicio
        window.scrollTo(0, 0);
    }

    // Obtener título de categoría
    getCategoryTitle(category) {
        const titles = {
            'nuevos': 'Nuevos Productos',
            'sale': 'Sale',
            'mujer': 'Colección Mujer',
            'hombre': 'Colección Hombre',
            'accesorios': 'Accesorios'
        };

        // Si es un tipo de ropa
        const clothingType = this.clothingTypes.find(t => t.id === category);
        if (clothingType) {
            return clothingType.name;
        }

        return titles[category] || 'Productos';
    }

    // Obtener productos por categoría
    getProductsByCategory(category) {
        const products = [];
        
        // Cargar ediciones del catálogo
        const catalogEdits = JSON.parse(localStorage.getItem('nabby_catalog_edits') || '{}');

        // Obtener del mapeo original (productos del catálogo)
        if (window.imagesMapping) {
            for (const [colorCode, colors] of Object.entries(window.imagesMapping)) {
                for (const [number, images] of Object.entries(colors)) {
                    if (images && images.length > 0) {
                        const productId = `${colorCode}-${number}`;
                        
                        // Obtener ediciones si existen
                        const edits = catalogEdits[productId] || {};
                        
                        // Usar tipos editados si existen, sino usar categoría por defecto
                        const types = edits.types || [category];
                        
                        // Si el producto tiene ediciones, aplicarlas
                        if (types.includes(category)) {
                            products.push({
                                id: productId,
                                title: edits.title || `${this.capitalizeFirst(colorCode)} Prenda ${number}`,
                                color: edits.color || this.capitalizeFirst(colorCode),
                                colorCode: edits.color || colorCode,
                                number: number,
                                price: edits.price !== undefined ? edits.price : 49.99,
                                image: `imagenes/Ropas/${colorCode}/${number}/${images[0]}`,
                                types: types,
                                sizes: edits.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                                inStock: edits.inStock !== undefined ? edits.inStock : true,
                                description: edits.description || ''
                            });
                        }
                    }
                }
            }
        }

        // Obtener productos personalizados
        const customProducts = JSON.parse(localStorage.getItem('nabby_custom_products') || '[]');
        customProducts.forEach(product => {
            const firstImage = localStorage.getItem(`nabby_product_image_${product.id}_0`);
            
            // Verificar si el producto tiene este tipo (múltiples tipos)
            const productTypes = product.types || (product.type ? [product.type] : []);
            if (firstImage && productTypes.includes(category)) {
                products.push({
                    ...product,
                    image: firstImage,
                    types: productTypes
                });
            }
        });

        return products;
    }

    // Volver a inicio
    goHome(event) {
        if (event) {
            event.preventDefault();
        }

        const categoryView = document.getElementById('category-view');
        const mainContent = document.querySelector('.main-content');

        if (categoryView) {
            categoryView.style.display = 'none';
        }
        if (mainContent) {
            mainContent.style.display = 'block';
        }

        this.currentCategory = null;
        window.scrollTo(0, 0);
    }

    // Capitalizar primera letra
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Crear instancia global
const navigationSystem = new NavigationSystem();

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationSystem;
}
