import { createClient } from '@supabase/supabase-js';

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SB_URL || !SB_KEY) {
  console.error("Missing Supabase configuration. Please check your .env file.");
  console.error("SB_URL:", SB_URL ? "✓" : "✗ MISSING");
  console.error("SB_KEY:", SB_KEY ? "✓" : "✗ MISSING");
}

// Create Supabase client
export const supabase = createClient(SB_URL, SB_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export async function sbSignIn(email, password) {
  if (!SB_URL || !SB_KEY) {
    throw new Error("Supabase configuration missing. Check environment variables.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in failed:", error.message);
    throw new Error(error.message);
  }

  if (!data.session) {
    throw new Error("Login failed: No session returned");
  }

  return data.session;
}

export async function sbLoadData(userId) {
  const { data, error } = await supabase
    .from('app_state')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error("Error loading data:", error);
    return null;
  }

  return data?.data || null;
}

export async function sbSaveData(userId, data) {
  const { error } = await supabase
    .from('app_state')
    .upsert({
      user_id: userId,
      data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error("Error saving data:", error);
    throw error;
  }
}

// Subscribe to real-time changes for a user's data
export function subscribeToDataChanges(userId, onDataChange) {
  const channel = supabase
    .channel(`app_state:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'app_state',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('Real-time update received:', payload);
        onDataChange(payload.new.data);
      }
    )
    .subscribe();

  return channel;
}