/**
 * database/seed.js
 * Seed the Supabase database with the school enquiry intents
 * (from data/schoolIntents.js). Replaces all existing intents.
 * Run: node database/seed.js
 */

require('dotenv').config();
const Intent   = require('../models/Intent');

const INTENTS = require('../data/schoolIntents');

async function seed() {
  try {
    console.log('✅  Using Supabase project:', process.env.SUPABASE_URL);

    // Clear existing intents
    await Intent.deleteAll();
    console.log('🗑️   Cleared existing intents');

    // Insert all intents
    const inserted = await Intent.insertMany(INTENTS);
    console.log(`🌱  Seeded ${inserted.length} intents successfully!\n`);

    // Display summary
    const categories = {};
    INTENTS.forEach(({ category }) => {
      categories[category] = (categories[category] || 0) + 1;
    });
    console.log('📊  Intent distribution:');
    Object.entries(categories).forEach(([cat, count]) =>
      console.log(`    ${cat.padEnd(12)} : ${count} intents`)
    );

    console.log('\n✨  Database seeded! Run "npm start" to launch the chatbot.');
  } catch (err) {
    console.error('❌  Seed failed:', err.message || err);
    process.exitCode = 1;
  }
}

seed();
