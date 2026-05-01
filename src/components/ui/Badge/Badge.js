// src/components/ui/Badge/Badge.js
import styles from './Badge.module.css';

const LABELS = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  ARCHIVED: 'Archivé',
  APPROVED: 'Approuvé',
  PENDING: 'En attente',
  REJECTED: 'Rejeté',
  INVITED: 'Invité',
  ACCEPTED: 'Accepté',
  DECLINED: 'Refusé',
  SUBMITTED: 'Soumis',
  REVISION_REQUESTED: 'Révision',
  NANO: 'Nano',
  MICRO: 'Micro',
  MACRO: 'Macro',
  MEGA: 'Mega',
};

export default function Badge({ status }) {
  const key = status?.toLowerCase().replace('_', '_');
  return (
    <span className={`${styles.badge} ${styles[status?.toLowerCase()] || ''}`}>
      {LABELS[status] || status}
    </span>
  );
}