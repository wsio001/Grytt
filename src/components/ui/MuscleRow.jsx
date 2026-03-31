import { Plus, Minus, Trash2 } from "lucide-react";
import styles from "./styles/MuscleRow.module.css";

export default function MuscleRow({ muscle, goalValue, onUpdateGoal, onDelete }) {
  return (
    <div className={styles.row}>
      <span className={styles.muscleName}>{muscle}</span>
      <div className={styles.controls}>
        <button
          onClick={() => onUpdateGoal(muscle, goalValue - 1)}
          className={styles.button}>
          <Minus size={13} />
        </button>
        <span className={styles.goalValue}>
          {goalValue}
        </span>
        <button
          onClick={() => onUpdateGoal(muscle, goalValue + 1)}
          className={styles.button}>
          <Plus size={13} />
        </button>
        <button
          onClick={() => onDelete(muscle)}
          className={styles.deleteButton}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
