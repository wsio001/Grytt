import { Plus } from "lucide-react";
import CategorySelector from "./CategorySelector";
import styles from "./styles/AddMuscleForm.module.css";

export default function AddMuscleForm({
  newMuscle,
  setNewMuscle,
  newMuscleCat,
  setNewMuscleCat,
  muscleCats,
  goals,
  onAdd
}) {
  const categories = Object.keys(muscleCats);
  const isDisabled = !newMuscle.trim() || newMuscle.trim() in goals;

  return (
    <div className={styles.form}>
      <p className={styles.description}>
        Add a new muscle to an existing group and set its weekly target.
      </p>

      <CategorySelector
        categories={categories}
        selectedCategory={newMuscleCat}
        onSelectCategory={setNewMuscleCat}
      />

      <div className={styles.inputContainer}>
        <p className={styles.label}>Muscle Name</p>
        <input
          value={newMuscle}
          onChange={e => setNewMuscle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !isDisabled && onAdd()}
          placeholder={`e.g. Inner ${newMuscleCat}`}
          className={styles.input}
        />
      </div>

      <button
        onClick={onAdd}
        disabled={isDisabled}
        className={styles.submitButton}>
        <Plus size={16} /> Add to {newMuscleCat}
      </button>
    </div>
  );
}
