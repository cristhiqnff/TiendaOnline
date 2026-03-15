// Route Guard - Protección de Páginas - Tienda Online
// Implementación obligatoria según arquitectura

document.addEventListener("DOMContentLoaded", () => {
  
  const privatePages = [
    "mis-pedidos.html",
    "perfil.html", 
    "checkout.html",
    "panel-vendedor.html",
    "admin.html"
  ];

  const page = window.location.pathname.split("/").pop();

  if (privatePages.includes(page)) {
    if (!window.session || !window.session.isLoggedIn()) {
      window.location.href = "login.html";
    }
  }

});

console.log('🛡️ Sistema de protección de páginas cargado');
