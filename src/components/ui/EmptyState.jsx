import Button from './Button';
import styles from './EmptyState.module.css';

export default function EmptyState({
  icon = '🛍️',
  title = 'Nothing here yet',
  subtitle = 'Explore our collection and find something you love.',
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.subtitle}>{subtitle}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
