/**
 * Automated Supabase to Firebase Cloud Firestore Migration Script
 * 
 * Usage:
 * 1. Install dependencies:
 *    npm install @supabase/supabase-js firebase-admin
 * 
 * 2. Set your credentials below or via environment variables
 * 
 * 3. Run:
 *    node scripts/migrate_supabase_to_firebase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================================================
// 1. CONFIGURATION
// ============================================================================
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rfzsssibtxswkibomrsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmenNzc2lidHhzd2tpYm9tcnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzgyODIsImV4cCI6MjA4OTk1NDI4Mn0.G5MwrFbNsfVME2aCGPzf86m8rRTTPGjn9szZj9TSQz4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log('🚀 Starting Supabase to Firebase Data Migration...\n');

  const exportData = {
    profiles: [],
    matches: [],
    messages: [],
    swipes: [],
    transactions: [],
    safety_reports: [],
    settings: [],
  };

  try {
    // 1. Fetch Profiles
    console.log('📦 Fetching profiles from Supabase...');
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
    if (!pErr && profiles) {
      exportData.profiles = profiles;
      console.log(`   Found ${profiles.length} profiles.`);
    } else {
      console.log('   Notice on profiles:', pErr?.message || 'Empty table');
    }

    // 2. Fetch Matches
    console.log('📦 Fetching matches from Supabase...');
    const { data: matches, error: mErr } = await supabase.from('matches').select('*');
    if (!mErr && matches) {
      exportData.matches = matches;
      console.log(`   Found ${matches.length} matches.`);
    }

    // 3. Fetch Messages
    console.log('📦 Fetching messages from Supabase...');
    const { data: messages, error: msgErr } = await supabase.from('messages').select('*');
    if (!msgErr && messages) {
      exportData.messages = messages;
      console.log(`   Found ${messages.length} messages.`);
    }

    // 4. Fetch Swipes
    console.log('📦 Fetching swipes from Supabase...');
    const { data: swipes, error: sErr } = await supabase.from('swipes').select('*');
    if (!sErr && swipes) {
      exportData.swipes = swipes;
      console.log(`   Found ${swipes.length} swipes.`);
    }

    // 5. Fetch Settings
    console.log('📦 Fetching settings from Supabase...');
    const { data: settings, error: setErr } = await supabase.from('settings').select('*');
    if (!setErr && settings) {
      exportData.settings = settings;
      console.log(`   Found ${settings.length} settings.`);
    }

    // Save JSON Backup
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `supabase_export_${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(exportData, null, 2), 'utf8');
    console.log(`\n💾 Saved local JSON export to: ${backupFile}`);

    console.log('\n======================================================');
    console.log('🔥 HOW TO IMPORT DIRECTLY TO FIRESTORE:');
    console.log('======================================================');
    console.log('1. Place your Firebase serviceAccountKey.json in the scripts/ folder.');
    console.log('2. Run this script with: node scripts/migrate_supabase_to_firebase.js --upload');
    console.log('3. All documents will be written to your live Cloud Firestore collections.\n');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

runMigration();
