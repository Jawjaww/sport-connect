-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    team_code VARCHAR(8) UNIQUE,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    jersey_number INTEGER,
    position VARCHAR(50),
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Team Staff table (coaches, managers, etc.)
CREATE TABLE IF NOT EXISTS team_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(team_id, user_id)
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    format VARCHAR(50) NOT NULL, -- league, knockout, group_stage_knockout
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tournament Teams junction table
CREATE TABLE IF NOT EXISTS tournament_teams (
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    group_name VARCHAR(50),
    points INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'eliminated', 'withdrawn')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (tournament_id, team_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id),
    home_team_id UUID REFERENCES teams(id) NOT NULL,
    away_team_id UUID REFERENCES teams(id) NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    round VARCHAR(50), -- group_stage, quarter_final, semi_final, final
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- Match Events table (goals, cards, substitutions)
CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) NOT NULL,
    player_id UUID REFERENCES players(id),
    event_type VARCHAR(50) NOT NULL, -- goal, yellow_card, red_card, substitution
    minute INTEGER NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Player Statistics table
CREATE TABLE IF NOT EXISTS player_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    minutes_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(player_id, match_id)
);

-- Team Join Requests table
CREATE TABLE IF NOT EXISTS team_join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(team_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_join_requests ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Teams
CREATE POLICY "Teams are viewable by everyone" ON teams
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create teams" ON teams
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Team owners can update their teams" ON teams
    FOR UPDATE USING (auth.uid() = owner_id);

-- Players
CREATE POLICY "Players are viewable by everyone" ON players
    FOR SELECT USING (true);

CREATE POLICY "Team staff can manage players" ON players
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_staff
            WHERE team_staff.team_id = players.team_id
            AND team_staff.user_id = auth.uid()
        )
    );

-- Create functions for team management
CREATE OR REPLACE FUNCTION get_team_members(team_id UUID)
RETURNS TABLE (
    id UUID,
    full_name VARCHAR(255),
    role VARCHAR(50),
    jersey_number INTEGER,
    position VARCHAR(50)
) LANGUAGE sql SECURITY DEFINER AS $$
    SELECT 
        p.id,
        p.first_name || ' ' || p.last_name as full_name,
        'player' as role,
        p.jersey_number,
        p.position
    FROM players p
    WHERE p.team_id = team_id AND p.is_active = true
    UNION ALL
    SELECT 
        ts.id,
        pr.full_name,
        ts.role,
        NULL as jersey_number,
        NULL as position
    FROM team_staff ts
    LEFT JOIN profiles pr ON pr.id = ts.user_id
    WHERE ts.team_id = team_id;
$$;
