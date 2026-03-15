function initAdmin() {
  try { cargarDashboard(); } catch (e) { console.error('Error init Dashboard:', e); }
  try { cargarProductos(); } catch (e) { console.error('Error init Productos:', e); }
  try { cargarCategorias(); } catch (e) { console.error('Error init Categorias:', e); }
  try { cargarUsuarios(); } catch (e) { console.error('Error init Usuarios:', e); }
  try { cargarPedidos(); } catch (e) { console.error('Error init Pedidos:', e); }
  try { cargarVendedores(); } catch (e) { console.error('Error init Vendedores:', e); }
  try { cargarRoles(); } catch (e) { console.error('Error init Roles:', e); }
  try { cargarSolicitudesVendedor(); } catch (e) { console.error('Error init Solicitudes:', e); }
  try { cargarEstadisticas(); } catch (e) { console.error('Error init Estadisticas:', e); }
  
  // Inicializar badges de notificaciones
  actualizarBadgesNotificaciones();
}

async function actualizarBadgesNotificaciones() {
  try {
    // Obtener conteo de solicitudes pendientes
    const res = await fetch('http://localhost:5000/solicitud/vendedor/pendientes', {
      headers: { 'Authorization': `Bearer ${window.session.getToken()}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      const pendingCount = data.count || 0;
      
      // Actualizar badge en la pestaña de solicitudes
      const solicitudesTab = document.querySelector('[href="#solicitudesVendedor"]');
      if (solicitudesTab) {
        // Eliminar badge existente
        const existingBadge = solicitudesTab.querySelector('.notification-badge');
        if (existingBadge) {
          existingBadge.remove();
        }
        
        // Agregar nuevo badge si hay solicitudes pendientes
        if (pendingCount > 0) {
          const badge = document.createElement('span');
          badge.className = 'notification-badge';
          badge.textContent = pendingCount > 99 ? '99+' : pendingCount;
          badge.style.cssText = `
            background-color: #dc3545;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 0.75rem;
            margin-left: 5px;
            position: relative;
            top: -8px;
          `;
          solicitudesTab.appendChild(badge);
        }
      }
      
      // Actualizar título de la página
      if (pendingCount > 0) {
        document.title = `(${pendingCount}) Panel de Administración - Tienda Online`;
      } else {
        document.title = 'Panel de Administración - Tienda Online';
      }
    }
  } catch (error) {
    console.error('Error actualizando badges:', error);
  }
}

// Actualizar badges cada 30 segundos
setInterval(actualizarBadgesNotificaciones, 30000);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
