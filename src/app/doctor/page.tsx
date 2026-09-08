import React from 'react';
import styles from './page.module.css';
import { dashboardAnalytics } from '@/data/mockData';
import { RiskBadge, RiskLevel } from '@/components/shared/RiskBadge';
import { SeverityAlert, AlertType } from '@/components/shared/SeverityAlert';
import { IconUsers, IconClock, IconFileCheck, IconBell } from '@tabler/icons-react';

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Overview of your clinic for today.</p>
      </header>

      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper}><IconUsers /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Patients</span>
            <span className={styles.kpiValue}>{dashboardAnalytics.totalPatientsToday}</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper}><IconClock /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>AI Time Saved</span>
            <span className={styles.kpiValue}>{dashboardAnalytics.aiTimeSaved}</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper}><IconFileCheck /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Claim Acceptance</span>
            <span className={styles.kpiValue}>{dashboardAnalytics.claimAcceptanceRate}</span>
          </div>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Upcoming Appointments</h2>
          <div className={styles.appointmentList}>
            {dashboardAnalytics.upcomingAppointments.map((appt, idx) => (
              <div key={idx} className={styles.appointmentRow}>
                <span className={styles.apptTime}>{appt.time}</span>
                <span className={styles.apptPatient}>{appt.patient}</span>
                <span className={styles.apptType}>{appt.type}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>High-Priority Alerts</h2>
          <div className={styles.alertList}>
            {dashboardAnalytics.recentAlerts.map((alert, idx) => (
              <SeverityAlert key={idx} type={alert.type as AlertType} message={alert.message} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
