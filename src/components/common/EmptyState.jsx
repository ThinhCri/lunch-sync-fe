import { Button, Result } from 'antd';
import styles from './EmptyState.module.css';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  if (!title) return null;
  return (
    <div className={styles.container}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <Button type="primary" onClick={onAction} className={styles.action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
