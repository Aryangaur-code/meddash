'use client';
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { IconUpload, IconFileReport, IconPill, IconRobot, IconX } from '@tabler/icons-react';
import Link from 'next/link';

export default function PatientRecords() {
  const { patients, uploadReport } = useAppContext();
  const [analyzingReport, setAnalyzingReport] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Simulate logged in patient (using the first patient from the array)
  const currentPatient = patients[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newReport = {
        id: `REP-${Math.floor(Math.random() * 10000)}`,
        name: file.name,
        date: new Date().toLocaleDateString(),
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type || 'Unknown'
      };
      // Simulate upload delay
      setTimeout(() => {
        uploadReport(currentPatient.id, newReport);
        alert('Report uploaded successfully!');
      }, 800);
    }
  };

  const handleAnalyze = (report: any) => {
    setAnalyzingReport(report);
    setShowAnalysis(true);
  };

  if (!currentPatient) return <div style={{padding: '48px', textAlign: 'center'}}>No patient data found.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 32px', position: 'relative' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '8px' }}>My Health Records</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', marginBottom: '48px' }}>Manage your lab reports, scans, and active medications.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Reports Section */}
        <div style={{ background: 'var(--color-surface-base)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconFileReport color="var(--color-accent)" /> My Reports
            </h2>
            
            <label style={{ cursor: 'pointer', background: 'var(--color-accent)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s' }}>
              <IconUpload size={16} /> Scan / Upload
              <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!currentPatient.reports || currentPatient.reports.length === 0) ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)' }}>
                No reports uploaded yet. Click Upload to add your first scan or lab result.
              </div>
            ) : (
              currentPatient.reports.map((report: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-raised)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-base)', marginBottom: '4px' }}>{report.name}</span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Uploaded: {report.date} • {report.size}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'transparent', border: '1px solid var(--color-text-muted)', color: 'var(--color-text-base)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>View</button>
                    <button onClick={() => handleAnalyze(report)} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconRobot size={14} /> AI Analyze
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Medications Section */}
        <div style={{ background: 'var(--color-surface-base)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <IconPill color="var(--color-accent)" /> Active Medications
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!currentPatient.medications || currentPatient.medications.length === 0) ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)' }}>
                You have no active medications prescribed.
              </div>
            ) : (
              currentPatient.medications.map((med: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--color-surface-raised)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10B981' }}>
                  <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    💊
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-base)' }}>{med}</span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Prescribed by Doctor</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* AI Analysis Modal */}
      {showAnalysis && analyzingReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'var(--color-surface-base)', width: '600px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <div style={{ background: 'var(--color-surface-raised)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '20px' }}><IconRobot color="var(--color-accent)" /> AI Report Analysis</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>Analyzing {analyzingReport.name}</p>
              </div>
              <button onClick={() => setShowAnalysis(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-base)', cursor: 'pointer' }}><IconX /></button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--color-accent)', marginBottom: '8px' }}>Findings</h3>
                <p style={{ fontSize: '15px', color: 'var(--color-text-base)', lineHeight: 1.6, background: 'var(--color-surface-raised)', padding: '16px', borderRadius: '8px' }}>
                  Based on the scanned document, the key markers appear to be within normal ranges, however, there are slight anomalies in your Hemoglobin levels indicating potential early signs of anemia or fatigue. Blood pressure reads normally.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#B45309', marginBottom: '8px' }}>Suggested Actions</h3>
                <ul style={{ paddingLeft: '20px', color: 'var(--color-text-base)', lineHeight: 1.6 }}>
                  <li>Increase iron-rich foods in your diet (spinach, legumes).</li>
                  <li>Ensure 8 hours of sleep per night to reduce fatigue.</li>
                  <li>Schedule a consultation with a General Physician for a thorough follow-up.</li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Recommended Doctors</h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ fontWeight: 600 }}>Dr. Sandeep Vaishya</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>General Medicine • Jaipur</div>
                    <Link href="/patient" style={{ display: 'inline-block', marginTop: '12px', color: 'var(--color-accent)', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>Consult →</Link>
                  </div>
                  <div style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ fontWeight: 600 }}>Dr. Anita Desai</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Cardiology • Jodhpur</div>
                    <Link href="/patient" style={{ display: 'inline-block', marginTop: '12px', color: 'var(--color-accent)', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>Consult →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
