import { createClient } from '@supabase/supabase-js';

// Utiliser les variables d'environnement ou des valeurs codées en dur si non disponibles
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dakdtlxvqnulezhcqgzy.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha2R0bHh2cW51bGV6aGNxZ3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTQ4MzYsImV4cCI6MjA2MzkzMDgzNn0.WSvl7hTDPSr4JCxkRvo-WtZgeldFyJJpR8s_EdON1LE';

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);