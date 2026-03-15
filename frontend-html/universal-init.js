// Universal Init - Inicialización Global - Tienda Online
// Implementación obligatoria según arquitectura

document.addEventListener("DOMContentLoaded", () => {
  if (window.session) {
    window.session.updateNavbar();
  }
});

console.log('🚀 Inicializador universal cargado');
