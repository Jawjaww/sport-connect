-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_code VARCHAR(8) UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create team members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('player', 'manager', 'coach', 'staff')),
    status VARCHAR(50) DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teams
CREATE POLICY "Teams are viewable by members" ON public.teams
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.team_members 
            WHERE team_id = id 
            AND status = 'active'
        )
        OR auth.uid() = created_by
    );

CREATE POLICY "Teams can be created by authenticated users" ON public.teams
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teams can be updated by managers" ON public.teams
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.team_members 
            WHERE team_id = id 
            AND role IN ('manager', 'coach')
            AND status = 'active'
        )
        OR auth.uid() = created_by
    );

-- Create RLS policies for team members
CREATE POLICY "Team members are viewable by team members" ON public.team_members
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.team_members 
            WHERE team_id = team_id 
            AND status = 'active'
        )
        OR auth.uid() IN (
            SELECT created_by 
            FROM public.teams 
            WHERE id = team_id
        )
    );

CREATE POLICY "Team members can be created by team managers" ON public.team_members
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id 
            FROM public.team_members 
            WHERE team_id = team_id 
            AND role IN ('manager', 'coach')
            AND status = 'active'
        )
        OR auth.uid() IN (
            SELECT created_by 
            FROM public.teams 
            WHERE id = team_id
        )
    );

CREATE POLICY "Team members can be updated by team managers" ON public.team_members
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.team_members 
            WHERE team_id = team_id 
            AND role IN ('manager', 'coach')
            AND status = 'active'
        )
        OR auth.uid() IN (
            SELECT created_by 
            FROM public.teams 
            WHERE id = team_id
        )
    );

-- Create function to generate unique team code
CREATE OR REPLACE FUNCTION generate_unique_team_code()
RETURNS trigger AS $$
DECLARE
    new_code VARCHAR(8);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 6-character code
        new_code := UPPER(SUBSTRING(MD5(''||NOW()::TEXT||RANDOM()::TEXT) FROM 1 FOR 6));
        
        -- Check if this code already exists
        SELECT EXISTS (
            SELECT 1 
            FROM public.teams 
            WHERE team_code = new_code
        ) INTO code_exists;
        
        -- If code doesn't exist, use it
        IF NOT code_exists THEN
            NEW.team_code := new_code;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate team code
CREATE TRIGGER generate_team_code_trigger
    BEFORE INSERT ON public.teams
    FOR EACH ROW
    WHEN (NEW.team_code IS NULL)
    EXECUTE FUNCTION generate_unique_team_code();
