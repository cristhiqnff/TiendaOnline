/**
 * Inicializador Universal - Tienda Online
 * Sincroniza todas las páginas con el nuevo sistema de sesión
 */

class UniversalInitializer {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Inicializa la página con el nuevo sistema
   */
  init() {
    console.log('🚀 Inicializando página con sistema profesional...');
    
    // Esperar a que los módulos estén cargados
    this.waitForModules().then(() => {
      this.setupPage();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('✅ Página inicializada correctamente');
    });
  }

  /**
   * Espera a que los módulos esenciales estén cargados
   */
  async waitForModules() {
    const maxWait = 5000; // 5 segundos máximo
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const checkModules = () => {
        if (window.session && window.routeGuard) {
          console.log('✅ Módulos cargados');
          resolve();
        } else if (Date.now() - startTime > maxWait) {
          console.warn('⚠️ Tiempo de espera agotado para módulos');
          resolve();
        } else {
          setTimeout(checkModules, 50);
        }
      };
      
      checkModules();
    });
  }

  /**
   * Configura la página actual
   */
  setupPage() {
    // Esperar un poco para asegurar que el DOM esté listo
    setTimeout(() => {
      // Actualizar header con el sistema UNIFICADO
      if (window.session) {
        window.session.updateNavbar();
      }
      
      // Verificar protección de ruta
      if (window.routeGuard) {
        window.routeGuard.checkAccess();
        window.routeGuard.protectElements();
      }
      
      // Actualizar año actual
      this.updateCurrentYear();
      
      // Actualizar badge del carrito
      this.updateCartBadge();
      
      // Inicializar buscador si existe
      this.initSearch();
      
      // Configurar formulario de logout
      this.setupLogout();
    }, 100);
  }

  /**
   * Configura event listeners globales
   */
  setupEventListeners() {
    // Escuchar cambios de sesión
    window.addEventListener('sessionChanged', () => {
      console.log('🔄 Cambio de sesión detectado');
      this.setupPage();
    });
    
    // Escuchar cambios de localStorage con las claves correctas
    window.addEventListener('storage', (e) => {
      if (e.key === 'user' || e.key === 'token') {
        console.log('🔄 Cambio en localStorage detectado');
        this.setupPage();
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('sessionChanged'));
      }
    });
    
    // Prevenir doble submit de formularios
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.dataset.submitting === 'true') {
        e.preventDefault();
        return false;
      }
      form.dataset.submitting = 'true';
      setTimeout(() => {
        form.dataset.submitting = 'false';
      }, 3000);
    });
  }

  /**
   * Actualiza el año actual en el footer
   */
  updateCurrentYear() {
    const yearElements = document.querySelectorAll('#currentYear, .current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
      element.textContent = currentYear;
    });
  }

  /**
   * Actualiza el badge del carrito
   */
  updateCartBadge() {
    if (typeof window.actualizarBadgeCarrito === 'function') {
      window.actualizarBadgeCarrito();
    }
  }

  /**
   * Inicializa el buscador
   */
  initSearch() {
    const searchForm = document.getElementById('formBuscador');
    const searchInput = document.getElementById('busqueda');
    
    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
          // Redirigir a página de resultados
          window.location.href = `categorias.html?search=${encodeURIComponent(searchTerm)}`;
        }
      });
    }
  }

  /**
   * Configura el botón de logout
   */
  setupLogout() {
    const logoutBtn = document.getElementById('btnLogout');
    
    if (logoutBtn && window.session) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Confirmar logout
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
          window.session.logout();
        }
      });
    }
  }

  /**
   * Muestra notificaciones de usuario
   */
  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      max-width: 400px;
    `;
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remover
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  }

  /**
   * Muestra un loading overlay
   */
  showLoading(message = 'Cargando...') {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'position-fixed top-0 start-0 w-100 h-100';
    overlay.style.cssText = `
      background-color: rgba(0,0,0,0.5);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    overlay.innerHTML = `
      <div class="bg-white p-4 rounded text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <div>${message}</div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }

  /**
   * Oculta el loading overlay
   */
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Formatea moneda
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  /**
   * Formatea fecha
   */
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('es-CO', { ...defaultOptions, ...options })
      .format(new Date(date));
  }
}

// Crear instancia global
window.universal = new UniversalInitializer();

// Funciones globales para compatibilidad
window.showNotification = (message, type, duration) => window.universal.showNotification(message, type, duration);
window.showLoading = (message) => window.universal.showLoading(message);
window.hideLoading = () => window.universal.hideLoading();
window.formatCurrency = (amount) => window.universal.formatCurrency(amount);
window.formatDate = (date, options) => window.universal.formatDate(date, options);

// Inicializar automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.universal.init();
  });
} else {
  // El DOM ya está cargado
  window.universal.init();
}

console.log('🚀 Inicializador universal cargado');
