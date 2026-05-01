// src/components/ui/Button/Button.js
import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  onClick,
  type = 'button',
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
        full ? styles.full : '',
        disabled ? styles.disabled : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}