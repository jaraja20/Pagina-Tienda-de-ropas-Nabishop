// Sistema de Administración - NabbyShop
// =====================================

class AdminSystem {
    constructor() {
        console.log('✓ AdminSystem cargado correctamente');
        this.currentUser = this.getCurrentUser();
        this.clothingTypes = this.loadClothingTypes();
        this.colors = this.loadColors();
        this.registryLog = this.loadRegistry();
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.isAdmin()) {
            this.initAdminPanel();
            this.attachEventListeners();
        }
    }

    // Verificar si es administrador
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Obtener usuario actual
    getCurrentUser() {
        const stored = localStorage.getItem('nabby_currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    // Cargar tipos de ropa
    loadClothingTypes() {
        const stored = localStorage.getItem('nabby_clothingTypes');
        if (stored) return JSON.parse(stored);
        
        // Tipos por defecto
        return [
            { id: 'hoodies', name: 'Hoodies', visible: true, order: 1 },
            { id: 'vestidos', name: 'Vestidos', visible: true, order: 2 },
            { id: 'remeras', name: 'Remeras', visible: true, order: 3 },
            { id: 'pantalones', name: 'Pantalones', visible: true, order: 4 },
            { id: 'accesorios', name: 'Accesorios', visible: true, order: 5 }
        ];
    }

    // Cargar colores
    loadColors() {
        const stored = localStorage.getItem('nabby_colors');
        if (stored) return JSON.parse(stored);
        
        return [
            { id: 'rojo', name: 'Rojo', hex: '#FF0000', visible: true },
            { id: 'rosa', name: 'Rosa', hex: '#FFC0CB', visible: true },
            { id: 'azul', name: 'Azul', hex: '#0000FF', visible: true },
            { id: 'celeste', name: 'Celeste', hex: '#87CEEB', visible: true },
            { id: 'amarillo', name: 'Amarillo', hex: '#FFFF00', visible: true },
            { id: 'verde', name: 'Verde', hex: '#008000', visible: true }
        ];
    }

    // Cargar registro
    loadRegistry() {
        const stored = localStorage.getItem('nabby_registry');
        return stored ? JSON.parse(stored) : [];
    }

    // Capitalizar primera letra
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Guardar registro
    saveRegistry() {
        localStorage.setItem('nabby_registry', JSON.stringify(this.registryLog));
    }

    // Agregar entrada al registro
    addRegistryEntry(type, description, details = {}) {
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type: type, // 'clothing_type', 'product_add', 'product_edit', 'product_delete', 'color_add', etc.
            description: description,
            user: this.currentUser.username,
            details: details
        };
        this.registryLog.unshift(entry);
        this.saveRegistry();
        return entry;
    }

    // Guardar tipos de ropa
    saveClothingTypes() {
        localStorage.setItem('nabby_clothingTypes', JSON.stringify(this.clothingTypes));
        this.addRegistryEntry('config_change', 'Tipos de ropa actualizados');
    }

    // Guardar colores
    saveColors() {
        localStorage.setItem('nabby_colors', JSON.stringify(this.colors));
        this.addRegistryEntry('config_change', 'Colores actualizados');
    }

    // Inicializar panel de administración
    initAdminPanel() {
        const sidebar = document.getElementById('admin-sidebar');
        const content = document.getElementById('admin-content');
        const toggleBtn = document.getElementById('admin-toggle-btn');
        
        if (!sidebar || !content || !toggleBtn) {
            console.error('Admin containers not found in DOM');
            return;
        }
        
        // Mostrar botón de admin
        toggleBtn.style.display = 'block';
        
        // Agregar listener de paste global cuando el admin esté activo
        document.addEventListener('paste', (e) => this.globalPasteHandler(e));
        
        // Configurar sidebar
        sidebar.className = 'admin-sidebar';
        sidebar.innerHTML = `
            <div class="admin-header">
                <h3>Panel Admin</h3>
                <button class="admin-close-btn" onclick="adminSystem.toggleSidebar()">×</button>
            </div>
            
            <nav class="admin-nav">
                <button class="admin-nav-btn active" onclick="adminSystem.showSection('dashboard')">
                    <i class="fas fa-home"></i> Dashboard
                </button>
                <button class="admin-nav-btn" onclick="adminSystem.showSection('clothing-types')">
                    <i class="fas fa-tags"></i> Tipos de Ropa
                </button>
                <button class="admin-nav-btn" onclick="adminSystem.showSection('colors')">
                    <i class="fas fa-palette"></i> Colores
                </button>
                <button class="admin-nav-btn" onclick="adminSystem.showSection('add-product')">
                    <i class="fas fa-plus-circle"></i> Agregar Prenda
                </button>
                <button class="admin-nav-btn" onclick="adminSystem.showSection('manage-products')">
                    <i class="fas fa-edit"></i> Gestionar Prendas
                </button>
                <button class="admin-nav-btn" onclick="adminSystem.showSection('registry')">
                    <i class="fas fa-history"></i> Registro
                </button>
            </nav>
        `;
        
        // Configurar contenido
        content.className = 'admin-content';
        
        // Configurar botón flotante
        toggleBtn.onclick = () => this.toggleSidebar();
        toggleBtn.innerHTML = '<i class="fas fa-cog"></i>';
        toggleBtn.title = 'Panel Admin';
        
        // Mostrar dashboard por defecto
        this.showSection('dashboard');
    }

    // Alternar sidebar
    toggleSidebar() {
        const sidebar = document.getElementById('admin-sidebar');
        const content = document.getElementById('admin-content');
        
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            content.classList.remove('open');
        } else {
            sidebar.classList.add('open');
            content.classList.add('open');
        }
    }

    // Mostrar sección
    showSection(section) {
        const content = document.getElementById('admin-content');
        
        // Actualizar botones activos
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Marcar botón actual como activo
        const activeBtn = document.querySelector(`[onclick="adminSystem.showSection('${section}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Limpiar contenido
        content.innerHTML = '';
        content.style.display = 'block';
        
        // Mostrar sección correspondiente
        switch(section) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'clothing-types':
                this.renderClothingTypes();
                break;
            case 'colors':
                this.renderColors();
                break;
            case 'add-product':
                this.renderAddProduct();
                break;
            case 'manage-products':
                this.renderManageProducts();
                break;
            case 'registry':
                this.renderRegistry();
                break;
        }
    }

    // Renderizar Dashboard
    renderDashboard() {
        const content = document.getElementById('admin-content');
        const totalProducts = window.imagesMapping ? 
            Object.values(window.imagesMapping).reduce((sum, colors) => 
                sum + Object.keys(colors).length, 0) : 0;
        
        content.innerHTML = `
            <div class="admin-dashboard">
                <h2>Dashboard</h2>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-tshirt"></i></div>
                        <div class="stat-info">
                            <h4>Prendas Totales</h4>
                            <p class="stat-number">${totalProducts}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-palette"></i></div>
                        <div class="stat-info">
                            <h4>Colores</h4>
                            <p class="stat-number">${this.colors.length}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-tags"></i></div>
                        <div class="stat-info">
                            <h4>Tipos de Ropa</h4>
                            <p class="stat-number">${this.clothingTypes.length}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-info">
                            <h4>Usuario</h4>
                            <p class="stat-number">${this.currentUser.username}</p>
                        </div>
                    </div>
                </div>
                
                <div class="recent-activity">
                    <h3>Actividad Reciente</h3>
                    <div class="activity-list">
                        ${this.registryLog.slice(0, 5).map(entry => `
                            <div class="activity-item">
                                <span class="activity-time">${new Date(entry.timestamp).toLocaleString()}</span>
                                <span class="activity-desc">${entry.description}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar Tipos de Ropa
    renderClothingTypes() {
        const content = document.getElementById('admin-content');
        
        content.innerHTML = `
            <div class="admin-section">
                <h2>Gestionar Tipos de Ropa</h2>
                
                <div class="form-section">
                    <h3>Agregar Nuevo Tipo</h3>
                    <form onsubmit="adminSystem.addClothingType(event)">
                        <div class="form-group">
                            <label for="type-id">ID (slug):</label>
                            <input type="text" id="type-id" required placeholder="ej: hoodies">
                        </div>
                        <div class="form-group">
                            <label for="type-name">Nombre:</label>
                            <input type="text" id="type-name" required placeholder="ej: Hoodies">
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="type-visible" checked>
                                Visible en menú
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary">Agregar Tipo</button>
                    </form>
                </div>
                
                <div class="list-section">
                    <h3>Tipos Existentes</h3>
                    <div class="types-list">
                        ${this.clothingTypes.map((type, idx) => `
                            <div class="type-item">
                                <div class="type-info">
                                    <strong>${type.name}</strong>
                                    <small>(${type.id})</small>
                                    <span class="visibility-badge ${type.visible ? 'visible' : 'hidden'}">
                                        ${type.visible ? '✓ Visible' : '✗ Oculto'}
                                    </span>
                                </div>
                                <div class="type-actions">
                                    <button class="btn btn-small btn-warning" 
                                            onclick="adminSystem.toggleTypeVisibility(${idx})">
                                        ${type.visible ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                    <button class="btn btn-small btn-danger" 
                                            onclick="adminSystem.deleteClothingType(${idx})">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Agregar tipo de ropa
    addClothingType(event) {
        event.preventDefault();
        
        const id = document.getElementById('type-id').value;
        const name = document.getElementById('type-name').value;
        const visible = document.getElementById('type-visible').checked;
        
        // Verificar que no exista
        if (this.clothingTypes.some(t => t.id === id)) {
            alert('Este tipo de ropa ya existe');
            return;
        }
        
        const newType = {
            id: id,
            name: name,
            visible: visible,
            order: this.clothingTypes.length + 1
        };
        
        this.clothingTypes.push(newType);
        this.saveClothingTypes();
        this.addRegistryEntry('clothing_type_add', `Tipo de ropa agregado: ${name}`);
        
        alert(`✓ ${name} agregado`);
        this.renderClothingTypes();
    }

    // Alternar visibilidad de tipo
    toggleTypeVisibility(idx) {
        this.clothingTypes[idx].visible = !this.clothingTypes[idx].visible;
        this.saveClothingTypes();
        this.renderClothingTypes();
    }

    // Eliminar tipo de ropa
    deleteClothingType(idx) {
        if (confirm('¿Eliminar este tipo de ropa?')) {
            const deleted = this.clothingTypes.splice(idx, 1)[0];
            this.saveClothingTypes();
            this.addRegistryEntry('clothing_type_delete', `Tipo de ropa eliminado: ${deleted.name}`);
            this.renderClothingTypes();
        }
    }

    // Renderizar Colores
    renderColors() {
        const content = document.getElementById('admin-content');
        
        content.innerHTML = `
            <div class="admin-section">
                <h2>Gestionar Colores</h2>
                
                <div class="form-section">
                    <h3>Agregar Nuevo Color</h3>
                    <form onsubmit="adminSystem.addColor(event)">
                        <div class="form-group">
                            <label for="color-id">ID (slug):</label>
                            <input type="text" id="color-id" required placeholder="ej: rojo">
                        </div>
                        <div class="form-group">
                            <label for="color-name">Nombre:</label>
                            <input type="text" id="color-name" required placeholder="ej: Rojo">
                        </div>
                        <div class="form-group">
                            <label for="color-hex">Color (HEX):</label>
                            <input type="color" id="color-hex" required value="#FF0000">
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="color-visible" checked>
                                Visible en menú
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary">Agregar Color</button>
                    </form>
                </div>
                
                <div class="list-section">
                    <h3>Colores Existentes</h3>
                    <div class="colors-list">
                        ${this.colors.map((color, idx) => `
                            <div class="color-item">
                                <div class="color-preview" style="background-color: ${color.hex}"></div>
                                <div class="color-info">
                                    <strong>${color.name}</strong>
                                    <small>${color.hex} (${color.id})</small>
                                    <span class="visibility-badge ${color.visible ? 'visible' : 'hidden'}">
                                        ${color.visible ? '✓ Visible' : '✗ Oculto'}
                                    </span>
                                </div>
                                <div class="color-actions">
                                    <button class="btn btn-small btn-warning" 
                                            onclick="adminSystem.toggleColorVisibility(${idx})">
                                        ${color.visible ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                    <button class="btn btn-small btn-danger" 
                                            onclick="adminSystem.deleteColor(${idx})">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Agregar color
    addColor(event) {
        event.preventDefault();
        
        const id = document.getElementById('color-id').value;
        const name = document.getElementById('color-name').value;
        const hex = document.getElementById('color-hex').value;
        const visible = document.getElementById('color-visible').checked;
        
        // Verificar que no exista
        if (this.colors.some(c => c.id === id)) {
            alert('Este color ya existe');
            return;
        }
        
        const newColor = {
            id: id,
            name: name,
            hex: hex,
            visible: visible
        };
        
        this.colors.push(newColor);
        this.saveColors();
        this.addRegistryEntry('color_add', `Color agregado: ${name}`);
        
        alert(`✓ ${name} agregado`);
        this.renderColors();
    }

    // Alternar visibilidad de color
    toggleColorVisibility(idx) {
        this.colors[idx].visible = !this.colors[idx].visible;
        this.saveColors();
        this.renderColors();
    }

    // Eliminar color
    deleteColor(idx) {
        if (confirm('¿Eliminar este color?')) {
            const deleted = this.colors.splice(idx, 1)[0];
            this.saveColors();
            this.addRegistryEntry('color_delete', `Color eliminado: ${deleted.name}`);
            this.renderColors();
        }
    }

    // Renderizar Agregar Producto
    renderAddProduct() {
        const content = document.getElementById('admin-content');
        
        const colorOptions = this.colors.map(c => 
            `<option value="${c.id}">${c.name}</option>`
        ).join('');
        
        content.innerHTML = `
            <div class="admin-section">
                <h2>Agregar Nueva Prenda</h2>
                
                <form id="add-product-form" onsubmit="adminSystem.submitAddProduct(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="prod-title">Título:</label>
                            <input type="text" id="prod-title" required placeholder="Nombre de la prenda">
                        </div>
                        <div class="form-group">
                            <label for="prod-color">Color:</label>
                            <select id="prod-color" required>
                                <option value="">Seleccionar color...</option>
                                ${colorOptions}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="prod-price">Precio:</label>
                            <input type="number" id="prod-price" step="0.01" required placeholder="0.00">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Tipos de Ropa (Selecciona múltiples):</label>
                        <div class="checkbox-group">
                            ${this.clothingTypes.map((type, idx) => `
                                <label class="checkbox-item">
                                    <input type="checkbox" value="${type.id}" class="prod-type-checkbox">
                                    <span>${type.name}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="prod-description">Descripción:</label>
                        <textarea id="prod-description" rows="4" placeholder="Descripción del producto"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="prod-sizes">Tamaños (separados por comas):</label>
                        <input type="text" id="prod-sizes" value="XS,S,M,L,XL,XXL" placeholder="XS,S,M,L,XL,XXL">
                    </div>
                    
                    <div class="form-group">
                        <label for="prod-stock">Stock Disponible:</label>
                        <select id="prod-stock">
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Cargar Imágenes:</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                            <!-- Opción 1: Drag & Drop / Click -->
                            <div class="image-upload" id="image-drop-zone" ondrop="adminSystem.handleImageDrop(event)" ondragover="adminSystem.handleDragOver(event)" ondragleave="adminSystem.handleDragLeave(event)">
                                <div class="upload-content">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Arrastra imágenes aquí o haz clic</p>
                                    <small>JPG, PNG, WEBP</small>
                                </div>
                                <input type="file" id="prod-images" multiple accept="image/*" style="display: none;" onchange="adminSystem.handleImageSelect(event)">
                            </div>
                            
                            <!-- Opción 2: Portapapeles -->
                            <button type="button" onclick="adminSystem.pasteFromClipboard('add')" style="padding: 20px; display: flex !important; flex-direction: column; align-items: center; justify-content: center; height: 100%; border: 3px solid #4CAF50; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; background: #e8f5e9; color: #2e7d32; transition: all 0.3s ease;">
                                <i class="fas fa-paste" style="font-size: 36px; margin-bottom: 10px; color: #4CAF50;"></i>
                                <span style="color: #2e7d32; font-weight: bold;">Pegar Imagen</span>
                                <small style="font-weight: normal; margin-top: 5px; font-size: 12px; color: #4CAF50;">del portapapeles</small>
                            </button>
                        </div>
                        <div id="image-preview" class="image-preview-container"></div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">
                        <i class="fas fa-plus"></i> Agregar Prenda
                    </button>
                </form>
            </div>
        `;
        
        // Agregar event listeners para el drop zone
        const dropZone = document.getElementById('image-drop-zone');
        if (dropZone) {
            dropZone.addEventListener('click', () => {
                document.getElementById('prod-images').click();
            });
        }
    }

    // Mostrar área de paste
    showPasteArea(context = 'add') {
        const areaId = context === 'edit' ? 'paste-input-area-edit' : 'paste-input-area';
        const inputId = context === 'edit' ? 'paste-input-edit' : 'paste-input';
        
        const area = document.getElementById(areaId);
        const input = document.getElementById(inputId);
        
        if (area) {
            area.style.display = 'block';
            area.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Focus en el input
            setTimeout(() => {
                if (input) {
                    input.focus();
                    this.showNotification('✓ Área de paste activa. Presiona Ctrl+V');
                }
            }, 100);
        }
    }
    
    // Cerrar área de paste
    closePasteArea(context = 'add') {
        const areaId = context === 'edit' ? 'paste-input-area-edit' : 'paste-input-area';
        const area = document.getElementById(areaId);
        if (area) {
            area.style.display = 'none';
        }
    }
    
    // Pegar imágenes desde el portapapeles usando Clipboard API
    async pasteFromClipboard(context = 'add') {
        console.log('pasteFromClipboard llamado con context:', context);
        try {
            // Acceder al portapapeles
            console.log('Intentando acceder al portapapeles...');
            const items = await navigator.clipboard.read();
            const imageFiles = [];
            
            // Buscar imágenes en el portapapeles
            for (const item of items) {
                const imageTypes = item.types.filter(t => t.startsWith('image/'));
                
                if (imageTypes.length > 0) {
                    for (const imageType of imageTypes) {
                        const blob = await item.getType(imageType);
                        imageFiles.push(blob);
                        console.log(`✓ Imagen encontrada en portapapeles: ${imageType}`);
                    }
                }
            }
            
            if (imageFiles.length > 0) {
                this.processImageBlobs(imageFiles, context);
                this.showNotification(`✓ ${imageFiles.length} imagen(es) pegada(s) del portapapeles`);
            } else {
                this.showNotification('⚠️ No hay imágenes en el portapapeles');
            }
        } catch (error) {
            console.error('Error al acceder al portapapeles:', error);
            
            // Si falla la Clipboard API, mostrar fallback
            if (error.name === 'NotAllowedError') {
                this.showNotification('⚠️ El navegador requiere permiso para acceder al portapapeles');
                alert('Por favor, permite al sitio acceder a tu portapapeles.\n\nSi se te pidió permiso, haz clic en "Permitir".');
            } else {
                this.showNotification('⚠️ No se pudo acceder al portapapeles');
                alert('Tu navegador podría no soportar esta función.\n\nIntenta:\n1. Usa el área Drag & Drop\n2. O haz clic para seleccionar archivos');
            }
        }
    }
    
    // Procesar blobs de imagen (desde portapapeles)
    processImageBlobs(blobs, context = 'add') {
        const previewId = context === 'add' ? 'image-preview' : 'new-image-preview';
        const preview = document.getElementById(previewId);
        
        if (!preview) return;
        
        blobs.forEach((blob, index) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-img-container';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-img';
                
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'preview-remove-btn';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = (e) => {
                    e.preventDefault();
                    imgContainer.remove();
                };
                
                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                preview.appendChild(imgContainer);
            };
            
            reader.readAsDataURL(blob);
        });
        
        // Scroll al preview
        setTimeout(() => {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    // Manejar paste de imágenes (Ctrl+V)
    handlePasteImage(event, context = 'add') {
        // Si no hay clipboard data, salir
        if (!event.clipboardData) {
            return;
        }
        
        const items = event.clipboardData.items;
        if (!items) {
            return;
        }
        
        let foundImages = false;
        const files = [];
        
        // Buscar archivos de imagen en el clipboard
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const type = items[i].type;
                if (type.indexOf('image') !== -1) {
                    files.push(items[i].getAsFile());
                    foundImages = true;
                }
            }
        }
        
        // Si encontramos imágenes, procesarlas
        if (foundImages && files.length > 0) {
            event.preventDefault();
            event.stopPropagation();
            
            console.log(`✓ Pegar detectado: ${files.length} imagen(es)`);
            
            // Procesar los archivos
            this.processImageFiles(files, context);
            
            // Scroll al preview
            setTimeout(() => {
                const preview = context === 'edit' 
                    ? document.getElementById('new-image-preview')
                    : document.getElementById('image-preview');
                
                if (preview) {
                    preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    this.showNotification(`✓ ${files.length} imagen(es) agregada(s) desde portapapeles`);
                }
            }, 100);
        }
    }
    
    // Mostrar notificación temporal
    showNotification(message) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        notif.textContent = message;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }

    // Handler global de paste para admin
    globalPasteHandler(event) {
        // Solo procesar si estamos en una sección de agregar o editar
        const adminContent = document.getElementById('admin-content');
        if (!adminContent || adminContent.style.display === 'none') {
            return;
        }
        
        // Verificar si hay un drop zone visible
        const dropZoneAdd = document.getElementById('image-drop-zone');
        const dropZoneEdit = document.getElementById('image-drop-zone-edit');
        
        if (!dropZoneAdd && !dropZoneEdit) {
            return;
        }
        
        // Determinar contexto
        const context = dropZoneAdd ? 'add' : 'edit';
        this.handlePasteImage(event, context);
    }

    // Manejar drag over
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        const dropZone = event.target.closest('.image-upload');
        if (dropZone) {
            dropZone.classList.add('drag-over');
        }
    }

    // Manejar drag leave
    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        const dropZone = event.target.closest('.image-upload');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
    }
    
    // Mejorar drop para que funcione en cualquier drop zone
    handleImageDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const dropZone = event.target.closest('.image-upload');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
        
        const files = event.dataTransfer.files;
        
        // Determinar contexto según el ID del drop zone
        const context = event.target.closest('#image-drop-zone-edit') ? 'edit' : 'add';
        this.processImageFiles(files, context);
    }

    // Manejar drop
    handleImageDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const dropZone = document.getElementById('image-drop-zone');
        dropZone.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        this.processImageFiles(files);
    }

    // Manejar selección de archivos
    handleImageSelect(event) {
        const files = event.target.files;
        this.processImageFiles(files);
    }

    // Procesar archivos de imagen
    processImageFiles(files, context = 'add') {
        const previewId = context === 'add' ? 'image-preview' : 'new-image-preview';
        const preview = document.getElementById(previewId);
        
        if (!preview) return;
        
        // Convertir FileList a Array
        const fileArray = Array.from(files);
        
        fileArray.forEach((file, index) => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} no es una imagen válida`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-img-container';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-img';
                
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'preview-remove-btn';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = (e) => {
                    e.preventDefault();
                    imgContainer.remove();
                };
                
                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                preview.appendChild(imgContainer);
            };
            reader.readAsDataURL(file);
        });
    }

    // Enviar agregar producto
    submitAddProduct(event) {
        event.preventDefault();
        
        const title = document.getElementById('prod-title').value;
        
        // Obtener múltiples tipos seleccionados
        const typeCheckboxes = document.querySelectorAll('.prod-type-checkbox:checked');
        const types = Array.from(typeCheckboxes).map(cb => cb.value);
        
        if (types.length === 0) {
            alert('Debes seleccionar al menos un tipo de ropa');
            return;
        }
        
        const color = document.getElementById('prod-color').value;
        const price = parseFloat(document.getElementById('prod-price').value);
        const description = document.getElementById('prod-description').value;
        const sizes = document.getElementById('prod-sizes').value.split(',').map(s => s.trim());
        const stock = document.getElementById('prod-stock').value === 'true';
        
        // Obtener imágenes del preview
        const imageContainers = document.querySelectorAll('.preview-img-container');
        
        if (imageContainers.length === 0) {
            alert('Debes cargar al menos una imagen');
            return;
        }
        
        // Extraer datos de imágenes (base64 o referencias)
        const images = [];
        imageContainers.forEach((container, idx) => {
            const img = container.querySelector('.preview-img');
            images.push({
                index: idx,
                src: img.src,
                name: `imagen-${idx + 1}.jpg`
            });
        });
        
        // Crear producto con metadata
        const productNumber = Date.now();
        const product = {
            id: `${color}-${productNumber}`,
            title: title,
            type: types[0], // Mantener el primer tipo como principal
            types: types, // Nuevo: arreglo de múltiples tipos
            color: color,
            colorCode: color,
            price: price,
            description: description,
            sizes: sizes,
            inStock: stock,
            number: productNumber,
            imageCount: images.length,
            images: images,
            createdAt: new Date().toISOString()
        };
        
        // Guardar producto en localStorage
        let customProducts = JSON.parse(localStorage.getItem('nabby_custom_products') || '[]');
        customProducts.push(product);
        localStorage.setItem('nabby_custom_products', JSON.stringify(customProducts));
        
        // Guardar imágenes en localStorage (base64)
        images.forEach((img, idx) => {
            localStorage.setItem(`nabby_product_image_${product.id}_${idx}`, img.src);
        });
        
        // Agregar al mapeo global
        if (!window.imagesMapping) {
            window.imagesMapping = {};
        }
        if (!window.imagesMapping[color]) {
            window.imagesMapping[color] = {};
        }
        window.imagesMapping[color][productNumber] = images.map((_, idx) => `imagen-${idx + 1}.jpg`);
        localStorage.setItem('nabby_imagesMapping', JSON.stringify(window.imagesMapping));
        
        this.addRegistryEntry('product_add', `Prenda agregada: ${title}`, {
            product: {
                id: product.id,
                title: title,
                types: types,
                color: color,
                price: price
            },
            imageCount: images.length
        });
        
        alert(`✓ ${title} agregado con ${images.length} imagen(s) y ${types.length} tipo(s)`);
        
        // Limpiar formulario
        document.getElementById('add-product-form').reset();
        document.getElementById('image-preview').innerHTML = '';
        
        // Recargar productos en la tienda si es posible
        if (typeof productsSystem !== 'undefined' && productsSystem.loadProducts) {
            productsSystem.loadProducts();
        }
    }

    // Renderizar Gestionar Productos
    renderManageProducts() {
        const content = document.getElementById('admin-content');
        
        content.innerHTML = `
            <div class="admin-section">
                <h2>Gestionar Prendas</h2>
                
                <div class="search-filter">
                    <input type="text" id="product-search" placeholder="Buscar prenda..." 
                           onkeyup="adminSystem.filterProducts()">
                </div>
                
                <div id="products-management-list" class="products-management-list">
                    <!-- Se llenará con productos -->
                </div>
            </div>
        `;
        
        this.populateProductsList();
    }

    // Poblar lista de productos
    populateProductsList() {
        const list = document.getElementById('products-management-list');
        
        let html = '';
        
        // Primero, mostrar productos del mapeo original
        if (window.imagesMapping) {
            for (const [colorCode, colors] of Object.entries(window.imagesMapping)) {
                for (const [number, images] of Object.entries(colors)) {
                    if (images && images.length > 0) {
                        const productId = `${colorCode}-${number}`;
                        html += `
                            <div class="product-management-item">
                                <div class="prod-thumb">
                                    <img src="imagenes/Ropas/${colorCode}/${number}/${images[0]}" 
                                         alt="Prenda" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2280%22 height=%2280%22/%3E%3C/svg%3E'">
                                </div>
                                <div class="prod-details">
                                    <h4>${colorCode} - Prenda ${number}</h4>
                                    <small>${images.length} imagen(s)</small>
                                </div>
                                <div class="prod-actions">
                                    <button class="btn btn-small btn-primary" onclick="adminSystem.editProduct('${productId}')">
                                        Editar
                                    </button>
                                    <button class="btn btn-small btn-danger" onclick="adminSystem.deleteProduct('${productId}')">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                }
            }
        }
        
        // Luego, mostrar productos personalizados
        const customProducts = JSON.parse(localStorage.getItem('nabby_custom_products') || '[]');
        
        customProducts.forEach((product) => {
            const firstImage = localStorage.getItem(`nabby_product_image_${product.id}_0`);
            const imageSrc = firstImage || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2280%22 height=%2280%22/%3E%3C/svg%3E';
            
            html += `
                <div class="product-management-item custom-product">
                    <div class="prod-thumb">
                        <img src="${imageSrc}" alt="${product.title}">
                        <span class="product-badge">PERSONALIZADO</span>
                    </div>
                    <div class="prod-details">
                        <h4>${product.title}</h4>
                        <small>${product.color} • $${product.price.toFixed(2)}</small>
                        <small>${product.imageCount} imagen(s)</small>
                    </div>
                    <div class="prod-actions">
                        <button class="btn btn-small btn-primary" onclick="adminSystem.editProduct('${product.id}')">
                            Editar
                        </button>
                        <button class="btn btn-small btn-danger" onclick="adminSystem.deleteCustomProduct('${product.id}')">
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
        });
        
        list.innerHTML = html || '<p>No hay productos para mostrar</p>';
    }

    // Filtrar productos
    filterProducts() {
        const search = document.getElementById('product-search').value.toLowerCase();
        const items = document.querySelectorAll('.product-management-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(search) ? 'flex' : 'none';
        });
    }

    // Editar producto
    editProduct(productId) {
        console.log('Editando producto:', productId);
        
        let product = null;
        let isCustom = false;
        
        // Primero buscar en productos personalizados
        let customProducts = JSON.parse(localStorage.getItem('nabby_custom_products') || '[]');
        product = customProducts.find(p => p.id === productId);
        
        if (product) {
            isCustom = true;
            console.log('Producto encontrado en custom products');
        } else {
            // Si no lo encuentra, buscar en el mapeo original
            const parts = productId.split('-');
            if (parts.length >= 2) {
                const colorCode = parts[0];
                const number = parts[1];
                
                if (window.imagesMapping && window.imagesMapping[colorCode] && window.imagesMapping[colorCode][number]) {
                    const images = window.imagesMapping[colorCode][number];
                    product = {
                        id: productId,
                        title: `${this.capitalizeFirst(colorCode)} Prenda ${number}`,
                        type: 'remeras', // tipo por defecto
                        types: ['remeras'],
                        color: colorCode,
                        colorCode: colorCode,
                        price: 49.99,
                        description: 'Prenda del catálogo original',
                        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                        inStock: true,
                        imageCount: images.length,
                        images: images,
                        isFromCatalog: true
                    };
                    console.log('Producto encontrado en mapeo original');
                }
            }
        }
        
        if (!product) {
            console.error('Producto no encontrado');
            alert('Producto no encontrado');
            return;
        }
        
        const content = document.getElementById('admin-content');
        
        // Obtener tipos seleccionados (compatible con formato antiguo y nuevo)
        const productTypes = product.types || (product.type ? [product.type] : []);
        console.log('Tipos del producto:', productTypes);
        
        // Crear checkboxes para tipos
        const typeCheckboxes = this.clothingTypes.map(t => `
            <label class="checkbox-item">
                <input type="checkbox" value="${t.id}" class="edit-prod-type-checkbox" ${productTypes.includes(t.id) ? 'checked' : ''}>
                <span>${t.name}</span>
            </label>
        `).join('');
        
        const colorOptions = this.colors.map(c => 
            `<option value="${c.id}" ${c.id === product.color ? 'selected' : ''}>${c.name}</option>`
        ).join('');
        
        // Cargar imágenes actuales
        let currentImagesHtml = '';
        
        if (isCustom) {
            // Imágenes personalizadas guardadas en localStorage
            currentImagesHtml = Array.from({length: product.imageCount}).map((_, idx) => {
                const imageSrc = localStorage.getItem(`nabby_product_image_${product.id}_${idx}`);
                return imageSrc ? `
                    <div class="preview-img-container">
                        <img src="${imageSrc}" class="preview-img" alt="Imagen ${idx + 1}" style="max-width: 100%; height: auto;">
                        <button type="button" class="preview-remove-btn" onclick="adminSystem.removeProductImage('${product.id}', ${idx})">×</button>
                    </div>
                ` : '';
            }).join('');
        } else {
            // Imágenes del catálogo original
            currentImagesHtml = (product.images || []).map((img, idx) => {
                const imagePath = `imagenes/Ropas/${product.color}/${product.images[idx].split('/').pop() || idx + 1}/${img}`;
                return `
                    <div class="preview-img-container">
                        <img src="${imagePath}" class="preview-img" alt="Imagen ${idx + 1}" style="max-width: 100%; height: auto;">
                        <span class="preview-img-info">Catálogo</span>
                    </div>
                `;
            }).join('');
        }
        
        content.innerHTML = `
            <div class="admin-section">
                <h2>Editar Prenda: ${product.title}</h2>
                ${isCustom ? '' : '<p style="color: #666; font-size: 14px; margin-bottom: 15px;">⚠️ Este es un producto del catálogo original</p>'}
                
                <form id="edit-product-form" onsubmit="adminSystem.submitEditProduct(event, '${product.id}', ${isCustom})">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-prod-title">Título:</label>
                            <input type="text" id="edit-prod-title" required value="${product.title}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Tipos de Prenda:</label>
                        <div class="checkbox-group">
                            ${typeCheckboxes}
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-prod-color">Color:</label>
                            <select id="edit-prod-color" required>
                                ${colorOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-prod-price">Precio:</label>
                            <input type="number" id="edit-prod-price" step="0.01" required value="${product.price}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-prod-description">Descripción:</label>
                        <textarea id="edit-prod-description" rows="4">${product.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-prod-sizes">Tamaños (separados por comas):</label>
                        <input type="text" id="edit-prod-sizes" value="${product.sizes.join(',')}">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-prod-stock">Stock Disponible:</label>
                        <select id="edit-prod-stock">
                            <option value="true" ${product.inStock ? 'selected' : ''}>Sí</option>
                            <option value="false" ${!product.inStock ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Imágenes Actuales:</label>
                        <div id="current-images" class="image-preview-container">
                            ${currentImagesHtml}
                        </div>
                    </div>
                    
                    ${isCustom ? `
                    <div class="form-group">
                        <label>Agregar Más Imágenes:</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                            <!-- Opción 1: Drag & Drop / Click -->
                            <div class="image-upload" id="image-drop-zone-edit" ondrop="adminSystem.handleImageDrop(event)" ondragover="adminSystem.handleDragOver(event)" ondragleave="adminSystem.handleDragLeave(event)">
                                <div class="upload-content">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Arrastra imágenes aquí o haz clic</p>
                                    <small>JPG, PNG, WEBP</small>
                                </div>
                                <input type="file" id="edit-prod-images" multiple accept="image/*" style="display: none;" onchange="adminSystem.handleImageSelect(event)">
                            </div>
                            
                            <!-- Opción 2: Portapapeles -->
                            <button type="button" class="btn btn-secondary" onclick="adminSystem.pasteFromClipboard('edit')" style="padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; border: 2px solid #4CAF50; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; background: #f0fff0;">
                                <i class="fas fa-paste" style="font-size: 32px; margin-bottom: 10px; color: #4CAF50;"></i>
                                <span>Pegar imagen</span>
                                <small style="font-weight: normal; margin-top: 5px; font-size: 12px;">del portapapeles</small>
                            </button>
                        </div>
                        <div id="new-image-preview" class="image-preview-container" style="margin-top: 15px;"></div>
                    </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn btn-primary" style="flex: 1; padding: 12px; font-size: 16px;">
                            <i class="fas fa-save"></i> Guardar Cambios
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="adminSystem.showSection('manage-products')" style="flex: 1; padding: 12px; font-size: 16px;">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Agregar event listener al drop zone solo para productos personalizados
        if (isCustom) {
            const dropZone = document.getElementById('image-drop-zone-edit');
            if (dropZone) {
                dropZone.addEventListener('click', () => {
                    document.getElementById('edit-prod-images').click();
                });
            }
        }
    }

    // Guardar cambios de producto
    submitEditProduct(event, productId, isCustom) {
        event.preventDefault();
        
        const title = document.getElementById('edit-prod-title').value;
        
        // Obtener múltiples tipos seleccionados
        const typeCheckboxes = document.querySelectorAll('.edit-prod-type-checkbox:checked');
        const types = Array.from(typeCheckboxes).map(cb => cb.value);
        
        if (types.length === 0) {
            alert('Debes seleccionar al menos un tipo de ropa');
            return;
        }
        
        const color = document.getElementById('edit-prod-color').value;
        const price = parseFloat(document.getElementById('edit-prod-price').value);
        const description = document.getElementById('edit-prod-description').value;
        const sizes = document.getElementById('edit-prod-sizes').value.split(',').map(s => s.trim());
        const stock = document.getElementById('edit-prod-stock').value === 'true';
        
        if (isCustom) {
            // Editar producto personalizado
            let customProducts = JSON.parse(localStorage.getItem('nabby_custom_products') || '[]');
            const productIndex = customProducts.findIndex(p => p.id === productId);
            
            if (productIndex === -1) {
                alert('Producto no encontrado');
                return;
            }
            
            // Actualizar producto con tipos múltiples
            customProducts[productIndex] = {
                ...customProducts[productIndex],
                title,
                type: types[0],
                types: types,
                color,
                colorCode: color,
                price,
                description,
                sizes,
                inStock: stock,
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem('nabby_custom_products', JSON.stringify(customProducts));
        } else {
            // Editar producto del catálogo original
            // Guardar en localStorage como un registro de cambios
            let catalogEdits = JSON.parse(localStorage.getItem('nabby_catalog_edits') || '{}');
            
            catalogEdits[productId] = {
                title,
                types: types,
                color,
                price,
                description,
                sizes,
                inStock: stock,
                editedAt: new Date().toISOString()
            };
            
            localStorage.setItem('nabby_catalog_edits', JSON.stringify(catalogEdits));
        }
        
        this.addRegistryEntry('product_edit', `Prenda editada: ${title}`, {
            productId: productId,
            isCustom: isCustom,
            changes: { title, types: types, color, price }
        });
        
        alert(`✓ Prenda actualizada con ${types.length} tipo(s)`);
        this.renderManageProducts();
    }

    // Remover imagen de producto
    removeProductImage(productId, imageIndex) {
        if (confirm('¿Eliminar esta imagen?')) {
            localStorage.removeItem(`nabby_product_image_${productId}_${imageIndex}`);
            alert('✓ Imagen eliminada');
            this.editProduct(productId);
        }
    }

    // Eliminar producto (original)
    deleteProduct(productId) {
        if (confirm('¿Eliminar esta prenda del catálogo?')) {
            const parts = productId.split('-');
            const color = parts[0];
            const number = parts[1];
            
            if (window.imagesMapping && window.imagesMapping[color]) {
                delete window.imagesMapping[color][number];
                
                // Si el color no tiene más productos, eliminar el color también
                if (Object.keys(window.imagesMapping[color]).length === 0) {
                    delete window.imagesMapping[color];
                }
                
                localStorage.setItem('nabby_imagesMapping', JSON.stringify(window.imagesMapping));
                this.addRegistryEntry('product_delete', `Prenda eliminada: ${productId}`);
                alert('✓ Prenda eliminada correctamente');
                this.renderManageProducts();
            }
        }
    }

    // Eliminar producto personalizado
    deleteCustomProduct(productId) {
        if (confirm('¿Eliminar esta prenda personalizada? Esta acción no se puede deshacer.')) {
            // Eliminar de localStorage
            let customProducts = JSON.parse(localStorage.getItem('nabby_custom_products') || '[]');
            const productToDelete = customProducts.find(p => p.id === productId);
            customProducts = customProducts.filter(p => p.id !== productId);
            localStorage.setItem('nabby_custom_products', JSON.stringify(customProducts));
            
            // Eliminar imágenes
            if (productToDelete) {
                for (let i = 0; i < productToDelete.imageCount; i++) {
                    localStorage.removeItem(`nabby_product_image_${productId}_${i}`);
                }
            }
            
            // Eliminar del mapeo global
            const parts = productId.split('-');
            const color = parts[0];
            if (window.imagesMapping && window.imagesMapping[color]) {
                const keysToRemove = [];
                for (const number in window.imagesMapping[color]) {
                    if (productId.startsWith(`${color}-${number}`)) {
                        keysToRemove.push(number);
                    }
                }
                keysToRemove.forEach(number => delete window.imagesMapping[color][number]);
                localStorage.setItem('nabby_imagesMapping', JSON.stringify(window.imagesMapping));
            }
            
            this.addRegistryEntry('product_delete', `Prenda personalizada eliminada: ${productId}`);
            alert('✓ Prenda eliminada correctamente');
            this.renderManageProducts();
        }
    }

    // Renderizar Registro
    renderRegistry() {
        const content = document.getElementById('admin-content');
        
        const registryHTML = this.registryLog.map((entry, idx) => `
            <div class="registry-entry">
                <div class="entry-header">
                    <span class="entry-type badge badge-${entry.type}">${entry.type}</span>
                    <span class="entry-user">${entry.user}</span>
                    <span class="entry-time">${new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <div class="entry-body">
                    <p>${entry.description}</p>
                    ${entry.details && Object.keys(entry.details).length > 0 ? 
                        `<details><summary>Detalles</summary><pre>${JSON.stringify(entry.details, null, 2)}</pre></details>` 
                        : ''}
                </div>
            </div>
        `).join('');
        
        content.innerHTML = `
            <div class="admin-section">
                <h2>Registro de Cambios</h2>
                
                <div class="registry-header">
                    <p>Total de cambios: <strong>${this.registryLog.length}</strong></p>
                    <button class="btn btn-small btn-danger" onclick="if(confirm('¿Limpiar registro?')) adminSystem.clearRegistry()">
                        Limpiar Registro
                    </button>
                </div>
                
                <div class="registry-list">
                    ${registryHTML || '<p>No hay cambios registrados</p>'}
                </div>
            </div>
        `;
    }

    // Limpiar registro
    clearRegistry() {
        this.registryLog = [];
        this.saveRegistry();
        this.renderRegistry();
        alert('Registro limpiado');
    }

    // Adjuntar event listeners
    attachEventListeners() {
        // Cerrar sidebar al hacer click fuera
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('admin-sidebar');
            const toggleBtn = document.getElementById('admin-toggle-btn');
            
            if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                if (sidebar.classList.contains('open')) {
                    // Opcional: cerrar automáticamente
                }
            }
        });
    }
}

// Crear instancia global
const adminSystem = new AdminSystem();

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSystem;
}
