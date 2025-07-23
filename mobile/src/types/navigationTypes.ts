import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
	Auth: undefined;
	Main: undefined;
	Home: undefined;
	ManagedTeams: undefined;
	TeamCodeDetail: { teamId: string, teamCode: string };
	TeamMain: { teamId: string };
	PlayerProfile: { playerId: string };
	CreateTeam: undefined;
	JoinTeam: undefined;
	TeamMembers: { teamId: string; }; 
	EditTeam: { teamId: string };
	EditPlayer: { playerId: string; teamId: string };
	MatchDetails: { matchId: string };
	TournamentDetails: { tournamentId: string };
	Profile: undefined;
	Teams: undefined;
	TeamStack: { teamId: string };
	Settings: undefined;
	PlayerDetails: { playerId: string, teamId: string };
	AddPlayer: { teamId: string };
};

export type AuthStackParamList = {
	Login: undefined;
	Register: undefined;
	ForgotPassword: undefined;
};

export type MainStackParamList = {
	Teams: undefined;
	TeamStack: { teamId: string };
	Profile: undefined;
	Settings: undefined;
};

export type TeamStackParamList = {
	JoinTeam: undefined;
	TeamDetails: { teamId: string };
	EditTeam: { teamId: string };
	TeamMembers: { teamId: string };
	TeamCodeDetail: { teamId: string; teamCode: string };
	TeamSettings: { teamId: string };
	AddPlayer: { teamId: string };
	TeamMain: { teamId: string };
	PlayerDetails: { playerId: string, teamId: string };
	EditPlayer: { playerId: string, teamId: string };
};

export type HomeStackParamList = {
	Home: undefined;
	MatchDetails: { matchId: string };
	TournamentDetails: { tournamentId: string };
	TeamCreation: undefined;
	Profile: undefined;
	Teams: undefined;
	TeamStack: { teamId: string };
	Settings: undefined;
	PlayerDetails: { playerId: string, teamId: string };
	EditPlayer: { playerId: string };
	EditTeam: { teamId: string };
	TeamSettings: undefined;
	AddPlayer: { teamId: string };
};

export type MainTabParamList = {
	HomeMain: undefined;
	TeamMain: { teamId: string };
	Tournaments: undefined;
	Statistics: undefined;
	Notifications: undefined;
	MatchDetails: { matchId: string };
	TournamentDetails: { tournamentId: string };
	TeamCreation: undefined;
	Profile: undefined;
	Teams: undefined;
	TeamStack: { teamId: string };
	Settings: undefined;
	PlayerDetails: { playerId: string, teamId: string };
	EditPlayer: { playerId: string };
	EditTeam: { teamId: string };
	TeamSettings: undefined;
	AddPlayer: { teamId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
	NativeStackScreenProps<AuthStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = 
	NativeStackScreenProps<MainStackParamList, T>;

export type TeamStackScreenProps<T extends keyof TeamStackParamList> = 
	NativeStackScreenProps<TeamStackParamList, T>;

export type HomeStackScreenProps = 
	NativeStackScreenProps<HomeStackParamList, keyof HomeStackParamList>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
	NativeStackScreenProps<MainTabParamList, T>;
