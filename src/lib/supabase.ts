import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ualrfvbnwhvhrswlguea.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbHJmdmJud2h2aHJzd2xndWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyODc3NDMsImV4cCI6MjA5OTg2Mzc0M30.t9_lOmpVqEnavHnnmlXBWnHZe2FCdoRz5Qh1T_4G9Xs';

// Sanitize URL by removing trailing slash and /rest/v1 path segments if present
if (supabaseUrl) {
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
