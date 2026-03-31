import { Plus, X, Check, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import styles from "./styles/ExerciseLibraryModal.module.css";

export default function ExerciseLibraryModal({
  showLibrary,
  setShowLibrary,
  libGrouped,
  libCats,
  setLibCats,
  plan,
  activeDay,
  exMap,
  handleMobileExerciseClick,
  contextMenu,
  setContextMenu,
  addAsNewExercise,
  addAsSuperset
}) {
  return (
    <>
      <button
        onClick={() => setShowLibrary(true)}
        className={styles.fab}>
        <Plus size={24} />
      </button>

      {showLibrary && (
        <div className={styles.overlay} onClick={() => setShowLibrary(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Exercise Library</h3>
              <button onClick={() => setShowLibrary(false)} className={styles.closeButton}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className={styles.modalContent}>
              {Object.entries(libGrouped).map(([cat, exs]) => {
                if (!exs.length) return null;
                return (
                  <div key={cat} className={styles.categoryCard}>
                    <div
                      className={styles.categoryHeader}
                      onClick={() => setLibCats(p => ({ ...p, [cat]: !p[cat] }))}>
                      <span className={styles.categoryName}>{cat}</span>
                      {libCats[cat] ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                    {libCats[cat] && (
                      <div className={styles.exerciseList}>
                        {exs.map(ex => {
                          const inDay = (plan[activeDay] || []).flat().some(pe => pe.exerciseId === ex.id);
                          return (
                            <button
                              key={ex.id}
                              onClick={() => !inDay && handleMobileExerciseClick(ex)}
                              disabled={inDay}
                              className={`${styles.exerciseButton} ${
                                inDay
                                  ? styles.exerciseButtonDisabled
                                  : styles.exerciseButtonActive
                              }`}>
                              <span className={styles.exerciseName}>{ex.name}</span>
                              {inDay && <Check size={14} className={styles.checkIcon} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Context Menu for adding exercise */}
      {contextMenu?.show && (
        <div className={styles.contextMenuOverlay} onClick={() => setContextMenu(null)}>
          <div className={styles.contextMenu} onClick={e => e.stopPropagation()}>
            <div className={styles.contextMenuHeader}>
              <h3 className={styles.contextMenuTitle}>Add {contextMenu.exercise.name}</h3>
            </div>
            <div className={styles.contextMenuContent}>
              <button
                onClick={() => addAsNewExercise(contextMenu.exercise)}
                className={styles.contextMenuItem}>
                <Plus size={18} className="text-orange-500" />
                <span className="text-sm text-white">Add as new exercise</span>
              </button>
              {(plan[activeDay] || []).length > 0 && (
                <>
                  <div className={styles.sectionLabel}>
                    <p className={styles.sectionLabelText}>Superset with:</p>
                  </div>
                  {(plan[activeDay] || []).map((row, ri) => {
                    if (row.length >= 2) return null;
                    return (
                      <button
                        key={ri}
                        onClick={() => addAsSuperset(contextMenu.exercise, ri)}
                        className={styles.contextMenuItem}>
                        <GripVertical size={18} className="text-gray-500" />
                        <div className={styles.rowInfo}>
                          <p className={styles.rowName}>
                            {row.map(pe => exMap.get(pe.exerciseId)?.name).join(" + ")}
                          </p>
                          <p className={styles.rowNumber}>Row {ri + 1}</p>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
            <div className={styles.contextMenuFooter}>
              <button
                onClick={() => setContextMenu(null)}
                className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
