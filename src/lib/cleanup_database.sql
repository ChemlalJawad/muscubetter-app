-- Script pour nettoyer la base de données Supabase
-- Exécuter ce script avant d'exécuter le nouveau script database.sql

-- Supprimer les triggers de manière sécurisée
DO $$ 
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Vérifier si la table user_stats existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_stats') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
    END IF;
    
    -- Vérifier si la table player_stats existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'player_stats') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_player_stats_updated_at ON player_stats;
    END IF;
    
    -- Vérifier si la table user_quests existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_quests') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_player_stats_on_quest_completion ON user_quests;
        DROP TRIGGER IF EXISTS update_updated_at_column ON user_quests;
    END IF;
    
    -- Vérifier si la table player_quests existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'player_quests') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_player_stats_on_quest_completion ON player_quests;
        DROP TRIGGER IF EXISTS update_updated_at_column ON player_quests;
    END IF;
    
    -- Vérifier si la table exercises existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exercises') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_updated_at_column ON exercises;
    END IF;
    
    -- Vérifier si la table workout_programs existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workout_programs') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_updated_at_column ON workout_programs;
    END IF;
    
    -- Vérifier si la table workouts existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workouts') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_updated_at_column ON workouts;
    END IF;
    
    -- Vérifier si la table workout_exercises existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workout_exercises') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_updated_at_column ON workout_exercises;
    END IF;
    
    -- Vérifier si la table daily_quests existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_quests') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_updated_at_column ON daily_quests;
    END IF;
    
    -- Vérifier si la table badges existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'badges') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_updated_at_column ON badges;
    END IF;
    
    -- Vérifier si la table player_badges existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'player_badges') INTO table_exists;
    IF table_exists THEN
        DROP TRIGGER IF EXISTS update_updated_at_column ON player_badges;
    END IF;
END $$;

-- Supprimer les fonctions avec CASCADE pour éliminer les dépendances
DROP FUNCTION IF EXISTS update_user_stats_on_quest_completion() CASCADE;
DROP FUNCTION IF EXISTS update_player_stats_on_quest_completion() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_exercise_table() CASCADE;
DROP FUNCTION IF EXISTS create_workout_tables() CASCADE;
DROP FUNCTION IF EXISTS create_user_stats_table() CASCADE;
DROP FUNCTION IF EXISTS create_player_tables() CASCADE;
DROP FUNCTION IF EXISTS create_quest_tables() CASCADE;
DROP FUNCTION IF EXISTS create_badge_tables() CASCADE;

-- Supprimer les tables avec les contraintes de clé étrangère d'abord
DROP TABLE IF EXISTS player_quests CASCADE;
DROP TABLE IF EXISTS user_quests CASCADE;
DROP TABLE IF EXISTS player_badges CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS workout_exercises CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS workout_programs CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS player_stats CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS daily_quests CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;

-- Supprimer les types personnalisés si nécessaire
-- DROP TYPE IF EXISTS exercise_difficulty;
-- DROP TYPE IF EXISTS record_type;

-- Supprimer les index (normalement supprimés avec les tables, mais au cas où)
DROP INDEX IF EXISTS idx_exercises_category;
DROP INDEX IF EXISTS idx_workouts_program_id;
DROP INDEX IF EXISTS idx_workout_exercises_workout_id;
DROP INDEX IF EXISTS idx_user_stats_user_id;
DROP INDEX IF EXISTS idx_players_username;
DROP INDEX IF EXISTS idx_player_stats_player_id;
DROP INDEX IF EXISTS idx_player_quests_player_id;
DROP INDEX IF EXISTS idx_player_badges_player_id;

-- Confirmer que le nettoyage est terminé
SELECT 'Nettoyage de la base de données terminé. Vous pouvez maintenant exécuter le nouveau script.';
