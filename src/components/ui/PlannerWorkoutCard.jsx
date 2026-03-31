import { GripVertical, Plus, Minus, Trash2 } from "lucide-react";
import DropZone from "./DropZone";
import styles from "./styles/PlannerWorkoutCard.module.css";

export default function PlannerWorkoutCard({
  row,
  rowIndex,
  activeDay,
  exMap,
  dragState,
  workoutHandlers,
  dragHandlers
}) {
  const { isMobile, isDragging, isDraggingMobile, drag } = dragState;
  const { updSets, remPe } = workoutHandlers;
  const { dispatchDrag, resetDrag, handleDrop, handleTouchStart, handleTouchEnd, handleTouchMove } = dragHandlers;

  const isSuperset = row.length > 1;
  const isDraggingThisRow = isMobile && drag.srcRow === rowIndex && drag.src === activeDay && isDraggingMobile;

  return (
    <div>
      {/* Superset container with visual grouping */}
      <div className={isMobile && isSuperset ? styles.supersetContainer : ""}>
        {isMobile && isSuperset && (
          <div className={styles.supersetIndicator}></div>
        )}
        {isMobile && isSuperset && (
          <div className={styles.supersetHeader}>
            <GripVertical size={12} className="text-orange-500" />
            <span className={styles.supersetLabel}>Superset</span>
          </div>
        )}
        <div className={`${isMobile && isSuperset ? styles.cardRowMobile : styles.cardRow} ${isDraggingThisRow ? styles.cardRowDragging : ""}`}>
          {row.map((pe, peIndex) => {
            const ex = exMap.get(pe.exerciseId);
            if (!ex) {
              return (
                <div key={pe.id} className={styles.unknownExercise}>
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
                className={`${isMobile && isSuperset ? styles.exerciseCardMobile : styles.exerciseCard} ${!isMobile || isDraggingMobile ? styles.exerciseCardDraggable : ""}`}>
                <div className={styles.exerciseHeader}>
                  {!isMobile && <GripVertical size={11} className={styles.gripIcon} />}
                  {isMobile && isSuperset && (
                    <span className={styles.supersetNumber}>{peIndex + 1}</span>
                  )}
                  <span className={styles.exerciseName}>{ex.name}</span>
                  <button
                    onClick={() => updSets(activeDay, rowIndex, pe.id, -1)}
                    className={styles.button}>
                    <Minus size={10} />
                  </button>
                  <span className={styles.setsCount}>{pe.sets}</span>
                  <button
                    onClick={() => updSets(activeDay, rowIndex, pe.id, 1)}
                    className={styles.button}>
                    <Plus size={10} />
                  </button>
                  <button
                    onClick={() => remPe(activeDay, rowIndex, pe.id)}
                    className={styles.deleteButton}>
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
              className={isMobile && row.length > 1 ? styles.dropZoneSupersetMobile : styles.dropZoneSuperset}
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
          className={styles.dropZoneNewRow}
          onOver={() => dispatchDrag({ type: "OVER", row: rowIndex, pos: "new-row" })}
          onLeave={() => dispatchDrag({ type: "OVER", row: null, pos: null })}
          onDrop={() => handleDrop(activeDay, rowIndex, "new-row")}
        />
      )}
    </div>
  );
}
