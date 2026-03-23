import { useEffect, useRef } from "react";
import { sbSaveData } from "../lib/supabase";

export function useDebouncedSave(payload, session, delay = 1200) {
  const timer = useRef(null);
  useEffect(() => {
    if (!session || !payload) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      sbSaveData(session.access_token, session.user.id, payload).catch(() => {});
    }, delay);
    return () => clearTimeout(timer.current);
  }, [payload, session, delay]);
}