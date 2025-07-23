-- Schema SportConnect - Version optimisée et complète
-- Supprime le schéma incomplet et crée un schéma complet

-- Suppression des tables existantes
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS player_stats CASCADE;
DROP TABLE IF EXISTS player_ratings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/*
 * Table profiles
 * Profils utilisateurs avec informations complètes
 */
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    birth_date DATE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Table teams
 * Équipes sportives
 */
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    sport TEXT NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    logo_url TEXT,
    location TEXT,
    team_code TEXT UNIQUE DEFAULT upper(substring(md5(random()::text) from 1 for 8)),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'))
);

/*
 * Table team_members
 * Membres des équipes avec rôles
 */
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('player', 'coach', 'manager', 'admin')),
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    left_at TIMESTAMPTZ,
    UNIQUE(team_id, user_id)
);

/*
 * Table matches
 * Matchs entre équipes
 */
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    opponent TEXT NOT NULL,
    location TEXT,
    date TIMESTAMPTZ NOT NULL,
    score_team INTEGER,
    score_opponent INTEGER,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    tournament_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Table tournaments
 * Tournois sportifs
 */
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    max_participants INTEGER DEFAULT 16,
    current_participants UUID[] DEFAULT '{}',
    format TEXT NOT NULL CHECK (format IN ('league', 'knockout', 'group_stage')),
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    organizer_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ajouter la foreign key pour tournament_id après création de tournaments
ALTER TABLE matches ADD CONSTRAINT fk_matches_tournament 
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL;

/*
 * Table player_ratings
 * Évaluations détaillées des joueurs
 */
CREATE TABLE player_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rater_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    offensive_skills NUMERIC(3, 2) CHECK (offensive_skills BETWEEN 0 AND 10),
    defensive_skills NUMERIC(3, 2) CHECK (defensive_skills BETWEEN 0 AND 10),
    passing NUMERIC(3, 2) CHECK (passing BETWEEN 0 AND 10),
    dribbling NUMERIC(3, 2) CHECK (dribbling BETWEEN 0 AND 10),
    team_spirit NUMERIC(3, 2) CHECK (team_spirit BETWEEN 0 AND 10),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(player_id, rater_id, match_id)
);

/*
 * Table player_stats
 * Statistiques calculées des joueurs
 */
CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT 0.00,
    performance_score NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(player_id, team_id)
);

/*
 * Table notifications
 * Système de notifications
 */
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('match', 'tournament', 'team', 'performance', 'system', 'ai_insight', 'ai_suggestion')),
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Table ai_insights
 * Insights générés par l'IA pour les joueurs et équipes
 */
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type TEXT NOT NULL CHECK (target_type IN ('player', 'team', 'match', 'tournament')),
    target_id UUID NOT NULL,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('performance_trend', 'chemistry_analysis', 'selection_recommendation', 'improvement_tip', 'team_dynamics', 'match_prediction')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    confidence_score NUMERIC(3, 2) CHECK (confidence_score BETWEEN 0 AND 1),
    data JSONB, -- Données structurées pour l'insight
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ -- Certains insights peuvent expirer
);

/*
 * Table player_chemistry
 * Analyse de la chimie entre joueurs basée sur les performances communes
 */
CREATE TABLE player_chemistry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_a_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    player_b_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    chemistry_score NUMERIC(3, 2) DEFAULT 0.00, -- Score de chimie calculé
    matches_played_together INTEGER DEFAULT 0,
    avg_performance_together NUMERIC(3, 2) DEFAULT 0.00,
    mutual_ratings_avg NUMERIC(3, 2) DEFAULT 0.00,
    last_calculated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(player_a_id, player_b_id, team_id),
    CHECK (player_a_id != player_b_id)
);

/*
 * Table match_participation_patterns
 * Patterns de participation pour l'IA de sélection
 */
CREATE TABLE match_participation_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    attendance_rate NUMERIC(3, 2) DEFAULT 0.00,
    commitment_score NUMERIC(3, 2) DEFAULT 0.00,
    preferred_positions TEXT[],
    availability_pattern JSONB, -- Jours préférés, créneaux, etc.
    motivation_factors JSONB, -- Ce qui motive le joueur
    last_analyzed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(player_id, team_id)
);

/*
 * Table ai_selection_history
 * Historique des sélections automatiques de l'IA
 */
CREATE TABLE ai_selection_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    selected_players UUID[] NOT NULL,
    selection_criteria JSONB, -- Critères utilisés par l'IA
    ai_confidence NUMERIC(3, 2),
    human_override BOOLEAN DEFAULT FALSE,
    actual_result JSONB, -- Résultat réel du match pour apprentissage
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Table feedback_sentiment
 * Analyse de sentiment des commentaires pour l'IA
 */
CREATE TABLE feedback_sentiment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating_id UUID REFERENCES player_ratings(id) ON DELETE CASCADE,
    sentiment_score NUMERIC(3, 2) CHECK (sentiment_score BETWEEN -1 AND 1), -- -1 négatif, +1 positif
    emotional_tone TEXT CHECK (emotional_tone IN ('positive', 'neutral', 'negative', 'constructive', 'harsh')),
    key_topics TEXT[], -- Mots-clés extraits du feedback
    analyzed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_teams_modtime 
    BEFORE UPDATE ON teams 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_matches_modtime 
    BEFORE UPDATE ON matches 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tournaments_modtime 
    BEFORE UPDATE ON tournaments 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_player_ratings_modtime 
    BEFORE UPDATE ON player_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_player_stats_modtime 
    BEFORE UPDATE ON player_stats 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Index pour optimiser les performances
