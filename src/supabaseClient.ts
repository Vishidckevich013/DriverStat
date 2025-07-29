import { createClient } from '@supabase/supabase-js';


// TODO: Замените SUPABASE_URL на ваш Project URL из Supabase Project Settings
const SUPABASE_URL = 'https://rftloskzqqmrvuqiafaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGxvc2t6cXFtcnZ1cWlhZmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjYwMTYsImV4cCI6MjA2OTQwMjAxNn0.6thCOCx0FggiZkJpi9k-dcYofhrnRWoh9w3NTOIY_b0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
