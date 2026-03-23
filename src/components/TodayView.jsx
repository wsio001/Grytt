import { useState, useMemo, useCallback, useEffect } from "react";
import { Dumbbell, Check, Save } from "lucide-react";
import { todayDay, todayFullName, todayStr } from "../constants";

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
    <div className="space-y-4">
      <p className="text-gray-500 text-sm">{todayFullName()} · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
      {rows.map((row, ri) => {
        const isSuperset = row.length > 1;
        return (
          <div key={ri} className="bg-gray-900 rounded-xl p-4">
            {isSuperset && <div className="text-xs text-orange-400 font-semibold mb-3 uppercase tracking-widest">Superset</div>}
            <div className={isSuperset ? "flex gap-3" : ""}>
              {row.map(pe => {
                const ex = exMap.get(pe.exerciseId);
                if (!ex) return <div key={pe.id} className="flex-1 bg-gray-800 rounded-lg p-3 text-xs text-gray-600 italic">Unknown exercise</div>;
                const sets = inputs[pe.id] || [];
                const prev = lastLogByEx.get(pe.exerciseId);
                const spacer = row.length === 3 ? "2fr" : isSuperset ? "2fr" : "5fr";
                const cols = `0.5fr ${spacer} 1.5fr 0.5fr 1.5fr`;
                return (
                  <div key={pe.id} className="flex-1 bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-semibold">{ex.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ex.tags.map(t => <span key={t} className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{t}</span>)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-lg">{pe.sets} sets</span>
                    </div>
                    {prev && prev.date < date
                      ? <p className="text-xs text-gray-600 mb-3">Last: {prev.sets.map((s, i) => `S${i + 1} ${s.reps}r×${s.weight}lb`).join("  ")}</p>
                      : <div className="mb-3" />}
                    <div className="space-y-2">
                      {sets.map((s, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", gap: "4px" }}>
                          <span className="text-xs text-gray-500 whitespace-nowrap">S{i + 1}</span>
                          <div />
                          <div className="flex items-center gap-1 min-w-0">
                            <input type="text" inputMode="numeric" value={s.reps}
                              onChange={e => upd(pe.id, i, "reps", e.target.value.replace(/[^0-9]/g, ""))}
                              placeholder="0"
                              className="bg-gray-700 rounded-lg py-1.5 text-sm pr-1.5 outline-none focus:ring-1 focus:ring-orange-500 w-full min-w-0" style={{ textAlign: "right" }} />
                            <span className="text-gray-500 text-xs whitespace-nowrap">reps</span>
                          </div>
                          <span className="text-gray-500 text-sm text-center">×</span>
                          <div className="flex items-center gap-1 min-w-0">
                            <input type="text" inputMode="decimal" value={s.weight}
                              onChange={e => upd(pe.id, i, "weight", e.target.value.replace(/[^0-9.]/g, ""))}
                              placeholder="0"
                              className="bg-gray-700 rounded-lg py-1.5 text-sm pr-1.5 outline-none focus:ring-1 focus:ring-orange-500 w-full min-w-0" style={{ textAlign: "right" }} />
                            <span className="text-gray-500 text-xs whitespace-nowrap">lbs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <button onClick={saveAll}
        className={`w-full font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${saved ? "bg-green-500/20 text-green-400" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
        {saved ? <><Check size={20} />Saved!</> : <><Save size={20} />Save Today's Progress</>}
      </button>
    </div>
  );
}