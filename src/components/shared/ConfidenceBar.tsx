import React from 'react';
import styles from './ConfidenceBar.module.css';
import clsx from 'clsx';

interface ConfidenceBarProps {
  score: number; // 0 to 1
  label?: string;
}

export function ConfidenceBar({ score, label }: ConfidenceBarProps) {
  const percentage = Math.round(score * 100);
  
  let colorClass = styles.high;
  if (score < 0.7) colorClass = styles.low;
  else if (score < 0.9) colorClass = styles.medium;

  return (
    <div className={styles.container}>
      <div className={styles.labelWrapper}>
        <span className={styles.label}>{label || 'AI Confidence'}</span>
        <span className={styles.percentage}>{percentage}%</span>
      </div>
      <div className={styles.track}>
        <div 
          className={clsx(styles.fill, colorClass)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
