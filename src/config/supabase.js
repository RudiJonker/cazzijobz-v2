import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ewvilqjqtbxcmwomhzxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dmlscWpxdGJ4Y213b21oenhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjIyMjEsImV4cCI6MjA4OTQ5ODIyMX0.zLBCtMFkBkYp-88QOmHMmsZNirbqSMLihkQvVVoIrwg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);