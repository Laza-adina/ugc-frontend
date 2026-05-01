// src/components/ui/Input/Input.js
import styles from './Input.module.css';

export default function Input({
  label,
  error,
  type = 'text',
  textarea = false,
  ...props
}) {
  return (
    <div className={`${styles.wrapper} ${error ? styles.error : ''}`}>
      {label && <label className={styles.label}>{label}</label>}
      {textarea ? (
        <textarea className={`${styles.input} ${styles.textarea}`} {...props} />
      ) : (
        <input type={type} className={styles.input} {...props} />
      )}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}