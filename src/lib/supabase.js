const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SB_URL || !SB_KEY) {
  console.error("Missing Supabase configuration. Please check your .env file.");
  console.error("SB_URL:", SB_URL ? "✓" : "✗ MISSING");
  console.error("SB_KEY:", SB_KEY ? "✓" : "✗ MISSING");
}

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

  // Check if response is ok and content-type is JSON
  if (!r.ok) {
    const contentType = r.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const d = await r.json();
      throw new Error(d.error_description || d.msg || `Login failed: ${r.status}`);
    } else {
      throw new Error(`Login failed: Server returned ${r.status}. Please check your Supabase URL and configuration.`);
    }
  }

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