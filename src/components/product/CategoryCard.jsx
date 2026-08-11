import { Link } from 'react-router-dom';
import styles from './CategoryCard.module.css';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/shop?category=${category.id}`}
      className={styles.card}
      style={{ '--cat-color': category.color, '--cat-bg': category.bgColor }}
      aria-label={`Browse ${category.name}`}
    >
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{category.icon}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{category.name}</h3>
        <p className={styles.description}>{category.description}</p>
        <span className={styles.count}>{category.count} items</span>
      </div>
      <div className={styles.arrow}>→</div>
    </Link>
  );
}
