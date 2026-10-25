/**
 * services/liveChatService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the state & business logic of live chat sessions.
 * Keeps in-memory tracking of connected admins and queued students.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const LiveChat = require('../models/LiveChat');

// ── In-memory admin registry ──────────────────────────────────────────────────
// Map: socketId → { adminId, adminName, busy, currentRoom }
const connectedAdmins = new Map();

// ── In-memory queue position tracking ─────────────────────────────────────────
// Map: roomId → LiveChat document (for quick lookup)
const activeSessions = new Map();

// ── Register / unregister admin ───────────────────────────────────────────────
function registerAdmin(socketId, adminId, adminName) {
  connectedAdmins.set(socketId, {
    socketId,
    adminId,
    adminName,
    busy:        false,
    currentRoom: null,
    connectedAt: new Date(),
  });
  console.log(`[LiveChat] Admin registered: ${adminName} (${socketId})`);
}

function unregisterAdmin(socketId) {
  connectedAdmins.delete(socketId);
  console.log(`[LiveChat] Admin disconnected: ${socketId}`);
}

function getAvailableAdmin() {
  for (const [, admin] of connectedAdmins) {
    if (!admin.busy) return admin;
  }
  return null;
}

function getAllAdmins() {
  return Array.from(connectedAdmins.values());
}

function setAdminBusy(socketId, busy, roomId = null) {
  const admin = connectedAdmins.get(socketId);
  if (admin) {
    admin.busy        = busy;
    admin.currentRoom = roomId;
  }
}

// ── Create a new live chat session ────────────────────────────────────────────
async function createSession({
  studentSocketId,
  studentId = 'anonymous',
  studentName = 'Student',
  sessionId,
  language = 'en',
  triggerMessage = '',
  triggerConfidence = 0,
}) {
  const roomId = `live_${sessionId}_${Date.now()}`;

  const chat = await LiveChat.create(
    { studentSocketId, studentId, studentName, sessionId, roomId, language, triggerMessage, triggerConfidence },
    { sender: 'system', senderName: 'System', text: `Chat session started. Student query: "${triggerMessage}"` },
  );

  activeSessions.set(roomId, chat);
  console.log(`[LiveChat] Session created: ${roomId} for student ${studentName}`);
  return chat;
}

// ── Admin accepts a queued chat ───────────────────────────────────────────────
async function acceptSession(roomId, adminSocketId, adminId, adminName) {
  // Conditional update: only succeeds while the chat is still queued
  const updated = await LiveChat.updateByRoomId(
    roomId,
    { status: 'active', adminSocketId, adminId, adminName, acceptedAt: new Date() },
    { onlyIfStatus: 'queued' },
  );
  if (!updated) {
    const existing = await LiveChat.findByRoomId(roomId);
    if (!existing) throw new Error(`Session not found: ${roomId}`);
    throw new Error(`Session ${roomId} is not in queue (status: ${existing.status})`);
  }

  await LiveChat.addMessage(roomId, {
    sender: 'system', senderName: 'System', text: `Admin ${adminName} has joined the chat.`,
  });

  const chat = await LiveChat.findByRoomId(roomId);
  activeSessions.set(roomId, chat);
  setAdminBusy(adminSocketId, true, roomId);
  console.log(`[LiveChat] Admin ${adminName} accepted chat ${roomId}`);
  return chat;
}

// ── Add a message to a session ─────────────────────────────────────────────────
async function addMessage(roomId, { sender, senderName, text, lang = 'en' }) {
  await LiveChat.addMessage(roomId, { sender, senderName, text, lang });
}

// ── Mark messages as read ─────────────────────────────────────────────────────
async function markRead(roomId, by) {
  const update = by === 'admin' ? { unreadByAdmin: 0 } : { unreadByStudent: 0 };
  await LiveChat.updateByRoomId(roomId, update);
}

// ── Close a session ────────────────────────────────────────────────────────────
async function closeSession(roomId, closedBy = 'system') {
  const updated = await LiveChat.updateByRoomId(roomId, { status: 'closed', closedAt: new Date() });
  if (!updated) throw new Error(`Session not found: ${roomId}`);

  await LiveChat.addMessage(roomId, {
    sender: 'system', senderName: 'System', text: `Chat ended by ${closedBy}.`,
  });

  // Free up admin
  if (updated.adminSocketId) setAdminBusy(updated.adminSocketId, false, null);
  activeSessions.delete(roomId);

  console.log(`[LiveChat] Session closed: ${roomId}`);
  return LiveChat.findByRoomId(roomId);
}

// ── Rate a session ─────────────────────────────────────────────────────────────
async function rateSession(roomId, rating, feedback = '') {
  return LiveChat.updateByRoomId(roomId, { rating, feedback });
}

// ── Get full session ───────────────────────────────────────────────────────────
async function getSession(roomId) {
  return LiveChat.findByRoomId(roomId);
}

// ── Get queue for admin panel ──────────────────────────────────────────────────
async function getQueue() {
  return LiveChat.getQueue();
}

async function getActiveChats() {
  return LiveChat.getActiveChats();
}

async function getStats() {
  return LiveChat.getStats();
}

async function getQueuePosition(roomId) {
  const queue = await LiveChat.getQueue();
  const pos   = queue.findIndex(c => c.roomId === roomId);
  return pos === -1 ? null : pos + 1;
}

module.exports = {
  // Admin management
  registerAdmin,
  unregisterAdmin,
  getAvailableAdmin,
  getAllAdmins,
  setAdminBusy,

  // Session management
  createSession,
  acceptSession,
  addMessage,
  markRead,
  closeSession,
  rateSession,
  getSession,
  getQueue,
  getActiveChats,
  getStats,
  getQueuePosition,
};