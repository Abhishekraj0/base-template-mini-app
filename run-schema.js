// Simple script to run the Supabase schema
// You can copy and paste the SQL from supabase-setup.sql into your Supabase SQL Editor

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSchema() {
  try {
    console.log('🚀 Running Supabase schema setup...');
    
    // Read the SQL file
    const sql = fs.readFileSync('supabase-setup.sql', 'utf8');
    
    console.log('📋 SQL Schema loaded from supabase-setup.sql');
    console.log('\n⚠️  Please copy and paste the following SQL into your Supabase SQL Editor:');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/nfpodetepyhzwkzfeqtc/sql');
    console.log('\n' + '='.repeat(80));
    console.log(sql);
    console.log('='.repeat(80));
    console.log('\n✅ After running the SQL, your database will be ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runSchema();