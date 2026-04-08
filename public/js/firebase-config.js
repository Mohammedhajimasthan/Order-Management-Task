// Firebase Configuration
// Replace these values with your Firebase project credentials
// Get them from: https://console.firebase.google.com → Project Settings → Your apps

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyAtYtX1hA45appwb7lNI1Vny_prlL63Igw",
  authDomain: "order-management-d88a7.firebaseapp.com",
  projectId: "order-management-d88a7",
  storageBucket: "order-management-d88a7.firebasestorage.app",
  messagingSenderId: "920331090407",
  appId: "1:920331090407:web:3a8cdb0236bc6ce5e26542",
  measurementId: "G-0N3J28H6Y9"
};

// Initialize Firebase (avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };

// VAPID Key for FCM push notifications
// Get from Firebase Console → Project Settings → Cloud Messaging
export const VAPID_KEY = "YOUR_VAPID_KEY";
