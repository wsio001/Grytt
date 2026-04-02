import { useCallback } from "react";
import styles from "./styles/WorkoutProgressCard.module.css";

export default function WorkoutProgressCard({ row, inputs, exMap, lastLogByEx, todayDate, onUpdate }) {
  const isSuperset = row.length > 1;

  const upd = useCallback((id, i, f, v) =>
    onUpdate(id, i, f, v), [onUpdate]);

  return (
    <div className={styles.card}>
      {isSuperset && (
        <div className={styles.supersetHeader}>
          <div className={styles.supersetLine}></div>
          <div className={styles.supersetLabel}>Superset</div>
          <div className={styles.supersetLineEnd}></div>
        </div>
      )}
      <div className={isSuperset ? styles.supersetContent : ""}>
        {row.map((pe, peIndex) => {
          const ex = exMap.get(pe.exerciseId);
          if (!ex) return (
            <div key={pe.id} className={styles.unknownExercise}>
              Unknown exercise
            </div>
          );
          const sets = inputs[pe.id] || [];
          const prev = lastLogByEx.get(pe.exerciseId);
          const cols = `0.5fr 2fr 2.5fr 0.5fr 2.5fr`;

          return (
            <div key={pe.id} className={styles.exerciseCard}>
              <div className={styles.exerciseHeader}>
                <div className={styles.exerciseInfo}>
                  {isSuperset && (
                    <span className={styles.supersetBadge}>
                      {peIndex + 1}
                    </span>
                  )}
                  <div className={styles.exerciseDetails}>
                    <p className={styles.exerciseName}>{ex.name}</p>
                    <div className={styles.tagContainer}>
                      {ex.tags.map(t => (
                        <span key={t} className={styles.tag}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className={styles.setsBadge}>
                  {pe.sets} sets
                </span>
              </div>
              {prev && prev.date < todayDate ? (
                <p className={styles.lastLog}>
                  Last: {prev.sets.map((s, i) => `S${i + 1} ${s.reps}r×${s.weight}lb`).join("  ")}
                </p>
              ) : (
                <div className={styles.spacer} />
              )}
              <div className={styles.setsContainer}>
                {sets.map((s, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", gap: "4px" }}>
                    <span className={styles.setLabel}>S{i + 1}</span>
                    <div />
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={s.reps}
                        onChange={e => upd(pe.id, i, "reps", e.target.value.replace(/[^0-9]/g, ""))}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                        placeholder="0"
                        className={styles.input}
                        style={{ textAlign: "right" }}
                      />
                      <span className={styles.inputLabel}>reps</span>
                    </div>
                    <span className={styles.multiplier}>×</span>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={s.weight}
                        onChange={e => upd(pe.id, i, "weight", e.target.value.replace(/[^0-9.]/g, ""))}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                        placeholder="0"
                        className={styles.input}
                        style={{ textAlign: "right" }}
                      />
                      <span className={styles.inputLabel}>lbs</span>
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
