import ProductCard from './ProductCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ products, loading = false, columns = 4 }) {
  if (loading) return <LoadingSpinner size="lg" text="Loading products..." />;

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon="🎨"
        title="No products found"
        subtitle="Try adjusting your filters or explore other categories."
      />
    );
  }

  return (
    <div
      className={styles.grid}
      style={{ '--cols': columns }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
