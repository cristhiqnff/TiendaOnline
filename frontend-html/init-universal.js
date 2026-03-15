/**
 * Script de Inicialización Universal para Todas las Páginas
 * Garantiza la verificación de sesión y la inicialización correcta del header
 */

// Función de inicialización universal
function initializePage() {
  console.log('🚀 Inicializando página con sistema de sesión corregido...');
  
  // El session-manager ya se inicializa automáticamente
  // Solo necesitamos asegurarnos de que la navegación se actualice
  
  // Forzar actualización de navegación después de que el DOM esté completamente cargado
  setTimeout(() => {
    if (window.sessionManager && window.sessionManager.isInitialized) {
      console.log('🔄 Forzando actualización de navegación...');
      window.sessionManager.updateNavigation();
    }
  }, 100);
  
  // Actualizar año actual
  if (window.ui && window.ui.setYear) {
    window.ui.setYear();
  }
  
  // Actualizar badge del carrito
  if (typeof window.actualizarBadgeCarrito === 'function') {
    window.actualizarBadgeCarrito();
  }
  
  // Inicializar buscador si existe
  if (window.ui && window.ui.initBuscador) {
    window.ui.initBuscador();
  }
  
  console.log('✅ Página inicializada correctamente');
}

// Esperar a que el DOM esté listo y el session-manager inicializado
document.addEventListener('DOMContentLoaded', () => {
  // Esperar un poco más para asegurar que session-manager esté listo
  setTimeout(initializePage, 50);
});

// También ejecutar cuando la página esté completamente cargada
window.addEventListener('load', () => {
  setTimeout(initializePage, 100);
});

// Escuchar cambios en localStorage para sincronización inmediata
window.addEventListener('storage', (e) => {
  if (e.key === 'token' || e.key === 'user') {
    console.log('🔄 Cambio en localStorage detectado, actualizando página...');
    setTimeout(() => {
      if (window.sessionManager) {
        window.sessionManager.loadSessionData();
        window.sessionManager.updateNavigation();
      }
    }, 50);
  }
});

console.log('🔧 Script de inicialización universal cargado');
