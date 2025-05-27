import { createClient } from '@supabase/supabase-js';

// Vérifier si nous sommes en environnement de développement
const isDevelopment = process.env.NODE_ENV === 'development';

// Charger les variables d'environnement depuis le fichier .env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Vérifier que les valeurs sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement Supabase ne sont pas définies dans le fichier .env');
  console.error('Assurez-vous que le fichier .env est présent et contient les variables REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY');
  
  if (isDevelopment) {
    console.error('En développement, vous pouvez copier le fichier .env.example en .env');
  }
}

// Créer le client Supabase
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');