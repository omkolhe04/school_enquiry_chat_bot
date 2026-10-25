/**
 * public/js/liveChat.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Feature 3: Live Chat with Admin
 * Handles the student-side live chat panel UI + socket events
 * ─────────────────────────────────────────────────────────────────────────────
 */

const LiveChatUI = (() => {

  // ── State ──────────────────────────────────────────────────────────────────
  let isOpen        = false;
  let isConnected   = false;
  let isQueued      = false;
  let currentRoomId = null;
  let socketRef     = null;
  let sessionIdRef  = null;
  let typingTimer   = null;
  let ratingGiven   = false;

  // ── Panel HTML template (injected into page) ───────────────────────────────
  function _createPanel() {
    const panel = document.createElement('div');
    panel.id    = 'live-chat-panel';
    panel.innerHTML = `
      <!-- Live Chat Floating Panel -->
      <div class="lc-overlay" id="lc-overlay"></div>
      <div class="lc-panel" id="lc-panel">
        <!-- Header -->
        <div class="lc-header">
          <div class="lc-header-info">
            <div class="lc-header-avatar">👨‍💼</div>
            <div class="lc-header-text">
              <strong id="lc-admin-name">School Support</strong>
              <span class="lc-status-badge" id="lc-status-badge">
                <span class="lc-status-dot"></span>
                <span id="lc-status-text">Connecting…</span>
              </span>
            </div>
          </div>
          <div class="lc-header-actions">
            <button id="lc-end-btn" class="lc-btn-end" title="End Chat" style="display:none">
              ✕ End Chat
            </button>
            <button id="lc-close-btn" class="lc-btn-close" title="Minimise">⬇</button>
          </div>
        </div>

        <!-- Queue notice -->
        <div class="lc-queue-notice" id="lc-queue-notice">
          <div class="lc-queue-spinner"></div>
          <p id="lc-queue-msg">Connecting you to an available admin…</p>
          <small id="lc-queue-pos"></small>
        </div>

        <!-- Messages -->
        <div class="lc-messages" id="lc-messages"></div>

        <!-- Typing indicator -->
        <div class="lc-typing-indicator" id="lc-typing-ind" style="display:none">
          <span></span><span></span><span></span>
          <small>Admin is typing…</small>
        </div>

        <!-- Input -->
        <div class="lc-input-bar" id="lc-input-bar" style="display:none">
          <input id="lc-input" type="text" placeholder="Type your message…" maxlength="500" autocomplete="off"/>
          <button id="lc-send-btn" class="lc-send" aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <!-- Rating panel (shown on chat end) -->
        <div class="lc-rating-panel" id="lc-rating-panel" style="display:none">
          <p>How was your experience?</p>
          <div class="lc-stars" id="lc-stars">
            <button data-val="1">⭐</button>
            <button data-val="2">⭐</button>
            <button data-val="3">⭐</button>
            <button data-val="4">⭐</button>
            <button data-val="5">⭐</button>
          </div>
          <input id="lc-feedback" type="text" placeholder="Optional feedback…" maxlength="200"/>
          <button id="lc-submit-rating" class="lc-btn-rate">Submit Rating</button>
        </div>
      </div>

      <!-- Floating trigger button -->
      <button class="lc-trigger" id="lc-trigger-btn" title="Chat with Admin" style="display:none">
        <span class="lc-trigger-icon">💬</span>
        <span class="lc-trigger-label">Admin Help</span>
        <span class="lc-badge" id="lc-badge" style="display:none">!</span>
      </button>
    `;
    document.body.appendChild(panel);
  }

  // ── Init live chat (called from chat.js) ───────────────────────────────────
  function init(socket, sessionId) {
    socketRef    = socket;
    sessionIdRef = sessionId;

    _createPanel();
    _bindEvents();
    _bindSocketEvents();

    console.log('[LiveChat] UI initialised');
  }

  // ── Show the live chat trigger button ─────────────────────────────────────
  function showTrigger(triggerMsg = '', triggerConf = 0) {
    const triggerBtn = document.getElementById('lc-trigger-btn');
    const badge      = document.getElementById('lc-badge');
    if (triggerBtn) {
      triggerBtn.style.display = 'flex';
      triggerBtn.dataset.triggerMsg  = triggerMsg;
      triggerBtn.dataset.triggerConf = triggerConf;
      if (badge) badge.style.display = 'flex';
    }
  }

  // ── Open / close panel ─────────────────────────────────────────────────────
  function openPanel() {
    const panel   = document.getElementById('lc-panel');
    const overlay = document.getElementById('lc-overlay');
    if (panel)   panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
    isOpen = true;
    const badge = document.getElementById('lc-badge');
    if (badge) badge.style.display = 'none';
  }

  function closePanel() {
    const panel   = document.getElementById('lc-panel');
    const overlay = document.getElementById('lc-overlay');
    if (panel)   panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    isOpen = false;
  }

  // ── Request a live chat session ────────────────────────────────────────────
  function requestChat() {
    if (!socketRef || isQueued || isConnected) return;
    const triggerBtn  = document.getElementById('lc-trigger-btn');
    const triggerMsg  = triggerBtn?.dataset.triggerMsg  || '';
    const triggerConf = parseFloat(triggerBtn?.dataset.triggerConf || 0);
    const lang        = typeof Translation !== 'undefined' ? Translation.getLang() : 'en';

    socketRef.emit('request_live_chat', {
      sessionId:        sessionIdRef,
      studentName:      'Student',
      language:         lang,
      triggerMessage:   triggerMsg,
      triggerConfidence: triggerConf,
    });

    isQueued = true;
    _setStatus('queued', 'Queued — waiting for admin…');
    _showQueueNotice('Waiting for an available admin…');
    _addSystemMsg('🕐 Connecting you to a support agent. Please wait…');
    document.getElementById('lc-end-btn').style.display = 'inline-flex';
  }

  // ── Send a live message ────────────────────────────────────────────────────
  function sendLiveMessage() {
    const input = document.getElementById('lc-input');
    const text  = input?.value.trim();
    if (!text || !currentRoomId) return;
    input.value = '';

    const lang = typeof Translation !== 'undefined' ? Translation.getLang() : 'en';
    socketRef.emit('live_chat_message', { roomId: currentRoomId, text, lang });
    _addMessage('student', 'You', text, new Date());
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────
  function _addMessage(sender, name, text, timestamp) {
    const msgsEl  = document.getElementById('lc-messages');
    if (!msgsEl) return;

    const isAdmin  = sender === 'admin';
    const isSystem = sender === 'system';
    const time     = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isSystem) {
      msgsEl.innerHTML += `
        <div class="lc-msg-system">
          <span>${_esc(text)}</span>
        </div>`;
    } else {
      msgsEl.innerHTML += `
        <div class="lc-msg ${isAdmin ? 'admin' : 'student'}">
          <div class="lc-msg-avatar">${isAdmin ? '👨‍💼' : '🧑'}</div>
          <div class="lc-msg-body">
            <div class="lc-msg-name">${_esc(name)}</div>
            <div class="lc-msg-bubble">${_esc(text)}</div>
            <div class="lc-msg-time">${time}</div>
          </div>
        </div>`;
    }

    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function _addSystemMsg(text) {
    _addMessage('system', '', text, new Date());
  }

  function _setStatus(state, label) {
    const badge = document.getElementById('lc-status-badge');
    const text  = document.getElementById('lc-status-text');
    if (text)  text.textContent = label;
    if (badge) badge.className  = `lc-status-badge ${state}`;
  }

  function _showQueueNotice(msg, pos = '') {
    const notice = document.getElementById('lc-queue-notice');
    const msgEl  = document.getElementById('lc-queue-msg');
    const posEl  = document.getElementById('lc-queue-pos');
    if (notice) notice.style.display = 'flex';
    if (msgEl)  msgEl.textContent  = msg;
    if (posEl)  posEl.textContent  = pos ? `Queue position: ${pos}` : '';
  }

  function _hideQueueNotice() {
    const notice = document.getElementById('lc-queue-notice');
    if (notice) notice.style.display = 'none';
  }

  function _showInputBar() {
    const bar = document.getElementById('lc-input-bar');
    if (bar) bar.style.display = 'flex';
    setTimeout(() => document.getElementById('lc-input')?.focus(), 100);
  }

  function _esc(str) {
    return (str || '').toString()
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Bind DOM events ────────────────────────────────────────────────────────
  function _bindEvents() {
    // Trigger button → open panel + request chat
    document.getElementById('lc-trigger-btn')?.addEventListener('click', () => {
      openPanel();
      if (!isQueued && !isConnected) requestChat();
    });

    // Close/minimise button
    document.getElementById('lc-close-btn')?.addEventListener('click', closePanel);

    // Overlay click → close
    document.getElementById('lc-overlay')?.addEventListener('click', closePanel);

    // End chat button
    document.getElementById('lc-end-btn')?.addEventListener('click', () => {
      if (!currentRoomId) return;
      if (confirm('Are you sure you want to end the chat?')) {
        socketRef.emit('end_live_chat', { roomId: currentRoomId });
      }
    });

    // Send button
    document.getElementById('lc-send-btn')?.addEventListener('click', sendLiveMessage);

    // Enter key in input
    document.getElementById('lc-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendLiveMessage();
      }
    });

    // Typing indicator emit
    document.getElementById('lc-input')?.addEventListener('input', () => {
      if (!currentRoomId) return;
      socketRef.emit('live_typing', { roomId: currentRoomId, isTyping: true });
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        socketRef.emit('live_typing', { roomId: currentRoomId, isTyping: false });
      }, 2000);
    });

    // Star rating
    document.querySelectorAll('.lc-stars button').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val);
        document.querySelectorAll('.lc-stars button').forEach((b, i) => {
          b.classList.toggle('active', i < val);
        });
        document.getElementById('lc-stars').dataset.selected = val;
      });
    });

    // Submit rating
    document.getElementById('lc-submit-rating')?.addEventListener('click', async () => {
      if (ratingGiven) return;
      const rating   = parseInt(document.getElementById('lc-stars')?.dataset.selected || 0);
      const feedback = document.getElementById('lc-feedback')?.value || '';
      if (rating < 1) {
        alert('Please select a rating (1–5 stars)');
        return;
      }
      ratingGiven = true;
      try {
        await fetch(`/api/livechat/session/${currentRoomId}/rate`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ rating, feedback }),
        });
      } catch (_) {}
      document.getElementById('lc-rating-panel').style.display = 'none';
      _addSystemMsg(`⭐ Thank you for your ${rating}-star rating!`);
    });
  }

  // ── Bind socket events ─────────────────────────────────────────────────────
  function _bindSocketEvents() {
    if (!socketRef) return;

    socketRef.on('live_chat_queued', ({ roomId, position, message }) => {
      currentRoomId = roomId;
      _showQueueNotice(message, position);
    });

    socketRef.on('admin_joined', ({ adminName, message }) => {
      isConnected = true;
      isQueued    = false;
      _hideQueueNotice();
      _showInputBar();
      _setStatus('active', `${adminName} — Online`);
      document.getElementById('lc-admin-name').textContent = adminName;
      _addSystemMsg(`✅ ${message}`);
    });

    socketRef.on('live_message_received', ({ sender, senderName, text, timestamp }) => {
      if (sender !== 'student') { // we already added student messages locally
        _addMessage(sender, senderName, text, timestamp);
      }
    });

    socketRef.on('live_typing_indicator', ({ isTyping, sender }) => {
      if (sender === 'admin') {
        const ind = document.getElementById('lc-typing-ind');
        if (ind) ind.style.display = isTyping ? 'flex' : 'none';
      }
    });

    socketRef.on('live_chat_ended', ({ message, closedBy }) => {
      isConnected   = false;
      isQueued      = false;
      _setStatus('closed', 'Chat Ended');
      _hideQueueNotice();
      _addSystemMsg(`🔚 ${message}`);
      document.getElementById('lc-input-bar').style.display  = 'none';
      document.getElementById('lc-end-btn').style.display    = 'none';
      // Show rating panel
      if (!ratingGiven) {
        document.getElementById('lc-rating-panel').style.display = 'block';
      }
    });

    socketRef.on('live_chat_error', ({ message }) => {
      _addSystemMsg(`❌ ${message}`);
      _setStatus('error', 'Error');
    });

    socketRef.on('student_disconnected', () => {
      _addSystemMsg('⚠️ Connection issue. Reconnecting…');
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return { init, showTrigger, openPanel, closePanel };
})();