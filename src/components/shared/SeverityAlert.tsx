import React from 'react';
import styles from './SeverityAlert.module.css';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import clsx from 'clsx';

export type AlertType = 'Critical' | 'Warning' | 'Info';

interface SeverityAlertProps {
  type: AlertType;
  message: string;
}

export function SeverityAlert({ type, message }: SeverityAlertProps) {
  const isCritical = type === 'Critical';
  const isWarning = type === 'Warning';
  
  const Icon = isCritical || isWarning ? IconAlertTriangle : IconInfoCircle;

  return (
    <div className={clsx(styles.alert, {
      [styles.critical]: isCritical,
      [styles.warning]: isWarning,
      [styles.info]: type === 'Info'
    })}>
      <Icon size={18} className={styles.icon} />
      <span className={styles.message}>{message}</span>
    </div>
  );
}
