import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  
  // Log the first few characters for debugging (without exposing secrets)
  if (supabaseUrl) {
    console.log('📍 Supabase URL:', supabaseUrl.substring(0, 30) + '...');
  }
  if (supabaseServiceKey) {
    console.log('🔑 Service Key length:', supabaseServiceKey.length);
  }
  
  throw new Error('Missing Supabase environment variables');
}

// Configure Supabase client for backend usage with service role key
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

console.log('✅ Supabase client initialized successfully');
console.log('📍 URL:', supabaseUrl.substring(0, 30) + '...');
console.log('🔑 Service key configured:', !!supabaseServiceKey); 