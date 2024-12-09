-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON teams;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON teams;
DROP POLICY IF EXISTS "Enable update for team owners" ON teams;
DROP POLICY IF EXISTS "Allow public read access to teams" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;

-- Create basic policies
CREATE POLICY "teams_select_policy" 
    ON teams FOR SELECT 
    USING (true);  -- Anyone can read teams

CREATE POLICY "teams_insert_policy" 
    ON teams FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);  -- Any authenticated user can create teams

CREATE POLICY "teams_update_policy" 
    ON teams FOR UPDATE 
    USING (auth.uid() = owner_id);  -- Only team owners can update

-- Grant necessary permissions
GRANT ALL ON teams TO authenticated;
GRANT USAGE ON SEQUENCE teams_id_seq TO authenticated;

-- Ensure the trigger function has necessary permissions
GRANT EXECUTE ON FUNCTION generate_team_code TO authenticated;
GRANT EXECUTE ON FUNCTION set_team_code TO authenticated;

-- Add error logging function
CREATE OR REPLACE FUNCTION log_team_creation() RETURNS TRIGGER AS $$
BEGIN
    RAISE LOG 'Creating team: %', NEW;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add logging trigger
DROP TRIGGER IF EXISTS log_team_creation_trigger ON teams;
CREATE TRIGGER log_team_creation_trigger
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION log_team_creation();
