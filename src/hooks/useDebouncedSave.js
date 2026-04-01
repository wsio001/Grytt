import { useEffect, useRef } from "react";
import { sbSaveData } from "../lib/supabase";

const CACHE_KEY = "grytt_data_cache";

export function useDebouncedSave(payload, session, delay = 1200) {
  const timer = useRef(null);
  const saveInProgress = useRef(false);

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

// Clear cache on logout
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}