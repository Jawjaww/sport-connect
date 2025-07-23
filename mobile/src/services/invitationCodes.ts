import { supabase } from './supabase';
import { nanoid } from 'nanoid';

export const generateInvitationCode = async (teamId: string) => {
  try {
    const code = nanoid(8).toUpperCase(); // Generate a random 8 character code
    
    const { error } = await supabase
      .from('team_invitations')
      .insert([
        {
          code,
          team_id: teamId,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        },
      ]);

    if (error) throw error;
    return { code, error: null };
  } catch (error) {
    console.error('Error generating invitation code:', error);
    return { code: null, error };
  }
};

export const validateInvitationCode = async (code: string) => {
  try {
    const { data, error } = await supabase
      .from('team_invitations')
      .select('*, team:teams(*)')
      .eq('code', code)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error validating invitation code:', error);
    return { data: null, error };
  }
};

export const joinTeam = async (userId: string, teamId: string, role: string = 'player') => {
  try {
    const { error } = await supabase
      .from('team_members')
      .insert([
        {
          user_id: userId,
          team_id: teamId,
          role,
          joined_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error joining team:', error);
    return { error };
  }
};
