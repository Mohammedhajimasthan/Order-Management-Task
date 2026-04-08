// Settings page logic
import { requireAuth, populateUserNav, getCurrentUser } from './auth.js';
import { getUserProfile, saveUserProfile } from './db.js';
import { uploadLogo } from './storage.js';
import { requestNotificationPermission } from './notifications.js';
import { showToast, showLoading, hideLoading, toggleDarkMode, initDarkMode, initSidebar } from './ui.js';
import { updateProfile, updateEmail, updatePassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { auth } from './firebase-config.js';

initDarkMode();
const user = await requireAuth();
populateUserNav(user);
initSidebar();

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  const { logout } = await import('./auth.js');
  logout();
});

// Load profile
async function loadProfile() {
  const profile = await getUserProfile(user.uid);

  document.getElementById('profile-name').value = user.displayName || '';
  document.getElementById('profile-email').value = user.email || '';

  if (profile?.logoUrl) {
    const img = document.getElementById('logo-preview');
    if (img) { img.src = profile.logoUrl; img.classList.remove('hidden'); }
  }

  if (profile?.bio) document.getElementById('profile-bio').value = profile.bio;
  if (profile?.company) document.getElementById('profile-company').value = profile.company;

  // Dark mode toggle sync
  const darkToggle = document.getElementById('dark-mode-toggle');
  if (darkToggle) {
    darkToggle.checked = document.documentElement.classList.contains('dark');
  }
}

// Profile form
document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const displayName = form.querySelector('#profile-name').value.trim();
  const bio = form.querySelector('#profile-bio')?.value.trim() || '';
  const company = form.querySelector('#profile-company')?.value.trim() || '';

  showLoading('Saving profile...');
  try {
    await updateProfile(auth.currentUser, { displayName });
    await saveUserProfile(user.uid, { displayName, bio, company, email: user.email });
    populateUserNav(auth.currentUser);
    showToast('Profile updated!', 'success');
  } catch (err) {
    showToast('Failed to update profile: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
});

// Password form
document.getElementById('password-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const newPass = form.querySelector('#new-password').value;
  const confirm = form.querySelector('#confirm-password').value;

  if (newPass !== confirm) { showToast('Passwords do not match', 'error'); return; }
  if (newPass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

  showLoading('Updating password...');
  try {
    await updatePassword(auth.currentUser, newPass);
    showToast('Password updated!', 'success');
    form.reset();
  } catch (err) {
    showToast('Failed to update password: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
});

// Logo upload
document.getElementById('logo-upload')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast('File size must be under 5MB', 'error'); return; }

  const progressBar = document.getElementById('upload-progress');
  const progressFill = document.getElementById('upload-progress-fill');
  const progressText = document.getElementById('upload-progress-text');

  if (progressBar) progressBar.classList.remove('hidden');

  try {
    const url = await uploadLogo(user.uid, file, (pct) => {
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressText) progressText.textContent = pct + '%';
    });

    const img = document.getElementById('logo-preview');
    if (img) { img.src = url; img.classList.remove('hidden'); }
    showToast('Logo uploaded!', 'success');
  } catch (err) {
    showToast('Upload failed: ' + err.message, 'error');
  } finally {
    if (progressBar) progressBar.classList.add('hidden');
  }
});

// Dark mode toggle
document.getElementById('dark-mode-toggle')?.addEventListener('change', (e) => {
  const isDark = toggleDarkMode();
  showToast(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'info', 2000);
});

// Enable notifications
document.getElementById('enable-notifications')?.addEventListener('click', async () => {
  await requestNotificationPermission();
});

loadProfile();
