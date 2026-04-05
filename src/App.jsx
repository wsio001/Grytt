import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Dumbbell, Calendar, BookOpen, Settings, LogOut, RefreshCw } from "lucide-react";
import LoginScreen from "./components/LoginScreen";
import { useDebouncedSave, loadCachedData, clearCache, hasUnsavedChanges } from "./hooks/useDebouncedSave";

// Lazy load views for code splitting and faster initial load
const TodayView = lazy(() => import("./components/views/TodayView/TodayView"));
const PlannerView = lazy(() => import("./components/views/PlannerView/PlannerView"));
const LibraryView = lazy(() => import("./components/views/LibraryView/LibraryView"));
const SettingsView = lazy(() => import("./components/views/SettingsView/SettingsView"));
import { sbLoadData, supabase } from "./lib/supabase";
import { DAYS, INITIAL_MUSCLE_CATS, DEFAULT_GOALS, todayDay, emptyPlan } from "./constants";
import { DEFAULT_EX } from "./data/defaultExercises";

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
  const [syncing, setSyncing] = useState(false);

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (!session?.user?.id || syncing) return;

    // Check if there are unsaved changes in localStorage (< 3 seconds old)
    if (hasUnsavedChanges(session.user.id, 3000)) {
      console.log('⚠️ Skipping refresh - you have unsaved changes. Wait 3 seconds after editing.');
      return;
    }

    setSyncing(true);
    console.log('🔄 Manual refresh triggered');
    try {
      const d = await sbLoadData(session.user.id);
      if (d) {
        console.log('✅ Manual refresh successful');
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
      console.error('Manual refresh failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Restore session on mount using Supabase's built-in session management
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Get current session from Supabase (auto-restored from localStorage)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Failed to get session:', error);
          setLoading(false);
          return;
        }

        if (session) {
          console.log('✅ Session restored automatically');
          await onLogin(session);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error('Session restore error:', e);
        setLoading(false);
      }
    };

    restoreSession();

    // Listen for auth state changes (session refresh, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_OUT') {
        onLogout();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 Token refreshed automatically');
        setSession(session);
      } else if (event === 'SIGNED_IN' && session) {
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onLogin = async (sess) => {
    setLoading(true);
    setSession(sess);

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

  const onLogout = async () => {
    // Sign out from Supabase (clears session from localStorage automatically)
    await supabase.auth.signOut();
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
        console.log('👁️ App visible - checking for updates');

        // Skip refresh if there are very recent unsaved changes (< 3 seconds)
        if (hasUnsavedChanges(session.user.id, 3000)) {
          console.log('⚠️ Skipping auto-refresh - you have unsaved changes');
          return;
        }

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
          <button
            onClick={handleManualRefresh}
            disabled={syncing}
            className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-50"
            title="Sync latest data"
          >
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
          </button>
          <button onClick={onLogout} className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:text-white">
            <LogOut size={15} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-9 py-4 pb-24">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <Dumbbell className="text-orange-500 animate-pulse" size={32} />
          </div>
        }>
          {tab === "today"    && <TodayView   exMap={exMap} plan={plan} logs={logs} setLogs={setLogs} />}
          {tab === "planner"  && <PlannerView exMap={exMap} exercises={exercises} plan={plan} setPlan={setPlan} goals={goals} muscleCats={muscleCats} activeDay={activeDay} setActiveDay={setActiveDay} />}
          {tab === "library"  && <LibraryView exercises={exercises} setExercises={setEx} goals={goals} muscleCats={muscleCats} setPlan={setPlan} />}
          {tab === "settings" && <SettingsView goals={goals} setGoals={setGoals} setExercises={setEx} muscleCats={muscleCats} setMuscleCats={setMCats} />}
        </Suspense>
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