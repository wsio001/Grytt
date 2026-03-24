import { useState, useMemo, useCallback, useEffect } from "react";
import { GripVertical, Plus, Minus, Trash2, Check, Edit2, ChevronDown, ChevronUp, X } from "lucide-react";
import DropZone from "./DropZone";
import { useDragReducer, DRAG_INIT } from "../hooks/useDragReducer";
import { DAYS, DAYS_FULL, uid } from "../constants";

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
      <div className="bg-gray-900 rounded-xl p-4 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Weekly Volume</p>
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
          {Object.entries(muscleCats).map(([cat, muscles]) => (
            <div key={cat} className="bg-gray-800 rounded-lg p-2 flex-shrink-0 snap-start" style={{ minWidth: "140px" }}>
              <p className="text-xs font-semibold text-white mb-2 text-center">{cat}</p>
              <div className="space-y-1">
                {muscles.filter(m => m in goals).map(muscle => {
                  const curr = vol[muscle] || 0, tgt = goals[muscle] || 0, done = tgt > 0 && curr >= tgt;
                  return (
                    <div key={muscle} className={`text-xs px-1 py-0.5 rounded text-center leading-tight ${done ? "bg-green-500/20 text-green-400" : curr > 0 ? "bg-orange-500/20 text-orange-400" : "bg-gray-700 text-gray-500"}`}>
                      <div className="truncate">{muscle}</div>
                      <div className="font-semibold">{curr}{tgt > 0 ? `/${tgt}` : "—"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {DAYS.map(day => (
          <button key={day} onClick={() => setActiveDay(day)}
            className={`flex-1 py-1.5 text-center rounded-lg text-sm font-medium transition-colors ${activeDay === day ? "bg-orange-500 text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800"}`}>
            <div>{day}</div>
            <div className={`text-xs truncate mt-0.5 ${activeDay === day ? "text-orange-200" : "text-gray-600"}`}>{dayNames[day] || "Rest"}</div>
          </button>
        ))}
      </div>

      <div className={isMobile ? "" : "flex gap-3"}>
        {/* Desktop: Side-by-side library */}
        {!isMobile && (
          <div className="bg-gray-900 rounded-xl p-3 overflow-y-auto" style={{ width: "30%", flexShrink: 0, maxHeight: 520 }}>
            <p className="text-xs font-semibold text-orange-400 sticky top-0 bg-gray-900 py-1 mb-2">Library</p>
            <div className="space-y-2">
              {Object.entries(libGrouped).map(([cat, exs]) => {
                if (!exs.length) return null;
                return (
                  <div key={cat} className="rounded-lg overflow-hidden bg-gray-800">
                    <div className="px-2 py-1.5 flex items-center justify-between cursor-pointer" onClick={() => setLibCats(p => ({ ...p, [cat]: !p[cat] }))}>
                      <span className="text-xs font-medium text-white">{cat}</span>
                      {libCats[cat] ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
                    </div>
                    {libCats[cat] && (
                      <div className="p-1.5 space-y-1 bg-gray-900">
                        {exs.map(ex => {
                          const inDay = (plan[activeDay] || []).flat().some(pe => pe.exerciseId === ex.id);
                          return (
                            <div key={ex.id} draggable={!inDay}
                              onDragStart={() => dispatchDrag({ type: "START_LIB", ex })}
                              onDragEnd={resetDrag}
                              className={`flex items-center gap-1.5 rounded px-2 py-1.5 select-none text-xs transition-colors ${inDay ? "opacity-40 cursor-default bg-gray-800" : "bg-gray-800 hover:bg-gray-700 cursor-grab active:cursor-grabbing"}`}>
                              <GripVertical size={12} className="text-gray-500 flex-shrink-0" />
                              <span className="truncate flex-1">{ex.name}</span>
                              {inDay && <Check size={10} className="text-gray-500" />}
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
        )}

        <div className={`bg-gray-900 rounded-xl p-3 flex-1 transition-all ${!isMobile && isDragging ? "ring-2 ring-orange-500/40" : ""}`}
          style={{ minHeight: 400 }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (!(plan[activeDay] || []).length) handleDrop(activeDay, -1, "new-row"); }}>

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-orange-400">{fullDayName}'s Workout</p>
            <div className="flex items-center gap-1.5">
              {editingName ? (
                <>
                  <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && confirmName()}
                    placeholder="Upper, Push, Legs…"
                    className="bg-gray-800 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500 w-32" />
                  <button onClick={confirmName} className="p-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"><Check size={14} /></button>
                </>
              ) : (
                <>
                  <span className={`text-xs ${dayNames[activeDay] ? "text-white font-medium" : "text-gray-600"}`}>{dayNames[activeDay] || "Unnamed"}</span>
                  <button onClick={() => { setNameDraft(dayNames[activeDay] || ""); setEditingName(true); }} className="p-1 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700"><Edit2 size={13} /></button>
                </>
              )}
            </div>
          </div>

          {!(plan[activeDay] || []).length && (
            <div className={`rounded-lg border-2 border-dashed flex items-center justify-center py-10 transition-all ${!isMobile && isDragging ? "border-orange-500/50 bg-orange-500/5" : "border-gray-800"}`}>
              <span className="text-gray-600 text-sm">{isMobile ? "Tap + to add exercises" : "Drag exercises here"}</span>
            </div>
          )}

          {(plan[activeDay] || []).length > 0 && (
            <div className="space-y-2">
              {((!isMobile && isDragging) || (isMobile && isDraggingMobile)) && (
                <DropZone active={true} highlight={drag.overRow === -1 && drag.overPos === "new-row"}
                  label="Insert here" className="h-8"
                  onOver={() => dispatchDrag({ type: "OVER", row: -1, pos: "new-row" })}
                  onLeave={() => dispatchDrag({ type: "OVER", row: null, pos: null })}
                  onDrop={() => handleDrop(activeDay, -1, "new-row")} />
              )}
              {(plan[activeDay] || []).map((row, ri) => {
                const isSuperset = row.length > 1;
                const isDraggingThisRow = isMobile && drag.srcRow === ri && drag.src === activeDay && isDraggingMobile;

                return (
                  <div key={ri}>
                    {/* Superset container with visual grouping */}
                    <div className={`${isMobile && isSuperset ? "relative bg-gray-900 rounded-lg p-2 border-2 border-orange-500/30" : ""}`}>
                      {isMobile && isSuperset && (
                        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-orange-500 rounded-l"></div>
                      )}
                      {isMobile && isSuperset && (
                        <div className="flex items-center gap-1 mb-2 px-1">
                          <GripVertical size={12} className="text-orange-500" />
                          <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Superset</span>
                        </div>
                      )}
                      <div className={`flex gap-2 ${isMobile && isSuperset ? "flex-col" : ""} ${isDraggingThisRow ? "opacity-50" : ""}`}>
                        {row.map((pe, peIndex) => {
                          const ex = exMap.get(pe.exerciseId);
                          if (!ex) return <div key={pe.id} className="flex-1 bg-gray-800 rounded-lg p-2 text-xs text-gray-600 italic">Unknown</div>;
                          return (
                            <div key={pe.id}
                              draggable={true}
                              onDragStart={() => dispatchDrag({ type: "START_PLAN", pe: row[0], src: activeDay, srcRow: ri })}
                              onDragEnd={() => { resetDrag(); handleTouchEnd(); }}
                              onTouchStart={() => isMobile && handleTouchStart(pe, activeDay, ri)}
                              onTouchEnd={handleTouchEnd}
                              onTouchMove={handleTouchMove}
                              className={`${isMobile && isSuperset ? "w-full" : "flex-1"} bg-gray-800 rounded-lg p-2 transition-all ${!isMobile || isDraggingMobile ? "cursor-grab active:cursor-grabbing" : ""}`}>
                              <div className="flex items-center gap-1.5">
                                {!isMobile && <GripVertical size={11} className="text-gray-500 flex-shrink-0" />}
                                {isMobile && isSuperset && (
                                  <span className="text-xs text-orange-400 font-bold mr-1">{peIndex + 1}</span>
                                )}
                                <span className="flex-1 text-xs font-medium truncate">{ex.name}</span>
                                <button onClick={() => updSets(activeDay, ri, pe.id, -1)} className="p-0.5 bg-gray-700 rounded hover:bg-gray-600"><Minus size={10} /></button>
                                <span className="w-4 text-center text-orange-400 font-bold text-xs">{pe.sets}</span>
                                <button onClick={() => updSets(activeDay, ri, pe.id, 1)} className="p-0.5 bg-gray-700 rounded hover:bg-gray-600"><Plus size={10} /></button>
                                <button onClick={() => remPe(activeDay, ri, pe.id)} className="p-0.5 text-red-400 rounded hover:bg-red-500/20 ml-0.5"><Trash2 size={10} /></button>
                              </div>
                            </div>
                          );
                        })}
                        {((!isMobile && isDragging) || (isMobile && isDraggingMobile)) && row.length < 2 && (
                          <DropZone active={true} highlight={drag.overRow === ri && drag.overPos === "superset"}
                            label="Superset" className={isMobile && row.length > 1 ? "w-full mt-2" : "flex-1"}
                            onOver={() => dispatchDrag({ type: "OVER", row: ri, pos: "superset" })}
                            onLeave={() => dispatchDrag({ type: "OVER", row: null, pos: null })}
                            onDrop={() => handleDrop(activeDay, ri, "superset")} />
                        )}
                      </div>
                    </div>
                    {((!isMobile && isDragging) || (isMobile && isDraggingMobile)) && (
                      <DropZone active={true} highlight={drag.overRow === ri && drag.overPos === "new-row"}
                        label="New row" className="h-8 mt-2"
                        onOver={() => dispatchDrag({ type: "OVER", row: ri, pos: "new-row" })}
                        onLeave={() => dispatchDrag({ type: "OVER", row: null, pos: null })}
                        onDrop={() => handleDrop(activeDay, ri, "new-row")} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: FAB and Library Modal */}
      {isMobile && (
        <>
          <button
            onClick={() => setShowLibrary(true)}
            className="fixed bottom-20 right-4 w-14 h-14 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-orange-600 transition-colors z-40">
            <Plus size={24} />
          </button>

          {showLibrary && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowLibrary(false)}>
              <div className="bg-gray-900 w-full rounded-t-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <h3 className="text-lg font-semibold text-white">Exercise Library</h3>
                  <button onClick={() => setShowLibrary(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-2">
                  {Object.entries(libGrouped).map(([cat, exs]) => {
                    if (!exs.length) return null;
                    return (
                      <div key={cat} className="rounded-lg overflow-hidden bg-gray-800">
                        <div className="px-3 py-2 flex items-center justify-between cursor-pointer" onClick={() => setLibCats(p => ({ ...p, [cat]: !p[cat] }))}>
                          <span className="text-sm font-medium text-white">{cat}</span>
                          {libCats[cat] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </div>
                        {libCats[cat] && (
                          <div className="p-2 space-y-1 bg-gray-900">
                            {exs.map(ex => {
                              const inDay = (plan[activeDay] || []).flat().some(pe => pe.exerciseId === ex.id);
                              return (
                                <button
                                  key={ex.id}
                                  onClick={() => !inDay && handleMobileExerciseClick(ex)}
                                  disabled={inDay}
                                  className={`w-full flex items-center gap-2 rounded px-3 py-2.5 text-sm transition-colors ${inDay ? "opacity-40 cursor-not-allowed bg-gray-800" : "bg-gray-800 hover:bg-gray-700 active:bg-gray-600"}`}>
                                  <span className="truncate flex-1 text-left">{ex.name}</span>
                                  {inDay && <Check size={14} className="text-gray-500" />}
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
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setContextMenu(null)}>
              <div className="bg-gray-900 rounded-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-800">
                  <h3 className="font-semibold text-white">Add {contextMenu.exercise.name}</h3>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => addAsNewExercise(contextMenu.exercise)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-800 rounded-lg transition-colors">
                    <Plus size={18} className="text-orange-500" />
                    <span className="text-sm text-white">Add as new exercise</span>
                  </button>
                  {(plan[activeDay] || []).length > 0 && (
                    <>
                      <div className="px-4 py-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Superset with:</p>
                      </div>
                      {(plan[activeDay] || []).map((row, ri) => {
                        if (row.length >= 2) return null;
                        return (
                          <button
                            key={ri}
                            onClick={() => addAsSuperset(contextMenu.exercise, ri)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-800 rounded-lg transition-colors">
                            <GripVertical size={18} className="text-gray-500" />
                            <div className="flex-1">
                              <p className="text-sm text-white">{row.map(pe => exMap.get(pe.exerciseId)?.name).join(" + ")}</p>
                              <p className="text-xs text-gray-500">Row {ri + 1}</p>
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
                <div className="p-2 border-t border-gray-800">
                  <button
                    onClick={() => setContextMenu(null)}
                    className="w-full py-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}