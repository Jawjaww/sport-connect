-- Create teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
    max_teams INTEGER,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id),
    home_team_id UUID REFERENCES teams(id) NOT NULL,
    away_team_id UUID REFERENCES teams(id) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- Create tournament_teams junction table
CREATE TABLE tournament_teams (
    tournament_id UUID REFERENCES tournaments(id),
    team_id UUID REFERENCES teams(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (tournament_id, team_id)
);

-- Create RLS policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;

-- Create policies for reading data
CREATE POLICY "Allow public read access to teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public read access to matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tournament_teams" ON tournament_teams FOR SELECT USING (true);

-- Add sample data
INSERT INTO teams (name, description) VALUES
    ('FC Barcelona', 'Spanish professional football club'),
    ('Real Madrid', 'Spanish professional football club'),
    ('Manchester United', 'English professional football club'),
    ('Liverpool', 'English professional football club');

INSERT INTO tournaments (name, description, start_date, status, location) VALUES
    ('Champions League 2024', 'European elite football competition', NOW(), 'in_progress', 'Europe'),
    ('Premier League 2024', 'English top division', NOW(), 'in_progress', 'England');

INSERT INTO matches (home_team_id, away_team_id, date, tournament_id, status) 
SELECT 
    t1.id as home_team_id,
    t2.id as away_team_id,
    NOW() + interval '1 day' as date,
    (SELECT id FROM tournaments LIMIT 1),
    'scheduled'
FROM teams t1, teams t2
WHERE t1.id != t2.id
LIMIT 2;