CREATE INDEX idx_teams_owner ON teams(owner_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_matches_team ON matches(team_id);
CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_player_ratings_player ON player_ratings(player_id);
CREATE INDEX idx_player_ratings_match ON player_ratings(match_id);
CREATE INDEX idx_player_stats_player ON player_stats(player_id);
CREATE INDEX idx_player_stats_team ON player_stats(team_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Index pour les nouvelles tables IA
CREATE INDEX idx_ai_insights_target ON ai_insights(target_type, target_id);
CREATE INDEX idx_ai_insights_active ON ai_insights(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_player_chemistry_players ON player_chemistry(player_a_id, player_b_id);
CREATE INDEX idx_player_chemistry_team ON player_chemistry(team_id);
CREATE INDEX idx_player_chemistry_score ON player_chemistry(chemistry_score DESC);
CREATE INDEX idx_participation_player_team ON match_participation_patterns(player_id, team_id);
CREATE INDEX idx_participation_attendance ON match_participation_patterns(attendance_rate DESC);
CREATE INDEX idx_ai_selection_match ON ai_selection_history(match_id);
CREATE INDEX idx_ai_selection_team ON ai_selection_history(team_id);
CREATE INDEX idx_feedback_sentiment_rating ON feedback_sentiment(rating_id);
CREATE INDEX idx_feedback_sentiment_score ON feedback_sentiment(sentiment_score);

-- Politiques RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_chemistry ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participation_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_selection_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_sentiment ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Politiques pour teams
CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create teams"
    ON teams FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Team owners can update their teams"
    ON teams FOR UPDATE
    USING (auth.uid() = owner_id);

-- Politiques pour team_members
CREATE POLICY "Team members are viewable by everyone"
    ON team_members FOR SELECT
    USING (true);

CREATE POLICY "Team owners can manage members"
    ON team_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_members.team_id
            AND teams.owner_id = auth.uid()
        )
    );

-- Politiques pour matches
CREATE POLICY "Matches are viewable by everyone"
    ON matches FOR SELECT
    USING (true);

CREATE POLICY "Team members can manage matches"
    ON matches FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            JOIN teams t ON t.id = tm.team_id
            WHERE tm.team_id = matches.team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('manager', 'admin', 'coach')
        )
    );

-- Politiques pour tournaments
CREATE POLICY "Tournaments are viewable by everyone"
    ON tournaments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create tournaments"
    ON tournaments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Tournament organizers can update tournaments"
    ON tournaments FOR UPDATE
    USING (auth.uid() = organizer_id);

-- Politiques pour player_ratings
CREATE POLICY "Player ratings are viewable by team members"
    ON player_ratings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.user_id = auth.uid()
            AND (tm.user_id = player_ratings.player_id OR tm.user_id = player_ratings.rater_id)
        )
    );

CREATE POLICY "Team members can rate other team members"
    ON player_ratings FOR INSERT
    WITH CHECK (
        auth.uid() = rater_id
        AND EXISTS (
            SELECT 1 FROM team_members tm1, team_members tm2
            WHERE tm1.user_id = auth.uid()
            AND tm2.user_id = player_ratings.player_id
            AND tm1.team_id = tm2.team_id
        )
    );

-- Politiques pour player_stats
CREATE POLICY "Player stats are viewable by everyone"
    ON player_stats FOR SELECT
    USING (true);

CREATE POLICY "System can update player stats"
    ON player_stats FOR ALL
    USING (true);

-- Politiques pour notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Politiques pour les nouvelles tables IA
CREATE POLICY "Users can view ai_insights for their teams"
    ON ai_insights FOR SELECT
    USING (
        target_type = 'player' AND target_id IN (SELECT id FROM profiles WHERE id = auth.uid())
        OR target_type = 'team' AND target_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
        OR target_type IN ('match', 'tournament') AND target_id IN (
            SELECT m.id FROM matches m 
            JOIN team_members tm ON m.team_id = tm.team_id 
            WHERE tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view chemistry for their teams"
    ON player_chemistry FOR SELECT
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view participation patterns for their teams"
    ON match_participation_patterns FOR SELECT
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view ai selection history for their teams"
    ON ai_selection_history FOR SELECT
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view feedback sentiment for their ratings"
    ON feedback_sentiment FOR SELECT
    USING (
        rating_id IN (
            SELECT id FROM player_ratings 
            WHERE player_id = auth.uid() OR rater_id = auth.uid()
        )
    );

-- Fonctions utilitaires
CREATE OR REPLACE FUNCTION calculate_player_performance(player_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    performance_score NUMERIC;
BEGIN
    SELECT 
        COALESCE(
            (goals * 2.0) + 
            (assists * 1.5) + 
            (games_played * 0.1) - 
            (yellow_cards * 0.5) - 
            (red_cards * 2.0) +
            COALESCE(average_rating, 0) * 2,
            0
        )
    INTO performance_score
    FROM player_stats
    WHERE player_id = player_uuid;
    
    RETURN COALESCE(performance_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les statistiques automatiquement
CREATE OR REPLACE FUNCTION update_player_stats_from_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculer la moyenne des ratings pour ce joueur
    UPDATE player_stats 
    SET average_rating = (
        SELECT AVG((offensive_skills + defensive_skills + passing + dribbling + team_spirit) / 5.0)
        FROM player_ratings 
        WHERE player_id = NEW.player_id
    ),
    performance_score = calculate_player_performance(NEW.player_id)
    WHERE player_id = NEW.player_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_stats
    AFTER INSERT OR UPDATE ON player_ratings
    FOR EACH ROW EXECUTE FUNCTION update_player_stats_from_ratings();
