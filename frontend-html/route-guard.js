/**
 * Middleware de Protección de Páginas - Tienda Online
 * Sistema de control de acceso basado en roles
 */

class RouteGuard {
  constructor() {
    this.routes = {
      // Páginas públicas (no requieren autenticación)
      public: [
        'index.html',
        'login.html',
        'registro.html',
        'categorias.html',
        'producto.html',
        'detalle-producto.html',
        'carrito.html',
        'checkout.html',
        'recuperar-password.html',
        'reset-password.html'
      ],
      
      // Páginas de cliente
      cliente: [
        'mis-pedidos.html',
        'detalle-pedido.html',
        'perfil.html',
        'direcciones.html',
        'metodos-pago.html'
      ],
      
      // Páginas de vendedor
      vendedor: [
        'panel-vendedor.html',
        'panel-vendedor-productos.html',
        'panel-vendedor-agregar.html',
        'panel-vendedor-inventario.html',
        'panel-vendedor-pedidos.html',
        'panel-vendedor-ventas.html',
        'panel-vendedor-estadisticas.html',
        'panel-vendedor-config.html'
      ],
      
      // Páginas de administrador
      admin: [
        'admin.html',
        'gestion-pedidos.html',
        'crear-pedido.html',
        'gestion-usuarios.html',
        'gestion-vendedores.html',
        'gestion-categorias.html',
        'gestion-productos.html',
        'dashboard-analytics.html',
        'empleados.html'
      ]
    };
  }

  /**
   * Verifica el acceso a la página actual
   */
  checkAccess() {
    const currentPath = window.location.pathname;
    const currentPage = this.getCurrentPage(currentPath);
    
    console.log('🛡️ Verificando acceso a:', currentPage);
    
    // Si es página pública, permitir acceso
    if (this.isPublicPage(currentPage)) {
      console.log('✅ Página pública, acceso permitido');
      return true;
    }
    
    // Si no hay sesión, redirigir a login
    if (!window.session || !window.session.isLoggedIn()) {
      console.log('🔒 No hay sesión, redirigiendo a login...');
      this.redirectToLogin();
      return false;
    }
    
    // Verificar acceso según rol
    const user = window.session.getUser();
    if (this.isClientePage(currentPage) && (!user || user.rol !== 'cliente')) {
      console.log('🚫 Página de cliente, usuario no es cliente');
      this.redirectToHome();
      return false;
    }
    
    if (this.isVendedorPage(currentPage) && (!user || user.rol !== 'vendedor')) {
      console.log('🚫 Página de vendedor, usuario no es vendedor');
      this.redirectToHome();
      return false;
    }
    
    if (this.isAdminPage(currentPage) && (!user || user.rol !== 'admin')) {
      console.log('🚫 Página de administrador, usuario no es admin');
      this.redirectToHome();
      return false;
    }
    
    console.log('✅ Acceso permitido para rol:', user ? user.rol : 'sin rol');
    return true;
  }

  /**
   * Obtiene el nombre de la página actual
   */
  getCurrentPage(path) {
    // Extraer el nombre del archivo de la ruta
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];
    
    // Si no tiene extensión, asumir index.html
    if (!lastSegment.includes('.')) {
      return 'index.html';
    }
    
