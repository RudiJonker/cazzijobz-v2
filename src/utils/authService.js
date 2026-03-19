import { supabase } from '../config/supabase';

export const authService = {
  signUp: async (email, password) => {
    return await supabase.auth.signUp({ email, password });
  },
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  getSession: async () => {
    return await supabase.auth.getSession();
  },
  createProfile: async (profile) => {
    return await supabase.from('profiles').insert(profile);
  },
  getProfile: async (userId) => {
    return await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },
  updateProfile: async (userId, updates) => {
    return await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  },
};