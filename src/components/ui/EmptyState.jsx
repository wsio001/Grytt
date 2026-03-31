import styles from "./styles/EmptyState.module.css";

export default function EmptyState({ message }) {
  return (
    <div className={styles.container}>
      {message}
    </div>
  );
}
