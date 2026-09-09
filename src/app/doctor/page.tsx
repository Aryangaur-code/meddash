'use client';
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

      {/* Direct Connect Section */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px', background: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Direct Connect:</span>
        <input 
          type="text" 
          placeholder="Enter Patient ID (e.g., P-1001)" 
          id="patient-id-input"
          style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)', width: '240px' }}
        />
        <button 
          onClick={() => {
            const patId = (document.getElementById('patient-id-input') as HTMLInputElement).value.trim();
            if (patId) window.location.href = `/doctor/consultation?patientId=${patId}`;
          }}
          style={{ padding: '10px 20px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}
        >
          Connect
        </button>
      </div>

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
