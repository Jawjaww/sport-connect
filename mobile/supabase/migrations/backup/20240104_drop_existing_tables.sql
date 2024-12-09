-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TRIGGER IF EXISTS generate_team_code_trigger ON public.teams;
DROP FUNCTION IF EXISTS generate_unique_team_code();
DROP TABLE IF EXISTS public.team_members;
DROP TABLE IF EXISTS public.teams;

-- Verify that tables are dropped
DO $$ 
BEGIN
    RAISE NOTICE 'Starting clean installation of teams structure...';
END $$;
