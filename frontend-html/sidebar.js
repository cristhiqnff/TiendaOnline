// Menú lateral dinámico según rol - Sistema UNIFICADO
function renderSidebar() {
  const user = window.session.getUser();
  const logged = window.session.isLoggedIn();
  const rol = user ? user.rol : null;
  const esAdmin = rol === 'admin';
  const esVendedor = rol === 'vendedor';
  
  const sidebarItems = document.getElementById('sidebarItems');
  if (!sidebarItems) return;
  
  let html = '';
  
  if (esAdmin) {
    html += `
      <li><a href="admin.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
      <li><a href="gestion-pedidos.html"><i class="fas fa-shopping-cart"></i> Pedidos</a></li>
      <li><a href="gestion-usuarios.html"><i class="fas fa-users"></i> Usuarios</a></li>
      <li><a href="gestion-productos.html"><i class="fas fa-box"></i> Productos</a></li>
      <li><a href="gestion-categorias.html"><i class="fas fa-tags"></i> Categorías</a></li>
    `;
  } else if (esVendedor) {
    html += `
      <li><a href="panel-vendedor.html"><i class="fas fa-tachometer-alt"></i> Mi Panel</a></li>
      <li><a href="panel-vendedor-productos.html"><i class="fas fa-box"></i> Mis Productos</a></li>
      <li><a href="panel-vendedor-pedidos.html"><i class="fas fa-shopping-cart"></i> Pedidos</a></li>
      <li><a href="panel-vendedor-ventas.html"><i class="fas fa-chart-line"></i> Ventas</a></li>
    `;
  } else {
    html += `
      <li><a href="index.html"><i class="fas fa-home"></i> Inicio</a></li>
      <li><a href="mis-pedidos.html"><i class="fas fa-shopping-cart"></i> Mis Pedidos</a></li>
      <li><a href="perfil.html"><i class="fas fa-user"></i> Mi Perfil</a></li>
    `;
  }
  
  sidebarItems.innerHTML = html;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (window.session && window.session.isLoggedIn()) {
    renderSidebar();
  }
});
