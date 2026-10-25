/**
 * public/js/voiceChat.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Feature 1: Voice Chat — Web Speech API (SpeechRecognition)
 *
 * Flow:
 *   User clicks 🎤 → starts recognition → speech → text
 *   → auto-fills input → triggers send → bot responds
 * ─────────────────────────────────────────────────────────────────────────────
 */

const VoiceChat = (() => {
  // ── State ──────────────────────────────────────────────────────────────────
  let recognition      = null;
  let isListening      = false;
  let silenceTimer     = null;
  let onTranscriptCb   = null;  // callback when final transcript ready
  let onStatusChangeCb = null;  // callback for UI status updates

  // ── Browser support check ──────────────────────────────────────────────────
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const isSupported = () => !!SpeechRecognition;

  // ── Initialise SpeechRecognition ───────────────────────────────────────────
  function init(options = {}) {
    if (!SpeechRecognition) {
      console.warn('[VoiceChat] Web Speech API not supported in this browser.');
      return false;
    }

    recognition = new SpeechRecognition();

    recognition.continuous      = false;    // stop after first pause
    recognition.interimResults  = true;     // show partial results live
    recognition.maxAlternatives = 1;
    recognition.lang            = options.lang || 'en-IN';  // default Indian English

    // ── Event handlers ───────────────────────────────────────────────────────

    recognition.onstart = () => {
      isListening = true;
      console.log('[VoiceChat] Listening started');
      _statusChange('listening', 'Listening… speak now 🎙️');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript   = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim (partial) transcript live in input
      if (interimTranscript) {
        _statusChange('processing', `Hearing: "${interimTranscript}"`);
        if (onTranscriptCb) onTranscriptCb(interimTranscript, false); // interim
      }

      // Final transcript ready → send
      if (finalTranscript) {
        console.log(`[VoiceChat] Final: "${finalTranscript}"`);
        _statusChange('done', `Recognised: "${finalTranscript}"`);
        if (onTranscriptCb) onTranscriptCb(finalTranscript.trim(), true); // final
      }
    };

    recognition.onspeechend = () => {
      // Small delay to catch last words
      silenceTimer = setTimeout(() => stop(), 800);
    };

    recognition.onend = () => {
      isListening = false;
      clearTimeout(silenceTimer);
      console.log('[VoiceChat] Recognition ended');
      _statusChange('idle', '');
    };

    recognition.onerror = (event) => {
      isListening = false;
      clearTimeout(silenceTimer);
      console.error('[VoiceChat] Error:', event.error);

      const errorMessages = {
        'no-speech':          'No speech detected. Please try again.',
        'audio-capture':      'Microphone not found. Check your device.',
        'not-allowed':        'Microphone permission denied. Please allow microphone access.',
        'network':            'Network error. Check your connection.',
        'aborted':            '',
        'service-not-allowed':'Speech service not allowed.',
      };

      const msg = errorMessages[event.error] || `Voice error: ${event.error}`;
      if (msg) _statusChange('error', msg);
    };

    return true;
  }

  // ── Start listening ────────────────────────────────────────────────────────
  function start(langCode = 'en-IN') {
    if (!SpeechRecognition) {
      _statusChange('error', 'Voice input is not supported in your browser. Try Chrome or Edge.');
      return false;
    }

    if (isListening) {
      stop();
      return false;
    }

    // Map language codes to BCP-47 tags for SpeechRecognition
    const langMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };

    if (!recognition) init({ lang: langMap[langCode] || langCode });
    else recognition.lang = langMap[langCode] || langCode;

    try {
      recognition.start();
      return true;
    } catch (e) {
      console.error('[VoiceChat] start error:', e);
      _statusChange('error', 'Could not start voice recognition. Refresh and try again.');
      return false;
    }
  }

  // ── Stop listening ─────────────────────────────────────────────────────────
  function stop() {
    clearTimeout(silenceTimer);
    if (recognition && isListening) {
      try { recognition.stop(); } catch (_) {}
    }
    isListening = false;
  }

  // ── Register callbacks ─────────────────────────────────────────────────────
  function onTranscript(cb)    { onTranscriptCb   = cb; }
  function onStatusChange(cb)  { onStatusChangeCb = cb; }

  // ── Internal helpers ───────────────────────────────────────────────────────
  function _statusChange(state, message) {
    if (onStatusChangeCb) onStatusChangeCb(state, message);
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    isSupported,
    init,
    start,
    stop,
    onTranscript,
    onStatusChange,
    get listening() { return isListening; },
  };
})();