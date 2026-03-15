// Sistema de Sesión Global - Tienda Online
// Objeto unificado para toda la aplicación

window.session = {
  /**
   * Obtiene el usuario actual desde localStorage
   */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  },

  /**
   * Obtiene el token de autenticación
   */
  getToken() {
    return localStorage.getItem("token");
  },

  /**
   * Verifica si hay sesión activa
   */
  isLoggedIn() {
    return !!localStorage.getItem("token");
  },

  /**
   * Cierra sesión y redirige al inicio
   */
  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "index.html";
  },

  /**
   * Inicia sesión del usuario
   */
  login(user, token) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    this.updateNavbar();
  },

  /**
   * Actualiza la navegación según estado de sesión
   */
  updateNavbar() {
    const user = this.getUser();

    const navGuest = document.getElementById("navGuest");
    const navUser = document.getElementById("navUser");
    const navAdmin = document.getElementById("navAdmin");
    const navVendedor = document.getElementById("navVendedor");
    const navUserName = document.getElementById("navUserName");

    if (user) {
      // Hay sesión activa
      if (navGuest) navGuest.style.display = "none";
      if (navUser) navUser.style.display = "flex";
      if (navUserName) navUserName.textContent = user.nombre || "Mi cuenta";

      if (user.rol === "admin" && navAdmin) navAdmin.style.display = "inline";
      if (user.rol === "vendedor" && navVendedor) navVendedor.style.display = "inline";

    } else {
      // No hay sesión
      if (navGuest) navGuest.style.display = "inline";
      if (navUser) navUser.style.display = "none";
      if (navAdmin) navAdmin.style.display = "none";
      if (navVendedor) navVendedor.style.display = "none";
    }

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
      btnLogout.onclick = () => this.logout();
    }
  },

  /**
   * Establece la sesión del usuario
   */
  setSession(user, token) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    this.updateNavbar();
  },

  /**
   * Limpia la sesión actual
   */
  clearSession() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    this.updateNavbar();
  }
};

// Inicializar la navegación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  if (window.session) {
    window.session.updateNavbar();
  }
});
