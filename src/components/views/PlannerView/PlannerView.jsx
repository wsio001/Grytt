import { useState, useMemo, useCallback, useEffect } from "react";
import MuscleCounterCard from "../../ui/MuscleCounterCard";
import DateSelector from "../../ui/DateSelector";
import ExerciseLibrarySidebar from "../../ui/ExerciseLibrarySidebar";
import ExerciseLibraryModal from "../../ui/ExerciseLibraryModal";
import PlannerContainer from "../../ui/PlannerContainer";
import { useDragReducer } from "../../../hooks/useDragReducer";
import { DAYS, DAYS_FULL, uid } from "../../../constants";
import styles from "./PlannerView.module.css";

export default function PlannerView({ exMap, exercises, plan, setPlan, goals, muscleCats, activeDay, setActiveDay, dayNames, setDayNames }) {
  const [drag, dispatchDrag] = useDragReducer();
  const [libCats, setLibCats] = useState(Object.fromEntries(Object.keys(muscleCats).map(c => [c, false])));
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLibrary, setShowLibrary] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { exercise, show }
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isDraggingMobile, setIsDraggingMobile] = useState(false);

  useEffect(() => { setEditingName(false); setNameDraft(dayNames[activeDay] || ""); }, [activeDay]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    };
  }, [longPressTimer]);

  const isDragging = !!(drag.ex || drag.pe);

  const vol = useMemo(() => {
    const v = Object.fromEntries(Object.keys(goals).map(m => [m, 0]));
    DAYS.forEach(day => (plan[day] || []).forEach(row => row.forEach(pe => {
      const ex = exMap.get(pe.exerciseId);
      ex && ex.tags.forEach(t => { if (t in v) v[t] += pe.sets; });
    })));
    return v;
  }, [plan, exMap, goals]);

  const libGrouped = useMemo(() => {
    const g = Object.fromEntries(Object.keys(muscleCats).map(c => [c, []]));
    exercises.forEach(ex => {
      for (const [cat, muscles] of Object.entries(muscleCats)) {
        if (ex.tags.some(t => muscles.includes(t))) { g[cat].push(ex); break; }
      }
    });
    return g;
  }, [exercises, muscleCats]);

  const resetDrag = useCallback(() => dispatchDrag({ type: "RESET" }), []);

  const handleDrop = useCallback((targetDay, rowIndex, position) => {
    if (!drag.ex && !drag.pe) return;
    const newPe = drag.src === "library" ? { id: uid(), exerciseId: drag.ex.id, sets: 3 } : drag.pe;
    setPlan(prev => {
      const np = { ...prev };
      const tRows = [...(prev[targetDay] || [])];
      if (drag.src !== "library") {
        if (drag.src === targetDay) {
          const sRow = [...tRows[drag.srcRow]];
          const idx = sRow.findIndex(e => e.id === drag.pe.id);
          if (idx !== -1) { sRow.splice(idx, 1); sRow.length === 0 ? tRows.splice(drag.srcRow, 1) : (tRows[drag.srcRow] = sRow); }
        } else {
          const sRows = [...(prev[drag.src] || [])];
          const sRow = [...sRows[drag.srcRow]];
          const idx = sRow.findIndex(e => e.id === drag.pe.id);
          if (idx !== -1) { sRow.splice(idx, 1); sRow.length === 0 ? sRows.splice(drag.srcRow, 1) : (sRows[drag.srcRow] = sRow); np[drag.src] = sRows; }
        }
      }
      if (position === "superset" && rowIndex >= 0 && tRows[rowIndex] && tRows[rowIndex].length < 2) {
        tRows[rowIndex] = [...tRows[rowIndex], newPe];
      } else {
        const ins = rowIndex === -1 ? 0 : rowIndex !== null ? rowIndex + 1 : tRows.length;
        tRows.splice(Math.min(ins, tRows.length), 0, [newPe]);
      }
      np[targetDay] = tRows;
      return np;
    });
    resetDrag();
  }, [drag, setPlan, resetDrag]);

  const updSets = useCallback((day, ri, peId, d) => setPlan(prev => ({ ...prev, [day]: prev[day].map((row, i) => i === ri ? row.map(pe => pe.id === peId ? { ...pe, sets: Math.max(1, pe.sets + d) } : pe) : row) })), [setPlan]);
  const remPe = useCallback((day, ri, peId) => setPlan(prev => ({ ...prev, [day]: prev[day].map((row, i) => i === ri ? row.filter(pe => pe.id !== peId) : row).filter(r => r.length > 0) })), [setPlan]);
  const confirmName = useCallback(() => { setDayNames(p => ({ ...p, [activeDay]: nameDraft })); setEditingName(false); }, [activeDay, nameDraft, setDayNames]);

  // Mobile: tap to add exercise with context menu
  const handleMobileExerciseClick = useCallback((ex) => {
    const currentWorkout = plan[activeDay] || [];

    // If no exercises, add directly
    if (currentWorkout.length === 0) {
      const newPe = { id: uid(), exerciseId: ex.id, sets: 3 };
      setPlan(prev => ({ ...prev, [activeDay]: [[newPe]] }));
      setShowLibrary(false);
      return;
    }

    // Show context menu
    setContextMenu({ exercise: ex, show: true });
  }, [plan, activeDay, setPlan]);

  const addAsNewExercise = useCallback((ex) => {
    const newPe = { id: uid(), exerciseId: ex.id, sets: 3 };
    setPlan(prev => {
      const currentRows = [...(prev[activeDay] || [])];
      currentRows.push([newPe]);
      return { ...prev, [activeDay]: currentRows };
    });
    setContextMenu(null);
    setShowLibrary(false);
  }, [activeDay, setPlan]);

  const addAsSuperset = useCallback((ex, rowIndex) => {
    const newPe = { id: uid(), exerciseId: ex.id, sets: 3 };
    setPlan(prev => {
      const currentRows = [...(prev[activeDay] || [])];
      currentRows[rowIndex] = [...currentRows[rowIndex], newPe];
      return { ...prev, [activeDay]: currentRows };
    });
    setContextMenu(null);
    setShowLibrary(false);
  }, [activeDay, setPlan]);

  // Mobile long-press handlers - drags entire row (superset as group)
  const handleTouchStart = useCallback((pe, day, rowIndex) => {
    const timer = setTimeout(() => {
      setIsDraggingMobile(true);
      // Use the first exercise in the row to represent the entire row
      const currentRow = plan[day]?.[rowIndex];
      const firstPe = currentRow?.[0] || pe;
      dispatchDrag({ type: "START_PLAN", pe: firstPe, src: day, srcRow: rowIndex });
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500); // 500ms long-press
    setLongPressTimer(timer);
  }, [plan]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsDraggingMobile(false);
  }, [longPressTimer]);

  const handleTouchMove = useCallback(() => {
    // Cancel long-press if user moves finger before timer completes
    if (longPressTimer && !isDraggingMobile) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer, isDraggingMobile]);

  const fullDayName = DAYS_FULL[DAYS.indexOf(activeDay)];

  return (
    <div>
      <div className={styles.volumeSection}>
        <p className={styles.volumeTitle}>Weekly Volume</p>
        {isMobile ? (
          // Mobile: Carousel mode (2 cards visible, scroll for more)
          <div className={styles.carouselContainer}>
            {Object.entries(muscleCats).map(([cat, muscles]) => (
              <div key={cat} className={styles.carouselItem}>
                <MuscleCounterCard category={cat} muscles={muscles} vol={vol} goals={goals} />
              </div>
            ))}
          </div>
        ) : (
          // Desktop: Grid layout (all 6 cards visible)
          <div className={styles.gridContainer}>
            {Object.entries(muscleCats).map(([cat, muscles]) => (
              <MuscleCounterCard key={cat} category={cat} muscles={muscles} vol={vol} goals={goals} />
            ))}
          </div>
        )}
      </div>

      <DateSelector
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        dayNames={dayNames}
        editingName={editingName}
        setEditingName={setEditingName}
        nameDraft={nameDraft}
        setNameDraft={setNameDraft}
        confirmName={confirmName}
      />

      <div className={isMobile ? "" : "flex gap-3"}>
        {/* Desktop: Side-by-side library */}
        {!isMobile && (
          <ExerciseLibrarySidebar
            libGrouped={libGrouped}
            libCats={libCats}
            setLibCats={setLibCats}
            plan={plan}
            activeDay={activeDay}
            dispatchDrag={dispatchDrag}
            resetDrag={resetDrag}
          />
        )}

        <PlannerContainer
          activeDay={activeDay}
          fullDayName={fullDayName}
          plan={plan}
          exMap={exMap}
          dragState={{ isMobile, isDragging, isDraggingMobile, drag }}
          nameEditor={{ editingName, setEditingName, nameDraft, setNameDraft, confirmName, dayNames }}
          workoutHandlers={{ updSets, remPe }}
          dragHandlers={{ dispatchDrag, resetDrag, handleDrop, handleTouchStart, handleTouchEnd, handleTouchMove }}
          onEmptyClick={isMobile ? () => setShowLibrary(true) : undefined}
        />
      </div>

      {/* Mobile: FAB and Library Modal */}
      {isMobile && (
        <ExerciseLibraryModal
          showLibrary={showLibrary}
          setShowLibrary={setShowLibrary}
          libGrouped={libGrouped}
          libCats={libCats}
          setLibCats={setLibCats}
          plan={plan}
          activeDay={activeDay}
          exMap={exMap}
          handleMobileExerciseClick={handleMobileExerciseClick}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          addAsNewExercise={addAsNewExercise}
          addAsSuperset={addAsSuperset}
        />
      )}
    </div>
  );
}