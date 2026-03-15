// Panel de administración básico: productos, categorías, usuarios, pedidos, roles, dashboard
// Requiere token de admin - Sistema UNIFICADO
const token = window.session.getToken();
const user = window.session.getUser();

// Extraer correctamente el rol del usuario
const rol = user ? user.rol : null;
const esAdmin = rol === 'admin';

console.log('Token:', token ? 'presente' : 'ausente');
console.log('Usuario:', user);
console.log('Rol:', rol);

if (!token || !esAdmin) {
  console.error('❌ Acceso denegado: Se requiere rol de administrador');
  window.location.href = 'login.html';
  throw new Error('Acceso denegado');
}

// Funciones básicas del panel
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 Panel de administración cargado');
  
  // Actualizar nombre del usuario si está disponible
  const adminUserName = document.getElementById('adminUserName');
  if (adminUserName && user && user.nombre) {
    adminUserName.textContent = user.nombre;
  }
  
  // Configurar logout
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      window.session.logout();
    });
  }
});
