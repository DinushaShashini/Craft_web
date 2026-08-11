import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.inner} />
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}
