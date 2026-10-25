/**
 * models/ChatLog.js
 * Data access for bot chat sessions (Supabase tables: chat_logs, chat_messages)
 */

const { getSupabase } = require('../config/database');

function sessionToApi(row) {
  return {
    _id:           row.id,
    sessionId:     row.session_id,
    userId:        row.user_id,
    totalMessages: row.total_messages,
    resolvedCount: row.resolved_count,
    fallbackCount: row.fallback_count,
    lastActivity:  row.last_activity,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
}

function messageToApi(m) {
  return {
    role:       m.role,
    text:       m.text,
    timestamp:  m.timestamp,
    intent:     m.intent,
    confidence: m.confidence,
    entities:   m.entities || [],
  };
}

/** Record one user message + bot reply, creating the session if needed. */
async function logExchange({ sessionId, userId = 'anonymous', userText, nlpResult }) {
  const { error } = await getSupabase().rpc('log_chat_exchange', {
    p_session_id:  sessionId,
    p_user_id:     userId,
    p_user_text:   userText,
    p_bot_text:    nlpResult.response,
    p_intent:      nlpResult.intent ?? null,
    p_confidence:  nlpResult.confidence ?? null,
    p_entities:    nlpResult.entities || [],
    p_is_fallback: Boolean(nlpResult.isFallback),
  });
  if (error) throw new Error(error.message);
}

/** Session with its messages (oldest first), or null. */
async function findBySessionId(sessionId) {
  const { data, error } = await getSupabase()
    .from('chat_logs')
    .select('*, chat_messages(*)')
    .eq('session_id', sessionId)
    .order('id', { referencedTable: 'chat_messages', ascending: true })
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...sessionToApi(data), messages: (data.chat_messages || []).map(messageToApi) };
}

async function listSessions({ page = 1, limit = 20 } = {}) {
  const from = (page - 1) * limit;
  const { data, error, count } = await getSupabase()
    .from('chat_logs')
    .select('*', { count: 'exact' })
    .order('last_activity', { ascending: false })
    .range(from, from + limit - 1);
  if (error) throw new Error(error.message);
  return { sessions: data.map(sessionToApi), total: count || 0 };
}

async function getTotals() {
  const { data, error } = await getSupabase().rpc('chat_stats');
  if (error) throw new Error(error.message);
  const t = (Array.isArray(data) ? data[0] : data) || {};
  return {
    totalSessions: Number(t.total_sessions || 0),
    totalMessages: Number(t.total_messages || 0),
    totalResolved: Number(t.total_resolved || 0),
    totalFallback: Number(t.total_fallback || 0),
  };
}

module.exports = { logExchange, findBySessionId, listSessions, getTotals };
