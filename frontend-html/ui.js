function mostrarToast(msg) {
  let toast = document.getElementById('toastCarrito');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastCarrito';
    toast.className = 'toast show position-fixed bottom-0 end-0 m-3 align-items-center text-white bg-dark border-0';
    toast.style.zIndex = '10000';
    toast.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div></div>`;
    document.body.appendChild(toast);
  } else {
    toast.querySelector('.toast-body').textContent = msg;
    toast.classList.add('show');
  }
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function renderCardTemplate(prod) {
  const id = prod.id_producto ?? prod.id;
  const imgUrl = prod.imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
  const nombre = prod.nombre || 'Producto sin nombre';
  const precio = Number(prod.precio || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const categoria = prod.categoria || 'Varios';
  
  return `
    <div class="col-12 col-sm-6 col-lg-4 mb-4 product-card-wrapper" data-nombre="${normalizar(nombre)}" data-categoria="${normalizar(categoria)}" data-marca="${normalizar(prod.marca||'')}">
      <div class="card h-100 shadow-sm ml-product-card border-0">
        <div class="overflow-hidden" style="border-radius: 12px 12px 0 0;">
           <img src="${imgUrl}" class="card-img-top" alt="Imagen de ${nombre}" loading="lazy">
        </div>
        <div class="card-body d-flex flex-column">
          <div class="small text-brand mb-1 fw-bold">${categoria}</div>
          <h3 class="card-title h6 fw-semibold mb-2">${nombre}</h3>
          <p class="card-text fw-bold fs-5 text-dark mb-3 mt-auto">$${precio}</p>
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-add-cart flex-grow-1" type="button" aria-label="Agregar al carrito">Agregar al carrito</button>
            <a href="detalle-producto.html?id=${id}" class="btn btn-outline-secondary btn-ver-detalle" aria-label="Ver producto ${nombre}">Ver</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function renderCatalogo() {
  const cont = document.getElementById('productos');
  if (!cont) return;
  cont.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2 text-muted">Cargando catálogo...</p>
    </div>
  `;
  
  const catalogo = await products.getCatalogo();
  if (!catalogo || catalogo.length === 0) {
    cont.innerHTML = '<div class="col-12"><div class="alert alert-info">No hay productos disponibles.</div></div>';
    return;
  }
  
  cont.innerHTML = '';
  catalogo.forEach(prod => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderCardTemplate(prod).trim();
    const el = wrapper.firstChild;
    
    // Add event listeners
    const btnCart = el.querySelector('.btn-add-cart');
    btnCart.addEventListener('click', (e) => {
      e.preventDefault();
      cart.agregarAlCarrito(prod);
    });

    const btnVer = el.querySelector('.btn-ver-detalle');
    btnVer.addEventListener('click', () => {
      products.agregarAVistos(prod);
    });

    cont.appendChild(el);
  });
}

function renderVistos() {
  const cont = document.getElementById('vistosList') || document.getElementById('vistos');
  if (!cont) return;

  const vistos = products.getVistosRecientemente();
  if (!vistos.length) {
    cont.innerHTML = '<div class="col-12"><div class="text-muted">Aún no has visto productos.</div></div>';
    return;
  }

  cont.innerHTML = '';
  vistos.forEach(prod => {
    const id = prod.id_producto ?? prod.id;
    const precio = Number(prod.precio || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
    cont.innerHTML += `
      <div class="col-12 col-sm-6 col-lg-2 mb-3">
        <div class="card h-100 shadow-sm ml-product-card border-0 bg-white">
          <div class="overflow-hidden" style="border-radius: 12px 12px 0 0;">
            <img src="${prod.imagen || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="Visto: ${prod.nombre}" style="height: 120px;" loading="lazy">
          </div>
          <div class="card-body p-2 text-center">
            <div class="fw-semibold small text-truncate" title="${prod.nombre}">${prod.nombre}</div>
            <div class="text-muted small">$${precio}</div>
            <a class="stretched-link" href="detalle-producto.html?id=${id}" aria-label="Ver detalle de ${prod.nombre}" onclick='products.agregarAVistos(${JSON.stringify(prod).replace(/"/g, "&quot;")})'></a>
          </div>
        </div>
      </div>
    `;
  });
}

async function renderMasVendidos() {
  const cont = document.getElementById('masVendidos');
  if (!cont) return;
  const catalogo = await products.getCatalogo();
  
  // Como no hay endpoint específico de destacados, usamos los primeros 4 del catálogo real.
  const destacados = catalogo.slice(0, 4);

  if (!destacados.length) {
    cont.innerHTML = '<div class="col-12"><div class="text-muted">No hay productos destacados por el momento.</div></div>';
    return;
  }

  cont.innerHTML = '';
  destacados.forEach(p => {
    const id = p.id_producto ?? p.id;
    const item = document.createElement('div');
    item.className = 'col-6 col-md-3 mb-3';
    item.innerHTML = `
      <div class="card h-100 shadow-sm ml-product-card border-0">
        <a href="detalle-producto.html?id=${id}" class="text-decoration-none text-dark" onclick='products.agregarAVistos(${JSON.stringify(p).replace(/"/g, "&quot;")})'>
          <div class="overflow-hidden" style="border-radius: 12px 12px 0 0;">
            <img src="${p.imagen || 'https://via.placeholder.com/300x200'}" class="card-img-top top-vendidos-img" alt="${p.nombre}" loading="lazy">
          </div>
          <div class="card-body p-3">
            <div class="badge bg-warning text-dark mb-2">Destacado</div>
            <h3 class="h6 fw-bold text-truncate" title="${p.nombre}">${p.nombre}</h3>
            <div class="text-success fw-bold">$${Number(p.precio).toLocaleString('en-US')}</div>
          </div>
        </a>
        <div class="card-footer bg-transparent border-0 p-3 pt-0">
          <button class="btn btn-sm btn-outline-primary w-100" onclick='cart.agregarAlCarrito(${JSON.stringify(p).replace(/"/g, "&quot;")})'>Comprar</button>
        </div>
      </div>
    `;
    cont.appendChild(item);
  });
}

function normalizar(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function initBuscador() {
  const input = document.getElementById('busqueda');
  const searchForm = document.getElementById('formBuscador');
  
  if (!input || !searchForm) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  input.addEventListener('input', () => {
    const q = normalizar(input.value);
    
    // Filter product cards in the page
    const cards = document.querySelectorAll('.product-card-wrapper');
    let foundCount = 0;

    cards.forEach(card => {
      const nombre = card.dataset.nombre || '';
      const cat = card.dataset.categoria || '';
      const marca = card.dataset.marca || '';

      if (nombre.includes(q) || cat.includes(q) || marca.includes(q)) {
        card.style.display = '';
        foundCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const noResultsMsg = document.getElementById('noResultsMessage');
    const cont = document.getElementById('productos');
    if (foundCount === 0 && cont) {
      if (!noResultsMsg) {
        const div = document.createElement('div');
        div.id = 'noResultsMessage';
        div.className = 'col-12 mt-4';
        div.innerHTML = `<div class="alert alert-warning text-center">No se encontraron productos para "<b>${input.value}</b>".</div>`;
        cont.parentElement.insertBefore(div, cont.nextSibling); // Insert after product container
      } else {
        noResultsMsg.style.display = 'block';
        noResultsMsg.querySelector('b').textContent = input.value;
      }
    } else if (noResultsMsg) {
      noResultsMsg.style.display = 'none';
    }
  });
}

// Smooth scroll for internal links
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

function setYear() {
  const el = document.getElementById('currentYear');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}

// Clean button for vistos
document.addEventListener('DOMContentLoaded', () => {
  const btnLimpiar = document.getElementById('btnLimpiarVistos');
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', products.limpiarVistos);
  }
});

// Funciones de filtrado y paginación
let currentPage = 1;
const itemsPerPage = 12;
let allProducts = [];
let filteredProducts = [];

function setupFiltersAndPagination() {
  const container = document.getElementById('productos');
  if (!container) return;

  // Agregar controles de paginación y filtros
  const controlsHtml = `
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text"><i class="fas fa-search"></i></span>
          <input type="text" class="form-control" id="searchInput" placeholder="Buscar productos...">
        </div>
      </div>
      <div class="col-md-3">
        <select class="form-select" id="categoryFilter">
          <option value="">Todas las categorías</option>
        </select>
      </div>
      <div class="col-md-3">
        <select class="form-select" id="sortBy">
          <option value="nombre">Nombre</option>
          <option value="precio-asc">Precio: Menor a Mayor</option>
          <option value="precio-desc">Precio: Mayor a Menor</option>
        </select>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div id="paginationInfo" class="text-muted"></div>
      <nav id="paginationControls"></nav>
    </div>
  `;

  container.insertAdjacentHTML('beforebegin', controlsHtml);

  // Event listeners
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('categoryFilter').addEventListener('change', applyFilters);
  document.getElementById('sortBy').addEventListener('change', applyFilters);
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;
  const sortBy = document.getElementById('sortBy').value;

  // Filtrar productos
  filteredProducts = allProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      product.nombre.toLowerCase().includes(searchTerm) ||
      product.descripcion?.toLowerCase().includes(searchTerm) ||
      product.categoria?.toLowerCase().includes(searchTerm);
    
    const matchesCategory = !categoryFilter || product.categoria === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Ordenar productos
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'nombre':
        return a.nombre.localeCompare(b.nombre);
      case 'precio-asc':
        return a.precio - b.precio;
      case 'precio-desc':
        return b.precio - a.precio;
      default:
        return 0;
    }
  });

  currentPage = 1;
  renderPaginatedProducts();
}

function renderPaginatedProducts() {
  const container = document.getElementById('productos');
  if (!container) return;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);

  // Renderizar productos
  container.innerHTML = productsToShow.map(product => renderCardTemplate(product)).join('');

  // Actualizar información de paginación
  updatePaginationInfo();
  
  // Renderizar controles de paginación
  renderPaginationControls();

  // Actualizar badge del carrito
  if (window.cart && window.cart.actualizarBadgeCarrito) {
    window.cart.actualizarBadgeCarrito();
  }
}

function updatePaginationInfo() {
  const info = document.getElementById('paginationInfo');
  if (!info) return;

  const totalItems = filteredProducts.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  info.textContent = totalItems > 0 
    ? `Mostrando ${startItem}-${endItem} de ${totalItems} productos`
    : 'No se encontraron productos';
}

function renderPaginationControls() {
  const controls = document.getElementById('paginationControls');
  if (!controls) return;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  if (totalPages <= 1) {
    controls.innerHTML = '';
    return;
  }

  let paginationHtml = '<ul class="pagination pagination-sm mb-0">';
  
  // Botón anterior
  paginationHtml += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
        <i class="fas fa-chevron-left"></i>
      </a>
    </li>
  `;

  // Números de página
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHtml += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
      </li>
    `;
  }

  // Botón siguiente
  paginationHtml += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
        <i class="fas fa-chevron-right"></i>
      </a>
    </li>
  `;

  paginationHtml += '</ul>';
  controls.innerHTML = paginationHtml;
}

function changePage(page) {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderPaginatedProducts();
  
  // Scroll al inicio de productos
  document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadCategoriesForFilter() {
  try {
    const res = await fetch('http://localhost:5000/categoria');
    if (res.ok) {
      const categories = await res.json();
      const select = document.getElementById('categoryFilter');
      if (select) {
        select.innerHTML = '<option value="">Todas las categorías</option>' +
          categories.map(cat => `<option value="${cat.nombre}">${cat.nombre}</option>`).join('');
      }
    }
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

// Modificar la función renderCatalogo existente
async function renderCatalogo() {
  const container = document.getElementById('productos');
  if (!container) return;

  try {
    const res = await fetch('http://localhost:5000/producto');
    if (!res.ok) throw new Error('Error al cargar productos');
    
    allProducts = await res.json();
    filteredProducts = [...allProducts];
    
    // Configurar filtros y paginación si no están configurados
    if (!document.getElementById('searchInput')) {
      setupFiltersAndPagination();
      await loadCategoriesForFilter();
    }
    
    renderPaginatedProducts();
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div class="alert alert-danger">Error al cargar productos. Intenta nuevamente.</div>';
  }
}

window.ui = {
  mostrarToast,
  renderCatalogo,
  renderVistos,
  renderMasVendidos,
  initBuscador,
  setYear,
  applyFilters,
  changePage
};
