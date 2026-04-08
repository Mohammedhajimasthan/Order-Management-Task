// Firebase Cloud Messaging Service Worker
// Place this file at the root of your site: /firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Must match firebase-config.js
firebase.initializeApp({
  apiKey: "AIzaSyAtYtX1hA45appwb7lNI1Vny_prlL63Igw",
  authDomain: "order-management-d88a7.firebaseapp.com",
  projectId: "order-management-d88a7",
  storageBucket: "order-management-d88a7.firebasestorage.app",
  messagingSenderId: "920331090407",
  appId: "1:920331090407:web:3a8cdb0236bc6ce5e26542",
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'New Notification', {
    body: body || '',
    icon: icon || '/favicon.ico',
    badge: '/favicon.ico',
  });
});
