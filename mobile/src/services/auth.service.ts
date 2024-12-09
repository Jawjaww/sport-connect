import { supabase } from './supabase';
import { logger } from '../utils/logger';

// Fonctions de base d'authentification
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      logger.error('❌ [Auth] Erreur lors de l\'inscription', { error });
    }
    
    return { data, error };
  } catch (error) {
    logger.error('❌ [Auth] Exception lors de l\'inscription', { error });
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      logger.error('❌ [Auth] Erreur lors de la connexion', { error });
    }
    
    return { data, error };
  } catch (error) {
    logger.error('❌ [Auth] Exception lors de la connexion', { error });
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('❌ [Auth] Erreur lors de la déconnexion', { error });
    }
    return { error };
  } catch (error) {
    logger.error('❌ [Auth] Exception lors de la déconnexion', { error });
    return { error };
  }
};

// Fonctions de gestion du mot de passe
export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      logger.error('❌ [Auth] Erreur lors de la réinitialisation du mot de passe', { error });
    }
    return { data, error };
  } catch (error) {
    logger.error('❌ [Auth] Exception lors de la réinitialisation du mot de passe', { error });
    return { data: null, error };
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      logger.error('❌ [Auth] Erreur lors de la mise à jour du mot de passe', { error });
    }
    return { data, error };
  } catch (error) {
    logger.error('❌ [Auth] Exception lors de la mise à jour du mot de passe', { error });
    return { data: null, error };
  }
};

// Fonctions utilitaires
export const getUserId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch (error) {
    logger.error('❌ [Auth] Erreur lors de la récupération de l\'ID utilisateur', { error });
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    logger.error('❌ [Auth] Erreur lors de la récupération de l\'utilisateur courant', { error });
    return null;
  }
};
