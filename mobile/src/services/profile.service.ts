import { supabase } from './supabase';
import type { Profile } from '../types/sharedTypes';

export class ProfileService {
  static async getProfile(): Promise<any | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  }

  static async upsertProfile(profile: Partial<Profile>): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async uploadAvatar(uri: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Convert URI to Blob
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileExt = uri.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
