import React from 'react';
import styles from './prescriptions.module.css';
import { prescriptions } from '@/data/mockData';
import { EntityPill } from '@/components/shared/EntityPill';
import { SeverityAlert } from '@/components/shared/SeverityAlert';
import { IconPlus, IconPill, IconSend } from '@tabler/icons-react';

export default function Prescriptions() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Prescription Builder</h1>
        <button className={styles.primaryBtn}><IconSend size={18} /> Send to Pharmacy</button>
      </div>

      <div className={styles.content}>
        <div className={styles.builderPanel}>
          <div className={styles.searchSection}>
            <input type="text" placeholder="Search for medications (e.g., Amlodipine)..." className={styles.searchInput} />
            <button className={styles.addBtn}><IconPlus size={18} /> Add</button>
          </div>

          <SeverityAlert type="Warning" message="Interaction Detected: Metformin + Amlodipine may cause slight hypoglycemic effects. Monitor closely." />

          <div className={styles.rxList}>
            {prescriptions.map(rx => (
              <div key={rx.id} className={styles.rxItem}>
                <div className={styles.rxIcon}><IconPill size={24} /></div>
                <div className={styles.rxDetails}>
                  <div className={styles.rxTop}>
                    <span className={styles.drugName}>{rx.drug}</span>
                    <EntityPill label={rx.status} type={rx.status === 'Draft' ? 'default' : 'diagnosis'} />
                  </div>
                  <div className={styles.rxBottom}>
                    <span>Dose: {rx.dose}</span>
                    <span>Freq: {rx.frequency}</span>
                    <span>Dur: {rx.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.patientContext}>
          <h2 className={styles.panelTitle}>Patient Context (R. Kumar)</h2>
          <div className={styles.contextBox}>
            <strong>Allergies:</strong>
            <p>Penicillin</p>
          </div>
          <div className={styles.contextBox}>
            <strong>Active Meds:</strong>
            <ul>
              <li>Metformin 500mg</li>
              <li>Amlodipine 5mg</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
