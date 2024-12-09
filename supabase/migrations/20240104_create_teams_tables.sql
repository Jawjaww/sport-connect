-- Modifiez la politique pour utiliser owner_id au lieu de created_by
CREATE POLICY "Teams are viewable by members" ON public.teams
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id
            FROM public.team_members
            WHERE team_id = id
            AND status = 'active'
        )
        OR auth.uid() = owner_id
    ); 