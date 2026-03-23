import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { sbSignIn, USER_MAP } from "../lib/supabase";

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    const key = name.trim().toLowerCase();
    const creds = USER_MAP[key];
    if (!creds) { setError("Type 'William' or 'Demo'"); return; }
    setLoading(true); setError("");
    try {
      const session = await sbSignIn(creds.email, creds.password);
      onLogin(session);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col items-center justify-center px-6">
      <Dumbbell size={44} className="text-orange-500 mb-6" />
      <h1 className="text-2xl font-bold text-white mb-1">Grytt</h1>
      <p className="text-gray-500 text-sm mb-10">Who are you?</p>
      <div className="w-full max-w-xs space-y-3">
        <input
          autoFocus
          value={name}
          onChange={e => { setName(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handle()}
          placeholder="William or Demo"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-lg placeholder-gray-600 outline-none focus:ring-2 focus:ring-orange-500"
        />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          onClick={handle}
          disabled={loading || !name.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? "Signing in…" : "Enter →"}
        </button>
      </div>
    </div>
  );
}