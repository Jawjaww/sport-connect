-- Création de la table profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    sports TEXT[] DEFAULT '{}',
    location JSONB,
    bio TEXT,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);

-- Création de la table events
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sport TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location JSONB NOT NULL,
    creator_id UUID REFERENCES profiles(id) NOT NULL,
    max_participants INTEGER NOT NULL,
    current_participants UUID[] DEFAULT '{}',
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
    skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'all'))
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);

-- Création de la table chats
CREATE TABLE chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image'))
);

-- Création de la table notifications
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('event_invitation', 'event_update', 'chat_message', 'event_reminder')),
    content JSONB NOT NULL,
    read BOOLEAN DEFAULT false
);

-- Création des index pour améliorer les performances
CREATE INDEX events_date_idx ON events(date);
CREATE INDEX events_sport_idx ON events(sport);
CREATE INDEX events_status_idx ON events(status);
CREATE INDEX chats_event_id_idx ON chats(event_id);
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_read_idx ON notifications(read);

-- Politiques de sécurité Row Level Security (RLS)

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
    ON events FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create events"
    ON events FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Event creators can update their events"
    ON events FOR UPDATE
    USING (auth.uid() = creator_id);

-- Chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can view messages"
    ON chats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = chats.event_id
            AND (
                events.creator_id = auth.uid()
                OR auth.uid() = ANY(events.current_participants)
            )
        )
    );

CREATE POLICY "Chat participants can insert messages"
    ON chats FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = chats.event_id
            AND (
                events.creator_id = auth.uid()
                OR auth.uid() = ANY(events.current_participants)
            )
        )
    );

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Création de la table teams
CREATE TABLE teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users NOT NULL,
    logo_url TEXT,
    team_code TEXT UNIQUE DEFAULT upper(substring(md5(random()::text) from 1 for 8)),
    sport TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'))
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);

-- Création de la table team_members pour gérer les relations utilisateurs-équipes
CREATE TABLE team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('player', 'manager', 'coach')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(team_id, user_id)
);

-- Politiques de sécurité Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create teams"
    ON teams FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Team creators can update their teams"
    ON teams FOR UPDATE
    USING (auth.uid() = created_by);

-- Politiques pour team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members are viewable by everyone"
    ON team_members FOR SELECT
    USING (true);

CREATE POLICY "Team managers can add members"
    ON team_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_members.team_id
            AND (
                teams.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM team_members tm
                    WHERE tm.team_id = team_members.team_id
                    AND tm.user_id = auth.uid()
                    AND tm.role = 'manager'
                )
            )
        )
    );

-- Index pour améliorer les performances
CREATE INDEX teams_created_by_idx ON teams(created_by);
CREATE INDEX team_members_team_id_idx ON team_members(team_id);
CREATE INDEX team_members_user_id_idx ON team_members(user_id);
