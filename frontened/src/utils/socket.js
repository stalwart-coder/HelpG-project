import { io } from 'socket.io-client';
import { getAccessToken } from './apiClient';

let socket = null;
const listeners = new Map();

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

export function getSocket() {
  if (socket) return socket;

  const token = getAccessToken() || localStorage.getItem('helpji_token');

  socket = io(SOCKET_URL, {
    auth: { token },
    query: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1500,
  });

  socket.on('connect', () => {
    // Re-register any pending rooms or subscriptions
    listeners.forEach((cbs, event) => {
      cbs.forEach((cb) => socket.on(event, cb));
    });
  });

  socket.on('connect_error', (err) => {
    // Graceful fallback for offline / mock testing
    console.debug('Socket connection notice:', err?.message || err);
  });

  return socket;
}

export function connectSocket(token) {
  if (socket) {
    if (token) socket.auth = { token };
    socket.connect();
    return socket;
  }
  return getSocket();
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Register helper online presence and GPS coordinates
 */
export function emitHelperStatus(statusData) {
  const s = getSocket();
  if (s) {
    s.emit('helper:status', statusData);
  }
}

/**
 * Helper live GPS transmission (used for Uber-style live driver tracking)
 */
export function emitHelperLocation({ lat, lng, bookingId, speed, heading }) {
  const s = getSocket();
  if (s) {
    s.emit('helper:location:update', { lat, lng, bookingId, speed, heading });
  }
}

/**
 * Customer scans radar for nearby helpers
 */
export function scanRadar(coords) {
  return new Promise((resolve) => {
    const s = getSocket();
    if (!s || !s.connected) {
      resolve({ helpers: [] });
      return;
    }
    s.emit('radar:scan', coords, (res) => {
      resolve(res || { helpers: [] });
    });
  });
}

/**
 * Join live booking tracking room
 */
export function joinBookingRoom(bookingId) {
  const s = getSocket();
  if (s && bookingId) {
    s.emit('booking:join', bookingId);
  }
}

export function leaveBookingRoom(bookingId) {
  const s = getSocket();
  if (s && bookingId) {
    s.emit('booking:leave', bookingId);
  }
}

/**
 * Listen for new incoming tasks (helper radar)
 */
export function onNewTask(callback) {
  const s = getSocket();
  if (!s) return () => {};
  s.on('task:available:new', callback);
  return () => s.off('task:available:new', callback);
}

/**
 * Listen for booking status changes (e.g. accepted, on_way, arrived, completed)
 */
export function onBookingUpdate(callback) {
  const s = getSocket();
  if (!s) return () => {};
  s.on('booking:status_change', callback);
  return () => s.off('booking:status_change', callback);
}

/**
 * Listen for real-time helper coordinates during active booking
 */
export function onHelperLocation(callback) {
  const s = getSocket();
  if (!s) return () => {};
  s.on('booking:helper_location', callback);
  return () => s.off('booking:helper_location', callback);
}

/**
 * Listen for updates to online helpers on customer radar
 */
export function onNearbyHelpers(callback) {
  const s = getSocket();
  if (!s) return () => {};
  s.on('helper:nearby_update', callback);
  return () => s.off('helper:nearby_update', callback);
}

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
  emitHelperStatus,
  emitHelperLocation,
  scanRadar,
  joinBookingRoom,
  leaveBookingRoom,
  onNewTask,
  onBookingUpdate,
  onHelperLocation,
  onNearbyHelpers,
};
