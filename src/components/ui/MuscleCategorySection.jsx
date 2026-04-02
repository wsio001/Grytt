import MuscleRow from "./MuscleRow";
import styles from "./styles/MuscleCategorySection.module.css";

export default function MuscleCategorySection({
  category,
  muscles,
  goals,
  onUpdateGoal,
  onDelete
}) {
  // Only show muscles that have goals set
  const activeMuscles = muscles.filter(m => m in goals);

  if (!activeMuscles.length) return null;

  return (
    <div className={styles.categoryContainer}>
      <p className={styles.categoryTitle}>
        {category}
      </p>
      <div className={styles.muscleGrid}>
        {activeMuscles.map(muscle => (
          <MuscleRow
            key={muscle}
            muscle={muscle}
            goalValue={goals[muscle] || 0}
            onUpdateGoal={onUpdateGoal}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
