import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { sbSignIn } from "../lib/supabase";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const session = await sbSignIn(email.trim(), password);
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
      <p className="text-gray-500 text-sm mb-10">Track your workouts</p>

      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
        <input
          type="email"
          autoFocus
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          placeholder="Email"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(""); }}
          placeholder="Password"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-orange-500"
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading || !email.trim() || !password.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}