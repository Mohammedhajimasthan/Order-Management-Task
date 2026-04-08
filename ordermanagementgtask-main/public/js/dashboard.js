// Dashboard page logic
import { requireAuth, populateUserNav } from './auth.js';
import { getDashboardStats } from './db.js';
import { showToast, formatCurrency, formatDate, statusBadge, initDarkMode, initSidebar } from './ui.js';

initDarkMode();

const user = await requireAuth();
populateUserNav(user);
initSidebar();

// Logout button
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  const { logout } = await import('./auth.js');
  logout();
});

async function loadDashboard() {
  try {
    const stats = await getDashboardStats();

    // KPI Cards
    document.getElementById('stat-total-orders').textContent = stats.total;
    document.getElementById('stat-revenue').textContent = formatCurrency(stats.revenue);
    document.getElementById('stat-pending').textContent = stats.pending;

    // Recent orders table
    const tbody = document.getElementById('recent-orders-body');
    if (tbody) {
      if (stats.recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No orders yet</td></tr>';
      } else {
        tbody.innerHTML = stats.recentOrders.map(o => `
          <tr class="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">#${o.id.slice(-6).toUpperCase()}</td>
            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">${o.customerName || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">${formatCurrency(o.amount || 0)}</td>
            <td class="px-6 py-4">${statusBadge(o.status)}</td>
            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">${formatDate(o.createdAt)}</td>
          </tr>
        `).join('');
      }
    }

    // Build chart data from monthly stats
    const sortedMonths = Object.keys(stats.monthly).sort();
    const labels = sortedMonths.map(k => {
      const [y, m] = k.split('-');
      return new Date(+y, +m - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
    });
    const orderCounts = sortedMonths.map(k => stats.monthly[k].orders);
    const revenueData = sortedMonths.map(k => stats.monthly[k].revenue);

    // Fallback demo data if no real data
    const chartLabels = labels.length ? labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const chartOrders = orderCounts.length ? orderCounts : [12, 19, 8, 25, 17, 30];
    const chartRevenue = revenueData.length ? revenueData : [1200, 1900, 800, 2500, 1700, 3000];

    renderOrdersChart(chartLabels, chartOrders);
    renderRevenueChart(chartLabels, chartRevenue);

  } catch (err) {
    console.error('Dashboard load error:', err);
    showToast('Failed to load dashboard data', 'error');
  }
}

function renderOrdersChart(labels, data) {
  const ctx = document.getElementById('orders-chart')?.getContext('2d');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Orders',
        data,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.1)' } },
        x: { grid: { display: false } },
      },
    },
  });
}

function renderRevenueChart(labels, data) {
  const ctx = document.getElementById('revenue-chart')?.getContext('2d');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Revenue ($)',
        data,
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgb(16, 185, 129)',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.1)' } },
        x: { grid: { display: false } },
      },
    },
  });
}

loadDashboard();
