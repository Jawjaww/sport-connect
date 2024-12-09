-- Create team_members table
CREATE TABLE public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('player', 'coach', 'manager', 'admin')) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
    left_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Team members viewable by team members"
ON public.team_members FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM public.team_members 
        WHERE team_id = team_members.team_id
    )
);

CREATE POLICY "Team members can be created by team managers"
ON public.team_members FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM public.team_members 
        WHERE team_id = team_members.team_id 
        AND role IN ('manager', 'admin')
    )
    OR 
    auth.uid() IN (
        SELECT coach_id 
        FROM public.teams 
        WHERE id = team_members.team_id
    )
);
