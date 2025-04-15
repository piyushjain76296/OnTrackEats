// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://hyyjiakuepbsloaeqdsf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eWppYWt1ZXBic2xvYWVxZHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NTEwOTEsImV4cCI6MjA2MDEyNzA5MX0.0iTJ1zFl6lqgSJFr9hvtxqkKa1SZ0IIGdC8TGnWKTh4';
export const supabase = createClient(supabaseUrl, supabaseKey);
