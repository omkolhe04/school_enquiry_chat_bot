/**
 * config/database.js
 * Supabase (Postgres) client + startup connection check
 *
 * Uses the service_role key — this must ONLY ever run on the server.
 * Never send SUPABASE_SERVICE_ROLE_KEY to the browser.
 */

const { createClient } = require('@supabase/supabase-js');

let client = null;

function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

const connectDB = async () => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('intents').select('id', { head: true, count: 'exact' });
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        throw new Error('Tables not found. Run supabase/schema.sql in the Supabase SQL Editor first.');
      }
      throw new Error(error.message);
    }
    console.log(`✅  Supabase Connected: ${new URL(process.env.SUPABASE_URL).host}`);
  } catch (error) {
    console.error('❌  Supabase connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.getSupabase = getSupabase;
