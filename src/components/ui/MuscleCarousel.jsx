import styles from "./styles/MuscleCarousel.module.css";

export default function MuscleCarousel({ muscleCats, catTab, setCatTab }) {
  return (
    <div className={styles.container}>
      {Object.keys(muscleCats).map(cat => (
        <button
          key={cat}
          onClick={() => setCatTab(cat)}
          className={`${styles.button} ${catTab === cat ? styles.buttonActive : styles.buttonInactive}`}>
          {cat}
        </button>
      ))}
    </div>
  );
}
