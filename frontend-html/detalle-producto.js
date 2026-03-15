const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const cont = document.getElementById('detalleProducto');

// Sistema de detalle de producto - Tienda Online
// Uso exclusivo del sistema session.js

function getUser() {
  return window.session.getUser();
}

function getRoles() {
  const user = getUser();
  if (Array.isArray(user.roles)) {
    return user.roles
      .map(r => (r && typeof r === 'object') ? r.nombre : r)
      .filter(Boolean);
  }
  return user.rol ? [user.rol] : [];
}

function getToken() {
  return window.session.getToken();
}

async function cargarResenas(idProducto) {
  const contResenas = document.getElementById('resenas');
  if (!contResenas) return;
  contResenas.innerHTML = '<div class="text-muted">Cargando reseñas...</div>';

  try {
    const res = await fetch(`http://localhost:5000/resena/producto/${idProducto}`);
    const resenas = await res.json();

    const roles = getRoles();
    const puedeResenar = roles.includes('cliente') || roles.includes('admin');

    if (!Array.isArray(resenas) || resenas.length === 0) {
      contResenas.innerHTML = '<div class="text-muted">No hay reseñas aún.</div>';
      return;
    }

    contResenas.innerHTML = resenas.map(r => `
      <div class="border-bottom pb-3 mb-3">
        <div class="d-flex justify-content-between">
          <strong>${r.usuario_nombre || 'Anónimo'}</strong>
          <small class="text-muted">${new Date(r.fecha).toLocaleDateString()}</small>
        </div>
        <div class="text-warning mb-1">${'★'.repeat(r.calificacion || 0)}${'☆'.repeat(5 - (r.calificacion || 0))}</div>
        <p class="mb-0">${r.comentario || ''}</p>
      </div>
    `).join('');

    if (puedeResenar) {
      const formResena = document.createElement('div');
      formResena.className = 'mt-4 p-3 border rounded';
      formResena.innerHTML = `
        <h5>Escribe tu reseña</h5>
        <div class="mb-2">
          <label>Calificación:</label>
          <select id="calificacion" class="form-select">
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
        </div>
        <div class="mb-2">
          <label>Comentario:</label>
          <textarea id="comentario" class="form-control" rows="3" placeholder="Tu opinión sobre este producto..."></textarea>
        </div>
        <button class="btn btn-primary" id="btnEnviarResena">Enviar reseña</button>
        <div id="resenaMsg"></div>
      `;
      contResenas.appendChild(formResena);

      document.getElementById('btnEnviarResena').onclick = async () => {
        const calificacion = document.getElementById('calificacion').value;
        const comentario = document.getElementById('comentario').value;
        const msg = document.getElementById('resenaMsg');

        if (!calificacion || !comentario.trim()) {
          msg.innerHTML = '<div class="alert alert-warning">Completa todos los campos.</div>';
          return;
        }

        try {
          const token = getToken();
          const resp = await fetch(`http://localhost:5000/resena/producto/${idProducto}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ calificacion, comentario })
          });

          if (resp.ok) {
            msg.innerHTML = '<div class="alert alert-success">Reseña publicada.</div>';
            await cargarResenas(idProducto);
          } else {
            msg.innerHTML = '<div class="alert alert-danger">' + (body.error || 'No se pudo publicar') + '</div>';
          }
        } catch {
          msg.innerHTML = '<div class="alert alert-danger">Error de conexión.</div>';
        }
      };
    }
  } catch {
    contResenas.innerHTML = '<div class="text-muted">No se pudieron cargar las reseñas.</div>';
  }
}

function marcarComoVisto(prod) {
  try {
    const pid = prod.id_producto || prod.id;
    if (!pid) return;
    let vistos = JSON.parse(localStorage.getItem('vistos') || '[]');
    const limpio = {
      id: pid,
      nombre: prod.nombre,
      imagen: prod.imagen,
      precio: prod.precio,
      categoria: prod.categoria,
      fecha: new Date().toISOString()
    };
    const sinDup = vistos.filter(v => String(v.id) !== String(pid));
    sinDup.unshift(limpio);
    localStorage.setItem('vistos', JSON.stringify(sinDup.slice(0, 12)));
  } catch {
    // ignore
  }
}

async function cargarSimilares(prod) {
  const contSimilares = document.getElementById('similaresContainer');
  if (!contSimilares) return;
  try {
    const res = await fetch('http://localhost:5000/producto');
    const productos = await res.json();
    const similares = (productos || [])
      .filter(p => String(p.id_producto) !== String(prod.id_producto))
      .filter(p => p.categoria === prod.categoria)
      .slice(0, 4);

    if (similares.length === 0) {
      contSimilares.innerHTML = '<div class="text-muted">No hay productos similares.</div>';
      return;
    }

    const html = similares.map(p => `
      <div class="col-md-3 mb-3">
        <div class="card h-100">
          <img src="${p.imagen || 'https://via.placeholder.com/200x150?text=Sin+Imagen'}" class="card-img-top" alt="${p.nombre}">
          <div class="card-body">
            <h6 class="card-title">${p.nombre}</h6>
            <p class="card-text text-primary fw-bold">$${Number(p.precio || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <a href="detalle-producto.html?id=${p.id_producto}" class="btn btn-outline-primary btn-sm">Ver detalles</a>
          </div>
        </div>
      </div>
    `).join('');

    contSimilares.innerHTML = html;
  } catch {
    contSimilares.innerHTML = '<div class="text-muted">No se pudieron cargar los similares.</div>';
  }
}

async function cargarAtributos(prod) {
  const secAtr = document.getElementById('productoAtributos');
  if (!secAtr) return;
  
  try {
    const res = await fetch(`http://localhost:5000/producto/${prod.id_producto || prod.id}/atributos`);
    const atributos = await res.json();
    
    if (!Array.isArray(atributos) || !atributos.length) {
      secAtr.style.display = 'none';
      return;
    }

    const html = atributos.map(atr => `
      <div class="row mb-2">
        <div class="col-sm-4 fw-bold">${atr.seccion || ''}:</div>
        <div class="col-sm-8">${atr.valor || ''}</div>
      </div>
    `).join('');

    secAtr.innerHTML = `
      <h5 class="mt-4">Características</h5>
      <div class="border p-3 rounded">
        ${html}
      </div>
    `;
    secAtr.style.display = 'block';
  } catch {
    secAtr.style.display = 'none';
  }
}

if (!id) {
  cont.innerHTML = `
    <div class="alert alert-danger">
      <h4 class="alert-heading">Producto No Encontrado</h4>
      <p>No se especificó un ID de producto válido.</p>
      <hr>
      <a href="index.html" class="btn btn-primary">Volver al Catálogo</a>
    </div>
  `;
} else {
  fetch(`http://localhost:5000/producto/${id}`)
    .then(res => {
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Producto no encontrado');
        } else {
          throw new Error('Error al cargar el producto');
        }
      }
      return res.json();
    })
    .then(prod => {
      if (!prod || Object.keys(prod).length === 0) {
        throw new Error('Producto no encontrado');
      }
      
      // Renderizar producto
      const idProd = prod.id_producto || prod.id;
      const imgUrl = prod.imagen || 'https://via.placeholder.com/400x300?text=Sin+Imagen';
      const nombre = prod.nombre || 'Producto sin nombre';
      const precio = Number(prod.precio || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
      const descripcion = prod.descripcion || 'Sin descripción disponible';
      
      cont.innerHTML = `
        <div class="row">
          <div class="col-md-6">
            <img src="${imgUrl}" class="img-fluid rounded" alt="${nombre}" 
                 onerror="this.src='https://via.placeholder.com/400x300?text=Error+Carga+Imagen'">
          </div>
          <div class="col-md-6">
            <h2>${nombre}</h2>
            <p class="text-muted">${prod.categoria || 'Sin categoría'}</p>
            <h3 class="text-primary">$${precio}</h3>
            <p>${descripcion}</p>
            
            <div class="d-flex gap-2 mb-3">
              <button class="btn btn-primary" onclick="window.cart.agregarAlCarrito(${JSON.stringify(prod).replace(/"/g, '&quot;')})">
                <i class="fas fa-cart-plus"></i> Agregar al Carrito
              </button>
              <button class="btn btn-outline-secondary" onclick="window.history.back()">
                <i class="fas fa-arrow-left"></i> Volver
              </button>
            </div>
            
            <div id="productoAtributos"></div>
          </div>
        </div>
        
        <div class="mt-5">
          <h4>Productos Similares</h4>
          <div id="similaresContainer" class="row"></div>
        </div>
        
        <div class="mt-5">
          <h4>Reseñas</h4>
          <div id="resenasContainer"></div>
        </div>
      `;
      
      // Cargar datos adicionales
      cargarAtributos(prod);
      cargarSimilares(prod);
      cargarResenas(idProd);
      
      // Marcar como visto
      marcarComoVisto(prod);
      
    })
    .catch(error => {
      console.error('Error cargando producto:', error);
      cont.innerHTML = `
        <div class="alert alert-danger">
          <h4 class="alert-heading">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${error.message === 'Producto no encontrado' ? 'Producto No Encontrado' : 'Error al Cargar Producto'}
          </h4>
          <p class="mb-3">
            ${error.message === 'Producto no encontrado' 
              ? 'El producto que buscas no existe o ha sido eliminado.' 
              : 'No pudimos cargar la información del producto en este momento. Por favor, intenta nuevamente más tarde.'}
          </p>
          <hr>
          <div class="d-flex gap-2">
            <a href="index.html" class="btn btn-primary">
              <i class="fas fa-home me-2"></i>Ir al Catálogo
            </a>
            <a href="categorias.html" class="btn btn-outline-secondary">
              <i class="fas fa-th-large me-2"></i>Ver Categorías
            </a>
            <button onclick="window.history.back()" class="btn btn-outline-primary">
              <i class="fas fa-arrow-left me-2"></i>Volver Atrás
            </button>
          </div>
        </div>
      `;
    });
}
