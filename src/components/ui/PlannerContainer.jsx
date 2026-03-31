import { Check, Edit2 } from "lucide-react";
import DropZone from "./DropZone";
import PlannerWorkoutCard from "./PlannerWorkoutCard";
import { DAYS_FULL, DAYS } from "../../constants";

export default function PlannerContainer({
  isMobile,
  isDragging,
  isDraggingMobile,
  activeDay,
  fullDayName,
  editingName,
  setEditingName,
  nameDraft,
  setNameDraft,
  confirmName,
  dayNames,
  plan,
  handleDrop,
  drag,
  dispatchDrag,
  exMap,
  updSets,
  remPe,
  resetDrag,
  handleTouchStart,
  handleTouchEnd,
  handleTouchMove
}) {
  return (
    <div
      className={`bg-gray-900 rounded-xl p-3 flex-1 transition-all ${!isMobile && isDragging ? "ring-2 ring-orange-500/40" : ""}`}
      style={{ minHeight: 400 }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        if (!(plan[activeDay] || []).length) handleDrop(activeDay, -1, "new-row");
      }}>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-orange-400">{fullDayName}'s Workout</p>
        <div className="flex items-center gap-1.5">
          {editingName ? (
            <>
              <input
                autoFocus
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && confirmName()}
                placeholder="Upper, Push, Legs…"
                className="bg-gray-800 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500 w-32"
              />
              <button onClick={confirmName} className="p-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                <Check size={14} />
              </button>
            </>
          ) : (
            <>
              <span className={`text-xs ${dayNames[activeDay] ? "text-white font-medium" : "text-gray-600"}`}>
                {dayNames[activeDay] || "Unnamed"}
              </span>
              <button
                onClick={() => {
                  setNameDraft(dayNames[activeDay] || "");
                  setEditingName(true);
                }}
                className="p-1 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700">
                <Edit2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {!(plan[activeDay] || []).length && (
        <div
          className={`rounded-lg border-2 border-dashed flex items-center justify-center py-10 transition-all ${
            !isMobile && isDragging ? "border-orange-500/50 bg-orange-500/5" : "border-gray-800"
          }`}>
          <span className="text-gray-600 text-sm">
            {isMobile ? "Tap + to add exercises" : "Drag exercises here"}
          </span>
        </div>
      )}

      {(plan[activeDay] || []).length > 0 && (
        <div className="space-y-2">
          {((!isMobile && isDragging) || (isMobile && isDraggingMobile)) && (
            <DropZone
              active={true}
              highlight={drag.overRow === -1 && drag.overPos === "new-row"}
              label="Insert here"
              className="h-8"
              onOver={() => dispatchDrag({ type: "OVER", row: -1, pos: "new-row" })}
              onLeave={() => dispatchDrag({ type: "OVER", row: null, pos: null })}
              onDrop={() => handleDrop(activeDay, -1, "new-row")}
            />
          )}
          {(plan[activeDay] || []).map((row, ri) => (
            <PlannerWorkoutCard
              key={ri}
              row={row}
              rowIndex={ri}
              activeDay={activeDay}
              exMap={exMap}
              isMobile={isMobile}
              isDragging={isDragging}
              isDraggingMobile={isDraggingMobile}
              drag={drag}
              updSets={updSets}
              remPe={remPe}
              dispatchDrag={dispatchDrag}
              resetDrag={resetDrag}
              handleDrop={handleDrop}
              handleTouchStart={handleTouchStart}
              handleTouchEnd={handleTouchEnd}
              handleTouchMove={handleTouchMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
