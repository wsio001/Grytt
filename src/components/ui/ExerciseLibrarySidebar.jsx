import { GripVertical, Check, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./styles/ExerciseLibrarySidebar.module.css";

export default function ExerciseLibrarySidebar({
  libGrouped,
  libCats,
  setLibCats,
  plan,
  activeDay,
  dispatchDrag,
  resetDrag
}) {
  return (
    <div className={styles.sidebar} style={{ width: "320px", flexShrink: 0, maxHeight: 600 }}>
      <p className={styles.title}>Exercise Library</p>
      <div className={styles.categoryList}>
        {Object.entries(libGrouped).map(([cat, exs]) => {
          if (!exs.length) return null;
          return (
            <div key={cat} className={styles.categoryCard}>
              <div
                className={styles.categoryHeader}
                onClick={() => setLibCats(p => ({ ...p, [cat]: !p[cat] }))}>
                <span className={styles.categoryName}>{cat}</span>
                {libCats[cat] ? (
                  <ChevronUp size={12} className="text-gray-400" />
                ) : (
                  <ChevronDown size={12} className="text-gray-400" />
                )}
              </div>
              {libCats[cat] && (
                <div className={styles.exerciseList}>
                  {exs.map(ex => {
                    const inDay = (plan[activeDay] || []).flat().some(pe => pe.exerciseId === ex.id);
                    return (
                      <div
                        key={ex.id}
                        draggable={!inDay}
                        onDragStart={() => dispatchDrag({ type: "START_LIB", ex })}
                        onDragEnd={resetDrag}
                        className={`${styles.exerciseItem} ${
                          inDay
                            ? styles.exerciseItemDisabled
                            : styles.exerciseItemActive
                        }`}>
                        <GripVertical size={12} className={styles.gripIcon} />
                        <span className={styles.exerciseName}>{ex.name}</span>
                        {inDay && <Check size={10} className={styles.checkIcon} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
