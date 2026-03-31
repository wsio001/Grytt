import { GripVertical, Plus, Minus, Trash2 } from "lucide-react";
import DropZone from "./DropZone";

export default function PlannerWorkoutCard({
  row,
  rowIndex,
  activeDay,
  exMap,
  isMobile,
  isDragging,
  isDraggingMobile,
  drag,
  updSets,
  remPe,
  dispatchDrag,
  resetDrag,
  handleDrop,
  handleTouchStart,
  handleTouchEnd,
  handleTouchMove
}) {
  const isSuperset = row.length > 1;
  const isDraggingThisRow = isMobile && drag.srcRow === rowIndex && drag.src === activeDay && isDraggingMobile;

  return (
    <div>
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
            if (!ex) {
              return (
                <div key={pe.id} className="flex-1 bg-gray-800 rounded-lg p-2 text-xs text-gray-600 italic">
                  Unknown
                </div>
              );
            }
            return (
              <div
                key={pe.id}
                draggable={true}
                onDragStart={() => dispatchDrag({ type: "START_PLAN", pe: row[0], src: activeDay, srcRow: rowIndex })}
                onDragEnd={() => { resetDrag(); handleTouchEnd(); }}
                onTouchStart={() => isMobile && handleTouchStart(pe, activeDay, rowIndex)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                className={`${isMobile && isSuperset ? "w-full" : "flex-1"} bg-gray-800 rounded-lg p-2 transition-all ${!isMobile || isDraggingMobile ? "cursor-grab active:cursor-grabbing" : ""}`}>
                <div className="flex items-center gap-1.5">
                  {!isMobile && <GripVertical size={11} className="text-gray-500 flex-shrink-0" />}
                  {isMobile && isSuperset && (
                    <span className="text-xs text-orange-400 font-bold mr-1">{peIndex + 1}</span>
                  )}
                  <span className="flex-1 text-xs font-medium truncate">{ex.name}</span>
                  <button
                    onClick={() => updSets(activeDay, rowIndex, pe.id, -1)}
                    className="p-0.5 bg-gray-700 rounded hover:bg-gray-600">
                    <Minus size={10} />
                  </button>
                  <span className="w-4 text-center text-orange-400 font-bold text-xs">{pe.sets}</span>
                  <button
                    onClick={() => updSets(activeDay, rowIndex, pe.id, 1)}
                    className="p-0.5 bg-gray-700 rounded hover:bg-gray-600">
                    <Plus size={10} />
                  </button>
                  <button
                    onClick={() => remPe(activeDay, rowIndex, pe.id)}
                    className="p-0.5 text-red-400 rounded hover:bg-red-500/20 ml-0.5">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            );
          })}
          {((!isMobile && isDragging) || (isMobile && isDraggingMobile)) && row.length < 2 && (
            <DropZone
              active={true}
              highlight={drag.overRow === rowIndex && drag.overPos === "superset"}
              label="Superset"
              className={isMobile && row.length > 1 ? "w-full mt-2" : "flex-1"}
              onOver={() => dispatchDrag({ type: "OVER", row: rowIndex, pos: "superset" })}
              onLeave={() => dispatchDrag({ type: "OVER", row: null, pos: null })}
              onDrop={() => handleDrop(activeDay, rowIndex, "superset")}
            />
          )}
        </div>
      </div>
      {((!isMobile && isDragging) || (isMobile && isDraggingMobile)) && (
        <DropZone
          active={true}
          highlight={drag.overRow === rowIndex && drag.overPos === "new-row"}
          label="New row"
          className="h-8 mt-2"
          onOver={() => dispatchDrag({ type: "OVER", row: rowIndex, pos: "new-row" })}
          onLeave={() => dispatchDrag({ type: "OVER", row: null, pos: null })}
          onDrop={() => handleDrop(activeDay, rowIndex, "new-row")}
        />
      )}
    </div>
  );
}
