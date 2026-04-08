// Support tickets page logic
import { requireAuth, populateUserNav } from './auth.js';
import { addTicket, updateTicket, getTickets } from './db.js';
import { showToast, showLoading, hideLoading, formatDate, statusBadge, initDarkMode, initSidebar } from './ui.js';

initDarkMode();
const user = await requireAuth();
populateUserNav(user);
initSidebar();

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  const { logout } = await import('./auth.js');
  logout();
});

let tickets = [];

async function loadTickets() {
  showLoading('Loading tickets...');
  try {
    tickets = await getTickets(user.uid);
    renderTickets();
  } catch {
    showToast('Failed to load tickets', 'error');
  } finally {
    hideLoading();
  }
}

function renderTickets() {
  const container = document.getElementById('tickets-list');
  if (!container) return;

  if (tickets.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-slate-500 dark:text-slate-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <p>No support tickets yet. Create your first ticket above.</p>
      </div>`;
    return;
  }

  container.innerHTML = tickets.map(t => `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 transition-all hover:shadow-md">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-xs font-mono text-slate-400">#${t.id.slice(-6).toUpperCase()}</span>
            ${statusBadge(t.status || 'open')}
            <span class="text-xs text-slate-400">${formatDate(t.createdAt)}</span>
          </div>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-1">${escHtml(t.subject || 'No subject')}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">${escHtml(t.message || '')}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          ${t.status !== 'closed' ? `
            <button onclick="updateTicketStatus('${t.id}', 'in-progress')" class="text-xs px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors" title="Mark In Progress">In Progress</button>
            <button onclick="updateTicketStatus('${t.id}', 'closed')" class="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Close</button>
          ` : `
            <button onclick="updateTicketStatus('${t.id}', 'open')" class="text-xs px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 transition-colors">Reopen</button>
          `}
        </div>
      </div>
    </div>
  `).join('');
}

window.updateTicketStatus = async (id, status) => {
  try {
    await updateTicket(id, { status });
    showToast(`Ticket marked as ${status}`, 'success');
    tickets = tickets.map(t => t.id === id ? { ...t, status } : t);
    renderTickets();
  } catch {
    showToast('Failed to update ticket', 'error');
  }
};

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// New ticket form
document.getElementById('ticket-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();

  if (!subject || !message) return;

  showLoading('Submitting ticket...');
  try {
    await addTicket({ subject, message, userId: user.uid, userName: user.displayName || user.email });
    showToast('Ticket submitted!', 'success');
    form.reset();
    await loadTickets();
  } catch {
    showToast('Failed to submit ticket', 'error');
  } finally {
    hideLoading();
  }
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-btn');
  const content = item.querySelector('.faq-content');
  const icon = item.querySelector('.faq-icon');

  btn?.addEventListener('click', () => {
    const isOpen = !content.classList.contains('hidden');
    // Close all
    document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = '');
    // Open clicked
    if (!isOpen) {
      content.classList.remove('hidden');
      if (icon) icon.style.transform = 'rotate(180deg)';
    }
  });
});

loadTickets();
