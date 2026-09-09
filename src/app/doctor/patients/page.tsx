'use client';
import React, { useState } from 'react';
import styles from './patients.module.css';
import { useAppContext } from '@/context/AppContext';

export default function Patients() {
  const { patients, addPatient, uploadReport, addMedication } = useAppContext();
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id);
  const [isAdding, setIsAdding] = useState(false);
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleAddPatient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPatient = {
      id: `P-${Math.floor(Math.random() * 10000)}`,
      name: formData.get('name'),
      age: Number(formData.get('age')),
      gender: formData.get('gender'),
      mrn: `MRN-${Math.floor(Math.random() * 1000000)}`,
      vitals: { bp: '120/80', hr: 72, spo2: 98, temp: 98.6 },
      chronicConditions: [],
      medications: [],
      allergies: [],
      recentVisits: []
    };
    addPatient(newPatient);
    setIsAdding(false);
    setSelectedPatientId(newPatient.id);
  };

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newReport = {
        id: `REP-${Math.floor(Math.random() * 10000)}`,
        name: file.name,
        date: new Date().toLocaleDateString(),
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type || 'Unknown'
      };
      uploadReport(selectedPatient.id, newReport);
    }
  };

  const handleAddMedication = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      addMedication(selectedPatient.id, e.currentTarget.value.trim());
      e.currentTarget.value = '';
    }
  };

  return (
    <div className={styles.container}>
      {/* ... listPanel remains same ... */}
      <div className={styles.listPanel}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--color-border)'}}>
          <h2 className={styles.panelTitle} style={{padding: 0, border: 'none'}}>Patient Roster</h2>
          <button onClick={() => setIsAdding(true)} style={{padding: '4px 8px', cursor: 'pointer', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '4px'}}>+</button>
        </div>
        
        <div className={styles.patientList}>
          {patients.map(p => (
            <div key={p.id} className={styles.patientItem} onClick={() => {setSelectedPatientId(p.id); setIsAdding(false);}}>
              <div className={styles.patientHeader}>
                <span className={styles.patientName}>{p.name}</span>
                <span className={styles.patientMrn}>{p.mrn}</span>
              </div>
              <div className={styles.patientDetails}>
                {p.age}y • {p.gender}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.profilePanel}>
        {isAdding ? (
          <div>
            <h1>Add New Patient</h1>
            <form onSubmit={handleAddPatient} style={{display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', marginTop: '24px'}}>
              <input name="name" placeholder="Patient Name" required style={{padding: '8px'}} />
              <input name="age" type="number" placeholder="Age" required style={{padding: '8px'}} />
              <select name="gender" required style={{padding: '8px'}}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <button type="submit" className={styles.primaryBtn}>Save Patient</button>
            </form>
          </div>
        ) : selectedPatient ? (
          <div style={{ height: '100%', overflowY: 'auto', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header / Top Profile Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', backgroundColor: 'var(--color-surface-base)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'var(--color-text-muted)' }}>
                {selectedPatient.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: 'var(--color-text-primary)' }}>{selectedPatient.name}</h1>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  {selectedPatient.gender} | DOB: {new Date(new Date().getFullYear() - selectedPatient.age, 0, 1).toLocaleDateString()} ({selectedPatient.age} Years old)
                </p>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  MRN: {selectedPatient.mrn} | 📍 {selectedPatient.residence || 'No Residence Data'}
                </p>
              </div>
              <button className={styles.primaryBtn} onClick={() => window.location.href = `/doctor/consultation?patientId=${selectedPatient.id}`}>Start Consultation</button>
            </div>

            {/* AI Case Intake Review (if exists) */}
            {selectedPatient.aiCases && selectedPatient.aiCases.length > 0 && (
              <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-accent)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🤖 AI Intake Review Pending</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: 'auto' }}>
                    {new Date(selectedPatient.aiCases[selectedPatient.aiCases.length - 1].date).toLocaleString()}
                  </span>
                </div>
                <div style={{ padding: '16px', display: 'flex', gap: '24px' }}>
                   <div style={{ flex: 1 }}>
                     <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Structured HPI</h4>
                     <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: '1.5' }}>
                       {selectedPatient.aiCases[selectedPatient.aiCases.length - 1].structuredHPI?.map((item: string, i: number) => (
                         <li key={i}>{item}</li>
                       ))}
                     </ul>
                   </div>
                   <div style={{ flex: 1, paddingLeft: '24px', borderLeft: '1px solid var(--color-border)' }}>
                     <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-status-error)', fontSize: '14px' }}>⚠️ Missing Info & Contradictions</h4>
                     <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.5' }}>
                       {selectedPatient.aiCases[selectedPatient.aiCases.length - 1].contradictions?.map((item: string, i: number) => (
                         <li key={i} style={{ color: 'var(--color-status-error)', marginBottom: '4px' }}>
                           {item} <a href="#" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>[PMID: 321876]</a>
                         </li>
                       ))}
                       {selectedPatient.aiCases[selectedPatient.aiCases.length - 1].missingInfo?.map((item: string, i: number) => (
                         <li key={i} style={{ color: 'var(--color-text-muted)' }}>{item} (Missing)</li>
                       ))}
                     </ul>
                     <div style={{ marginTop: '12px', padding: '8px', backgroundColor: 'var(--color-surface-raised)', borderRadius: '4px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                       <strong>RAG Evidence:</strong> &quot;NSAID hypersensitivity is frequently underreported. Literature suggests cross-reactivity risks...&quot; <a href="#" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Read More</a>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {/* 3-Column Masonry Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', alignItems: 'start' }}>
              
              {/* Column 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Summary Panel */}
                <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    📄 Summary
                  </div>
                  <div style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--color-text-primary)' }}>Visit: {new Date().toLocaleDateString()}</p>
                    {selectedPatient.name} is a {selectedPatient.age}-year-old {selectedPatient.gender.toLowerCase()} with a history of {(selectedPatient.chronicConditions || []).join(', ') || 'no chronic conditions'}. 
                    Patient reports overall doing well with current medications. 
                    {selectedPatient.vitals ? ` Blood pressure has been around ${selectedPatient.vitals.bp}.` : ''}
                  </div>
                </div>

                {/* Appointment Summary */}
                <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    📅 Appointment Summary
                  </div>
                  <table style={{ width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '8px 16px', fontWeight: 500 }}>Date</th>
                        <th style={{ padding: '8px 16px', fontWeight: 500 }}>Physician</th>
                        <th style={{ padding: '8px 16px', fontWeight: 500 }}>Reason</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: 'var(--color-text-primary)' }}>
                      <tr><td style={{ padding: '8px 16px' }}>{new Date().toLocaleDateString()}</td><td style={{ padding: '8px 16px' }}>Dr. Sharma</td><td style={{ padding: '8px 16px' }}>Routine Checkup</td></tr>
                      <tr><td style={{ padding: '8px 16px' }}>2025-11-20</td><td style={{ padding: '8px 16px' }}>Dr. Sharma</td><td style={{ padding: '8px 16px' }}>Follow-up</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* Medications */}
                <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    💊 Medications & Intelligence
                  </div>
                  
                  {/* Medicine Intelligence Alert */}
                  {(selectedPatient.medications || []).some((m: string) => m.toLowerCase().includes('metformin')) && (
                    <div style={{ margin: '16px 16px 0 16px', padding: '8px 12px', backgroundColor: 'rgba(250, 17, 79, 0.1)', border: '1px solid var(--color-status-error)', borderRadius: '4px', fontSize: '12px', color: 'var(--color-status-error)' }}>
                      <strong>AI Pharmacovigilance:</strong> Monitor renal function periodically while on Metformin. Patient&apos;s recent labs indicate borderline clearance.
                    </div>
                  )}

                  <table style={{ width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse', marginTop: '8px' }}>
                    <thead>
                      <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '8px 16px', fontWeight: 500 }}>Medication</th>
                        <th style={{ padding: '8px 16px', fontWeight: 500 }}>Instructions</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: 'var(--color-text-primary)' }}>
                      {(selectedPatient.medications && selectedPatient.medications.length > 0) ? selectedPatient.medications.map((m: any, idx: any) => (
                        <tr key={idx}><td style={{ padding: '8px 16px' }}>{m}</td><td style={{ padding: '8px 16px' }}>1 daily</td></tr>
                      )) : (
                        <tr><td colSpan={2} style={{ padding: '8px 16px', color: 'var(--color-text-muted)' }}>No active medications</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Column 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Vitals */}
                <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    ❤️ Vitals
                  </div>
                  <table style={{ width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '8px 16px', fontWeight: 500 }}>Metric</th>
                        <th style={{ padding: '8px 16px', fontWeight: 500 }}>Today within</th>
                        <th style={{ padding: '8px 16px', fontWeight: 500 }}>Previous within</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: 'var(--color-text-primary)' }}>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 16px' }}>Blood Pressure</td><td style={{ padding: '8px 16px' }}>{selectedPatient.vitals?.bp || '-'}</td><td style={{ padding: '8px 16px' }}>120/80</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 16px' }}>Heart Rate</td><td style={{ padding: '8px 16px' }}>{selectedPatient.vitals?.hr || '-'}</td><td style={{ padding: '8px 16px' }}>72</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 16px' }}>Temp (F)</td><td style={{ padding: '8px 16px' }}>{selectedPatient.vitals?.temp || '-'}</td><td style={{ padding: '8px 16px' }}>98.6</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 16px' }}>O2 Saturation</td><td style={{ padding: '8px 16px' }}>{selectedPatient.vitals?.spo2 || '-'}%</td><td style={{ padding: '8px 16px' }}>99%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Diagnosis */}
                <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    🩺 Diagnosis
                  </div>
                  <div style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--color-text-primary)' }}>Visit: {new Date().toLocaleDateString()}</p>
                    {(selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0) 
                      ? `Primary management of ${selectedPatient.chronicConditions.join(' and ')}. Patient requires ongoing monitoring.` 
                      : 'Routine evaluation. No acute abnormalities noted.'}
                  </div>
                </div>

                {/* Lab */}
                <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    🧪 Lab
                  </div>
                  <table style={{ width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <tbody style={{ color: 'var(--color-text-primary)' }}>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 16px', color: 'var(--color-text-muted)' }}>Total Cholesterol</td>
                        <td style={{ padding: '8px 16px' }}>Borderline High</td>
                        <td style={{ padding: '8px 16px' }}>200 - 239</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 16px', color: 'var(--color-text-muted)' }}>HDL</td>
                        <td style={{ padding: '8px 16px' }}>Negative Risk</td>
                        <td style={{ padding: '8px 16px' }}>{'> 60'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Column 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Documents | Notes */}
                <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📁 Documents | Notes</span>
                    <label style={{ fontSize: '12px', color: 'var(--color-accent)', cursor: 'pointer' }}>
                      + Add PDF
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        style={{ display: 'none' }} 
                        onChange={handleReportUpload} 
                      />
                    </label>
                  </div>
                  <div style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                    <p style={{ margin: '0 0 12px 0' }}>Patient followed up regarding previously discussed symptoms. Advised to continue current medication regimen. Will review labs next visit.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(selectedPatient.reports || []).map((report: any, i: any) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'var(--color-surface-raised)', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                          <span style={{ color: 'var(--color-accent)' }}>📄</span>
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-primary)' }}>{report.name || report}</span>
                          <button 
                            onClick={() => {
                              // Simulate download
                              const link = document.createElement('a');
                              link.href = 'data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCgkJPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqCjw8IC9MZW5ndGggNDQgPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDE1MyAwMDAwMCBuIAowMDAwMDAwMjcyIDAwMDAwIG4gCjAwMDAwMDAzNjEgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDU2CiUlRU9GCg=='; // dummy pdf
                              link.download = report.name || 'report.pdf';
                              link.click();
                            }}
                            style={{ background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}
                          >
                            View / Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medical Imaging */}
                <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    🩻 Medical Imaging
                  </div>
                  <div style={{ padding: '16px' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      Access X-Ray, CT, and MRI scans with 3D V-NET structural analysis and lesion volumetric tracking.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/doctor/diagnostics'}
                      style={{ width: '100%', padding: '10px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <span>Open AI Diagnostics Hub</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Plan */}
                <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    📝 Plan
                  </div>
                  <div style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--color-text-primary)' }}>Visit: {new Date().toLocaleDateString()}</p>
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>Problem 1. {(selectedPatient.chronicConditions && selectedPatient.chronicConditions[0]) || 'General Health'}</p>
                      <p style={{ margin: '0 0 12px 0' }}>Continue current therapy. Monitor symptoms for next 4 weeks. Report any acute changes.</p>
                      
                      <p style={{ margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>Problem 2. Preventive Care</p>
                      <p style={{ margin: 0 }}>Schedule routine annual labs. Maintain diet and exercise regimen as discussed.</p>
                    </div>
                  </div>
                </div>

                {/* Patient Timeline */}
                <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-overlay)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    ⏳ Patient Timeline
                  </div>
                  <div style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {selectedPatient.aiCases && selectedPatient.aiCases.length > 0 && (
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', position: 'relative' }}>
                        <div style={{ width: '2px', backgroundColor: 'var(--color-accent)', position: 'absolute', top: '10px', bottom: '-20px', left: '5px' }}></div>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', zIndex: 1, marginTop: '4px' }}></div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Today</div>
                          <div>AI Intake Assessment Completed</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Wearable Alert Event */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', position: 'relative' }}>
                      <div style={{ width: '2px', backgroundColor: 'var(--color-status-warning)', position: 'absolute', top: '10px', bottom: '-20px', left: '5px' }}></div>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-surface-raised)', border: '2px solid var(--color-status-warning)', zIndex: 1, marginTop: '4px' }}></div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-status-warning)' }}>3 Days Ago (Smartwatch)</div>
                        <div style={{ color: 'var(--color-text-primary)' }}>Abnormal HR Alert (Spike to 135 bpm)</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', position: 'relative' }}>
                      <div style={{ width: '2px', backgroundColor: 'var(--color-border)', position: 'absolute', top: '10px', bottom: '-20px', left: '5px' }}></div>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-surface-raised)', border: '2px solid var(--color-border)', zIndex: 1, marginTop: '4px' }}></div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>1 Month Ago</div>
                        <div>Prescription Renewed: Metformin</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-surface-raised)', border: '2px solid var(--color-border)', zIndex: 1, marginTop: '4px' }}></div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>6 Months Ago</div>
                        <div>Annual Physical - Labs Normal</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          <p>No patients found.</p>
        )}
      </div>
    </div>
  );
}
