/*
 * Database schema for SportConnect application
 * Contains all tables and relationships needed for core functionality
 * Includes user profiles, teams, matches, tournaments and player statistics
 */

-- Drop existing tables to ensure clean slate
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS player_stats CASCADE;

/*
 * User profiles table
 * Stores basic user information and authentication references
 */
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE, -- Links to Supabase auth system
    first_name TEXT NOT NULL, -- User's first name
    last_name TEXT NOT NULL, -- User's last name
    full_name TEXT, -- Optional full name display
    email TEXT UNIQUE NOT NULL, -- User's email address
    avatar_url TEXT, -- URL to user's profile picture
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- Record creation timestamp
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL -- Last update timestamp
);

/*
 * Teams table
 * Stores information about sports teams
 */
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Unique team identifier
    name TEXT NOT NULL, -- Team name
    description TEXT, -- Optional team description
    sport TEXT NOT NULL, -- Sport type (e.g., football, basketball)
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Team owner reference
    logo_url TEXT, -- URL to team logo
    location TEXT, -- Team's home location
    team_code TEXT UNIQUE, -- Unique code for team invitations
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')) -- Team status
);

/*
 * Team members table
 * Manages relationships between users and teams
 */
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Unique membership identifier
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE, -- Reference to team
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Reference to user
    role TEXT NOT NULL CHECK (role IN ('player', 'coach', 'manager', 'admin')), -- Member role
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- When member joined
    left_at TIMESTAMPTZ, -- When member left (if applicable)
    UNIQUE(team_id, user_id) -- Ensure unique membership
);

/*
 * Matches table
 * Stores information about scheduled and completed matches
 */
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Unique match identifier
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE, -- Reference to team
    opponent TEXT NOT NULL, -- Opponent team name
    location TEXT, -- Match location
    date TIMESTAMPTZ NOT NULL, -- Scheduled match date
    score_team INTEGER, -- Team's score
    score_opponent INTEGER, -- Opponent's score
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')), -- Match status
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Tournaments table
 * Stores information about sports tournaments
 */
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Unique tournament identifier
    name TEXT NOT NULL, -- Tournament name
    description TEXT, -- Tournament description
    start_date TIMESTAMPTZ NOT NULL, -- Tournament start date
    end_date TIMESTAMPTZ NOT NULL, -- Tournament end date
    location TEXT, -- Tournament location
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')), -- Tournament status
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Player ratings table
 * Stores detailed player ratings from teammates
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
 * Player statistics table
 * Stores detailed player performance data based on peer ratings
 * with optional influence on future selections
 */
CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Unique stat identifier
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Reference to player
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE, -- Reference to match
    offensive_skills NUMERIC(3, 2), -- Offensive capabilities (0.00 - 10.00)
    defensive_skills NUMERIC(3, 2), -- Defensive capabilities (0.00 - 10.00)
    attendance_score NUMERIC(3, 2), -- Attendance and commitment (0.00 - 10.00)
    fun_factor NUMERIC(3, 2), -- How fun the player was to play with (0.00 - 10.00)
    team_spirit NUMERIC(3, 2), -- Contribution to team atmosphere (0.00 - 10.00)
    selection_weight NUMERIC(3, 2) DEFAULT 1.00, -- Influence on future selections (0.00 - 1.00)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Team selection settings table
 * Allows manager to control rating influence on selections
 */
CREATE TABLE team_selection_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE UNIQUE,
    use_ratings_for_selection BOOLEAN DEFAULT FALSE,
    offensive_weight NUMERIC(3, 2) DEFAULT 0.25,
    defensive_weight NUMERIC(3, 2) DEFAULT 0.25,
    attendance_weight NUMERIC(3, 2) DEFAULT 0.20,
    fun_weight NUMERIC(3, 2) DEFAULT 0.15,
    team_spirit_weight NUMERIC(3, 2) DEFAULT 0.15,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Player badges table
 * Stores badges earned by players
 */
CREATE TABLE player_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('savior', 'top_scorer', 'team_player', 'mvp')),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Notification settings table
 * Stores user notification preferences
 */
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    match_reminders BOOLEAN DEFAULT TRUE,
    team_updates BOOLEAN DEFAULT TRUE,
    rating_requests BOOLEAN DEFAULT TRUE,
    emergency_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Emergency replacements table
 * Stores emergency replacement requests
 */
CREATE TABLE emergency_replacements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    replacement_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

/*
 * Function to automatically update 'updated_at' timestamp
 * Used by all tables to track last modification time
 */
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to all tables
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

CREATE TRIGGER update_player_stats_modtime
BEFORE UPDATE ON player_stats
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
