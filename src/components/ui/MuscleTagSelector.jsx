import { useState } from "react";
import { Plus, X } from "lucide-react";
import styles from "./styles/MuscleTagSelector.module.css";

export default function MuscleTagSelector({ selectedTags, allMuscles, onToggleTag, collapsed = false }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const availableMuscles = allMuscles.filter(m => !selectedTags.includes(m));
  const hasNoTags = selectedTags.length === 0;

  // If collapsed mode and no tags selected, show single "Add Tags" button
  if (collapsed && hasNoTags) {
    return (
      <div className={styles.container}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={styles.collapsedButton}>
          <Plus size={16} />
          Add Tags
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <>
            <div className={styles.backdrop} onClick={() => setShowDropdown(false)} />
            <div className={styles.dropdown}>
              {availableMuscles.map(muscle => (
                <button
                  key={muscle}
                  onClick={() => {
                    onToggleTag(muscle);
                    setShowDropdown(false);
                  }}
                  className={styles.dropdownButton}>
                  {muscle}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.normalContainer}>
      <p className={styles.label}>Muscle Groups</p>
      <div className={styles.tagContainer}>
        {/* Selected tags as removable pills */}
        {selectedTags.map(tag => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={styles.tag}>
            {tag}
            <X size={12} />
          </button>
        ))}

        {/* Add button */}
        {availableMuscles.length > 0 && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={styles.addButton}>
            <Plus size={12} />
            Add
          </button>
        )}
      </div>

      {/* Dropdown menu */}
      {showDropdown && availableMuscles.length > 0 && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className={styles.backdrop}
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className={styles.dropdown}>
            {availableMuscles.map(muscle => (
              <button
                key={muscle}
                onClick={() => {
                  onToggleTag(muscle);
                  setShowDropdown(false);
                }}
                className={styles.dropdownButton}>
                {muscle}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
