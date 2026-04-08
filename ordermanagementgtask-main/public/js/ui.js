// UI Utilities: Toast notifications, loading states, modals

// Toast notification system
let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'info', duration = 4000) {
  const container = getToastContainer();
  const toast = document.createElement('div');

  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-indigo-600 text-white',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${colors[type]} transform transition-all duration-300 translate-x-full opacity-0`;
  toast.innerHTML = `
    <span class="text-lg font-bold">${icons[type]}</span>
    <span class="text-sm flex-1">${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-2 text-white/80 hover:text-white text-lg leading-none">&times;</button>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
    });
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Loading overlay
export function showLoading(message = 'Loading...') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    overlay.innerHTML = `
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 flex items-center gap-4 shadow-2xl">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <span id="loading-message" class="text-slate-700 dark:text-slate-200 font-medium">${message}</span>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    document.getElementById('loading-message').textContent = message;
    overlay.classList.remove('hidden');
  }
}

export function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// Confirm dialog
export function showConfirm(title, message) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">${title}</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">${message}</p>
        <div class="flex gap-3 justify-end">
          <button id="confirm-cancel" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
          <button id="confirm-ok" class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#confirm-ok').addEventListener('click', () => { modal.remove(); resolve(true); });
    modal.querySelector('#confirm-cancel').addEventListener('click', () => { modal.remove(); resolve(false); });
  });
}

// Dark mode management
export function initDarkMode() {
  const stored = localStorage.getItem('darkMode');
  if (stored === 'true' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

export function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  return isDark;
}

// Sidebar toggle for mobile
export function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      if (overlay) overlay.classList.toggle('hidden');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    });
  }
}

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Format date
export function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Status badge HTML
export function statusBadge(status) {
  const styles = {
    pending:   'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    open:      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    closed:    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  const style = styles[status] || styles.pending;
  return `<span class="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}">${status}</span>`;
}

// Debounce utility
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