    return lastSegment;
  }

  /**
   * Verifica si es una página pública
   */
  isPublicPage(page) {
    return this.routes.public.includes(page);
  }

  /**
   * Verifica si es una página de cliente
   */
  isClientePage(page) {
    return this.routes.cliente.includes(page);
  }

  /**
   * Verifica si es una página de vendedor
   */
  isVendedorPage(page) {
    return this.routes.vendedor.includes(page);
  }

  /**
   * Verifica si es una página de administrador
   */
  isAdminPage(page) {
    return this.routes.admin.includes(page);
  }

  /**
   * Redirige a la página de login
   */
  redirectToLogin() {
    // Guardar la URL actual para redirigir después del login
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `login.html?return=${returnUrl}`;
  }

  /**
   * Redirige a la página principal
   */
  redirectToHome() {
    window.location.href = 'index.html';
  }

  /**
   * Redirige según el rol del usuario
   */
  redirectToRoleBased() {
    if (isCliente()) {
      window.location.href = 'index.html';
    } else if (isVendedor()) {
      window.location.href = 'panel-vendedor.html';
    } else if (isAdmin()) {
      window.location.href = 'admin.html';
    }
  }

  /**
   * Verifica si el usuario tiene acceso a una funcionalidad específica
   */
  canAccess(feature) {
    const userRole = getUserRole();
    
    const permissions = {
      // Permisos de cliente
      'comprar': ['cliente', 'vendedor', 'admin'],
      'ver-pedidos': ['cliente', 'vendedor', 'admin'],
      'gestionar-perfil': ['cliente', 'vendedor', 'admin'],
      
      // Permisos de vendedor
      'panel-vendedor': ['vendedor', 'admin'],
      'crear-productos': ['vendedor', 'admin'],
      'gestionar-inventario': ['vendedor', 'admin'],
      'ver-ventas': ['vendedor', 'admin'],
      'gestionar-pedidos-vendedor': ['vendedor', 'admin'],
      
      // Permisos de administrador
      'panel-admin': ['admin'],
      'aprobar-vendedores': ['admin'],
      'gestionar-usuarios': ['admin'],
      'gestionar-categorias': ['admin'],
      'gestionar-productos-admin': ['admin'],
      'moderar-productos': ['admin'],
      'gestionar-pedidos-admin': ['admin']
    };
    
    const allowedRoles = permissions[feature] || [];
    return allowedRoles.includes(userRole);
  }

  /**
   * Protege elementos del DOM según el rol
   */
  protectElements() {
    // Ocultar elementos protegidos por clase
    const protectedElements = document.querySelectorAll('[data-role-required]');
    
    protectedElements.forEach(element => {
      const requiredRole = element.getAttribute('data-role-required');
      const user = window.session.getUser();
      
      let hasAccess = false;
      
      // Verificar acceso según rol requerido
      switch (requiredRole) {
        case 'admin':
          hasAccess = user && user.rol === 'admin';
          break;
        case 'vendedor':
          hasAccess = user && user.rol === 'vendedor';
          break;
        case 'cliente':
          hasAccess = user && user.rol === 'cliente';
          break;
        default:
          // Verificar si el rol está en el usuario
          hasAccess = user && user.rol === requiredRole;
      }
      
      if (!hasAccess) {
        element.style.display = 'none';
        console.log('🛡️ Elemento ocultado por falta de permisos:', requiredRole);
      } else {
        element.style.display = '';
      }
    });
  }

  /**
   * Muestra un mensaje de acceso denegado
   */
  showAccessDenied(message = 'No tienes permisos para acceder a esta página.') {
    // Crear modal de acceso denegado
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Acceso Denegado
            </h5>
          </div>
          <div class="modal-body">
            <p>${message}</p>
            <div class="d-flex justify-content-between">
              <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                Cerrar
              </button>
              <button class="btn btn-primary" onclick="window.location.href='index.html'">
                Ir al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar automáticamente después de 5 segundos
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 5000);
  }
}

// Crear instancia global
window.routeGuard = new RouteGuard();

// Funciones globales para protección
window.protectPage = () => window.routeGuard.checkAccess();
window.protectElements = () => window.routeGuard.protectElements();
window.canAccess = (feature) => window.routeGuard.canAccess(feature);

// Verificar acceso automáticamente cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  // Esperar a que el sistema de sesión esté listo
  setTimeout(() => {
    window.routeGuard.checkAccess();
    window.routeGuard.protectElements();
  }, 100);
});

console.log('🛡️ Middleware de protección de páginas cargado');
