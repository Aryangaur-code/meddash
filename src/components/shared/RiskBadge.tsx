import React from 'react';
import styles from './RiskBadge.module.css';
import clsx from 'clsx';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const levelClass = styles[level.toLowerCase()];

  return (
    <span className={clsx(styles.badge, levelClass)}>
      {level} Risk
    </span>
  );
}
