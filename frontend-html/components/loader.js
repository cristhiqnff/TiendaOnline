/**
 * Sistema de Herencia de Componentes
 * Permite que las páginas hereden automáticamente header, footer y otros componentes
 */

class ComponentLoader {
  constructor() {
    this.cache = new Map();
    this.baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
  }

  /**
   * Inicializa el sistema de componentes
   */
  async init() {
    console.log('🔧 Inicializando sistema de componentes...');
    
    // Precargar componentes comunes
    await this.preloadComponents();
    
    // Procesar la página actual
    await this.processPage();
  }

  /**
   * Precarga los componentes más usados
   */
  async preloadComponents() {
    const components = ['header', 'footer', 'sidebar-vendedor'];
    
    for (const component of components) {
      try {
        const content = await this.loadComponent(component);
        this.cache.set(component, content);
        console.log(`✅ Componente ${component} precargado`);
      } catch (error) {
        console.error(`❌ Error cargando componente ${component}:`, error);
      }
    }
  }

  /**
   * Carga un componente desde el archivo
   */
  async loadComponent(name) {
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }

    try {
      const response = await fetch(`components/${name}.html`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const content = await response.text();
      this.cache.set(name, content);
      return content;
    } catch (error) {
      console.error(`Error cargando componente ${name}:`, error);
      return `<div class="alert alert-danger">Error cargando componente: ${name}</div>`;
    }
  }

  /**
   * Procesa la página actual y reemplaza los placeholders
   */
  async processPage() {
    // Obtener configuración de la página
    const config = window.PAGE_CONFIG || {};
    
    // Cargar componentes necesarios
    const components = {};
    
    // Header (siempre necesario excepto en login/registro)
    if (!config.excludeHeader) {
      components.header = await this.loadComponent('header');
    }
    
    // Footer (siempre necesario)
    if (!config.excludeFooter) {
      components.footer = await this.loadComponent('footer');
    }
    
    // Sidebar de vendedor (solo en páginas del panel)
    if (config.includeSidebar) {
      components.sidebar = await this.loadComponent('sidebar-vendedor');
    }
    
    // Procesar el contenido de la página
    this.processContent(components, config);
  }

  /**
   * Procesa el contenido y reemplaza los placeholders
   */
  processContent(components, config) {
    let html = document.documentElement.outerHTML;
    
    // Reemplazar placeholders
    html = html.replace(/{{HEADER}}/g, components.header || '');
    html = html.replace(/{{FOOTER}}/g, components.footer || '');
    html = html.replace(/{{SIDEBAR_VENDEDOR}}/g, components.sidebar || '');
    
    // Reemplazar variables de configuración
    html = html.replace(/{{TITLE}}/g, config.title || 'Tienda Online');
    html = html.replace(/{{DESCRIPTION}}/g, config.description || 'Tienda Online - Tu marketplace de confianza');
    html = html.replace(/{{KEYWORDS}}/g, config.keywords || 'tienda online, ecommerce, marketplace');
    html = html.replace(/{{SECTION}}/g, config.section || '');
    html = html.replace(/{{USER_ROLE}}/g, config.userRole || '');
    
    // Variables de estado activo para el sidebar
    if (config.section) {
      const activeStates = this.getActiveStates(config.section);
      html = html.replace(/{{ACTIVE_DASHBOARD}}/g, activeStates.dashboard);
      html = html.replace(/{{ACTIVE_PRODUCTOS}}/g, activeStates.productos);
      html = html.replace(/{{ACTIVE_AGREGAR}}/g, activeStates.agregar);
      html = html.replace(/{{ACTIVE_INVENTARIO}}/g, activeStates.inventario);
      html = html.replace(/{{ACTIVE_PEDIDOS}}/g, activeStates.pedidos);
      html = html.replace(/{{ACTIVE_VENTAS}}/g, activeStates.ventas);
      html = html.replace(/{{ACTIVE_ESTADISTICAS}}/g, activeStates.estadisticas);
      html = html.replace(/{{ACTIVE_CONFIG}}/g, activeStates.config);
    }
    
    // Reemplazar clases CSS
    html = html.replace(/{{BODY_CLASS}}/g, config.bodyClass || '');
    html = html.replace(/{{HEADER_CLASS}}/g, config.headerClass || 'ml-header-dark');
    html = html.replace(/{{MAIN_CLASS}}/g, config.mainClass || 'container my-4');
    
    // Reemplazar contenido adicional
    html = html.replace(/{{EXTRA_HEAD}}/g, config.extraHead || '');
    html = html.replace(/{{EXTRA_SCRIPTS}}/g, config.extraScripts || '');
    
    // Generar breadcrumb si es necesario
    if (config.breadcrumb) {
      const breadcrumb = this.generateBreadcrumb(config.breadcrumb);
      html = html.replace(/{{BREADCRUMB}}/g, breadcrumb);
    } else {
      html = html.replace(/{{BREADCRUMB}}/g, '');
    }
    
    // Actualizar el DOM
    document.documentElement.innerHTML = html;
    
    console.log('✅ Página procesada con componentes');
  }

  /**
   * Genera los estados activos para el sidebar según la sección actual
   */
  getActiveStates(section) {
    const states = {
      dashboard: '',
      productos: '',
      agregar: '',
      inventario: '',
      pedidos: '',
      ventas: '',
      estadisticas: '',
      config: ''
    };
    
    // Asignar estado activo según la sección
    switch (section) {
      case 'dashboard':
        states.dashboard = 'active';
        break;
      case 'productos':
        states.productos = 'active';
        break;
      case 'agregar':
        states.agregar = 'active';
        break;
      case 'inventario':
        states.inventario = 'active';
        break;
      case 'pedidos':
        states.pedidos = 'active';
        break;
      case 'ventas':
        states.ventas = 'active';
        break;
      case 'estadisticas':
        states.estadisticas = 'active';
        break;
      case 'config':
        states.config = 'active';
        break;
    }
    
    return states;
  }

  /**
   * Genera el HTML del breadcrumb
   */
  generateBreadcrumb(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return '';
    }
    
    let breadcrumb = '<nav class="bg-light border-bottom"><div class="container py-2"><div class="d-flex align-items-center gap-3">';
    
    items.forEach((item, index) => {
      if (index === items.length - 1) {
        // Último elemento (página actual)
        breadcrumb += `<span class="text-dark fw-semibold">${item.label}</span>`;
      } else {
        // Elementos anteriores con enlace
        breadcrumb += `<a href="${item.url}" class="text-decoration-none text-muted">${item.label}</a>`;
        breadcrumb += '<span class="text-muted">/</span>';
      }
    });
    
    breadcrumb += '</div></div></nav>';
    
    return breadcrumb;
  }

  /**
   * Limpia el caché de componentes
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Caché de componentes limpiado');
  }

  /**
   * Recarga un componente específico
   */
  async reloadComponent(name) {
    this.cache.delete(name);
    return await this.loadComponent(name);
  }
}

// Crear instancia global del loader
window.ComponentLoader = new ComponentLoader();

// Funciones de inicialización de componentes (pueden ser sobrescritas por páginas específicas)
window.initHeader = function() {
  console.log('🔧 Header inicializado');
  // Inicializar funcionalidades específicas del header aquí
};

window.initFooter = function() {
  console.log('🔧 Footer inicializado');
  // Inicializar funcionalidades específicas del footer aquí
};

window.initSidebar = function() {
  console.log('🔧 Sidebar inicializado');
  // Inicializar funcionalidades específicas del sidebar aquí
};

// Exportar para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentLoader;
}
