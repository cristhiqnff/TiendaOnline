function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function getRoles(user) {
  if (!user) return [];
  if (Array.isArray(user.roles)) {
    // roles puede venir como array de strings ["ADMIN"]
    // o array de objetos [{ id_rol, nombre: "ADMIN" }]
    return user.roles
      .map(r => (r && typeof r === 'object') ? r.nombre : r)
      .map(r => String(r || '').trim().toUpperCase())
      .filter(Boolean);
  }
  if (user.rol) return [String(user.rol).trim().toUpperCase()];
  return [];
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function renderAuthNav() {
  // DESACTIVADA: Esta función está siendo reemplazada por el nuevo sistema session.js
  // El nuevo sistema usa window.session.updateHeader() en su lugar
  console.log('⚠️ renderAuthNav() desactivada - usando nuevo sistema de sesión');
}

renderAuthNav();

// ===== Global cart badge =====
(function actualizarBadgeGlobal() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  try {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const total = carrito.reduce((a, i) => a + (Number(i.cantidad) || 0), 0);
    badge.textContent = String(total);
    badge.style.display = total > 0 ? 'inline-block' : 'none';
  } catch {}
})();

// ===== Global search: autosuggest + dedicated results page =====
(function activarBusquedaGlobal() {
  const forms = document.querySelectorAll('header form[role="search"]');
  if (!forms.length) return;

  const normalizarTexto = (value) => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  let catalogoPromise = null;
  async function obtenerCatalogo() {
    if (!catalogoPromise) {
      catalogoPromise = fetch('http://localhost:5000/producto')
        .then((res) => res.json())
        .then((rows) => Array.isArray(rows) ? rows : [])
        .catch(() => []);
    }
    return catalogoPromise;
  }

  function irABusqueda(q) {
    const value = String(q || '').trim();
    if (!value) return;
    window.location.href = 'busqueda.html?q=' + encodeURIComponent(value);
  }

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');

  forms.forEach((form) => {
    const input = form.querySelector('input[type="search"]');
    if (!input) return;

    if (q && !input.value) input.value = q;

    form.style.position = 'relative';
    const suggestBox = document.createElement('div');
    suggestBox.style.cssText = 'position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:1200;background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:8px;box-shadow:0 8px 22px rgba(0,0,0,.12);display:none;max-height:300px;overflow:auto;';
    form.appendChild(suggestBox);

    let lastSuggestions = [];
    function renderSuggestions(query) {
      const text = String(query || '').trim();
      if (!text || text.length < 2) {
        suggestBox.style.display = 'none';
        suggestBox.innerHTML = '';
        lastSuggestions = [];
        return;
      }

      obtenerCatalogo().then((catalogo) => {
        const nq = normalizarTexto(text);
        const found = catalogo
          .filter((p) => {
            const nombre = normalizarTexto(p.nombre || '');
            const desc = normalizarTexto(p.descripcion || '');
            return nombre.includes(nq) || desc.includes(nq);
          })
          .slice(0, 6);

        lastSuggestions = found;
        if (!found.length) {
          suggestBox.innerHTML = `<div style="padding:10px 12px;color:#6c757d;font-size:13px;">Sin sugerencias</div>`;
          suggestBox.style.display = 'block';
          return;
        }

        suggestBox.innerHTML = found.map((p) => {
          const id = p.id_producto ?? p.id;
          const precio = Number(p.precio || 0).toLocaleString();
          return `<a href="detalle-producto.html?id=${id}" class="suggest-item" style="display:flex;justify-content:space-between;gap:12px;padding:10px 12px;text-decoration:none;color:#111;border-bottom:1px solid rgba(0,0,0,.06);">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${String(p.nombre || 'Producto')}</span>
            <span style="color:#6c757d;font-size:12px;">$${precio}</span>
          </a>`;
        }).join('') + `<button type="button" class="suggest-more" style="width:100%;border:0;background:#f8f9fa;padding:10px 12px;text-align:left;font-size:13px;color:#0d6efd;cursor:pointer;">Ver todos los resultados de "${text}"</button>`;
        suggestBox.style.display = 'block';

        const moreBtn = suggestBox.querySelector('.suggest-more');
        if (moreBtn) {
          moreBtn.onclick = () => irABusqueda(text);
        }
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      irABusqueda(input.value);
    });

    input.addEventListener('input', () => renderSuggestions(input.value));
    input.addEventListener('focus', () => renderSuggestions(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (input.value.trim()) {
          irABusqueda(input.value);
        } else if (lastSuggestions.length) {
          const first = lastSuggestions[0];
          const id = first.id_producto ?? first.id;
          window.location.href = `detalle-producto.html?id=${id}`;
        }
      }
      if (e.key === 'Escape') {
        suggestBox.style.display = 'none';
      }
    });
    input.addEventListener('search', () => irABusqueda(input.value));
    input.addEventListener('blur', () => {
      setTimeout(() => { suggestBox.style.display = 'none'; }, 140);
    });
  });
})();
