// Sistema unificado de categorías - Tienda Online
// Uso exclusivo del sistema session.js

let categorias = [];

// Función de inicialización para categorías
window.initCategorias = function() {
  console.log('🏪 Inicializando sistema de categorías...');
  loadCategorias();
  setupEventListeners();
};

function loadCategorias() {
  // Simulación de datos - reemplazar con llamada real a API
  categorias = [
    { id: 1, nombre: 'Electrónica', icono: '📱', productos: 245 },
    { id: 2, nombre: 'Ropa', icono: '👕', productos: 189 },
    { id: 3, nombre: 'Hogar', icono: '🏠', productos: 156 },
    { id: 4, nombre: 'Deportes', icono: '⚽', productos: 98 },
    { id: 5, nombre: 'Libros', icono: '📚', productos: 234 },
    { id: 6, nombre: 'Juguetes', icono: '🎮', productos: 167 }
  ];
  
  renderCategorias();
}

function renderCategorias() {
  const container = document.getElementById('categoriasGrid');
  if (!container) {
    console.error('❌ Contenedor #categoriasGrid no encontrado');
    return;
  }

  const esAdmin = window.session ? window.session.isAdmin() : false;
  
  container.innerHTML = categorias.map(categoria => `
    <div class="col-md-4 col-sm-6 mb-4">
      <div class="card h-100 shadow-sm categoria-card" data-categoria-id="${categoria.id}">
        <div class="card-body text-center">
          <div class="categoria-icono mb-3">${categoria.icono}</div>
          <h5 class="card-title">${categoria.nombre}</h5>
          <p class="text-muted">${categoria.productos} productos</p>
          <div class="btn-group w-100" role="group">
            <button class="btn btn-outline-primary" onclick="verCategoria(${categoria.id})">
              Ver productos
            </button>
            ${esAdmin ? `
              <button class="btn btn-outline-warning" onclick="editarCategoria(${categoria.id})">
                Editar
              </button>
              <button class="btn btn-outline-danger" onclick="eliminarCategoria(${categoria.id})">
                Eliminar
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function setupEventListeners() {
  // Configurar búsqueda de categorías
  const searchInput = document.getElementById('busquedaCategoria');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      filterCategorias(searchTerm);
    });
  }
  
  // Configurar botón de agregar categoría (solo admin)
  const btnAgregar = document.getElementById('btnAgregarCategoria');
  if (btnAgregar && window.session && window.session.isAdmin()) {
    btnAgregar.style.display = 'block';
    btnAgregar.addEventListener('click', agregarCategoria);
  }
}

function filterCategorias(searchTerm) {
  const cards = document.querySelectorAll('.categoria-card');
  cards.forEach(card => {
    const categoriaId = card.dataset.categoriaId;
    const categoria = categorias.find(c => c.id == categoriaId);
    
    if (categoria && categoria.nombre.toLowerCase().includes(searchTerm)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function verCategoria(id) {
  window.location.href = `productos.html?categoria=${id}`;
}

function editarCategoria(id) {
  const categoria = categorias.find(c => c.id === id);
  if (categoria) {
    const nuevoNombre = prompt('Editar nombre de la categoría:', categoria.nombre);
    if (nuevoNombre && nuevoNombre.trim()) {
      categoria.nombre = nuevoNombre.trim();
      renderCategorias();
      showToast('Categoría actualizada correctamente', 'success');
    }
  }
}

function eliminarCategoria(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
    categorias = categorias.filter(c => c.id !== id);
    renderCategorias();
    showToast('Categoría eliminada correctamente', 'success');
  }
}

function agregarCategoria() {
  const nombre = prompt('Nombre de la nueva categoría:');
  if (nombre && nombre.trim()) {
    const nuevaCategoria = {
      id: Math.max(...categorias.map(c => c.id)) + 1,
      nombre: nombre.trim(),
      icono: '📦',
      productos: 0
    };
    categorias.push(nuevaCategoria);
    renderCategorias();
    showToast('Categoría agregada correctamente', 'success');
  }
}

function showToast(message, type = 'info') {
  let container = document.getElementById('globalToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'globalToastContainer';
    container.style.cssText = 'position:fixed;top:16px;right:16px;z-index:2000;display:flex;flex-direction:column;gap:8px;max-width:360px;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const tone = type === 'success'
    ? { bg: '#198754', border: '#146c43' }
    : type === 'warning'
      ? { bg: '#ffc107', border: '#e6ac00', text: '#111' }
      : { bg: '#0dcaf0', border: '#0aa2c5', text: '#fff' };

  toast.style.cssText = `
    background: ${tone.bg}; color: ${tone.text || '#fff'}; border: 1px solid ${tone.border};
    padding: 12px 16px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => container.removeChild(toast), 300);
  }, 3000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.initCategorias === 'function') {
    window.initCategorias();
  }
});

// Agregar animaciones CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .categoria-card {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .categoria-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .categoria-icono {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
`;
document.head.appendChild(style);
