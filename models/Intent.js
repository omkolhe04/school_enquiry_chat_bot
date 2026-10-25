/**
 * models/Intent.js
 * Data access for NLP intents (Supabase table: intents)
 *
 * Rows are returned in the same camelCase shape the old Mongoose model used
 * (including `_id`), so the admin panel and NLP service work unchanged.
 */

const { getSupabase } = require('../config/database');

const TABLE      = 'intents';
const CATEGORIES = ['admissions', 'academics', 'fees', 'campus', 'contact', 'events', 'general'];
const UUID_RE    = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class ValidationError extends Error {
  constructor(message, code) { super(message); this.name = 'ValidationError'; this.code = code; }
}

// ── Row ↔ API mapping ─────────────────────────────────────────────────────────
function toApi(row) {
  if (!row) return null;
  return {
    _id:             row.id,
    id:              row.id,
    intentName:      row.intent_name,
    displayName:     row.display_name,
    category:        row.category,
    trainingPhrases: row.training_phrases || [],
    responses:       row.responses || [],
    keywords:        row.keywords || [],
    entities:        row.entities || [],
    isActive:        row.is_active,
    hitCount:        row.hit_count,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

const toStrArray = (v) =>
  (Array.isArray(v) ? v : typeof v === 'string' ? v.split('\n') : [])
    .map(s => String(s).trim()).filter(Boolean);

/** Validate & convert API body → DB row. `partial` = only touch provided fields (updates). */
function toRow(body = {}, { partial = false } = {}) {
  const row = {};
  const has = (k) => body[k] !== undefined;

  if (!partial || has('intentName')) {
    const name = String(body.intentName || '').trim().toLowerCase();
    if (!name) throw new ValidationError('Intent name is required');
    row.intent_name = name;
  }
  if (!partial || has('displayName')) {
    const dn = String(body.displayName || '').trim();
    if (!dn) throw new ValidationError('Display name is required');
    row.display_name = dn;
  }
  if (!partial || has('category')) {
    const cat = body.category || 'general';
    if (!CATEGORIES.includes(cat)) throw new ValidationError(`Invalid category "${cat}"`);
    row.category = cat;
  }
  if (!partial || has('trainingPhrases')) {
    const tp = toStrArray(body.trainingPhrases);
    if (!tp.length) throw new ValidationError('At least one training phrase is required');
    row.training_phrases = tp;
  }
  if (!partial || has('responses')) {
    const rs = toStrArray(body.responses);
    if (!rs.length) throw new ValidationError('At least one response is required');
    row.responses = rs;
  }
  if (!partial || has('keywords'))  row.keywords = toStrArray(body.keywords);
  if (!partial || has('entities'))  row.entities = toStrArray(body.entities);
  if (has('isActive'))              row.is_active = Boolean(body.isActive);
  if (has('hitCount'))              row.hit_count = parseInt(body.hitCount, 10) || 0;
  return row;
}

function raise(error) {
  if (error.code === '23505') throw new ValidationError('Intent name already exists.', 11000);
  if (error.code === '23514') throw new ValidationError(error.message);
  throw new Error(error.message);
}

// ── Queries ───────────────────────────────────────────────────────────────────
async function list({ category } = {}) {
  let q = getSupabase().from(TABLE).select('*')
    .order('category', { ascending: true })
    .order('intent_name', { ascending: true });
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  if (error) raise(error);
  return data.map(toApi);
}

async function findActive() {
  const { data, error } = await getSupabase().from(TABLE).select('*').eq('is_active', true);
  if (error) raise(error);
  return data.map(toApi);
}

async function findById(id) {
  if (!UUID_RE.test(String(id))) return null;
  const { data, error } = await getSupabase().from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) raise(error);
  return toApi(data);
}

async function create(body) {
  const { data, error } = await getSupabase().from(TABLE).insert(toRow(body)).select().single();
  if (error) raise(error);
  return toApi(data);
}

async function insertMany(bodies) {
  const { data, error } = await getSupabase().from(TABLE).insert(bodies.map(b => toRow(b))).select();
  if (error) raise(error);
  return data.map(toApi);
}

async function update(id, body) {
  if (!UUID_RE.test(String(id))) return null;
  const row = toRow(body, { partial: true });
  if (!Object.keys(row).length) return findById(id);
  const { data, error } = await getSupabase().from(TABLE).update(row).eq('id', id).select().maybeSingle();
  if (error) raise(error);
  return toApi(data);
}

async function remove(id) {
  if (!UUID_RE.test(String(id))) return null;
  const { data, error } = await getSupabase().from(TABLE).delete().eq('id', id).select().maybeSingle();
  if (error) raise(error);
  return toApi(data);
}

async function deleteAll() {
  const { error } = await getSupabase().from(TABLE).delete().not('id', 'is', null);
  if (error) raise(error);
}

async function toggle(id) {
  const intent = await findById(id);
  if (!intent) return null;
  return update(id, { isActive: !intent.isActive });
}

async function incrementHit(id) {
  if (!UUID_RE.test(String(id))) return;
  const { error } = await getSupabase().rpc('increment_intent_hit', { p_id: id });
  if (error) raise(error);
}

module.exports = {
  CATEGORIES, ValidationError,
  list, findActive, findById, create, insertMany, update, remove, deleteAll, toggle, incrementHit,
};
