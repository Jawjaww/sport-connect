import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  supabase: typeof supabase;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  supabase: supabase,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          await AsyncStorage.setItem('user', JSON.stringify(session.user));
        } else {
          await AsyncStorage.removeItem('user');
        }
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error checking stored user:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('Sign in result:', error ? 'Error' : 'Success', data?.user?.email);
      return { error };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('Attempting to sign up:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      console.log('Sign up result:', error ? 'Error' : 'Success', data?.user?.email);
      return { error };
    } catch (err) {
      console.error('Sign up error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    console.log('Signing out');
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    console.log('Attempting password reset for:', email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      console.log('Password reset result:', error ? 'Error' : 'Success');
      return { error };
    } catch (err) {
      console.error('Password reset error:', err);
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        supabase,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
