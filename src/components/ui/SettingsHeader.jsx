import { Plus, X } from "lucide-react";
import styles from "./styles/SettingsHeader.module.css";

export default function SettingsHeader({ showAdd, onToggleAdd }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Muscle Groups</h2>
      <button
        onClick={onToggleAdd}
        className={`${styles.button} ${showAdd ? styles.buttonClose : styles.buttonAdd}`}>
        {showAdd ? <X size={20} /> : <Plus size={20} />}
      </button>
    </div>
  );
}
