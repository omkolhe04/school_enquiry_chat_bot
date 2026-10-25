/**
 * server.js — v2.0
 * College Chatbot — Main Application Entry Point
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *   · REST API  (chat, admin, live-chat, translation)
 *   · Socket.io real-time (bot chat + LIVE CHAT with admin)
 *   · Multilingual support via Translation Service
 *   · Live Chat escalation when confidence < threshold
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();

const express        = require('express');
const http           = require('http');
const { Server }     = require('socket.io');
const cors           = require('cors');
const path           = require('path');

const connectDB          = require('./config/database');
const chatRoutes         = require('./routes/chat');
const adminRoutes        = require('./routes/admin');
const liveChatRoutes     = require('./routes/liveChat');
const translationRoutes  = require('./routes/translation');

const { classifyIntent }       = require('./services/nlpService');
const { translateToEnglish, translateFromEnglish, detectLanguage } = require('./services/translationService');
const liveChatService          = require('./services/liveChatService');

const ChatLog  = require('./models/ChatLog');

// ─── Configuration ─────────────────────────────────────────────────────────────
const PORT                  = process.env.PORT || 3000;
const LIVE_CHAT_THRESHOLD   = parseFloat(process.env.LIVE_CHAT_THRESHOLD)   || 0.25;
const CONFIDENCE_THRESHOLD  = parseFloat(process.env.CONFIDENCE_THRESHOLD)  || 0.20;

// ─── App setup ─────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout:  60000,
  pingInterval: 25000,
});

app.get("/admin/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "adminChat.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "admin-panel.html"));
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ─── REST Routes ───────────────────────────────────────────────────────────────
app.use('/api/chat',       chatRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/livechat',   liveChatRoutes);
app.use('/api/translate',  translationRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'College Chatbot API v2.0',
    features:  ['nlp', 'voice', 'multilingual', 'live-chat'],
    timestamp: new Date().toISOString(),
  });
});

// ─── Utility ───────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ══════════════════════════════════════════════════════════════════════════════
//  SOCKET.IO EVENT HANDLING
// ══════════════════════════════════════════════════════════════════════════════

io.on('connection', (socket) => {
  console.log(`🔌  Client connected: ${socket.id}`);

  // ────────────────────────────────────────────────────────────────────────────
  // FEATURE A: Standard Bot Chat (with multilingual support)
  // Event: chat_message { message, sessionId, userId?, language? }
  // ────────────────────────────────────────────────────────────────────────────
  socket.on('chat_message', async ({ message, sessionId, userId = 'anonymous', language = 'en' }) => {
    if (!message?.trim() || !sessionId) return;

    try {
      const originalMessage = message.trim();

      // ── Step 1: Translate user input → English (for NLP) ──────────────────
      let englishMessage = originalMessage;
      if (language && language !== 'en') {
        englishMessage = await translateToEnglish(originalMessage, language);
        console.log(`[i18n] ${language} → en: "${originalMessage}" → "${englishMessage}"`);
      }

      // ── Step 2: Run NLP classification ────────────────────────────────────
      const nlpResult = await classifyIntent(englishMessage);

      // ── Step 3: Typing animation ───────────────────────────────────────────
      socket.emit('bot_typing', true);
      await sleep(400 + Math.random() * 500);
      socket.emit('bot_typing', false);

      // ── Step 4: Check if escalation to live chat is needed ─────────────────
      const shouldEscalate = nlpResult.isFallback || nlpResult.confidence < LIVE_CHAT_THRESHOLD;

      // ── Step 5: Translate bot response → user's language ──────────────────
      let responseText = nlpResult.response;
      if (language && language !== 'en') {
        responseText = await translateFromEnglish(nlpResult.response, language);
      }

      // ── Step 6: Emit response ──────────────────────────────────────────────
      socket.emit('bot_response', {
        message:       responseText,
        originalEn:    nlpResult.response,
        intent:        nlpResult.intent,
        displayName:   nlpResult.displayName,
        confidence:    nlpResult.confidence,
        entities:      nlpResult.entities,
        isFallback:    nlpResult.isFallback,
        canEscalate:   shouldEscalate,
        language,
        timestamp:     new Date().toISOString(),
      });

      // ── Step 7: Persist to Supabase ────────────────────────────────────────
      await persistChatLog(sessionId, userId, originalMessage, nlpResult, language);

    } catch (err) {
      console.error('[Socket] chat_message error:', err);
      socket.emit('bot_response', {
        message:    'Sorry, something went wrong. Please try again! 🙏',
        intent:     'error',
        confidence: 0,
        isFallback: true,
        timestamp:  new Date().toISOString(),
      });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // FEATURE B: Request Live Chat (student escalates to human admin)
  // Event: request_live_chat { sessionId, userId?, studentName?, language?, triggerMessage?, triggerConfidence? }
  // ────────────────────────────────────────────────────────────────────────────
  socket.on('request_live_chat', async ({
    sessionId,
    userId        = 'anonymous',
    studentName   = 'Student',
    language      = 'en',
    triggerMessage     = '',
    triggerConfidence  = 0,
  }) => {
    try {
      // Create a queued session in Supabase
      const chat = await liveChatService.createSession({
        studentSocketId: socket.id,
        studentId:       userId,
        studentName,
        sessionId,
        language,
        triggerMessage,
        triggerConfidence,
      });

      // Student joins the live chat room
      socket.join(chat.roomId);
      socket.liveChatRoomId = chat.roomId;

      // Notify the student
      socket.emit('live_chat_queued', {
        roomId:   chat.roomId,
        position: 1,
        message:  'You are now in the queue. An admin will join shortly...',
      });

      // Broadcast new chat request to ALL connected admin sockets
      io.to('admin_room').emit('new_chat_request', {
        roomId:           chat.roomId,
        studentName,
        triggerMessage,
        triggerConfidence,
        language,
        queuedAt:         new Date().toISOString(),
      });

      // Check if an admin is immediately available
      const availableAdmin = liveChatService.getAvailableAdmin();
      if (availableAdmin) {
        io.to('admin_room').emit('admin_alert', {
          type:    'new_chat',
          message: `New chat from ${studentName}`,
          roomId:  chat.roomId,
        });
      }

      console.log(`[LiveChat] Queued: ${chat.roomId} — Student: ${studentName}`);
    } catch (err) {
      console.error('[Socket] request_live_chat error:', err);
      socket.emit('live_chat_error', { message: 'Could not create live chat session. Please try again.' });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // FEATURE B: Admin registers (joins admin_room)
  // Event: admin_register { adminId, adminName, token }
  // ────────────────────────────────────────────────────────────────────────────
  socket.on('admin_register', ({ adminId, adminName, token }) => {
    // Validate token
    const expected = Buffer.from(
      `${process.env.ADMIN_USERNAME || 'admin'}:${process.env.ADMIN_PASSWORD || 'admin123'}`
    ).toString('base64');

    if (token !== expected) {
      socket.emit('admin_auth_error', { message: 'Invalid admin token' });
      return;
    }

    liveChatService.registerAdmin(socket.id, adminId, adminName);
    socket.join('admin_room');
    socket.adminId   = adminId;
    socket.adminName = adminName;
    socket.isAdmin   = true;

    socket.emit('admin_registered', { message: `Welcome, ${adminName}! You are now online.` });

    // Send current queue to new admin
    liveChatService.getQueue().then(queue => {
      socket.emit('chat_queue_update', { queue });
    });

    console.log(`[LiveChat] Admin online: ${adminName} (${socket.id})`);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // FEATURE B: Admin accepts a queued chat
  // Event: admin_accept_chat { roomId }
  // ────────────────────────────────────────────────────────────────────────────
  socket.on('admin_accept_chat', async ({ roomId }) => {
    if (!socket.isAdmin) return;

    try {
      const chat = await liveChatService.acceptSession(
        roomId, socket.id, socket.adminId, socket.adminName
      );

      // Admin joins the room
      socket.join(roomId);
      socket.currentRoom = roomId;

      // Notify the student that admin has joined
      io.to(roomId).emit('admin_joined', {
        adminName: socket.adminName,
        message:   `${socket.adminName} has joined the chat. How can I help you?`,
        roomId,
        timestamp: new Date().toISOString(),
      });

      // Confirm to admin with full chat history
      socket.emit('live_chat_accepted', {
        roomId,
        chat,
        message: `You are now chatting with ${chat.studentName}`,
      });

      // Update queue for all admins
      const queue = await liveChatService.getQueue();
      io.to('admin_room').emit('chat_queue_update', { queue });

      console.log(`[LiveChat] ${socket.adminName} accepted ${roomId}`);
    } catch (err) {
      console.error('[Socket] admin_accept_chat error:', err);
      socket.emit('live_chat_error', { message: err.message });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // FEATURE B: Live chat message (both student and admin)
  // Event: live_chat_message { roomId, text, lang? }
  // ────────────────────────────────────────────────────────────────────────────
  socket.on('live_chat_message', async ({ roomId, text, lang = 'en' }) => {
    if (!roomId || !text?.trim()) return;

    try {
      const isAdmin      = socket.isAdmin === true;
      const sender       = isAdmin ? 'admin' : 'student';
      const senderName   = isAdmin ? (socket.adminName || 'Admin') : 'Student';

      // Persist message
      await liveChatService.addMessage(roomId, { sender, senderName, text: text.trim(), lang });

      // Broadcast to everyone in the room
      io.to(roomId).emit('live_message_received', {
        sender,
        senderName,
        text:      text.trim(),
        lang,
        roomId,
        timestamp: new Date().toISOString(),
        isAdmin,
      });

    } catch (err) {
      console.error('[Socket] live_chat_message error:', err);
      socket.emit('live_chat_error', { message: 'Message could not be sent. Please try again.' });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // FEATURE B: Typing indicator for live chat
  // Event: live_typing { roomId, isTyping }
  // ────────────────────────────────────────────────────────────────────────────
  socket.on('live_typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('live_typing_indicator', {
      isTyping,
      sender: socket.isAdmin ? 'admin' : 'student',
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // FEATURE B: End live chat
  // Event: end_live_chat { roomId }
  // ────────────────────────────────────────────────────────────────────────────
  socket.on('end_live_chat', async ({ roomId }) => {
    try {
      const closer = socket.isAdmin ? (socket.adminName || 'Admin') : 'Student';
      await liveChatService.closeSession(roomId, closer);

      io.to(roomId).emit('live_chat_ended', {
        roomId,
        message:   'The chat has been ended. Thank you!',
        closedBy:  closer,
        timestamp: new Date().toISOString(),
      });

      // Update admin queue
      const queue = await liveChatService.getQueue();
      io.to('admin_room').emit('chat_queue_update', { queue });

      console.log(`[LiveChat] Ended: ${roomId} by ${closer}`);
    } catch (err) {
      console.error('[Socket] end_live_chat error:', err);
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // FEATURE B: Admin sends a note/internal message
  // Event: admin_internal_note { roomId, note }
  // ────────────────────────────────────────────────────────────────────────────
  socket.on('admin_internal_note', async ({ roomId, note }) => {
    if (!socket.isAdmin || !roomId || !note) return;
    await liveChatService.addMessage(roomId, {
      sender:     'system',
      senderName: `Admin Note (${socket.adminName})`,
      text:       `📝 ${note}`,
      lang:       'en',
    });
    // Only visible to admins
    socket.emit('internal_note_saved', { roomId, note });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // DISCONNECT
  // ────────────────────────────────────────────────────────────────────────────
  socket.on('disconnect', async () => {
    console.log(`❌  Client disconnected: ${socket.id}`);

    // If an admin disconnects, close their active chat
    if (socket.isAdmin) {
      liveChatService.unregisterAdmin(socket.id);
      if (socket.currentRoom) {
        try {
          await liveChatService.closeSession(socket.currentRoom, 'Admin disconnected');
          io.to(socket.currentRoom).emit('live_chat_ended', {
            roomId:   socket.currentRoom,
            message:  'Admin disconnected. Chat has ended. You can request a new chat.',
            closedBy: 'system',
          });
        } catch (_) {}
      }
      // Update queue for remaining admins
      const queue = await liveChatService.getQueue();
      io.to('admin_room').emit('chat_queue_update', { queue });
    }

    // If a student disconnects from live chat, notify admin
    if (socket.liveChatRoomId) {
      io.to(socket.liveChatRoomId).emit('live_typing_indicator', { isTyping: false, sender: 'student' });
      socket.to('admin_room').emit('student_disconnected', { roomId: socket.liveChatRoomId });
    }
  });
});

// ─── DB helper ─────────────────────────────────────────────────────────────────
async function persistChatLog(sessionId, userId, message, nlpResult, language) {
  try {
    await ChatLog.logExchange({ sessionId, userId, userText: message, nlpResult });
  } catch (err) {
    console.error('[DB] persistChatLog error:', err.message);
  }
}

// ─── Start server ──────────────────────────────────────────────────────────────
(async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   🎓  College Chatbot Server v2.0 — RUNNING           ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║   🌐  Chat UI       → http://localhost:${PORT}             ║`);
    console.log(`║   🛠️   Admin Panel   → http://localhost:${PORT}/admin       ║`);
    console.log(`║   💬  Admin Chat    → http://localhost:${PORT}/admin/chat   ║`);
    console.log(`║   🔌  API Base      → http://localhost:${PORT}/api         ║`);
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║   ✅  Feature 1: Voice Chat (Web Speech API)          ║');
    console.log('║   ✅  Feature 2: Multilingual (EN / HI / MR)         ║');
    console.log('║   ✅  Feature 3: Live Chat with Admin (Socket.io)     ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
  });
})();

module.exports = { app, server, io };