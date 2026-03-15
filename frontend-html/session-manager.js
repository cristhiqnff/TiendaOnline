/**
 * Script de Inicialización Universal - Sesión y Navegación
 * Se encarga de detectar la sesión y actualizar la navegación en todas las páginas
 */

class SessionManager {
  constructor() {
    this.user = null;
    this.token = null;
    this.roles = [];
    this.isInitialized = false;
  }

  /**
   * Inicializa el gestor de sesión
   */
  init() {
    console.log('🔐 Inicializando gestor de sesión...');
    
    // Cargar datos de sesión desde localStorage
    this.loadSessionData();
    
    // Actualizar navegación
    this.updateNavigation();
    
    // Configurar eventos globales
    this.setupGlobalEvents();
    
    // Marcar como inicializado
    this.isInitialized = true;
    
    console.log('✅ Gestor de sesión inicializado');
  }

  /**
   * Carga los datos de sesión desde localStorage con validación estricta
   */
  loadSessionData() {
    try {
      this.token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      // Validación estricta del usuario
      if (!userStr || userStr === 'null' || userStr === 'undefined' || userStr === '{}') {
        console.log('🔍 Datos de usuario inválidos, limpiando sesión');
        this.clearSession();
        return;
      }
      
      this.user = JSON.parse(userStr);
      
      // Validar que el objeto usuario tenga propiedades válidas
      if (!this.user || typeof this.user !== 'object') {
        console.log('🔍 Objeto de usuario inválido, limpiando sesión');
        this.clearSession();
        return;
      }
      
      // Validar que tenga al menos una propiedad esencial
      const hasEssentialProps = this.user.email || this.user.id || this.user.nombre || this.user.username;
      if (!hasEssentialProps) {
        console.log('🔍 Usuario sin propiedades esenciales, limpiando sesión');
        this.clearSession();
        return;
      }
      
      // Extraer roles correctamente
      if (this.user && this.user.roles) {
        if (Array.isArray(this.user.roles)) {
          this.roles = this.user.roles.map(r => 
            (r && typeof r === 'object') ? r.nombre : r
          ).filter(Boolean);
        } else if (this.user.rol) {
          this.roles = [this.user.rol];
        }
      } else {
        this.roles = [];
      }
      
      console.log('👤 Usuario válido cargado:', this.user);
      console.log('🔑 Token:', this.token ? 'presente' : 'ausente');
      console.log('🎭 Roles:', this.roles);
      
    } catch (error) {
      console.error('❌ Error cargando datos de sesión:', error);
      this.clearSession();
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn() {
    return !!this.token && !!this.user;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role) {
    return this.roles.includes(role);
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin() {
    return this.hasRole('ADMIN') || this.hasRole('SUPER_ADMIN');
  }

  /**
   * Verifica si el usuario es vendedor
   */
  isVendedor() {
    return this.hasRole('VENDEDOR');
  }

  /**
   * Verifica si el usuario es cliente (no tiene roles especiales)
   */
  isCliente() {
    return this.isLoggedIn() && !this.isAdmin() && !this.isVendedor();
  }

  /**
   * Actualiza los elementos de navegación según el estado de sesión
   */
  updateNavigation() {
    // Elementos de navegación
    const navGuest = document.getElementById('navGuest');
    const navUser = document.getElementById('navUser');
    const navAdmin = document.getElementById('navAdmin');
    const navVendedor = document.getElementById('navVendedor');
    const navUserName = document.getElementById('navUserName');
    const btnLogout = document.getElementById('btnLogout');

    console.log('🧭 Actualizando navegación. ¿Usuario logueado?', this.isLoggedIn());

    if (this.isLoggedIn()) {
      // Usuario autenticado - Ocultar login/registro, mostrar usuario
      if (navGuest) {
        navGuest.style.display = 'none';
        console.log('✅ Ocultando navGuest (login/registro)');
      }
      
      if (navUser) {
        navUser.style.display = '';
        console.log('✅ Mostrando navUser (info usuario)');
      }
      
      // Actualizar nombre del usuario
      if (navUserName && this.user) {
        const displayName = this.user.nombre || 
                          this.user.email || 
                          this.user.username || 
                          'Mi cuenta';
        navUserName.textContent = displayName;
        console.log('✅ Nombre de usuario actualizado:', displayName);
      }
      
      // Mostrar enlaces según rol
      if (navAdmin) {
        const showAdmin = this.isAdmin();
        navAdmin.style.display = showAdmin ? '' : 'none';
        console.log('✅ navAdmin visible:', showAdmin);
      }
      
      if (navVendedor) {
        const showVendedor = this.isVendedor();
        navVendedor.style.display = showVendedor ? '' : 'none';
        console.log('✅ navVendedor visible:', showVendedor);
      }
      
    } else {
      // Usuario no autenticado - Mostrar login/registro, ocultar usuario
      if (navGuest) {
        navGuest.style.display = '';
        console.log('✅ Mostrando navGuest (login/registro)');
      }
      
      if (navUser) {
        navUser.style.display = 'none';
        console.log('✅ Ocultando navUser (info usuario)');
      }
      
      if (navAdmin) {
        navAdmin.style.display = 'none';
        console.log('✅ Ocultando navAdmin');
      }
      
      if (navVendedor) {
        navVendedor.style.display = 'none';
        console.log('✅ Ocultando navVendedor');
      }
    }
    
    // Configurar botón de logout
    if (btnLogout) {
      btnLogout.addEventListener('click', () => this.logout());
      console.log('✅ Botón logout configurado');
    }
    
    console.log('🧭 Navegación actualizada según estado de sesión');
  }

  /**
   * Configura eventos globales
   */
  setupGlobalEvents() {
    // Escuchar cambios en localStorage (para sincronización entre pestañas)
    window.addEventListener('storage', (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('🔄 Cambio detectado en localStorage, recargando sesión...');
        this.loadSessionData();
        this.updateNavigation();
      }
    });

    // Actualizar carrito si existe la función
    if (typeof window.actualizarBadgeCarrito === 'function') {
      window.actualizarBadgeCarrito();
    }
  }

  /**
   * Cierra sesión del usuario completamente
   */
  logout() {
    console.log('🚪 Cerrando sesión...');
    
    // Eliminar completamente los datos de localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpiar variables locales
    this.token = null;
    this.user = null;
    this.roles = [];
    
    // Actualizar navegación inmediatamente
    this.updateNavigation();
    
    // Limpiar carrito si existe la función
    if (typeof window.limpiarCarrito === 'function') {
      window.limpiarCarrito();
    }
    
    console.log('✅ Sesión cerrada completamente');
    
    // Redirigir a página principal
    window.location.href = 'index.html';
  }

  /**
   * Limpia completamente la sesión
   */
  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = null;
    this.user = null;
    this.roles = [];
  }

  /**
   * Obtiene información del usuario actual
   */
  getUser() {
    return this.user;
  }

  /**
   * Obtiene los roles del usuario
   */
  getRoles() {
    return this.roles;
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken() {
    return this.token;
  }

  /**
   * Verifica acceso basado en rol requerido
   */
  requireRole(role) {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    
    if (!this.hasRole(role)) {
      console.warn(`⚠️ Acceso denegado. Se requiere rol: ${role}`);
      window.location.href = 'index.html';
      return false;
    }
    
    return true;
  }

  /**
   * Verifica que el usuario sea administrador
   */
  requireAdmin() {
    return this.requireRole('ADMIN') || this.requireRole('SUPER_ADMIN');
  }

  /**
   * Verifica que el usuario sea vendedor
   */
  requireVendedor() {
    return this.requireRole('VENDEDOR');
  }

  /**
   * Verifica autenticación (cualquier rol)
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
}

// Crear instancia global
window.sessionManager = new SessionManager();

// Inicializar automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.sessionManager.init();
  });
} else {
  // El DOM ya está cargado
  window.sessionManager.init();
}

// Hacer disponible globalmente para compatibilidad con código existente
window.auth = window.sessionManager;

// Para compatibilidad con código existente que use funciones específicas
window.isLoggedIn = () => window.sessionManager.isLoggedIn();
window.isAdmin = () => window.sessionManager.isAdmin();
window.isVendedor = () => window.sessionManager.isVendedor();
window.isCliente = () => window.sessionManager.isCliente();
window.requireAdmin = () => window.sessionManager.requireAdmin();
window.requireVendedor = () => window.sessionManager.requireVendedor();
window.requireAuth = () => window.sessionManager.requireAuth();

console.log('🔐 SessionManager cargado y disponible globalmente');
