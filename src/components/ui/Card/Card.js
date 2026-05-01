// src/components/ui/Card/Card.js
import styles from './Card.module.css';

export default function Card({ children, onClick, style }) {
  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}