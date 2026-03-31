import styles from "./styles/CategorySelector.module.css";

export default function CategorySelector({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div>
      <p className={styles.label}>Main Muscle Group</p>
      <div className={styles.buttonContainer}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`${styles.button} ${selectedCategory === cat ? styles.buttonActive : styles.buttonInactive}`}>
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
