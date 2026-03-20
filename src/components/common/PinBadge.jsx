import styles from './PinBadge.module.css';

export function PinBadge({ pin }) {
  if (!pin) return null;
  return (
    <div className={styles.badge}>
      <span className={styles.label}>PIN</span>
      <span className={styles.pin}>{pin}</span>
    </div>
  );
}
