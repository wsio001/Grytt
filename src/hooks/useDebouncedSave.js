import { useEffect, useRef } from "react";
import { sbSaveData } from "../lib/supabase";

const CACHE_KEY = "grytt_data_cache";

export function useDebouncedSave(payload, session, delay = 1200) {
  const timer = useRef(null);
  const saveInProgress = useRef(false);
  const latestPayload = useRef(payload);
  const latestSession = useRef(session);

  // Keep refs updated
  useEffect(() => {
    latestPayload.current = payload;
    latestSession.current = session;
  }, [payload, session]);

  // Save immediately when app is closing/backgrounding
  useEffect(() => {
    const saveBeforeUnload = async () => {
      if (!latestSession.current || !latestPayload.current) return;

      console.log('💾 App closing - saving immediately');
      try {
        // Use sendBeacon for reliability, fallback to regular save
        const userId = latestSession.current.user.id;
        await sbSaveData(userId, latestPayload.current);
        console.log('✓ Data saved before close');
      } catch (error) {
        console.error('Failed to save before close:', error);
      }
    };

    // Save when page is unloading (browser close, tab close, navigation)
    window.addEventListener('beforeunload', saveBeforeUnload);

    // Save when app goes to background (mobile)
    window.addEventListener('pagehide', saveBeforeUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        saveBeforeUnload();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', saveBeforeUnload);
      window.removeEventListener('pagehide', saveBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!session || !payload) return;

    // IMMEDIATE: Save to localStorage (instant, never fails)
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: payload,
        userId: session.user.id,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }

    // DEBOUNCED: Save to Supabase database (reduces server load)
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (saveInProgress.current) return;
      saveInProgress.current = true;
      try {
        await sbSaveData(session.user.id, payload);
        console.log('✓ Data synced to cloud');
      } catch (error) {
        console.error('Cloud sync failed:', error);
      } finally {
        saveInProgress.current = false;
      }
    }, delay);

    return () => clearTimeout(timer.current);
  }, [payload, session, delay]);
}

// Load cached data from localStorage
export function loadCachedData(userId) {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);

    // Only return if it's for the correct user
    if (parsed.userId !== userId) return null;

    console.log('📦 Loaded data from localStorage cache');
    return parsed.data;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

// Get localStorage cache timestamp
export function getCacheTimestamp(userId) {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);

    // Only return if it's for the correct user
    if (parsed.userId !== userId) return null;

    return parsed.timestamp;
  } catch (error) {
    return null;
  }
}

// Check if localStorage has unsaved changes (data modified in last N milliseconds)
export function hasUnsavedChanges(userId, withinMs = 2000) {
  const timestamp = getCacheTimestamp(userId);
  if (!timestamp) return false;

  const age = Date.now() - timestamp;
  return age < withinMs;
}

// Clear cache on logout
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}