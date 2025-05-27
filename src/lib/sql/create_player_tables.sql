-- Fonction pour créer la table des joueurs
CREATE OR REPLACE FUNCTION create_player_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si la table existe déjà
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'players') THEN
    -- Créer la table des joueurs
    CREATE TABLE public.players (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      auth_id UUID,
      username TEXT NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      level INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      muscle_coins INTEGER NOT NULL DEFAULT 100,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Ajouter les politiques RLS
    ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

    -- Politique pour permettre à tous les utilisateurs authentifiés de voir tous les joueurs
    CREATE POLICY "Tous les utilisateurs peuvent voir tous les joueurs" 
      ON public.players FOR SELECT 
      USING (true);

    -- Politique pour permettre à un utilisateur de modifier uniquement ses propres données
    CREATE POLICY "Les utilisateurs peuvent modifier leurs propres données" 
      ON public.players FOR UPDATE 
      USING (auth.uid() = auth_id);

    -- Politique pour permettre à un utilisateur de supprimer uniquement ses propres données
    CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres données" 
      ON public.players FOR DELETE 
      USING (auth.uid() = auth_id);

    -- Politique pour permettre à un utilisateur authentifié d'insérer ses propres données
    CREATE POLICY "Les utilisateurs authentifiés peuvent insérer leurs propres données" 
      ON public.players FOR INSERT 
      WITH CHECK (auth.uid() = auth_id);

    -- Pour le développement, permettre les opérations sans authentification
    CREATE POLICY "Autoriser toutes les opérations pour le développement" 
      ON public.players 
      USING (true) 
      WITH CHECK (true);

    RAISE NOTICE 'Table des joueurs créée avec succès';
  ELSE
    RAISE NOTICE 'La table des joueurs existe déjà';
  END IF;
END;
$$;
