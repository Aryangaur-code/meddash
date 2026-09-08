'use client';
import React from 'react';
import styles from './health.module.css';
import { wearableVitals, patientSupplyStatus, currentConsultation } from '@/data/mockData';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  IconActivity, IconHeartbeat, IconWalk, IconMoon, IconPill, IconBellRinging, 
  IconBrain, IconRun, IconDroplet, IconLungs, IconCalendarEvent 
} from '@tabler/icons-react';

export default function PatientHealthDashboard() {
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Health & Fitness Vitals</h1>
        <p className={styles.subtitle}>Wearable sensor synced • Last updated: Just now</p>
      </header>

      <div className={styles.dashboardGrid}>

        {/* 1. Knowledge Graph AI Analysis (Full Width) */}
        <div className={`${styles.panel} ${styles.fullWidthPanel}`}>
          <h2 className={styles.panelTitle}>
            <IconBrain color="#a4ff00" /> AI Knowledge Graph Report
          </h2>
          <div className={styles.kgContent}>
            <p>
              Based on your latest synced vitals and medical history, your overall wellness index is stable. 
              Your <span className={styles.kgHighlight}>Fasting Glucose</span> aligns perfectly with your prescribed Metformin regimen. 
              However, your <span className={styles.kgWarning}>Blood Pressure (145/90)</span> has shown slight elevation correlating with evening headaches.
            </p>
            <p style={{ marginTop: '12px' }}>
              <strong>AI Recommendation:</strong> Maintain your current <span className={styles.kgHighlight}>average of 7,300 steps/day</span>. 
              We have automatically flagged your BP trends to Dr. Sharma for your next review.
            </p>
          </div>
        </div>

        {/* 2. Fitness Rings Summary */}
        <div className={`${styles.panel} ${styles.fullWidthPanel}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div className={styles.fitnessSummary}>
             <div className={styles.metricCard}>
               <span className={`${styles.metricValue} ${styles.redText}`}>2,300</span>
               <span className={`${styles.metricLabel} ${styles.redText}`}>Move (kcal)</span>
             </div>
             <div className={styles.metricCard}>
               <span className={`${styles.metricValue} ${styles.greenText}`}>45</span>
               <span className={`${styles.metricLabel} ${styles.greenText}`}>Exercise (min)</span>
             </div>
             <div className={styles.metricCard}>
               <span className={`${styles.metricValue} ${styles.blueText}`}>10</span>
               <span className={`${styles.metricLabel} ${styles.blueText}`}>Stand (hrs)</span>
             </div>
           </div>
        </div>

        {/* 3. Micro Widgets for Vitals */}
        <div className={styles.microGrid}>
          <div className={styles.microPanel}>
            <div className={styles.microTitle}><IconWalk size={16} color="#a4ff00"/> Daily Steps</div>
            <div className={styles.microValue}>7,342 <span className={styles.microUnit}>steps</span></div>
          </div>
          <div className={styles.microPanel}>
            <div className={styles.microTitle}><IconRun size={16} color="#a4ff00"/> Step Distance</div>
            <div className={styles.microValue}>5.2 <span className={styles.microUnit}>km</span></div>
          </div>
          <div className={styles.microPanel}>
            <div className={styles.microTitle}><IconRun size={16} color="#a4ff00"/> Walking Pace</div>
            <div className={styles.microValue}>12&apos;30&quot; <span className={styles.microUnit}>/km</span></div>
          </div>
          <div className={styles.microPanel}>
            <div className={styles.microTitle}><IconHeartbeat size={16} color="#fa114f"/> Heart Rate</div>
            <div className={styles.microValue}>72 <span className={styles.microUnit}>bpm</span></div>
          </div>
          <div className={styles.microPanel}>
            <div className={styles.microTitle}><IconMoon size={16} color="#00e5ff"/> Sleep Data</div>
            <div className={styles.microValue}>6h 45m</div>
          </div>
          <div className={styles.microPanel}>
            <div className={styles.microTitle}><IconLungs size={16} color="#3b82f6"/> Blood Oxygen</div>
            <div className={styles.microValue}>98<span className={styles.microUnit}>%</span></div>
          </div>
          <div className={styles.microPanel}>
            <div className={styles.microTitle}><IconDroplet size={16} color="#ef4444"/> Blood Pressure</div>
            <div className={styles.microValue}>120/80</div>
          </div>
        </div>

        {/* 4. Heart Rate Chart */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <IconHeartbeat color="#fa114f" /> Heart Rate Trend
          </h2>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wearableVitals}>
                <XAxis dataKey="day" stroke="#8e8e93" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="heartRate" stroke="#fa114f" strokeWidth={3} dot={{ fill: '#fa114f', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Steps Chart */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <IconWalk color="#a4ff00" /> Daily Steps
          </h2>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wearableVitals}>
                <XAxis dataKey="day" stroke="#8e8e93" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1c1c1e', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="steps" fill="#a4ff00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Appointments & Medical Supply */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <IconCalendarEvent color="#f59e0b" /> Upcoming Appointments
          </h2>
          <div className={styles.supplyItem} style={{ borderLeft: '4px solid #f59e0b' }}>
             <div className={styles.supplyHeader}>
               <span className={styles.medName}>Dr. Rohan Sharma</span>
               <span className={styles.daysLeft}>In 3 Days</span>
             </div>
             <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
               Follow-up Consultation • 10:30 AM
             </div>
          </div>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <IconPill color="#00e5ff" /> Supply Alerts
          </h2>
          <div>
            {patientSupplyStatus.map((supply, idx) => {
              const percentLeft = (supply.pillsLeft / supply.totalPills) * 100;
              const isWarning = supply.pillsLeft <= 5;

              return (
                <div key={idx} className={styles.supplyItem}>
                  <div className={styles.supplyHeader}>
                    <span className={styles.medName}>{supply.medName}</span>
                    <span className={styles.daysLeft}>{supply.pillsLeft} Days Left</span>
                  </div>
                  <div className={styles.progressBarBg} style={{ marginTop: '8px' }}>
                    <div 
                      className={`${styles.progressBarFill} ${isWarning ? styles.fillWarning : styles.fillNormal}`}
                      style={{ width: `${percentLeft}%` }}
                    />
                  </div>
                  {isWarning && (
                    <div className={styles.alertBadge}>
                      <IconBellRinging size={18} />
                      Doctor notified of low supply.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
