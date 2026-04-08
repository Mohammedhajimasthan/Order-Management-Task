// Orders page logic
import { requireAuth, populateUserNav } from './auth.js';
import { getOrders, addOrder, updateOrder, deleteOrder } from './db.js';
import { showToast, showConfirm, showLoading, hideLoading, formatCurrency, formatDate, statusBadge, initDarkMode, initSidebar, debounce } from './ui.js';

initDarkMode();
const user = await requireAuth();
populateUserNav(user);
initSidebar();

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  const { logout } = await import('./auth.js');
  logout();
});

let allOrders = [];
let filteredOrders = [];
let editingId = null;

// Filters state
let filters = { search: '', status: '', dateFrom: '', dateTo: '' };
let sortConfig = { key: 'createdAt', dir: 'desc' };

async function loadOrders() {
  showLoading('Loading orders...');
  try {
    allOrders = await getOrders();
    applyFilters();
  } catch (err) {
    showToast('Failed to load orders', 'error');
  } finally {
    hideLoading();
  }
}

function applyFilters() {
  filteredOrders = allOrders.filter(o => {
    const s = filters.search.toLowerCase();
    const matchSearch = !s ||
      (o.customerName || '').toLowerCase().includes(s) ||
      (o.id || '').toLowerCase().includes(s) ||
      (o.product || '').toLowerCase().includes(s);
    const matchStatus = !filters.status || o.status === filters.status;

    let matchDate = true;
    if (filters.dateFrom || filters.dateTo) {
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt || 0);
      if (filters.dateFrom && orderDate < new Date(filters.dateFrom)) matchDate = false;
      if (filters.dateTo && orderDate > new Date(filters.dateTo + 'T23:59:59')) matchDate = false;
    }

    return matchSearch && matchStatus && matchDate;
  });

  // Sort
  filteredOrders.sort((a, b) => {
    let va = a[sortConfig.key], vb = b[sortConfig.key];
    if (sortConfig.key === 'createdAt') {
      va = va?.toDate ? va.toDate() : new Date(va || 0);
      vb = vb?.toDate ? vb.toDate() : new Date(vb || 0);
    }
    if (va < vb) return sortConfig.dir === 'asc' ? -1 : 1;
    if (va > vb) return sortConfig.dir === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable();
  document.getElementById('result-count').textContent = `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}`;
}

function renderTable() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  if (filteredOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No orders found</td></tr>';
    return;
  }

  tbody.innerHTML = filteredOrders.map(o => `
    <tr class="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
      <td class="px-4 py-3 text-sm font-mono text-slate-600 dark:text-slate-400">#${o.id.slice(-6).toUpperCase()}</td>
      <td class="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">${escHtml(o.customerName || 'N/A')}</td>
      <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">${escHtml(o.product || 'N/A')}</td>
      <td class="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">${formatCurrency(o.amount || 0)}</td>
      <td class="px-4 py-3">${statusBadge(o.status || 'pending')}</td>
      <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">${formatDate(o.createdAt)}</td>
      <td class="px-4 py-3">
        <div class="flex gap-2">
          <button onclick="editOrder('${o.id}')" class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" title="Edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="deleteOrderHandler('${o.id}')" class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Delete">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Modal
function openModal(order = null) {
  editingId = order?.id || null;
  const modal = document.getElementById('order-modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('order-form');

  title.textContent = order ? 'Edit Order' : 'Add Order';

  form.customerName.value = order?.customerName || '';
  form.product.value = order?.product || '';
  form.amount.value = order?.amount || '';
  form.status.value = order?.status || 'pending';
  form.notes.value = order?.notes || '';

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('order-modal').classList.add('hidden');
  editingId = null;
}

window.editOrder = (id) => {
  const order = allOrders.find(o => o.id === id);
  if (order) openModal(order);
};

window.deleteOrderHandler = async (id) => {
  const ok = await showConfirm('Delete Order', 'Are you sure you want to delete this order? This cannot be undone.');
  if (!ok) return;
  try {
    await deleteOrder(id);
    showToast('Order deleted', 'success');
    allOrders = allOrders.filter(o => o.id !== id);
    applyFilters();
  } catch {
    showToast('Failed to delete order', 'error');
  }
};

// Form submit
document.getElementById('order-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    customerName: form.customerName.value.trim(),
    product: form.product.value.trim(),
    amount: parseFloat(form.amount.value) || 0,
    status: form.status.value,
    notes: form.notes.value.trim(),
  };

  showLoading(editingId ? 'Updating order...' : 'Adding order...');
  try {
    if (editingId) {
      await updateOrder(editingId, data);
      showToast('Order updated!', 'success');
    } else {
      await addOrder(data);
      showToast('Order added!', 'success');
    }
    closeModal();
    await loadOrders();
  } catch (err) {
    showToast('Failed to save order', 'error');
  } finally {
    hideLoading();
  }
});

// Export CSV
document.getElementById('export-csv')?.addEventListener('click', () => {
  if (!filteredOrders.length) { showToast('No data to export', 'warning'); return; }
  const headers = ['ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'];
  const rows = filteredOrders.map(o => [
    o.id.slice(-6).toUpperCase(),
    o.customerName || '',
    o.product || '',
    o.amount || 0,
    o.status || '',
    formatDate(o.createdAt),
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  downloadBlob(csv, 'orders.csv', 'text/csv');
  showToast('CSV exported!', 'success');
});

// Export Excel (XLSX via simple CSV with .xls mime)
document.getElementById('export-excel')?.addEventListener('click', () => {
  if (!filteredOrders.length) { showToast('No data to export', 'warning'); return; }
  const headers = ['ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'];
  const rows = filteredOrders.map(o => [
    o.id.slice(-6).toUpperCase(),
    o.customerName || '',
    o.product || '',
    o.amount || 0,
    o.status || '',
    formatDate(o.createdAt),
  ]);
  // Simple HTML table → Excel-compatible format
  const table = `<table><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
  downloadBlob(table, 'orders.xls', 'application/vnd.ms-excel');
  showToast('Excel file exported!', 'success');
});

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Sort headers
document.querySelectorAll('[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (sortConfig.key === key) {
      sortConfig.dir = sortConfig.dir === 'asc' ? 'desc' : 'asc';
    } else {
      sortConfig.key = key;
      sortConfig.dir = 'asc';
    }
    applyFilters();
  });
});

// Filter controls
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', debounce(() => {
    filters.search = searchInput.value;
    applyFilters();
  }));
}

document.getElementById('status-filter')?.addEventListener('change', (e) => {
  filters.status = e.target.value;
  applyFilters();
});

document.getElementById('date-from')?.addEventListener('change', (e) => {
  filters.dateFrom = e.target.value;
  applyFilters();
});

document.getElementById('date-to')?.addEventListener('change', (e) => {
  filters.dateTo = e.target.value;
  applyFilters();
});

document.getElementById('add-order-btn')?.addEventListener('click', () => openModal());
document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
document.getElementById('order-modal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

loadOrders();
