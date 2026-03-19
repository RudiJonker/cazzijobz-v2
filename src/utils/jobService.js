import { supabase } from '../config/supabase';

export const jobService = {

  createJob: async (jobData) => {
    return await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();
  },

  updateJob: async (id, updates) => {
    return await supabase
      .from('jobs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  },

  deleteJob: async (id) => {
    return await supabase
      .from('jobs')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id);
  },

  pauseJob: async (id) => {
    return await supabase
      .from('jobs')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', id);
  },

  activateJob: async (id) => {
    return await supabase
      .from('jobs')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id);
  },

  getEmployerJobs: async (employerId) => {
    return await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employerId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });
  },

  getActiveJobs: async (filters = {}) => {
    let query = supabase
      .from('jobs')
      .select('*, profiles(full_name, avatar_url)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.searchText) {
      query = query.or(
        `city.ilike.%${filters.searchText}%,suburb.ilike.%${filters.searchText}%,province.ilike.%${filters.searchText}%`
      );
    }

    return await query;
  },

  getJobById: async (id) => {
    return await supabase
      .from('jobs')
      .select('*, profiles(full_name, avatar_url, phone)')
      .eq('id', id)
      .single();
  },

  incrementViews: async (id) => {
    return await supabase.rpc('increment_job_views', { job_id: id });
  },

};