/**
 * models/LiveChat.js
 * Data access for live chat sessions between students and admins
 * (Supabase tables: live_chats, live_chat_messages)
 */

const { getSupabase } = require('../config/database');

const TABLE        = 'live_chats';
const WITH_MSGS    = '*, live_chat_messages(*)';

function messageToApi(m) {
  return {
    sender:     m.sender,
    senderName: m.sender_name,
    text:       m.text,
    timestamp:  m.timestamp,
    isRead:     m.is_read,
    lang:       m.lang,
  };
}

function toApi(row) {
  if (!row) return null;
  const out = {
    _id:               row.id,
    roomId:            row.room_id,
    sessionId:         row.session_id,
    studentSocketId:   row.student_socket_id,
    studentId:         row.student_id,
    studentName:       row.student_name,
    adminSocketId:     row.admin_socket_id,
    adminId:           row.admin_id,
    adminName:         row.admin_name,
    status:            row.status,
    language:          row.language,
    subject:           row.subject,
    triggerMessage:    row.trigger_message,
    triggerConfidence: row.trigger_confidence,
    queuedAt:          row.queued_at,
    acceptedAt:        row.accepted_at,
    closedAt:          row.closed_at,
    rating:            row.rating,
    feedback:          row.feedback,
    unreadByAdmin:     row.unread_by_admin,
    unreadByStudent:   row.unread_by_student,
    createdAt:         row.created_at,
    updatedAt:         row.updated_at,
  };
  if (row.live_chat_messages) out.messages = row.live_chat_messages.map(messageToApi);
  return out;
}

const FIELD_MAP = {
  status: 'status', adminSocketId: 'admin_socket_id', adminId: 'admin_id', adminName: 'admin_name',
  acceptedAt: 'accepted_at', closedAt: 'closed_at', rating: 'rating', feedback: 'feedback',
  unreadByAdmin: 'unread_by_admin', unreadByStudent: 'unread_by_student',
};
function fieldsToRow(fields) {
  const row = {};
  for (const [k, v] of Object.entries(fields)) {
    if (FIELD_MAP[k]) row[FIELD_MAP[k]] = v instanceof Date ? v.toISOString() : v;
  }
  return row;
}

const orderMsgs = (q) => q.order('id', { referencedTable: 'live_chat_messages', ascending: true });
const check = ({ data, error, count }) => { if (error) throw new Error(error.message); return { data, count }; };

// ── Writes ────────────────────────────────────────────────────────────────────
async function create(fields, firstMessage) {
  const sb = getSupabase();
  const { data: chat } = check(await sb.from(TABLE).insert({
    room_id:            fields.roomId,
    session_id:         fields.sessionId,
    student_socket_id:  fields.studentSocketId,
    student_id:         fields.studentId || 'anonymous',
    student_name:       fields.studentName || 'Student',
    language:           fields.language || 'en',
    trigger_message:    fields.triggerMessage || '',
    trigger_confidence: fields.triggerConfidence || 0,
    status:             'queued',
  }).select().single());

  if (firstMessage) await addMessage(chat.room_id, firstMessage);
  return findByRoomId(chat.room_id);
}

async function addMessage(roomId, { sender, senderName, text, lang = 'en' }) {
  check(await getSupabase().rpc('add_live_chat_message', {
    p_room_id: roomId, p_sender: sender, p_sender_name: senderName, p_text: text, p_lang: lang,
  }));
}

/**
 * Update a session. `onlyIfStatus` makes it conditional (e.g. accept only
 * while still queued, so two admins can't grab the same chat). Returns null
 * when no row matched.
 */
async function updateByRoomId(roomId, fields, { onlyIfStatus } = {}) {
  let q = getSupabase().from(TABLE).update(fieldsToRow(fields)).eq('room_id', roomId);
  if (onlyIfStatus) q = q.eq('status', onlyIfStatus);
  const { data } = check(await q.select().maybeSingle());
  return toApi(data);
}

// ── Reads ─────────────────────────────────────────────────────────────────────
async function findByRoomId(roomId) {
  const { data } = check(await orderMsgs(
    getSupabase().from(TABLE).select(WITH_MSGS).eq('room_id', roomId)
  ).maybeSingle());
  return toApi(data);
}

async function getQueue() {
  const { data } = check(await getSupabase().from(TABLE)
    .select('id, room_id, student_name, trigger_message, trigger_confidence, queued_at, language')
    .eq('status', 'queued')
    .order('queued_at', { ascending: true }));
  return data.map(r => ({
    _id: r.id, roomId: r.room_id, studentName: r.student_name, triggerMessage: r.trigger_message,
    triggerConfidence: r.trigger_confidence, queuedAt: r.queued_at, language: r.language,
  }));
}

async function getActiveChats() {
  const { data } = check(await orderMsgs(getSupabase().from(TABLE).select(WITH_MSGS)
    .eq('status', 'active')
    .order('accepted_at', { ascending: false })));
  return data.map(toApi);
}

async function list({ status, page = 1, limit = 20 } = {}) {
  const from = (page - 1) * limit;
  let q = getSupabase().from(TABLE).select(WITH_MSGS, { count: 'exact' });
  if (status) q = q.eq('status', status);
  const { data, count } = check(await orderMsgs(q.order('created_at', { ascending: false }))
    .range(from, from + limit - 1));
  return { chats: data.map(toApi), total: count || 0 };
}

async function countByStatus(status) {
  let q = getSupabase().from(TABLE).select('id', { count: 'exact', head: true });
  if (status) q = q.eq('status', status);
  const { count } = check(await q);
  return count || 0;
}

async function getStats() {
  const [total, queued, active, closed] = await Promise.all([
    countByStatus(), countByStatus('queued'), countByStatus('active'), countByStatus('closed'),
  ]);
  return { total, queued, active, closed };
}

module.exports = {
  create, addMessage, updateByRoomId,
  findByRoomId, getQueue, getActiveChats, list, getStats,
};
