-- Suppression de la colonne coach_id si elle existe
ALTER TABLE IF EXISTS teams 
    DROP COLUMN IF EXISTS coach_id;

-- Ajout de la colonne owner_id si elle n'existe pas déjà
ALTER TABLE IF EXISTS teams
    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Mise à jour des politiques de sécurité
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;

CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

CREATE POLICY "Team owners can update their teams"
    ON teams FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create teams"
    ON teams FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
