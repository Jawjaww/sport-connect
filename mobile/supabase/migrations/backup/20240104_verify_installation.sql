-- Verify tables
SELECT 
    table_name, 
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM (
    VALUES ('teams'), ('team_members')
) as t(table_name)
WHERE EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
);

-- Verify policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('teams', 'team_members')
ORDER BY tablename, policyname;
