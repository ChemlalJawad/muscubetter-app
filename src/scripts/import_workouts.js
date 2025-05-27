// Script pour importer les programmes d'entraînement dans Supabase
// Exécuter avec: node import_workouts.js
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Vérifier les variables d'environnement
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.error('Erreur: Variables d\'environnement REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY requises');
  process.exit(1);
}

// Initialiser le client Supabase
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Lire le fichier SQL
const sqlFilePath = path.join(__dirname, 'workout_program_insert.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Diviser le fichier SQL en requêtes individuelles
const queries = sqlContent
  .split(';')
  .map(query => query.trim())
  .filter(query => query.length > 0);

// Fonction pour exécuter les requêtes SQL
async function executeQueries() {
  console.log(`Exécution de ${queries.length} requêtes SQL...`);
  
  try {
    // Vérifier la connexion à Supabase
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erreur de connexion à Supabase:', error.message);
      return;
    }
    console.log('Connexion à Supabase établie avec succès');

    // Exécuter les requêtes une par une
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`Exécution de la requête ${i + 1}/${queries.length}...`);
      
      // Exécuter la requête SQL brute
      const { error } = await supabase.rpc('execute_sql', { sql_query: query + ';' });
      
      if (error) {
        console.error(`Erreur lors de l'exécution de la requête ${i + 1}:`, error.message);
        console.error('Requête problématique:', query);
      } else {
        console.log(`Requête ${i + 1} exécutée avec succès`);
      }
    }
    
    console.log('Importation terminée!');
  } catch (error) {
    console.error('Erreur lors de l\'exécution des requêtes:', error.message);
  }
}

// Exécuter les requêtes
executeQueries();
