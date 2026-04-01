import { useMemo, useCallback, useEffect, useRef } from "react";
import { Dumbbell } from "lucide-react";
import { todayDay, todayFullName, todayStr } from "../../../constants";
import WorkoutProgressCard from "../../ui/WorkoutProgressCard";
import styles from "./TodayView.module.css";

export default function TodayView({ exMap, plan, logs, setLogs }) {
  const today = todayDay(), date = todayStr();
  const rows = (plan && plan[today]) || [];
  const saveTimer = useRef(null);

  const lastLogByEx = useMemo(() => {
    const map = new Map();
    [...logs].sort((a, b) => a.date.localeCompare(b.date)).forEach(l => map.set(l.exerciseId, l));
    return map;
  }, [logs]);

  const todayLogByEx = useMemo(() => {
    const map = new Map();
    logs.filter(l => l.date === date).forEach(l => map.set(l.exerciseId, l));
    return map;
  }, [logs, date]);

  const rowSignature = rows.map(row => row.map(pe => `${pe.id}:${pe.sets}`).join(",")).join("|");

  const buildInputs = useCallback(() => {
    const out = {};
    rows.forEach(row => row.forEach(pe => {
      const ref = todayLogByEx.get(pe.exerciseId) || lastLogByEx.get(pe.exerciseId) || null;
      out[pe.id] = Array.from({ length: pe.sets }, (_, i) => ({
        reps: (ref && ref.sets?.[i] != null) ? String(ref.sets[i].reps ?? "") : "",
        weight: (ref && ref.sets?.[i] != null) ? String(ref.sets[i].weight ?? "") : "",
      }));
    }));
    return out;
  }, [rowSignature, todayLogByEx, lastLogByEx]);

  const [inputs, setInputs] = useState(buildInputs);
  useEffect(() => { setInputs(buildInputs()); }, [buildInputs]);

  const upd = useCallback((id, i, f, v) =>
    setInputs(p => ({ ...p, [id]: p[id].map((s, j) => j === i ? { ...s, [f]: v } : s) })), []);

  const saveAll = useCallback(() => {
    const newLogs = [];
    rows.forEach(row => row.forEach(pe => {
      const sets = (inputs[pe.id] || []).map(({ reps, weight }) => ({ reps: Number(reps) || 0, weight: Number(weight) || 0 }));
      newLogs.push({ date, exerciseId: pe.exerciseId, sets });
    }));
    setLogs(prev => [...prev.filter(l => l.date !== date), ...newLogs]);
  }, [rows, inputs, date, setLogs]);

  // Auto-save when inputs change (debounced)
  useEffect(() => {
    if (rows.length === 0) return;

    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      saveAll();
    }, 800); // 800ms debounce

    return () => clearTimeout(saveTimer.current);
  }, [inputs, saveAll, rows.length]);

  if (!rows.length) return (
    <div className={styles.emptyState}>
      <Dumbbell size={44} className={styles.emptyIcon} />
      <p className={styles.emptyTitle}>No workout planned for {todayFullName()}</p>
      <p className={styles.emptySubtitle}>Set up your week in the Planner tab</p>
    </div>
  );

  return (
    <div className={styles.container}>
      <p className={styles.dateHeader}>{todayFullName()} · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
      {rows.map((row, ri) => (
        <WorkoutProgressCard
          key={ri}
          row={row}
          inputs={inputs}
          exMap={exMap}
          lastLogByEx={lastLogByEx}
          todayDate={date}
          onUpdate={upd}
        />
      ))}
    </div>
  );
}