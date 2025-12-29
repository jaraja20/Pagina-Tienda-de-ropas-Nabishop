// Sistema de Sincronización de Datos - NabbyShop
// ================================================

class DataSync {
    constructor() {
        this.serverUrl = this.getServerUrl();
        this.syncInterval = 30000; // Cada 30 segundos
        this.init();
    }

    // Obtener URL del servidor
    getServerUrl() {
        // Si estamos en localhost, usar localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
        // Si estamos en un dominio remoto (Cloudflare), usar el mismo dominio
        return window.location.protocol + '//' + window.location.host;
    }

    async init() {
        // Cargar datos del servidor al iniciar
        await this.loadDataFromServer();
        
        // Sincronizar cada 30 segundos
        setInterval(() => this.syncToServer(), this.syncInterval);
        
        // Sincronizar cuando cambia el localStorage
        window.addEventListener('storage', (e) => {
            if (e.key && (e.key.includes('nabby_custom_products') || e.key.includes('nabby_catalog_edits'))) {
                this.syncToServer();
            }
        });
    }

    // Cargar datos desde el servidor
    async loadDataFromServer() {
        try {
            const response = await fetch(`${this.serverUrl}/api/data`);
            if (!response.ok) return;
            
            const data = await response.json();
            
            // Cargar productos personalizados
            if (data.custom_products && Object.keys(data.custom_products).length > 0) {
                const existing = JSON.parse(localStorage.getItem('nabby_custom_products') || '[]');
                
                // Convertir de objeto a array si es necesario
                const serverProducts = Array.isArray(data.custom_products) 
                    ? data.custom_products 
                    : Object.values(data.custom_products);
                
                // Combinar: productos del servidor + locales (evitar duplicados)
                const combined = [...serverProducts];
                
                for (const local of existing) {
                    if (!combined.find(p => p.id === local.id)) {
                        combined.push(local);
                    }
                }
                
                localStorage.setItem('nabby_custom_products', JSON.stringify(combined));
            }
            
            // Cargar ediciones del catálogo
            if (data.catalog_edits && Object.keys(data.catalog_edits).length > 0) {
                const existing = JSON.parse(localStorage.getItem('nabby_catalog_edits') || '{}');
                const merged = { ...existing, ...data.catalog_edits };
                localStorage.setItem('nabby_catalog_edits', JSON.stringify(merged));
            }
        } catch (error) {
            console.log('No se pudo sincronizar desde el servidor (modo offline):', error.message);
        }
    }

    // Guardar datos en el servidor
    async syncToServer() {
        try {
            const customProducts = JSON.parse(localStorage.getItem('nabby_custom_products') || '[]');
            const catalogEdits = JSON.parse(localStorage.getItem('nabby_catalog_edits') || '{}');
            
            // Si hay productos personalizados, guardarlos
            if (customProducts.length > 0) {
                await this.saveProducts(customProducts);
            }
            
            // Si hay ediciones, guardarlas
            if (Object.keys(catalogEdits).length > 0) {
                await this.saveEdits(catalogEdits);
            }
        } catch (error) {
            console.log('Error sincronizando datos:', error.message);
        }
    }

    // Guardar productos en el servidor
    async saveProducts(products) {
        try {
            const response = await fetch(`${this.serverUrl}/api/save-products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    custom_products: products
                })
            });
            
            if (response.ok) {
                console.log('Productos guardados en servidor');
            }
        } catch (error) {
            console.log('Error guardando productos:', error.message);
        }
    }

    // Guardar ediciones en el servidor
    async saveEdits(edits) {
        try {
            const response = await fetch(`${this.serverUrl}/api/save-edits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    catalog_edits: edits
                })
            });
            
            if (response.ok) {
                console.log('Ediciones guardadas en servidor');
            }
        } catch (error) {
            console.log('Error guardando ediciones:', error.message);
        }
    }

    // Forzar sincronización inmediata
    async forceSyncNow() {
        console.log('Sincronizando datos...');
        await this.syncToServer();
        await this.loadDataFromServer();
        console.log('Sincronización completada');
    }
}

// Inicializar sincronización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dataSync = new DataSync();
    });
} else {
    window.dataSync = new DataSync();
}
