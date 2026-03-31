import { useState, useMemo, useCallback, useEffect } from "react";
import { Dumbbell, Check, Save } from "lucide-react";
import { todayDay, todayFullName, todayStr } from "../constants";
import WorkoutProgressCard from "./ui/WorkoutProgressCard";

export default function TodayView({ exMap, plan, logs, setLogs }) {
  const today = todayDay(), date = todayStr();
  const rows = (plan && plan[today]) || [];
  const [saved, setSaved] = useState(false);

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
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [rows, inputs, date, setLogs]);

  if (!rows.length) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-600">
      <Dumbbell size={44} className="mb-4 opacity-20" />
      <p className="font-medium">No workout planned for {todayFullName()}</p>
      <p className="text-sm mt-1">Set up your week in the Planner tab</p>
    </div>
  );

  return (
    <div className="space-y-4 pb-24">
      <p className="text-gray-500 text-sm">{todayFullName()} · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
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
      <button onClick={saveAll}
        className={`fixed bottom-20 left-4 right-4 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg z-40 ${saved ? "bg-green-500/20 text-green-400 border-2 border-green-500" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
        {saved ? <><Check size={20} />Saved!</> : <><Save size={20} />Save Today's Progress</>}
      </button>
    </div>
  );
}