import { GripVertical, Check, ChevronDown, ChevronUp } from "lucide-react";

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
    <div className="bg-gray-900 rounded-xl p-3 overflow-y-auto" style={{ width: "30%", flexShrink: 0, maxHeight: 520 }}>
      <p className="text-xs font-semibold text-orange-400 sticky top-0 bg-gray-900 py-1 mb-2">Library</p>
      <div className="space-y-2">
        {Object.entries(libGrouped).map(([cat, exs]) => {
          if (!exs.length) return null;
          return (
            <div key={cat} className="rounded-lg overflow-hidden bg-gray-800">
              <div
                className="px-2 py-1.5 flex items-center justify-between cursor-pointer"
                onClick={() => setLibCats(p => ({ ...p, [cat]: !p[cat] }))}>
                <span className="text-xs font-medium text-white">{cat}</span>
                {libCats[cat] ? (
                  <ChevronUp size={12} className="text-gray-400" />
                ) : (
                  <ChevronDown size={12} className="text-gray-400" />
                )}
              </div>
              {libCats[cat] && (
                <div className="p-1.5 space-y-1 bg-gray-900">
                  {exs.map(ex => {
                    const inDay = (plan[activeDay] || []).flat().some(pe => pe.exerciseId === ex.id);
                    return (
                      <div
                        key={ex.id}
                        draggable={!inDay}
                        onDragStart={() => dispatchDrag({ type: "START_LIB", ex })}
                        onDragEnd={resetDrag}
                        className={`flex items-center gap-1.5 rounded px-2 py-1.5 select-none text-xs transition-colors ${
                          inDay
                            ? "opacity-40 cursor-default bg-gray-800"
                            : "bg-gray-800 hover:bg-gray-700 cursor-grab active:cursor-grabbing"
                        }`}>
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
  );
}
