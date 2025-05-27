-- Fonction pour créer la table des statistiques du joueur
CREATE OR REPLACE FUNCTION create_player_stats_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si la table existe déjà
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'player_stats') THEN
    -- Créer la table des statistiques du joueur
    CREATE TABLE public.player_stats (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
      force INTEGER NOT NULL DEFAULT 10,
      endurance INTEGER NOT NULL DEFAULT 10,
      souplesse INTEGER NOT NULL DEFAULT 10,
      assiduity INTEGER NOT NULL DEFAULT 0,
      total_weight_lifted INTEGER NOT NULL DEFAULT 0,
      total_workouts_completed INTEGER NOT NULL DEFAULT 0,
      streak_days INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Ajouter les politiques RLS
    ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

    -- Politique pour permettre à tous les utilisateurs de voir toutes les statistiques
    CREATE POLICY "Tous les utilisateurs peuvent voir toutes les statistiques" 
      ON public.player_stats FOR SELECT 
      USING (true);

    -- Politique pour permettre les opérations sans authentification (pour le développement)
    CREATE POLICY "Autoriser toutes les opérations pour le développement" 
      ON public.player_stats 
      USING (true) 
      WITH CHECK (true);

    -- Créer un index sur player_id pour des recherches plus rapides
    CREATE INDEX idx_player_stats_player_id ON public.player_stats(player_id);

    RAISE NOTICE 'Table des statistiques du joueur créée avec succès';
  ELSE
    RAISE NOTICE 'La table des statistiques du joueur existe déjà';
  END IF;
END;
$$;
