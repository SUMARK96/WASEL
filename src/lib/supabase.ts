import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://khoyvkawvajkgcqngnwv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob3l2a2F3dmFqa2djcW5nbnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NDAzNTcsImV4cCI6MjEwMzIxNjM1N30.haZ_9up6kRDlE4SZ6MCV1vdM52newbSl9AvUdZCFFog';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('placeholder'));
};

