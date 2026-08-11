import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
