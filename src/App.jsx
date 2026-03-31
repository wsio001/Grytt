import { useState, useMemo, useEffect } from "react";
import { Dumbbell, Calendar, BookOpen, Settings, LogOut } from "lucide-react";
import LoginScreen from "./components/LoginScreen";
import TodayView from "./components/views/TodayView/TodayView";
import PlannerView from "./components/views/PlannerView/PlannerView";
import LibraryView from "./components/views/LibraryView/LibraryView";
import SettingsView from "./components/views/SettingsView/SettingsView";
import { useDebouncedSave } from "./hooks/useDebouncedSave";
import { sbLoadData, sbSignIn } from "./lib/supabase";
import { USER_MAP } from "./lib/supabase";
import { DAYS, INITIAL_MUSCLE_CATS, DEFAULT_GOALS, todayDay, emptyPlan } from "./constants";
import { DEFAULT_EX } from "./data/defaultExercises";

const SESSION_KEY = "grytt_session";

export default function App() {
  const [session, setSession]     = useState(null);
  const [tab, setTab]             = useState("today");
  const [exercises, setEx]        = useState(null);
  const [plan, setPlan]           = useState(null);
  const [goals, setGoals]         = useState(null);
  const [logs, setLogs]           = useState(null);
  const [dayNames, setDayNames]   = useState(Object.fromEntries(DAYS.map(d => [d, ""])));
  const [muscleCats, setMCats]    = useState(INITIAL_MUSCLE_CATS);
  const [loading, setLoading]     = useState(true);
  const [activeDay, setActiveDay] = useState(todayDay());

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const { username } = JSON.parse(stored);
          const creds = USER_MAP[username];
          if (creds) {
            const sess = await sbSignIn(creds.email, creds.password);
            await onLogin(sess, false); // false = not demo
            return;
          }
        } catch (e) {
          localStorage.removeItem(SESSION_KEY);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const onLogin = async (sess, isDemo = false) => {
    setLoading(true);
    setSession(sess);

    // Persist session for non-demo users
    if (!isDemo) {
      const username = Object.entries(USER_MAP).find(([, v]) => v.email === sess.user?.email)?.[0];
      if (username) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
      }
    }

    try {
      const d = await sbLoadData(sess.access_token);
      if (d) {
        setEx(d.exercises || DEFAULT_EX);
        setGoals(d.goals   || DEFAULT_GOALS);
        setLogs(d.logs     || []);
        setDayNames(d.dayNames   || Object.fromEntries(DAYS.map(d => [d, ""])));

        // Sort muscle categories to match INITIAL_MUSCLE_CATS order
        const loadedMCats = d.muscleCats || INITIAL_MUSCLE_CATS;
        const sortedMCats = {};
        Object.keys(INITIAL_MUSCLE_CATS).forEach(cat => {
          if (loadedMCats[cat]) {
            sortedMCats[cat] = loadedMCats[cat];
          }
        });
        // Add any custom categories not in INITIAL_MUSCLE_CATS
        Object.keys(loadedMCats).forEach(cat => {
          if (!sortedMCats[cat]) {
            sortedMCats[cat] = loadedMCats[cat];
          }
        });
        setMCats(sortedMCats);

        setPlan(d.plan           || emptyPlan());
      } else {
        setEx(DEFAULT_EX); setGoals(DEFAULT_GOALS); setLogs([]); setPlan(emptyPlan());
      }
    } catch {
      setEx(DEFAULT_EX); setGoals(DEFAULT_GOALS); setLogs([]); setPlan(emptyPlan());
    }
    setLoading(false);
  };

  const onLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null); setEx(null); setPlan(null); setGoals(null); setLogs(null);
    setDayNames(Object.fromEntries(DAYS.map(d => [d, ""]))); setMCats(INITIAL_MUSCLE_CATS);
  };

  const exMap = useMemo(() => new Map((exercises || []).map(e => [e.id, e])), [exercises]);

  const storagePayload = useMemo(() =>
    session && exercises && plan && goals && logs
      ? { exercises, plan, goals, logs, dayNames, muscleCats }
      : null,
    [exercises, plan, goals, logs, dayNames, muscleCats, session]);

  useDebouncedSave(storagePayload, session);

  // Show loading screen while checking for stored session or loading data
  if (loading) return (
    <div className="bg-gray-950 min-h-screen flex items-center justify-center">
      <Dumbbell className="text-orange-500 animate-pulse" size={40} />
    </div>
  );

  // Show login screen only after we've confirmed there's no stored session
  if (!session) return <LoginScreen onLogin={onLogin} />;

  const userName = Object.entries(USER_MAP).find(([, v]) => v.email === session.user?.email)?.[0] || "User";

  const TABS = [
    { id: "today",    icon: Dumbbell,  label: "Today" },
    { id: "planner",  icon: Calendar,  label: "Planner" },
    { id: "library",  icon: BookOpen,  label: "Exercises" },
    { id: "settings", icon: Settings,  label: "Goal" },
  ];

  return (
    <div className="bg-gray-950 min-h-screen text-white flex flex-col">
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={22} className="text-orange-500" />
          <span className="text-lg font-bold tracking-wide">Workout Planner</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 capitalize">{userName}</span>
          <button onClick={onLogout} className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:text-white">
            <LogOut size={15} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {tab === "today"    && <TodayView   exMap={exMap} plan={plan} logs={logs} setLogs={setLogs} />}
        {tab === "planner"  && <PlannerView exMap={exMap} exercises={exercises} plan={plan} setPlan={setPlan} goals={goals} muscleCats={muscleCats} activeDay={activeDay} setActiveDay={setActiveDay} dayNames={dayNames} setDayNames={setDayNames} />}
        {tab === "library"  && <LibraryView exercises={exercises} setExercises={setEx} goals={goals} muscleCats={muscleCats} setPlan={setPlan} />}
        {tab === "settings" && <SettingsView goals={goals} setGoals={setGoals} setExercises={setEx} muscleCats={muscleCats} setMuscleCats={setMCats} />}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${tab === t.id ? "text-orange-500 border-t-2 border-orange-500" : "text-gray-500 hover:text-gray-300"}`}>
              <t.icon size={20} /><span className="text-xs mt-1 font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}