function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

function getRoles(user) {
  if (!user) return [];
  if (Array.isArray(user.roles)) {
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

// Funciones de validación de seguridad
function requireRole(requiredRole) {
  const user = getUser();
  const roles = getRoles(user);
  const hasRole = roles.includes(requiredRole.toUpperCase());
  
  if (!hasRole) {
    location.href = 'index.html';
    return false;
  }
  return true;
}

function requireAdmin() {
  return requireRole('ADMIN');
}

function requireVendedor() {
  return requireRole('VENDEDOR');
}

function isAdmin() {
  const roles = getRoles(getUser());
  return roles.includes('ADMIN');
}

function isVendedor() {
  const roles = getRoles(getUser());
  return roles.includes('VENDEDOR');
}

function isCliente() {
  const roles = getRoles(getUser());
  return !roles.includes('ADMIN') && !roles.includes('VENDEDOR');
}

function renderAuthNav() {
  // DESACTIVADA: Esta función está siendo reemplazada por el nuevo sistema session.js
  // El nuevo sistema usa window.session.updateHeader() en su lugar
  console.log('⚠️ renderAuthNav() desactivada - usando nuevo sistema de sesión');
}

window.auth = {
  getUser,
  getRoles,
  isLoggedIn,
  renderAuthNav,
  requireRole,
  requireAdmin,
  requireVendedor,
  isAdmin,
  isVendedor,
  isCliente
};
