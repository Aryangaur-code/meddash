'use client';
import React, { useState } from 'react';
import styles from './schedule.module.css';
import { 
  IconClock, 
  IconCheck, 
  IconMessageCircle, 
  IconAlertCircle, 
  IconStethoscope,
  IconRun
} from '@tabler/icons-react';
import { useAppContext } from '@/context/AppContext';

type AppointmentStatus = 'Scheduled' | 'Waiting' | 'Consulting' | 'Completed';

interface Appointment {
  id: string;
  time: string;
  patient: string;
  reason: string;
  status: AppointmentStatus;
}

const mockSchedule: Appointment[] = [
  { id: 'APT-1', time: '09:00 AM', patient: 'Anjali Verma', reason: 'Routine Follow-up', status: 'Completed' },
  { id: 'APT-2', time: '09:30 AM', patient: 'Suresh Menon', reason: 'Blood Pressure Check', status: 'Completed' },
  { id: 'APT-3', time: '10:00 AM', patient: 'Rajesh Kumar', reason: 'Hypertension Management', status: 'Consulting' },
  { id: 'APT-4', time: '10:30 AM', patient: 'Priya Patel', reason: 'Chest Pain Evaluation', status: 'Waiting' },
  { id: 'APT-5', time: '11:00 AM', patient: 'Vikram Singh', reason: 'Knee Pain / Arthritis', status: 'Scheduled' },
  { id: 'APT-6', time: '11:30 AM', patient: 'Neha Gupta', reason: 'Viral Fever', status: 'Scheduled' },
  { id: 'APT-7', time: '01:00 PM', patient: 'Rahul Sharma', reason: 'Diabetes Screening', status: 'Scheduled' },
  { id: 'APT-8', time: '01:30 PM', patient: 'Anita Desai', reason: 'Asthma Follow-up', status: 'Scheduled' },
];

export default function DoctorSchedule() {
  const { patients } = useAppContext();
  const [appointments, setAppointments] = useState<Appointment[]>(mockSchedule);
  const [selectedAptId, setSelectedAptId] = useState<string>('APT-3'); // Default to current

  const selectedApt = appointments.find(a => a.id === selectedAptId);

  const updateStatus = (newStatus: AppointmentStatus) => {
    if (!selectedApt) return;
    setAppointments(prev => prev.map(apt => 
      apt.id === selectedApt.id ? { ...apt, status: newStatus } : apt
    ));
  };

  const sendNotification = (message: string) => {
    if (!selectedApt) return;
    alert(`SMS Sent to ${selectedApt.patient}:\n\n"${message}"`);
  };

  return (
    <div className={styles.scheduleContainer}>
      <h1 className={styles.pageTitle}>Today&apos;s Schedule</h1>

      <div className={styles.grid}>
        
        {/* Left Column: Timeline */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Workflow Timeline</h2>
          <div className={styles.timeline}>
            {appointments.map((apt) => (
              <div 
                key={apt.id} 
                className={`${styles.timelineItem} ${selectedAptId === apt.id ? styles.active : ''}`}
                onClick={() => setSelectedAptId(apt.id)}
              >
                <div className={styles.time}>{apt.time}</div>
                <div className={styles.patientName}>{apt.patient}</div>
                <div className={styles.reason}>{apt.reason}</div>
                <div className={`${styles.statusBadge} ${styles['status-' + apt.status]}`}>
                  {apt.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Appointment Manager */}
        <div className={styles.panel} style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
          <h2 className={styles.panelTitle}>Appointment Manager</h2>
          
          {selectedApt ? (
            <div className={styles.managerContent}>
              
              <div className={styles.managerHeader}>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>Patient</span>
                  <span className={styles.detailValue} style={{ fontSize: '1.4rem', color: 'var(--accent-blue)' }}>
                    {selectedApt.patient}
                  </span>
                </div>
                <div className={styles.detailGroup} style={{ textAlign: 'right' }}>
                  <span className={styles.detailLabel}>Time Slot</span>
                  <span className={styles.detailValue}>{selectedApt.time}</span>
                </div>
              </div>

              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>Consultation Reason</span>
                <span className={styles.detailValue}>{selectedApt.reason}</span>
              </div>

              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>Current Status</span>
                <span className={`${styles.statusBadge} ${styles['status-' + selectedApt.status]}`} style={{ position: 'relative', top: 0, right: 0, width: 'fit-content', marginTop: '4px' }}>
                  {selectedApt.status}
                </span>
              </div>

              <hr style={{ borderColor: 'var(--border-subtle)', margin: '16px 0' }} />

              {/* Workflow Actions */}
              <div>
                <h3 className={styles.sectionTitle}><IconStethoscope size={20}/> Update Workflow</h3>
                <div className={styles.workflowActions}>
                  <button 
                    className={`${styles.actionBtn} ${selectedApt.status === 'Waiting' ? styles.primary : ''}`}
                    onClick={() => updateStatus('Waiting')}
                  >
                    Mark Waiting
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${selectedApt.status === 'Consulting' ? styles.primary : ''}`}
                    onClick={() => {
                      updateStatus('Consulting');
                      const realPatient = patients.find((p: any) => p.name === selectedApt.patient);
                      const pid = realPatient ? realPatient.id : 'Unknown';
                      window.location.href = `/doctor/consultation?patientId=${pid}`;
                    }}
                  >
                    Start Consult
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${selectedApt.status === 'Completed' ? styles.primary : ''}`}
                    onClick={() => updateStatus('Completed')}
                  >
                    Complete
                  </button>
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border-subtle)', margin: '16px 0' }} />

              {/* Notifications */}
              <div>
                <h3 className={styles.sectionTitle}><IconMessageCircle size={20}/> Quick Notifications</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Send an automated SMS/Push notification directly to the patient&apos;s phone.
                </p>
                <div className={styles.notificationGrid}>
                  <button className={styles.notifyBtn} onClick={() => sendNotification("The doctor is running about 15 minutes behind schedule. Thank you for your patience.")}>
                    <IconClock size={18} /> Running 15 mins late
                  </button>
                  <button className={styles.notifyBtn} onClick={() => sendNotification("Please proceed to the Consultation Room now. The doctor is ready for you.")}>
                    <IconRun size={18} /> Please come in now
                  </button>
                  <button className={styles.notifyBtn} onClick={() => sendNotification("Reminder: Please ensure you are fasting for any prescribed blood work today.")}>
                    <IconAlertCircle size={18} /> Fasting Reminder
                  </button>
                  <button className={styles.notifyBtn} onClick={() => sendNotification("Your lab reports have been reviewed and are attached to your portal.")}>
                    <IconCheck size={18} /> Reports Reviewed
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className={styles.emptyState}>
              <IconStethoscope size={48} opacity={0.5} />
              <p>Select an appointment from the timeline to manage.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
