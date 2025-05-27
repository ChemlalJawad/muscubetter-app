-- Fichier SQL pour créer les procédures stockées dans Supabase
-- Copier et exécuter ces requêtes dans l'éditeur SQL de Supabase

-- Procédure pour créer la table des exercices
CREATE OR REPLACE FUNCTION create_exercise_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer la table des exercices si elle n'existe pas
  CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Débutant', 'Intermédiaire', 'Avancé')),
    equipment TEXT[] DEFAULT '{}',
    muscles_primary TEXT[] DEFAULT '{}',
    muscles_secondary TEXT[] DEFAULT '{}',
    instructions TEXT,
    tips TEXT,
    record NUMERIC,
    record_type TEXT CHECK (record_type IN ('poids', 'répétitions', 'temps', 'distance')),
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Créer un index sur la catégorie pour des recherches plus rapides
  CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
  
  -- Activer RLS (Row Level Security)
  ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
  
  -- Créer une politique pour permettre l'accès public en lecture
  DROP POLICY IF EXISTS "Allow public read access" ON exercises;
  CREATE POLICY "Allow public read access" ON exercises FOR SELECT USING (true);
  
  -- Créer une politique pour permettre l'accès authentifié en écriture
  DROP POLICY IF EXISTS "Allow authenticated insert access" ON exercises;
  CREATE POLICY "Allow authenticated insert access" ON exercises FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
  DROP POLICY IF EXISTS "Allow authenticated update access" ON exercises;
  CREATE POLICY "Allow authenticated update access" ON exercises FOR UPDATE USING (auth.role() = 'authenticated');
END;
$$;

-- Procédure pour créer les tables des programmes d'entraînement
CREATE OR REPLACE FUNCTION create_workout_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer la table des programmes d'entraînement
  CREATE TABLE IF NOT EXISTS workout_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    level TEXT,
    duration_weeks INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Créer la table des entraînements
  CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day TEXT NOT NULL,
    type TEXT NOT NULL,
    program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Créer la table des exercices d'entraînement
  CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight NUMERIC,
    rest_time INTEGER, -- en secondes
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Créer des index pour des recherches plus rapides
  CREATE INDEX IF NOT EXISTS idx_workouts_program_id ON workouts(program_id);
  CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
  
  -- Activer RLS (Row Level Security)
  ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
  
  -- Créer des politiques pour permettre l'accès public en lecture
  DROP POLICY IF EXISTS "Allow public read access" ON workout_programs;
  CREATE POLICY "Allow public read access" ON workout_programs FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Allow public read access" ON workouts;
  CREATE POLICY "Allow public read access" ON workouts FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Allow public read access" ON workout_exercises;
  CREATE POLICY "Allow public read access" ON workout_exercises FOR SELECT USING (true);
  
  -- Créer des politiques pour permettre l'accès authentifié en écriture
  DROP POLICY IF EXISTS "Allow authenticated insert access" ON workout_programs;
  CREATE POLICY "Allow authenticated insert access" ON workout_programs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
  DROP POLICY IF EXISTS "Allow authenticated update access" ON workout_programs;
  CREATE POLICY "Allow authenticated update access" ON workout_programs FOR UPDATE USING (auth.role() = 'authenticated');
  
  DROP POLICY IF EXISTS "Allow authenticated insert access" ON workouts;
  CREATE POLICY "Allow authenticated insert access" ON workouts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
  DROP POLICY IF EXISTS "Allow authenticated update access" ON workouts;
  CREATE POLICY "Allow authenticated update access" ON workouts FOR UPDATE USING (auth.role() = 'authenticated');
  
  DROP POLICY IF EXISTS "Allow authenticated insert access" ON workout_exercises;
  CREATE POLICY "Allow authenticated insert access" ON workout_exercises FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
  DROP POLICY IF EXISTS "Allow authenticated update access" ON workout_exercises;
  CREATE POLICY "Allow authenticated update access" ON workout_exercises FOR UPDATE USING (auth.role() = 'authenticated');
END;
$$;

