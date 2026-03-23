const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const USER_MAP = {
  william: {
    email: import.meta.env.VITE_WILLIAM_EMAIL,
    password: import.meta.env.VITE_WILLIAM_PASSWORD
  },
  demo: {
    email: import.meta.env.VITE_DEMO_EMAIL,
    password: import.meta.env.VITE_DEMO_PASSWORD
  },
};

export async function sbSignIn(email, password) {
  const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SB_KEY },
    body: JSON.stringify({ email, password }),
  });
  const d = await r.json();
  if (d.error || !d.access_token) throw new Error(d.error_description || d.msg || "Login failed");
  return d;
}

export async function sbLoadData(token) {
  const r = await fetch(`${SB_URL}/rest/v1/app_state?select=data`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` },
  });
  const rows = await r.json();
  return rows?.[0]?.data || null;
}

export async function sbSaveData(token, userId, data) {
  await fetch(`${SB_URL}/rest/v1/app_state`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ user_id: userId, data, updated_at: new Date().toISOString() }),
  });
}