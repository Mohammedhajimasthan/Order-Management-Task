// Authentication module
import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { showToast } from './ui.js';

const googleProvider = new GoogleAuthProvider();

// Check auth state — redirect if not logged in
export function requireAuth(redirectTo = '/index.html') {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = redirectTo;
      } else {
        resolve(user);
      }
    });
  });
}

// Redirect to dashboard if already logged in
export function redirectIfLoggedIn(redirectTo = '/dashboard.html') {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = redirectTo;
  });
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signupWithEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
  window.location.href = '/index.html';
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Populate user info in navbar
export function populateUserNav(user) {
  const nameEls = document.querySelectorAll('#user-name');
  const avatarUrl = user.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=6366f1&color=fff`;

  nameEls.forEach(el => el.textContent = user.displayName || user.email);

  document.querySelectorAll('#user-avatar, #user-avatar-top').forEach(img => {
    img.src = avatarUrl;
  });
}
