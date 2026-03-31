import { Plus, X, Check, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

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
                    <div
                      className="px-3 py-2 flex items-center justify-between cursor-pointer"
                      onClick={() => setLibCats(p => ({ ...p, [cat]: !p[cat] }))}>
                      <span className="text-sm font-medium text-white">{cat}</span>
                      {libCats[cat] ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
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
                              className={`w-full flex items-center gap-2 rounded px-3 py-2.5 text-sm transition-colors ${
                                inDay
                                  ? "opacity-40 cursor-not-allowed bg-gray-800"
                                  : "bg-gray-800 hover:bg-gray-700 active:bg-gray-600"
                              }`}>
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
                          <p className="text-sm text-white">
                            {row.map(pe => exMap.get(pe.exerciseId)?.name).join(" + ")}
                          </p>
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
  );
}
