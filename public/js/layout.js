// Shared layout: sidebar + navbar HTML injection
export function renderLayout(activePage) {
  const navItems = [
    { id: 'dashboard', href: '/dashboard.html', label: 'Dashboard', icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>` },
    { id: 'orders',    href: '/orders.html',   label: 'Orders',    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>` },
    { id: 'support',   href: '/support.html',  label: 'Support',   icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>` },
    { id: 'settings',  href: '/settings.html', label: 'Settings',  icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>` },
  ];

  const navHTML = navItems.map(item => `
    <a href="${item.href}" class="nav-link ${item.id === activePage ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-xl mx-2 text-sm font-medium transition-all hover:bg-white/10 ${item.id === activePage ? 'text-indigo-400' : 'text-slate-300 hover:text-white'}">
      <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
      ${item.label}
    </a>
  `).join('');

  return `
    <!-- Mobile overlay -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-20 hidden lg:hidden"></div>

    <!-- Sidebar -->
    <aside id="sidebar" class="fixed top-0 left-0 h-full w-64 bg-slate-900 dark:bg-slate-950 flex flex-col z-30 transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
      <!-- Brand -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <div>
          <p class="text-white font-semibold text-sm leading-tight">Admin Panel</p>
          <p class="text-slate-400 text-xs">Management System</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 space-y-1 overflow-y-auto">
        <p class="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Main Menu</p>
        ${navHTML}
      </nav>

      <!-- User + Logout -->
      <div class="border-t border-slate-700/50 p-4">
        <div class="flex items-center gap-3 mb-3">
          <img id="user-avatar" src="" alt="Avatar" class="w-9 h-9 rounded-full object-cover bg-slate-700" />
          <div class="flex-1 min-w-0">
            <p id="user-name" class="text-sm font-medium text-white truncate">Loading...</p>
            <p class="text-xs text-slate-400">Administrator</p>
          </div>
        </div>
        <button id="logout-btn"
          class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main wrapper -->
    <div class="lg:ml-64 flex flex-col min-h-screen">
      <!-- Top navbar -->
      <header class="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-3">
            <button id="sidebar-toggle" class="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <h2 id="page-title" class="text-lg font-semibold text-slate-900 dark:text-white capitalize">${activePage}</h2>
          </div>
          <div class="flex items-center gap-2">
            <!-- Dark mode toggle -->
            <button id="topbar-dark-toggle" class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors" title="Toggle dark mode">
              <svg class="w-5 h-5 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
              <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </button>
            <!-- Avatar -->
            <img id="user-avatar" src="" alt="Avatar" class="w-9 h-9 rounded-full object-cover bg-slate-200 cursor-pointer border-2 border-white dark:border-slate-700 shadow-sm" onclick="window.location.href='/settings.html'" />
          </div>
        </div>
      </header>
      <!-- Page content goes here -->
  `;
}
