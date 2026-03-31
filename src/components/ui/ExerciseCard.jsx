import { Edit2, Check, X, Trash2 } from "lucide-react";
import MuscleTagSelector from "./MuscleTagSelector";
import styles from "./styles/ExerciseCard.module.css";

export default function ExerciseCard({
  exercise,
  isEditing,
  editName,
  setEditName,
  editTags,
  allMuscles,
  toggleTag,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onOpenDetail
}) {
  return (
    <div className={styles.card}>
      {isEditing ? (
        <div>
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className={styles.editInput}
          />
          <MuscleTagSelector
            selectedTags={editTags}
            allMuscles={allMuscles}
            onToggleTag={toggleTag}
          />
          <div className={styles.buttonContainer}>
            <button
              onClick={onSave}
              className={styles.saveButton}>
              <Check size={16} />
              Save
            </button>
            <button
              onClick={onCancel}
              className={styles.cancelButton}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.viewContainer}>
          <button className={styles.exerciseInfo} onClick={onOpenDetail}>
            <p className={styles.exerciseName}>{exercise.name}</p>
            <div className={styles.tagContainer}>
              {exercise.tags.map(t => (
                <span
                  key={t}
                  className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          </button>
          <div className={styles.actionContainer}>
            <button
              onClick={onEdit}
              className={styles.editButton}>
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className={styles.deleteButton}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
