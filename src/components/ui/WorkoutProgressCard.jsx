import { useCallback } from "react";

export default function WorkoutProgressCard({ row, inputs, exMap, lastLogByEx, todayDate, onUpdate }) {
  const isSuperset = row.length > 1;

  const upd = useCallback((id, i, f, v) =>
    onUpdate(id, i, f, v), [onUpdate]);

  return (
    <div className="bg-gray-900 rounded-xl p-4 border-2 border-gray-800">
      {isSuperset && (
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-8 bg-orange-500 rounded-full"></div>
          <div className="text-xs text-orange-400 font-semibold uppercase tracking-widest">Superset</div>
          <div className="flex-1 h-1 bg-orange-500 rounded-full"></div>
        </div>
      )}
      <div className={isSuperset ? "space-y-3" : ""}>
        {row.map((pe, peIndex) => {
          const ex = exMap.get(pe.exerciseId);
          if (!ex) return (
            <div key={pe.id} className="bg-gray-800 rounded-lg p-3 text-xs text-gray-600 italic">
              Unknown exercise
            </div>
          );
          const sets = inputs[pe.id] || [];
          const prev = lastLogByEx.get(pe.exerciseId);
          const cols = `0.5fr 2fr 2.5fr 0.5fr 2.5fr`;

          return (
            <div key={pe.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-start gap-2 flex-1">
                  {isSuperset && (
                    <span className="text-xs font-bold text-orange-400 bg-orange-500/20 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {peIndex + 1}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{ex.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ex.tags.map(t => (
                        <span key={t} className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-lg flex-shrink-0">
                  {pe.sets} sets
                </span>
              </div>
              {prev && prev.date < todayDate ? (
                <p className="text-xs text-gray-600 mb-3">
                  Last: {prev.sets.map((s, i) => `S${i + 1} ${s.reps}r×${s.weight}lb`).join("  ")}
                </p>
              ) : (
                <div className="mb-3" />
              )}
              <div className="space-y-2">
                {sets.map((s, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", gap: "4px" }}>
                    <span className="text-xs text-gray-500 whitespace-nowrap">S{i + 1}</span>
                    <div />
                    <div className="flex items-center gap-1 min-w-0">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={s.reps}
                        onChange={e => upd(pe.id, i, "reps", e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="0"
                        className="bg-gray-700 rounded-lg py-1.5 text-sm pr-1.5 outline-none focus:ring-1 focus:ring-orange-500 w-full min-w-0"
                        style={{ textAlign: "right" }}
                      />
                      <span className="text-gray-500 text-xs whitespace-nowrap">reps</span>
                    </div>
                    <span className="text-gray-500 text-sm text-center">×</span>
                    <div className="flex items-center gap-1 min-w-0">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={s.weight}
                        onChange={e => upd(pe.id, i, "weight", e.target.value.replace(/[^0-9.]/g, ""))}
                        placeholder="0"
                        className="bg-gray-700 rounded-lg py-1.5 text-sm pr-1.5 outline-none focus:ring-1 focus:ring-orange-500 w-full min-w-0"
                        style={{ textAlign: "right" }}
                      />
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
}
