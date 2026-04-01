import { useState, useMemo, useEffect } from "react";
import { Dumbbell, Calendar, BookOpen, Settings, LogOut } from "lucide-react";
import LoginScreen from "./components/LoginScreen";
import TodayView from "./components/views/TodayView/TodayView";
import PlannerView from "./components/views/PlannerView/PlannerView";
import LibraryView from "./components/views/LibraryView/LibraryView";
import SettingsView from "./components/views/SettingsView/SettingsView";
import { useDebouncedSave, loadCachedData, clearCache } from "./hooks/useDebouncedSave";
import { sbLoadData, supabase } from "./lib/supabase";
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
          const sess = JSON.parse(stored);
          // Validate the session has required fields
          if (sess.access_token && sess.user) {
            // CRITICAL: Tell Supabase client about the restored session
            const { error } = await supabase.auth.setSession({
              access_token: sess.access_token,
              refresh_token: sess.refresh_token
            });

            if (error) {
              console.error('Failed to restore session:', error);
              localStorage.removeItem(SESSION_KEY);
              setLoading(false);
              return;
            }

            await onLogin(sess);
            return;
          }
        } catch (e) {
          console.error('Session restore error:', e);
          localStorage.removeItem(SESSION_KEY);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const onLogin = async (sess) => {
    setLoading(true);
    setSession(sess);

    // Persist session (store the full session object with tokens)
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));

    // STEP 1: Try to load from localStorage cache first (instant)
    const cachedData = loadCachedData(sess.user.id);
    if (cachedData) {
      console.log('⚡ Using cached data for instant load');
      setEx(cachedData.exercises || DEFAULT_EX);
      setGoals(cachedData.goals || DEFAULT_GOALS);
      setLogs(cachedData.logs || []);
      setDayNames(cachedData.dayNames || Object.fromEntries(DAYS.map(d => [d, ""])));

      const loadedMCats = cachedData.muscleCats || INITIAL_MUSCLE_CATS;
      const sortedMCats = {};
      Object.keys(INITIAL_MUSCLE_CATS).forEach(cat => {
        if (loadedMCats[cat]) sortedMCats[cat] = loadedMCats[cat];
      });
      Object.keys(loadedMCats).forEach(cat => {
        if (!sortedMCats[cat]) sortedMCats[cat] = loadedMCats[cat];
      });
      setMCats(sortedMCats);
      setPlan(cachedData.plan || emptyPlan());
      setLoading(false);
    }

    // STEP 2: Fetch from database in background (in case another device updated)
    try {
      const d = await sbLoadData(sess.user.id);
      if (d) {
        console.log('☁️ Loaded latest data from cloud');
        setEx(d.exercises || DEFAULT_EX);
        setGoals(d.goals || DEFAULT_GOALS);
        setLogs(d.logs || []);
        setDayNames(d.dayNames || Object.fromEntries(DAYS.map(d => [d, ""])));

        const loadedMCats = d.muscleCats || INITIAL_MUSCLE_CATS;
        const sortedMCats = {};
        Object.keys(INITIAL_MUSCLE_CATS).forEach(cat => {
          if (loadedMCats[cat]) sortedMCats[cat] = loadedMCats[cat];
        });
        Object.keys(loadedMCats).forEach(cat => {
          if (!sortedMCats[cat]) sortedMCats[cat] = loadedMCats[cat];
        });
        setMCats(sortedMCats);
        setPlan(d.plan || emptyPlan());
      } else if (!cachedData) {
        // No cache and no server data - use defaults
        setEx(DEFAULT_EX); setGoals(DEFAULT_GOALS); setLogs([]); setPlan(emptyPlan());
      }
    } catch (error) {
      console.error('Failed to load from cloud:', error);
      if (!cachedData) {
        // No cache and server failed - use defaults
        setEx(DEFAULT_EX); setGoals(DEFAULT_GOALS); setLogs([]); setPlan(emptyPlan());
      }
    }
    setLoading(false);
  };

  const onLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    clearCache(); // Clear the data cache on logout
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

  // Refresh data when app comes to foreground (no cost, automatic feel)
  useEffect(() => {
    if (!session?.user?.id) return;

    const handleVisibilityChange = async () => {
      // When app becomes visible (user switches back to it)
      if (!document.hidden) {
        console.log('👁️ App visible - fetching latest data');
        try {
          const d = await sbLoadData(session.user.id);
          if (d) {
            console.log('🔄 Refreshed data from cloud');
            setEx(d.exercises || DEFAULT_EX);
            setGoals(d.goals || DEFAULT_GOALS);
            setLogs(d.logs || []);
            setDayNames(d.dayNames || Object.fromEntries(DAYS.map(d => [d, ""])));

            const loadedMCats = d.muscleCats || INITIAL_MUSCLE_CATS;
            const sortedMCats = {};
            Object.keys(INITIAL_MUSCLE_CATS).forEach(cat => {
              if (loadedMCats[cat]) sortedMCats[cat] = loadedMCats[cat];
            });
            Object.keys(loadedMCats).forEach(cat => {
              if (!sortedMCats[cat]) sortedMCats[cat] = loadedMCats[cat];
            });
            setMCats(sortedMCats);
            setPlan(d.plan || emptyPlan());
          }
        } catch (error) {
          console.error('Failed to refresh data:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.user?.id]);

  // Show loading screen while checking for stored session or loading data
  if (loading) return (
    <div className="bg-gray-950 min-h-screen flex items-center justify-center">
      <Dumbbell className="text-orange-500 animate-pulse" size={40} />
    </div>
  );

  // Show login screen only after we've confirmed there's no stored session
  if (!session) return <LoginScreen onLogin={onLogin} />;

  const userName = session.user?.email?.split('@')[0] || "User";

  const TABS = [
    { id: "today",    icon: Dumbbell,  label: "Today" },
    { id: "planner",  icon: Calendar,  label: "Planner" },
    { id: "library",  icon: BookOpen,  label: "Exercises" },
    { id: "settings", icon: Settings,  label: "Goal" },
  ];

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col h-screen overflow-hidden">
      <div className="bg-gray-900 px-4 py-3 sm:py-5 border-b border-gray-800 flex items-center justify-between safe-area-top flex-shrink-0">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} className="text-orange-500" />
          <span className="text-base font-bold tracking-wide">Grytt</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 capitalize hidden sm:inline">{userName}</span>
          <button onClick={onLogout} className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:text-white">
            <LogOut size={15} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-9 py-4 pb-24">
        {tab === "today"    && <TodayView   exMap={exMap} plan={plan} logs={logs} setLogs={setLogs} />}
        {tab === "planner"  && <PlannerView exMap={exMap} exercises={exercises} plan={plan} setPlan={setPlan} goals={goals} muscleCats={muscleCats} activeDay={activeDay} setActiveDay={setActiveDay} dayNames={dayNames} setDayNames={setDayNames} />}
        {tab === "library"  && <LibraryView exercises={exercises} setExercises={setEx} goals={goals} muscleCats={muscleCats} setPlan={setPlan} />}
        {tab === "settings" && <SettingsView goals={goals} setGoals={setGoals} setExercises={setEx} muscleCats={muscleCats} setMuscleCats={setMCats} />}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 safe-area-bottom flex-shrink-0">
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