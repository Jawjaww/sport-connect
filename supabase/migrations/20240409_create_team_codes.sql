-- Drop existing table if it exists
DROP TABLE IF EXISTS public.team_codes CASCADE;
DROP TABLE IF EXISTS public.team_players CASCADE;

-- Create simplified team_codes table
CREATE TABLE public.team_codes (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (team_id),
    UNIQUE (code)
);

-- Enable RLS
ALTER TABLE public.team_codes ENABLE ROW LEVEL SECURITY;

-- Simple policy: Team members can view codes
CREATE POLICY "Team members can view codes"
    ON public.team_codes FOR SELECT
    USING (
        -- Team members can view
        auth.uid() IN (
            SELECT user_id 
            FROM public.team_members 
            WHERE team_id = team_codes.team_id
            AND status = 'active'
        )
    );

-- Simple policy: Only team owners can manage codes
CREATE POLICY "Team owners can manage codes"
    ON public.team_codes FOR ALL
    USING (
        auth.uid() IN (
            SELECT owner_id 
            FROM public.teams 
            WHERE id = team_codes.team_id
        )
    );

-- Create index for performance
CREATE INDEX idx_team_codes_code ON public.team_codes(code);
