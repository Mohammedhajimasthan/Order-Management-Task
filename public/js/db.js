// Firestore database operations
import { db } from './firebase-config.js';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ─── Orders ────────────────────────────────────────────────────────────────

export async function addOrder(orderData) {
  return addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateOrder(id, data) {
  return updateDoc(doc(db, 'orders', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteOrder(id) {
  return deleteDoc(doc(db, 'orders', id));
}

export async function getOrders(filters = {}) {
  let q = collection(db, 'orders');
  const constraints = [orderBy('createdAt', 'desc')];

  if (filters.status) constraints.unshift(where('status', '==', filters.status));
  if (filters.limit)  constraints.push(limit(filters.limit));

  q = query(q, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeOrders(callback, filters = {}) {
  let q = collection(db, 'orders');
  const constraints = [orderBy('createdAt', 'desc')];
  if (filters.status) constraints.unshift(where('status', '==', filters.status));
  q = query(q, ...constraints);
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

// ─── Support Tickets ───────────────────────────────────────────────────────

export async function addTicket(ticketData) {
  return addDoc(collection(db, 'tickets'), {
    ...ticketData,
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTicket(id, data) {
  return updateDoc(doc(db, 'tickets', id), { ...data, updatedAt: serverTimestamp() });
}

export async function getTickets(userId = null) {
  let q = collection(db, 'tickets');
  const constraints = [orderBy('createdAt', 'desc')];
  if (userId) constraints.unshift(where('userId', '==', userId));
  q = query(q, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeTickets(userId, callback) {
  const constraints = [orderBy('createdAt', 'desc')];
  if (userId) constraints.unshift(where('userId', '==', userId));
  const q = query(collection(db, 'tickets'), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ─── User Profile / Settings ───────────────────────────────────────────────

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveUserProfile(uid, data) {
  return setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const orders = await getOrders();
  const total = orders.length;
  const revenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const pending = orders.filter(o => o.status === 'pending').length;

  // Group by month for chart
  const monthly = {};
  orders.forEach(o => {
    if (!o.createdAt) return;
    const date = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthly[key]) monthly[key] = { orders: 0, revenue: 0 };
    monthly[key].orders += 1;
    if (o.status === 'completed') monthly[key].revenue += Number(o.amount) || 0;
  });

  return { total, revenue, pending, monthly, recentOrders: orders.slice(0, 5) };
}
