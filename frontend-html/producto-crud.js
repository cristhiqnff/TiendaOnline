// producto-crud.js — CRUD completo de productos
// Sistema CRUD de productos - Tienda Online
// Uso exclusivo del sistema session.js

const API = 'http://localhost:5000';

function getUser() {
  return window.session.getUser();
}

function getToken() {
  return window.session.getToken();
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function cargarDepartamentosProducto() {
  const deptoEl = document.getElementById('prodDeptoOrigen');
  const ciudadEl = document.getElementById('prodCiudadOrigen');
  if (!deptoEl || !ciudadEl) return;

  try {
    const res = await fetch('https://www.datos.gov.co/resource/xdk5-pm3f.json?$limit=1000');
    const deptos = await safeJson(res);
    if (!Array.isArray(deptos)) return;

    const deptosUnicos = [...new Set(deptos.map(d => d.departamento))];
    deptoEl.innerHTML = '<option value="">Seleccionar departamento</option>' +
      deptosUnicos.sort().map(d => `<option value="${d}">${d}</option>`).join('');

    deptoEl.addEventListener('change', () => {
      const deptoSeleccionado = deptoEl.value;
      if (!deptoSeleccionado) {
        ciudadEl.innerHTML = '<option value="">Seleccionar municipio</option>';
        return;
      }

      const ciudades = deptos
        .filter(d => d.departamento === deptoSeleccionado)
        .map(d => d.municipio);
      const ciudadesUnicas = [...new Set(ciudades)];
      
      ciudadEl.innerHTML = '<option value="">Seleccionar municipio</option>' +
        ciudadesUnicas.sort().map(c => `<option value="${c}">${c}</option>`).join('');
    });
  } catch (error) {
    console.error('Error cargando departamentos:', error);
  }
}

async function cargarCategorias() {
  const categoriaEl = document.getElementById('prodCategoria');
  if (!categoriaEl) return;

  try {
    const res = await fetch(`${API}/categoria`);
    const categorias = await safeJson(res);
    if (!Array.isArray(categorias)) return;

    categoriaEl.innerHTML = '<option value="">Seleccionar categoría</option>' +
      categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

async function cargarProductos() {
  const listaEl = document.getElementById('productosLista');
  if (!listaEl) return;

  try {
    const res = await fetch(`${API}/producto`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const productos = await safeJson(res);
    if (!Array.isArray(productos)) return;

    listaEl.innerHTML = productos.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.descripcion || ''}</td>
        <td>$${p.precio}</td>
        <td>${p.stock}</td>
        <td>${p.categoria?.nombre || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editarProducto(${p.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

async function guardarProducto() {
  const formulario = document.getElementById('productoForm');
  if (!formulario) return;

  const formData = new FormData(formulario);
  const producto = {
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    precio: parseFloat(formData.get('precio')),
    stock: parseInt(formData.get('stock')),
    categoria_id: parseInt(formData.get('categoria')),
    departamento_origen: formData.get('departamento_origen'),
    ciudad_origen: formData.get('ciudad_origen')
  };

  try {
    const res = await fetch(`${API}/producto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(producto)
    });

    if (res.ok) {
      alert('Producto guardado exitosamente');
      formulario.reset();
      cargarProductos();
    } else {
      alert('Error al guardar producto');
    }
  } catch (error) {
    console.error('Error guardando producto:', error);
    alert('Error al guardar producto');
  }
}

async function editarProducto(id) {
  try {
    const res = await fetch(`${API}/producto/${id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const producto = await safeJson(res);
    if (!producto) return;

    const formulario = document.getElementById('productoForm');
    if (formulario) {
      formulario.nombre.value = producto.nombre || '';
      formulario.descripcion.value = producto.descripcion || '';
      formulario.precio.value = producto.precio || '';
      formulario.stock.value = producto.stock || '';
      formulario.categoria.value = producto.categoria_id || '';
      formulario.departamento_origen.value = producto.departamento_origen || '';
      formulario.ciudad_origen.value = producto.ciudad_origen || '';
    }
  } catch (error) {
    console.error('Error cargando producto:', error);
  }
}

async function eliminarProducto(id) {
  if (!confirm('¿Está seguro de eliminar este producto?')) return;

  try {
    const res = await fetch(`${API}/producto/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (res.ok) {
      alert('Producto eliminado exitosamente');
      cargarProductos();
    } else {
      alert('Error al eliminar producto');
    }
  } catch (error) {
    console.error('Error eliminando producto:', error);
    alert('Error al eliminar producto');
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  cargarDepartamentosProducto();
  cargarCategorias();
  cargarProductos();
});
