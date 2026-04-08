// Firebase Cloud Messaging — browser push notifications
import { app, VAPID_KEY } from './firebase-config.js';
import { showToast } from './ui.js';

let messaging = null;

async function getMessaging() {
  if (messaging) return messaging;
  try {
    const { getMessaging: _getMessaging } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js'
    );
    messaging = _getMessaging(app);
    return messaging;
  } catch (e) {
    console.warn('Firebase Messaging not available:', e.message);
    return null;
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('Notifications not supported in this browser', 'warning');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    showToast('Notification permission denied', 'warning');
    return null;
  }

  try {
    const msg = await getMessaging();
    if (!msg) return null;
    const { getToken } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js'
    );
    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });
    console.log('FCM Token:', token);
    showToast('Push notifications enabled!', 'success');
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    showToast('Could not enable push notifications', 'error');
    return null;
  }
}

export async function onForegroundMessage(callback) {
  try {
    const msg = await getMessaging();
    if (!msg) return;
    const { onMessage } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js'
    );
    onMessage(msg, callback);
  } catch (e) {
    console.warn('FCM foreground listener error:', e);
  }
}

// Show a local browser notification
export function showLocalNotification(title, body, icon = '/favicon.ico') {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon });
  }
}
