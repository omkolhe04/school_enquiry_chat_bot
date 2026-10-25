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

  const chat = new LiveChat({
    studentSocketId,
    studentId,
    studentName,
    sessionId,
    roomId,
    language,
    triggerMessage,
    triggerConfidence,
    status: 'queued',
    messages: [
      {
        sender:     'system',
        senderName: 'System',
        text:       `Chat session started. Student query: "${triggerMessage}"`,
        timestamp:  new Date(),
      },
    ],
  });

  await chat.save();
  activeSessions.set(roomId, chat);
  console.log(`[LiveChat] Session created: ${roomId} for student ${studentName}`);
  return chat;
}

// ── Admin accepts a queued chat ───────────────────────────────────────────────
async function acceptSession(roomId, adminSocketId, adminId, adminName) {
  const chat = await LiveChat.findOne({ roomId });
  if (!chat) throw new Error(`Session not found: ${roomId}`);
  if (chat.status !== 'queued') throw new Error(`Session ${roomId} is not in queue (status: ${chat.status})`);

  chat.status         = 'active';
  chat.adminSocketId  = adminSocketId;
  chat.adminId        = adminId;
  chat.adminName      = adminName;
  chat.acceptedAt     = new Date();
  chat.messages.push({
    sender:     'system',
    senderName: 'System',
    text:       `Admin ${adminName} has joined the chat.`,
    timestamp:  new Date(),
  });

  await chat.save();
  activeSessions.set(roomId, chat);
  setAdminBusy(adminSocketId, true, roomId);
  console.log(`[LiveChat] Admin ${adminName} accepted chat ${roomId}`);
  return chat;
}

// ── Add a message to a session ─────────────────────────────────────────────────
async function addMessage(roomId, { sender, senderName, text, lang = 'en' }) {
  const chat = await LiveChat.findOne({ roomId });
  if (!chat) throw new Error(`Session not found: ${roomId}`);

  chat.messages.push({ sender, senderName, text, timestamp: new Date(), lang });

  if (sender === 'student') chat.unreadByAdmin   += 1;
  if (sender === 'admin')   chat.unreadByStudent += 1;

  await chat.save();
  return chat;
}

// ── Mark messages as read ─────────────────────────────────────────────────────
async function markRead(roomId, by) {
  const update = by === 'admin'
    ? { unreadByAdmin: 0 }
    : { unreadByStudent: 0 };

  await LiveChat.findOneAndUpdate({ roomId }, update);
}

// ── Close a session ────────────────────────────────────────────────────────────
async function closeSession(roomId, closedBy = 'system') {
  const chat = await LiveChat.findOne({ roomId });
  if (!chat) throw new Error(`Session not found: ${roomId}`);

  chat.status   = 'closed';
  chat.closedAt = new Date();
  chat.messages.push({
    sender:     'system',
    senderName: 'System',
    text:       `Chat ended by ${closedBy}.`,
    timestamp:  new Date(),
  });

  await chat.save();

  // Free up admin
  if (chat.adminSocketId) setAdminBusy(chat.adminSocketId, false, null);
  activeSessions.delete(roomId);

  console.log(`[LiveChat] Session closed: ${roomId}`);
  return chat;
}

// ── Rate a session ─────────────────────────────────────────────────────────────
async function rateSession(roomId, rating, feedback = '') {
  return LiveChat.findOneAndUpdate(
    { roomId },
    { rating, feedback },
    { new: true }
  );
}

// ── Get full session ───────────────────────────────────────────────────────────
async function getSession(roomId) {
  return LiveChat.findOne({ roomId }).lean();
}

// ── Get queue for admin panel ──────────────────────────────────────────────────
async function getQueue() {
  return LiveChat.find({ status: 'queued' })
    .sort({ queuedAt: 1 })
    .select('roomId studentName triggerMessage triggerConfidence queuedAt language')
    .lean();
}

async function getActiveChats() {
  return LiveChat.find({ status: 'active' })
    .sort({ acceptedAt: -1 })
    .lean();
}

async function getStats() {
  return LiveChat.getStats();
}

async function getQueuePosition(roomId) {
  const queue = await LiveChat.find({ status: 'queued' }).sort({ queuedAt: 1 }).lean();
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