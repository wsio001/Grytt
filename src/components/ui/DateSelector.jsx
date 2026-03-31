import { Check, Edit2 } from "lucide-react";
import { DAYS } from "../../constants";
import styles from "./styles/DateSelector.module.css";

export default function DateSelector({
  activeDay,
  setActiveDay,
  dayNames,
  editingName,
  setEditingName,
  nameDraft,
  setNameDraft,
  confirmName
}) {
  return (
    <div className={styles.container}>
      {DAYS.map(day => (
        <button
          key={day}
          onClick={() => setActiveDay(day)}
          className={`${styles.dayButton} ${
            activeDay === day
              ? styles.dayButtonActive
              : styles.dayButtonInactive
          }`}>
          <div>{day}</div>
          <div className={`${styles.dayName} ${activeDay === day ? styles.dayNameActive : styles.dayNameInactive}`}>
            {dayNames[day] || "Rest"}
          </div>
        </button>
      ))}
    </div>
  );
}
