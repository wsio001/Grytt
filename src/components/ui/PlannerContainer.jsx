import { Check, Edit2 } from "lucide-react";
import DropZone from "./DropZone";
import PlannerWorkoutCard from "./PlannerWorkoutCard";
import { DAYS_FULL, DAYS } from "../../constants";
import styles from "./styles/PlannerContainer.module.css";

export default function PlannerContainer({
  activeDay,
  fullDayName,
  plan,
  exMap,
  dragState,
  nameEditor,
  workoutHandlers,
  dragHandlers,
  onEmptyClick
}) {
  const { isMobile, isDragging, isDraggingMobile, drag } = dragState;
  const { editingName, setEditingName, nameDraft, setNameDraft, confirmName, dayNames } = nameEditor;
  const { updSets, remPe } = workoutHandlers;
  const { dispatchDrag, resetDrag, handleDrop, handleTouchStart, handleTouchEnd, handleTouchMove } = dragHandlers;
  return (
    <div
      className={`${styles.container} ${!isMobile && isDragging ? styles.containerDragging : ""}`}
      style={{ minHeight: 400 }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        if (!(plan[activeDay] || []).length) handleDrop(activeDay, -1, "new-row");
      }}>

      <div className={styles.header}>
        <p className={styles.title}>{fullDayName}'s Workout</p>
        <div className={styles.nameEditor}>
          {editingName ? (
            <>
              <input
                autoFocus
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && confirmName()}
                placeholder="Upper, Push, Legs…"
                className={styles.nameInput}
              />
              <button onClick={confirmName} className={styles.confirmButton}>
                <Check size={14} />
              </button>
            </>
          ) : (
            <>
              <span className={dayNames[activeDay] ? styles.nameDisplay : styles.nameDisplayUnnamed}>
                {dayNames[activeDay] || "Unnamed"}
              </span>
              <button
                onClick={() => {
                  setNameDraft(dayNames[activeDay] || "");
                  setEditingName(true);
                }}
                className={styles.editButton}>
                <Edit2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {!(plan[activeDay] || []).length && (
        <div
          onClick={onEmptyClick}
          className={`${styles.emptyState} ${
            !isMobile && isDragging ? styles.emptyStateDragging : styles.emptyStateDefault
          } ${onEmptyClick ? styles.emptyStateClickable : ""}`}>
          <span className={styles.emptyText}>
            {isMobile ? "Tap here or + to add exercises" : "Drag exercises here"}
          </span>
        </div>
      )}

      {(plan[activeDay] || []).length > 0 && (
        <div className={styles.workoutList}>
          {((!isMobile && isDragging) || (isMobile && isDraggingMobile)) && (
            <DropZone
              active={true}
              highlight={drag.overRow === -1 && drag.overPos === "new-row"}
              label="Insert here"
              className={styles.dropZone}
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
              dragState={dragState}
              workoutHandlers={workoutHandlers}
              dragHandlers={dragHandlers}
            />
          ))}
        </div>
      )}
    </div>
  );
}
