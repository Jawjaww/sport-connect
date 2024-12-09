-- Add team_code column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_code VARCHAR(8) UNIQUE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Create team join requests table if not exists
CREATE TABLE IF NOT EXISTS team_join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(team_id, user_id)
);

-- Enable RLS for team join requests
ALTER TABLE team_join_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to teams" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;

-- Create new policies for teams
CREATE POLICY "Enable read access for all users" ON teams
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON teams
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for team owners" ON teams
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Policies for team join requests
CREATE POLICY "Users can create join requests" ON team_join_requests
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team owners can view join requests" ON team_join_requests
    FOR SELECT TO authenticated
    USING (
        team_id IN (
            SELECT id FROM teams WHERE owner_id = auth.uid()
        )
    );

-- Function to generate random team code
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    code VARCHAR(8) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_team_code ON teams;

-- Trigger to automatically generate team code on team creation
CREATE OR REPLACE FUNCTION set_team_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.team_code IS NULL THEN
        LOOP
            NEW.team_code := generate_team_code();
            EXIT WHEN NOT EXISTS (SELECT 1 FROM teams WHERE team_code = NEW.team_code);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_team_code
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION set_team_code();
