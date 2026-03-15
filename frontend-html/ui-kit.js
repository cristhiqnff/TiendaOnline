// UI Kit - Componentes Reutilizables - Tienda Online
;(function initUIKit(global) {
  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount || 0);
  }

  function formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(date).toLocaleDateString('es-CO', { ...defaultOptions, ...options });
  }

  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || (() => {
      const container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'position-fixed top-0 end-0 p-3';
      container.style.zIndex = '1050';
      document.body.appendChild(container);
      return container;
    })();

    const toastId = 'toast-' + Date.now();
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert">
        <div class="d-flex">
          <div class="toast-body">${escapeHtml(message)}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  function showLoading(element, text = 'Cargando...') {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (!element) return;

    element.disabled = true;
    element.dataset.originalText = element.textContent || element.innerHTML;
    element.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${text}`;
  }

  function hideLoading(element) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (!element) return;

    element.disabled = false;
    if (element.dataset.originalText) {
      element.innerHTML = element.dataset.originalText;
      delete element.dataset.originalText;
    }
  }

  function showModal(title, body, options = {}) {
    const modalId = 'modal-' + Date.now();
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${escapeHtml(title)}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">${body}</div>
            ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);

    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
    });

    modal.show();
    return modal;
  }

  function confirmAction(message, onConfirm, options = {}) {
    const defaultOptions = {
      title: 'Confirmar acción',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      confirmClass: 'btn-primary'
    };

    const opts = { ...defaultOptions, ...options };
    const footer = `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${opts.cancelText}</button>
      <button type="button" class="btn ${opts.confirmClass}" id="confirmBtn">${opts.confirmText}</button>
    `;

    const modal = showModal(opts.title, `<p>${escapeHtml(message)}</p>`, { footer });
    
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.addEventListener('click', () => {
      modal.hide();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    });
  }

  function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePhone(phone) {
    const phoneRegex = /^[0-9+\-\s()]{7,}$/;
    return phoneRegex.test(phone);
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Exponer funciones globalmente
  global.UIKit = {
    escapeHtml,
    formatCurrency,
    formatDate,
    showToast,
    showLoading,
    hideLoading,
    showModal,
    confirmAction,
    sanitizeInput,
    validateEmail,
    validatePhone,
    debounce,
    throttle
  };

})(window);
