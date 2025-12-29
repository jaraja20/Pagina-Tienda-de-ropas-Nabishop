// Sistema de Autenticación - NabbyShop
// =====================================

class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.initAuthUI();
    }

    // Cargar usuarios del localStorage
    loadUsers() {
        const stored = localStorage.getItem('nabby_users');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Crear usuarios por defecto
        const defaultUsers = {
            'admin': {
                id: 1,
                username: 'admin',
                password: 'admin123', // En producción usar hash
                email: 'admin@nabbyshop.com',
                role: 'admin',
                fullName: 'Administrador'
            },
            'comprador': {
                id: 2,
                username: 'comprador',
                password: 'comprador123',
                email: 'comprador@nabbyshop.com',
                role: 'buyer',
                fullName: 'Comprador Demo'
            }
        };
        
        this.saveUsers(defaultUsers);
        return defaultUsers;
    }

    // Guardar usuarios en localStorage
    saveUsers(users) {
        localStorage.setItem('nabby_users', JSON.stringify(users));
    }

    // Cargar usuario actual
    loadCurrentUser() {
        const stored = localStorage.getItem('nabby_currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    // Guardar usuario actual
    saveCurrentUser(user) {
        if (user) {
            localStorage.setItem('nabby_currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('nabby_currentUser');
        }
        this.currentUser = user;
    }

    // Login
    login(username, password) {
        const user = Object.values(this.users).find(
            u => u.username === username && u.password === password
        );
        
        if (user) {
            const { password, ...userWithoutPassword } = user;
            this.saveCurrentUser(userWithoutPassword);
            this.updateUI();
            return { success: true, user: userWithoutPassword };
        }
        
        return { success: false, error: 'Usuario o contraseña incorrectos' };
    }

    // Register
    register(username, email, password, fullName) {
        if (this.users[username]) {
            return { success: false, error: 'El usuario ya existe' };
        }
        
        const newUser = {
            id: Date.now(),
            username,
            password,
            email,
            role: 'buyer',
            fullName
        };
        
        this.users[username] = newUser;
        this.saveUsers(this.users);
        
        const { password: _, ...userWithoutPassword } = newUser;
        this.saveCurrentUser(userWithoutPassword);
        this.updateUI();
        return { success: true, user: userWithoutPassword };
    }

    // Logout
    logout() {
        this.saveCurrentUser(null);
        this.updateUI();
        this.closeAuthModal();
    }

    // Inicializar UI de autenticación
    initAuthUI() {
        this.createAuthHTML();
        this.attachEventListeners();
        this.updateUI();
    }

    // Crear HTML del modal de autenticación
    createAuthHTML() {
        if (document.getElementById('auth-modal')) return;

        const authModal = document.createElement('div');
        authModal.id = 'auth-modal';
        authModal.className = 'auth-modal';
        authModal.innerHTML = `
            <div class="auth-modal-content">
                <button class="auth-modal-close">&times;</button>
                
                <!-- Login Tab -->
                <div class="auth-tab auth-tab-login active">
                    <h2>Iniciar Sesión</h2>
                    <form id="login-form">
                        <div class="form-group">
                            <label for="login-username">Usuario</label>
                            <input type="text" id="login-username" placeholder="Ingresa tu usuario" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Contraseña</label>
                            <input type="password" id="login-password" placeholder="Ingresa tu contraseña" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
                        <p class="auth-toggle">¿No tienes cuenta? <a href="#" class="toggle-register">Regístrate aquí</a></p>
                    </form>
                    <div class="demo-credentials">
                        <p><strong>Demo:</strong></p>
                        <p>Admin: admin / admin123</p>
                        <p>Comprador: comprador / comprador123</p>
                    </div>
                </div>

                <!-- Register Tab -->
                <div class="auth-tab auth-tab-register">
                    <h2>Crear Cuenta</h2>
                    <form id="register-form">
                        <div class="form-group">
                            <label for="register-fullname">Nombre Completo</label>
                            <input type="text" id="register-fullname" placeholder="Tu nombre completo" required>
                        </div>
                        <div class="form-group">
                            <label for="register-username">Usuario</label>
                            <input type="text" id="register-username" placeholder="Elige un usuario" required>
                        </div>
                        <div class="form-group">
                            <label for="register-email">Email</label>
                            <input type="email" id="register-email" placeholder="Tu email" required>
                        </div>
                        <div class="form-group">
                            <label for="register-password">Contraseña</label>
                            <input type="password" id="register-password" placeholder="Crea una contraseña" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Crear Cuenta</button>
                        <p class="auth-toggle">¿Ya tienes cuenta? <a href="#" class="toggle-login">Inicia sesión aquí</a></p>
                    </form>
                </div>

                <!-- User Profile -->
                <div class="auth-tab auth-tab-profile">
                    <h2>Mi Perfil</h2>
                    <div class="user-profile-info">
                        <p><strong>Nombre:</strong> <span id="profile-fullname"></span></p>
                        <p><strong>Usuario:</strong> <span id="profile-username"></span></p>
                        <p><strong>Email:</strong> <span id="profile-email"></span></p>
                        <p><strong>Rol:</strong> <span id="profile-role"></span></p>
                    </div>
                    <button id="logout-btn" class="btn btn-secondary">Cerrar Sesión</button>
                </div>
            </div>
        `;

        document.body.appendChild(authModal);
    }

    // Adjuntar event listeners
    attachEventListeners() {
        // Modal close
        const closeBtn = document.querySelector('.auth-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAuthModal());
        }

        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Toggle tabs
        document.querySelectorAll('.toggle-register').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthTab('register');
            });
        });

        document.querySelectorAll('.toggle-login').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthTab('login');
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Click en el usuario en el header
        const userIcon = document.querySelector('[title="Cuenta"]');
        if (userIcon) {
            userIcon.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentUser) {
                    this.showAuthTab('profile');
                } else {
                    this.showAuthTab('login');
                }
                this.openAuthModal();
            });
        }

        // Cerrar modal al hacer click fuera
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAuthModal();
                }
            });
        }
    }

    // Manejar login
    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const result = this.login(username, password);
        
        if (result.success) {
            alert('¡Bienvenido ' + result.user.fullName + '!');
            this.closeAuthModal();
        } else {
            alert(result.error);
        }
    }

    // Manejar registro
    handleRegister(e) {
        e.preventDefault();
        const fullName = document.getElementById('register-fullname').value;
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        const result = this.register(username, email, password, fullName);
        
        if (result.success) {
            alert('¡Cuenta creada exitosamente!');
            this.closeAuthModal();
        } else {
            alert(result.error);
        }
    }

    // Mostrar una pestaña del auth
    showAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`.auth-tab-${tabName}`).classList.add('active');
    }

    // Abrir modal de autenticación
    openAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    // Cerrar modal de autenticación
    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Actualizar UI según estado
    updateUI() {
        const userIcon = document.querySelector('[title="Cuenta"]');
        
        if (this.currentUser) {
            if (userIcon) {
                userIcon.style.color = this.currentUser.role === 'admin' ? '#ff6b6b' : '#9B7ECE';
                userIcon.title = `${this.currentUser.fullName} (${this.currentUser.role})`;
            }
        } else {
            if (userIcon) {
                userIcon.style.color = '';
                userIcon.title = 'Cuenta';
            }
        }

        // Actualizar perfil si está visible
        if (document.querySelector('.auth-tab-profile.active')) {
            this.updateProfileDisplay();
        }
    }

    // Actualizar pantalla de perfil
    updateProfileDisplay() {
        if (!this.currentUser) return;
        
        document.getElementById('profile-fullname').textContent = this.currentUser.fullName;
        document.getElementById('profile-username').textContent = this.currentUser.username;
        document.getElementById('profile-email').textContent = this.currentUser.email;
        document.getElementById('profile-role').textContent = 
            this.currentUser.role === 'admin' ? 'Administrador' : 'Comprador';
    }

    // Verificar si es admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }
}

// Crear instancia global
const authSystem = new AuthSystem();

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}
