import { DAYS } from "../../constants";
import styles from "./styles/DateSelector.module.css";

export default function DateSelector({
  activeDay,
  setActiveDay,
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
        </button>
      ))}
    </div>
  );
}
