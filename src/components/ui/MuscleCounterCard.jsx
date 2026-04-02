import styles from "./styles/MuscleCounterCard.module.css";

export default function MuscleCounterCard({ category, muscles, vol, goals }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{category}</p>
      <div className={styles.muscleList}>
        {muscles.filter(m => m in goals).map(muscle => {
          const curr = vol[muscle] || 0;
          const tgt = goals[muscle] || 0;
          const done = tgt > 0 && curr >= tgt;
          return (
            <div
              key={muscle}
              className={`${styles.muscleItem} ${
                done
                  ? styles.muscleDone
                  : curr > 0
                  ? styles.muscleInProgress
                  : styles.muscleNotStarted
              }`}>
              <span className={styles.muscleName}>{muscle}</span>
              <span className={styles.muscleCount}>{curr}{tgt > 0 ? `/${tgt}` : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
