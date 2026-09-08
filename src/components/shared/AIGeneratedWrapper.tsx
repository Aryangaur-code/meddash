import React from 'react';
import styles from './AIGeneratedWrapper.module.css';
import { IconSparkles } from '@tabler/icons-react';

interface AIGeneratedWrapperProps {
  children: React.ReactNode;
  title?: string;
}

export function AIGeneratedWrapper({ children, title = 'AI GENERATED' }: AIGeneratedWrapperProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <IconSparkles size={12} className={styles.icon} />
          <span>{title}</span>
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
