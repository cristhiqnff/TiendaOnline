const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const token = window.session.getToken();
const cont = document.getElementById('detallePedido');

const estados = { 1: 'Pendiente', 2: 'Pagado', 3: 'Enviado', 4: 'Entregado', 5: 'Cancelado' };
const badgeClass = { 1: 'bg-warning text-dark', 2: 'bg-info', 3: 'bg-primary', 4: 'bg-success', 5: 'bg-danger' };

if (!token) {
  cont.innerHTML = `
    <div class="text-center py-5">
      <div style="font-size:48px;">🔒</div>
      <h4 class="mt-3">Inicia sesión</h4>
      <p class="text-muted">Debes iniciar sesión para ver los detalles del pedido.</p>
      <a href="login.html" class="btn btn-dark">Iniciar sesión</a>
    </div>
  `;
} else {
  cargarDetalle();
}

async function cargarDetalle() {
  try {
    const res = await fetch(`http://localhost:5000/pedido/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Pedido no encontrado');
    const pedido = await res.json();

    cont.innerHTML = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h3 class="mb-0">Pedido #${pedido.id}</h3>
          <span class="badge ${badgeClass[pedido.id_estado]}">${estados[pedido.id_estado]}</span>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <h5>Información del Pedido</h5>
              <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleDateString()}</p>
              <p><strong>Estado:</strong> ${estados[pedido.id_estado]}</p>
              <p><strong>Total:</strong> $${pedido.total}</p>
              
              <h6 class="mt-4">Productos</h6>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pedido.detalles.map(d => `
                      <tr>
                        <td>${d.producto.nombre}</td>
                        <td>${d.cantidad}</td>
                        <td>$${d.precio_unitario}</td>
                        <td>$${d.subtotal}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="col-md-4">
              <h5>Información de Envío</h5>
              <p><strong>Cliente:</strong> ${pedido.usuario.nombre}</p>
              <p><strong>Email:</strong> ${pedido.usuario.email}</p>
              <p><strong>Teléfono:</strong> ${pedido.usuario.telefono || 'No especificado'}</p>
              <p><strong>Dirección:</strong> ${pedido.direccion || 'No especificada'}</p>
              
              <div class="mt-3">
                <a href="mis-pedidos.html" class="btn btn-secondary">Volver a Mis Pedidos</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error:', error);
    cont.innerHTML = `
      <div class="text-center py-5">
        <div style="font-size:48px;">❌</div>
        <h4 class="mt-3">Error al cargar pedido</h4>
        <p class="text-muted">No pudimos cargar los detalles del pedido.</p>
        <a href="mis-pedidos.html" class="btn btn-dark">Volver a Mis Pedidos</a>
      </div>
    `;
  }
}
