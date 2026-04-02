import { createClient } from '@supabase/supabase-js';

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SB_URL || !SB_KEY) {
  console.error("Missing Supabase configuration. Please check your .env file.");
  console.error("SB_URL:", SB_URL ? "✓" : "✗ MISSING");
  console.error("SB_KEY:", SB_KEY ? "✓" : "✗ MISSING");
}

// Create Supabase client with persistent session
export const supabase = createClient(SB_URL, SB_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'grytt_supabase_auth'
  },
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
  console.log('📥 Fetching data for user:', userId);

  const { data, error } = await supabase
    .from('app_state')
    .select('data, updated_at')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error("❌ Load FAILED:", error.message);
    return null;
  }

  if (data) {
    console.log("✅ Load SUCCESSFUL from Supabase");
    console.log("📊 Last updated:", data.updated_at);
    console.log("📦 Data size:", JSON.stringify(data.data).length, 'bytes');
  } else {
    console.log("ℹ️ No data found in Supabase for this user");
  }

  return data?.data || null;
}

export async function sbSaveData(userId, data) {
  console.log('💾 Attempting to save data for user:', userId);
  console.log('📦 Data payload size:', JSON.stringify(data).length, 'bytes');

  const payload = {
    user_id: userId,
    data,
    updated_at: new Date().toISOString()
  };

  const { error, data: result } = await supabase
    .from('app_state')
    .upsert(payload, {
      onConflict: 'user_id'
    })
    .select();

  if (error) {
    console.error("❌ Save FAILED:", error.message);
    console.error("Error details:", error);
    throw error;
  }

  console.log("✅ Save SUCCESSFUL to Supabase");
  console.log("📊 Saved at:", new Date().toISOString());
  console.log("🆔 User ID:", userId);
  return result;
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