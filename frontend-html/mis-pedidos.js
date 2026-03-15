// Sistema de mis pedidos - Tienda Online
// Uso exclusivo del sistema session.js

// Función de inicialización para mis pedidos
window.initMisPedidos = function() {
  console.log('📦 Inicializando sistema de mis pedidos...');
  
  // Verificar autenticación usando el sistema UNIFICADO
  if (!window.session || !window.session.isLoggedIn()) {
    showLoginRequired();
    return;
  }
  
  loadPedidos();
};

function showLoginRequired() {
  const container = document.getElementById('pedidosContainer');
  if (!container) {
    console.error('❌ Contenedor #pedidosContainer no encontrado');
    return;
  }
  
  container.innerHTML = `
    <div class="text-center py-5">
      <div style="font-size:48px;">🔒</div>
      <h4 class="mt-3">Inicia sesión</h4>
      <p class="text-muted">Debes iniciar sesión para ver tus pedidos.</p>
      <a href="login.html" class="btn btn-dark">Iniciar sesión</a>
    </div>
  `;
}

function loadPedidos() {
  const container = document.getElementById('pedidosContainer');
  if (!container) {
    console.error('❌ Contenedor #pedidosContainer no encontrado');
    return;
  }
  
  container.innerHTML = '<div class="text-muted text-center py-3">Cargando pedidos...</div>';
  
  // Obtener token del sistema UNIFICADO
  const user = window.session.getUser();
  const token = window.session.getToken();
  
  fetch('http://localhost:5000/pedido/mis-pedidos', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(pedidos => {
      if (!Array.isArray(pedidos) || !pedidos.length) {
        showEmptyPedidos();
        return;
      }
      renderPedidos(pedidos);
    })
    .catch(error => {
      console.error('Error cargando pedidos:', error);
      showError();
    });
}

function showEmptyPedidos() {
  const container = document.getElementById('pedidosContainer');
  if (!container) return;
  
  container.innerHTML = `
    <div class="text-center py-5">
      <div style="font-size:48px;">📦</div>
      <h4 class="mt-3">Sin pedidos</h4>
      <p class="text-muted">Aún no has realizado ningún pedido.</p>
      <a href="index.html" class="btn btn-dark">Explorar catálogo</a>
    </div>
  `;
}

function showError() {
  const container = document.getElementById('pedidosContainer');
  if (!container) return;
  
  container.innerHTML = `
    <div class="text-center py-5">
      <div style="font-size:48px;">⚠️</div>
      <h4 class="mt-3">Error al cargar pedidos</h4>
      <p class="text-muted">No pudimos cargar tus pedidos. Intenta nuevamente.</p>
      <button class="btn btn-dark" onclick="loadPedidos()">Reintentar</button>
    </div>
  `;
}

function renderPedidos(pedidos) {
  const container = document.getElementById('pedidosContainer');
  if (!container) return;
  
  container.innerHTML = pedidos.map(pedido => `
    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <strong>Pedido #${pedido.id}</strong>
          <span class="badge bg-${getStatusColor(pedido.estado)} ms-2">${pedido.estado}</span>
        </div>
        <small class="text-muted">${formatDate(pedido.fecha)}</small>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-8">
            <h6 class="card-title">Productos</h6>
            <div class="mb-3">
              ${pedido.detalles.map(producto => `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <strong>${producto.nombre}</strong>
                    <small class="text-muted d-block">Cantidad: ${producto.cantidad}</small>
                  </div>
                  <span class="text-muted">$${producto.precio}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="col-md-4 text-end">
            <h6 class="card-title">Total</h6>
            <h4 class="text-primary">$${pedido.total}</h4>
            <button class="btn btn-sm btn-outline-primary mt-2" onclick="verDetalle(${pedido.id})">
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function getStatusColor(estado) {
  switch (estado.toLowerCase()) {
    case 'pendiente': return 'warning';
    case 'procesando': return 'info';
    case 'enviado': return 'primary';
    case 'entregado': return 'success';
    case 'cancelado': return 'danger';
    default: return 'secondary';
  }
}

function formatDate(fecha) {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function verDetalle(pedidoId) {
  window.location.href = `detalle-pedido.html?id=${pedidoId}`;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.initMisPedidos === 'function') {
    window.initMisPedidos();
  }
});
