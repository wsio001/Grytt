import { Plus } from "lucide-react";
import MuscleTagSelector from "./MuscleTagSelector";
import styles from "./styles/AddExerciseForm.module.css";

export default function AddExerciseForm({
  newName,
  setNewName,
  newTags,
  setNewTags,
  allMuscles,
  onPreview
}) {
  const toggle = (tag) => {
    setNewTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className={styles.form}>
      <p className={styles.title}>Add New Exercise</p>
      <input
        value={newName}
        onChange={e => setNewName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && newTags.length && onPreview()}
        placeholder="Exercise name"
        className={styles.input}
      />
      <MuscleTagSelector
        selectedTags={newTags}
        allMuscles={allMuscles}
        onToggleTag={toggle}
        collapsed={true}
      />
      <button
        onClick={onPreview}
        disabled={!newName.trim() || !newTags.length}
        className={styles.submitButton}>
        <Plus size={18} /> Preview &amp; Add
      </button>
    </div>
  );
}
