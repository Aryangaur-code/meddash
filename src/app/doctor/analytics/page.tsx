import React from 'react';
import styles from './analytics.module.css';
import { dashboardAnalytics } from '@/data/mockData';

export default function Analytics() {
  const weeklyData = [
    { day: 'Mon', patients: 18 },
    { day: 'Tue', patients: 24 },
    { day: 'Wed', patients: 20 },
    { day: 'Thu', patients: 28 },
    { day: 'Fri', patients: 22 },
    { day: 'Sat', patients: 12 },
    { day: 'Sun', patients: 8 },
  ];

  const maxPatients = Math.max(...weeklyData.map(d => d.patients));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Analytics & Reports</h1>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Patient Volume (This Week)</h2>
          <div className={styles.chart}>
            {weeklyData.map(d => (
              <div key={d.day} className={styles.barColumn}>
                <div 
                  className={styles.bar} 
                  style={{ height: `${(d.patients / maxPatients) * 100}%` }}
                >
                  <span className={styles.barValue}>{d.patients}</span>
                </div>
                <span className={styles.dayLabel}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>AI Efficiency Metrics</h2>
          <div className={styles.metricList}>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Time Saved (Today)</span>
              <span className={styles.metricValue}>{dashboardAnalytics.aiTimeSaved}</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Documentation Auto-Fill</span>
              <span className={styles.metricValue}>87%</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Coding Confidence Avg</span>
              <span className={styles.metricValue}>94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