-- Procédure pour créer les tables des joueurs
CREATE OR REPLACE FUNCTION create_player_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer la table des joueurs
  CREATE TABLE IF NOT EXISTS players (
    player_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    full_name TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    muscle_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Créer un index sur username pour des recherches plus rapides
  CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
  
  -- Activer RLS (Row Level Security)
  ALTER TABLE players ENABLE ROW LEVEL SECURITY;
  
  -- Créer une politique pour permettre l'accès public en lecture
  DROP POLICY IF EXISTS "Allow public read access" ON players;
  CREATE POLICY "Allow public read access" ON players FOR SELECT USING (true);
  
  -- Créer une politique pour permettre l'accès en écriture
  DROP POLICY IF EXISTS "Allow service role insert access" ON players;
  CREATE POLICY "Allow service role insert access" ON players FOR INSERT WITH CHECK (auth.role() = 'service_role');
  
  DROP POLICY IF EXISTS "Allow service role update access" ON players;
  CREATE POLICY "Allow service role update access" ON players FOR UPDATE USING (auth.role() = 'service_role');
  
  -- Créer la table des statistiques de joueur
  CREATE TABLE IF NOT EXISTS player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL UNIQUE REFERENCES players(player_id) ON DELETE CASCADE,
    force NUMERIC DEFAULT 10,
    endurance NUMERIC DEFAULT 10,
    assiduity NUMERIC DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Créer un index sur player_id pour des recherches plus rapides
  CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats(player_id);
  
  -- Activer RLS (Row Level Security)
  ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
  
  -- Créer une politique pour permettre l'accès public en lecture
  DROP POLICY IF EXISTS "Allow public read access" ON player_stats;
  CREATE POLICY "Allow public read access" ON player_stats FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Allow service role insert access" ON player_stats;
  CREATE POLICY "Allow service role insert access" ON player_stats FOR INSERT WITH CHECK (auth.role() = 'service_role');
  
  DROP POLICY IF EXISTS "Allow service role update access" ON player_stats;
  CREATE POLICY "Allow service role update access" ON player_stats FOR UPDATE USING (auth.role() = 'service_role');
END;
$$;

-- Procédure pour créer les tables des quêtes
CREATE OR REPLACE FUNCTION create_quest_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer la table des quêtes journalières
  CREATE TABLE IF NOT EXISTS daily_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    xp INTEGER DEFAULT 50,
    coins INTEGER DEFAULT 10,
    progress NUMERIC,
    max NUMERIC,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Activer RLS (Row Level Security)
  ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
  
  -- Créer des politiques pour permettre l'accès public en lecture
  DROP POLICY IF EXISTS "Allow public read access" ON daily_quests;
  CREATE POLICY "Allow public read access" ON daily_quests FOR SELECT USING (true);
  
  -- Créer des politiques pour permettre l'accès authentifié en lecture/écriture
  DROP POLICY IF EXISTS "Allow authenticated update access" ON daily_quests;
  CREATE POLICY "Allow authenticated update access" ON daily_quests FOR UPDATE USING (auth.role() = 'authenticated');
  
  -- Créer la table des quêtes joueur
  CREATE TABLE IF NOT EXISTS player_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(player_id) ON DELETE CASCADE,
    quest_id UUID REFERENCES daily_quests(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Créer un index sur player_id pour des recherches plus rapides
  CREATE INDEX IF NOT EXISTS idx_player_quests_player_id ON player_quests(player_id);
  
  -- Activer RLS (Row Level Security)
  ALTER TABLE player_quests ENABLE ROW LEVEL SECURITY;
  
  -- Créer une politique pour permettre l'accès public en lecture
  DROP POLICY IF EXISTS "Allow public read access" ON player_quests;
  CREATE POLICY "Allow public read access" ON player_quests FOR SELECT USING (true);
  
  -- Créer une politique pour permettre l'accès authentifié en écriture
  DROP POLICY IF EXISTS "Allow authenticated insert access" ON player_quests;
  CREATE POLICY "Allow authenticated insert access" ON player_quests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
  DROP POLICY IF EXISTS "Allow authenticated update access" ON player_quests;
  CREATE POLICY "Allow authenticated update access" ON player_quests FOR UPDATE USING (auth.role() = 'authenticated');
END;
$$;

-- Procédure pour créer les tables des badges
CREATE OR REPLACE FUNCTION create_badge_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer la table des badges
  CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT CHECK (category IN ('régularité', 'performance', 'maîtrise')),
    unlocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Créer la table des badges joueur
  CREATE TABLE IF NOT EXISTS player_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(player_id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Créer un index pour des recherches plus rapides
  CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
  
  -- Activer RLS (Row Level Security)
  ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
  ALTER TABLE player_badges ENABLE ROW LEVEL SECURITY;
  
  -- Créer des politiques pour permettre l'accès public en lecture
  DROP POLICY IF EXISTS "Allow public read access" ON badges;
  CREATE POLICY "Allow public read access" ON badges FOR SELECT USING (true);
  
  -- Créer des politiques pour permettre l'accès authentifié en lecture/écriture
  DROP POLICY IF EXISTS "Allow authenticated update access" ON badges;
  CREATE POLICY "Allow authenticated update access" ON badges FOR UPDATE USING (auth.role() = 'authenticated');
  
  DROP POLICY IF EXISTS "Allow authenticated insert access" ON player_badges;
  CREATE POLICY "Allow authenticated insert access" ON player_badges FOR INSERT WITH CHECK (auth.role() = 'authenticated');
END;
$$;

-- Créer d'abord la fonction pour mettre à jour le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer la fonction pour mettre à jour les statistiques joueur
CREATE OR REPLACE FUNCTION update_player_stats_on_quest_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la quête vient d'être complétée
  IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
    -- Récupérer les récompenses de la quête
    DECLARE
      quest_xp INTEGER;
      quest_coins INTEGER;
    BEGIN
      SELECT xp, coins INTO quest_xp, quest_coins FROM daily_quests WHERE id = NEW.quest_id;
      
      -- Mettre à jour les statistiques joueur
      UPDATE players
      SET 
        xp = xp + quest_xp,
        muscle_coins = muscle_coins + quest_coins,
        updated_at = NOW()
      WHERE player_id = NEW.player_id;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appeler les procédures pour créer les tables dans le bon ordre
SELECT create_exercise_table();
SELECT create_workout_tables();
SELECT create_player_tables();
SELECT create_quest_tables();
SELECT create_badge_tables();

-- Insérer un joueur par défaut (Jawad) avec ses statistiques de base
INSERT INTO players (player_id, username, full_name, level, xp, muscle_coins)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'jawad',
  'Jawad',
  1,
  0,
  100
) ON CONFLICT (username) DO NOTHING;

-- Insérer les statistiques du joueur par défaut
INSERT INTO player_stats (player_id, force, endurance, assiduity)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  10,
  10,
  10
) ON CONFLICT (player_id) DO NOTHING;

-- Créer le trigger sur la table player_stats
DROP TRIGGER IF EXISTS update_player_stats_updated_at ON player_stats;
CREATE TRIGGER update_player_stats_updated_at
BEFORE UPDATE ON player_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Créer le trigger sur la table player_quests
DROP TRIGGER IF EXISTS update_player_stats_on_quest_completion ON player_quests;
CREATE TRIGGER update_player_stats_on_quest_completion
AFTER UPDATE ON player_quests
FOR EACH ROW
EXECUTE FUNCTION update_player_stats_on_quest_completion();

-- Données initiales pour les exercices
INSERT INTO exercises (name, description, category, difficulty, equipment, muscles_primary, muscles_secondary, instructions, tips)
VALUES 
('Squat', 'Un exercice fondamental pour les jambes', 'Membres inférieurs', 'Débutant', 
 ARRAY['Aucun', 'Barre', 'Haltères'], 
 ARRAY['Quadriceps', 'Fessiers'], 
 ARRAY['Ischio-jambiers', 'Mollets', 'Lombaires'], 
 'Tenez-vous debout, pieds écartés à largeur d''épaules. Descendez en pliant les genoux comme si vous vous asseyiez sur une chaise, en gardant le dos droit et la poitrine haute. Descendez jusqu''à ce que vos cuisses soient parallèles au sol, puis remontez en poussant à travers vos talons.',
 'Gardez les genoux alignés avec les orteils et ne les laissez pas dépasser la pointe des pieds. Engagez vos abdominaux pour maintenir votre colonne vertébrale neutre.'),

('Développé couché', 'Exercice classique pour la poitrine', 'Membres supérieurs', 'Intermédiaire', 
 ARRAY['Barre', 'Haltères', 'Machine'], 
 ARRAY['Pectoraux'], 
 ARRAY['Triceps', 'Épaules'], 
 'Allongez-vous sur un banc plat, pieds au sol. Saisissez la barre avec une prise légèrement plus large que la largeur des épaules. Abaissez la barre jusqu''à ce qu''elle touche votre poitrine, puis poussez vers le haut jusqu''à l''extension complète des bras.',
 'Gardez les poignets droits et les coudes à un angle de 45 degrés par rapport au corps. Ne rebondissez pas la barre sur votre poitrine.'),

('Planche', 'Excellent exercice pour renforcer le core', 'Core', 'Débutant', 
 ARRAY['Aucun'], 
 ARRAY['Abdominaux', 'Transverse'], 
 ARRAY['Épaules', 'Fessiers', 'Lombaires'], 
 'Placez-vous en position de pompe, mais en vous appuyant sur vos avant-bras. Votre corps doit former une ligne droite de la tête aux talons. Contractez vos abdominaux et maintenez cette position.',
 'Respirez normalement et ne retenez pas votre souffle. Évitez de laisser tomber vos hanches ou de les lever trop haut.'),

('Soulevé de terre', 'Un exercice composé puissant', 'Membres inférieurs', 'Avancé', 
 ARRAY['Barre', 'Haltères'], 
 ARRAY['Ischio-jambiers', 'Lombaires'], 
 ARRAY['Fessiers', 'Trapèzes', 'Avant-bras'], 
 'Tenez-vous debout devant une barre, pieds écartés à largeur de hanches. Pliez les genoux et les hanches pour saisir la barre avec une prise ferme. Gardez le dos droit, la poitrine haute, et soulevez la barre en poussant à travers vos talons et en étendant vos hanches et vos genoux.',
 'Gardez la barre proche de votre corps tout au long du mouvement. Ne arrondissez jamais votre dos - maintenez une position neutre de la colonne vertébrale.'),

('Pompes', 'Exercice de base pour le haut du corps', 'Membres supérieurs', 'Débutant', 
 ARRAY['Aucun'], 
 ARRAY['Pectoraux', 'Triceps'], 
 ARRAY['Épaules', 'Core'], 
 'Placez vos mains légèrement plus larges que la largeur des épaules, bras tendus, en position de planche haute. Abaissez votre corps en pliant les coudes jusqu''à ce que votre poitrine soit près du sol, puis poussez pour revenir à la position de départ.',
 'Gardez votre corps en ligne droite et vos coudes près du corps. Pour une version plus facile, faites des pompes sur les genoux.');

-- Données initiales pour les quêtes journalières
INSERT INTO daily_quests (name, description, icon, xp, coins, max)
VALUES 
('Le Réveil Musculaire', '5 minutes d''échauffement dynamique', '🔥', 50, 10, NULL),
('Hydratation Champion', 'Boire 2L d''eau aujourd''hui', '💧', 30, 5, 2),
('Le Défi Gainage', 'Tenir la planche pendant 60 secondes', '💪', 70, 15, NULL),
('Étirement Express', '5 minutes d''étirements', '🧘', 40, 8, NULL),
('La Marche Active', '30 minutes de marche rapide', '🚶', 60, 12, NULL),
('Focus Technique', '3 séries d''exercice avec forme parfaite', '🎯', 80, 20, NULL),
('Découverte Cardio', '10 minutes sur nouvelle machine cardio', '🏃', 50, 10, NULL),
('Sommeil Réparateur', '7-8 heures de sommeil', '😴', 40, 8, NULL);

-- Données initiales pour les badges
INSERT INTO badges (name, description, icon, category)
VALUES 
('Le Départ Idéal', 'Première séance terminée', '🏆', 'régularité'),
('Semaine Parfaite', 'Toutes séances d''une semaine complétées', '🌟', 'régularité'),
('Le Rythme est Là', '3 semaines consécutives sans manquer', '🔄', 'régularité'),
('Habitude Installée', 'Programme 4 semaines complet', '📅', 'régularité'),
('Serial Sportif', '10 jours consécutifs d''activité', '🔥', 'régularité'),
('Force Naissante', 'Première augmentation de Force', '💪', 'performance'),
('Endurance Secrète', '30 min cardio sans interruption', '🌊', 'performance'),
('Souplesse Fleurissante', '7 jours d''étirements consécutifs', '🧘', 'performance'),
('Premier RP', 'Premier record personnel', '📈', 'performance'),
('Machine à RP', '5 records personnels différents', '🚀', 'performance'),
('Le Centurion', '100,000 kg soulevés au total', '⚖️', 'performance'),
('Le Formateur', 'Regarder 3x la vidéo d''un exercice', '🎓', 'maîtrise'),
('Maître de la Planche', 'Planche 90 secondes', '🛡️', 'maîtrise'),
('Roi/Reine des Pompes', '20 pompes classiques d''affilée', '👑', 'maîtrise'),
('Pionnier(e) du Sport', 'Ajouter exercice personnalisé', '🔍', 'maîtrise');
