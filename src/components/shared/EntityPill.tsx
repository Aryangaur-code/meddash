import React from 'react';
import styles from './EntityPill.module.css';

interface EntityPillProps {
  label: string;
  type?: 'default' | 'drug' | 'diagnosis' | 'code';
}

export function EntityPill({ label, type = 'default' }: EntityPillProps) {
  return (
    <span className={`${styles.pill} ${styles[type]}`}>
      {label}
    </span>
  );
}
