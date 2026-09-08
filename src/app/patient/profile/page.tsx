'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './profile.module.css';
import { IconUserCircle, IconScan, IconId, IconCheck, IconUpload } from '@tabler/icons-react';

export default function PatientProfileIntake() {
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', regionOfBirth: '', residence: '',
    bp: '', hr: '', bmi: '', lastBloodReport: '', lastBodyCheckup: '',
    allergies: '', chronicConditions: '', medications: '',
    dailyActivities: '', environmentalExposures: ''
  });

  // Profile Avatar State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ABHA State
  const [abhaFile, setAbhaFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [abhaData, setAbhaData] = useState<any>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAbhaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAbhaFile(e.target.files[0]);
    }
  };

  const handleScanAbha = () => {
    if (!abhaFile) return;
    setIsScanning(true);
    
    // Simulate AI OCR process
    setTimeout(() => {
      const scannedData = {
        abhaNumber: '91-4567-8910-2345',
        name: 'Rajesh Kumar',
        gender: 'Male',
        dob: '1979-05-14',
        age: '47' // Derived
      };
      
      setAbhaData(scannedData);
      setIsScanning(false);
      
      // Auto-fill empty demographic fields
      setFormData(prev => ({
        ...prev,
        name: prev.name || scannedData.name,
        age: prev.age || scannedData.age,
        gender: prev.gender || scannedData.gender,
      }));
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile Data Submitted Successfully!");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Comprehensive Health Profile</h1>
      <p className={styles.subtitle}>Please provide your detailed health information to help your doctors diagnose more effectively.</p>

      <form className={styles.formGrid} onSubmit={handleSubmit}>

        <div className={styles.avatarContainer}>
          <div className={styles.avatarUpload}>
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar Preview" className={styles.avatarImage} layout="fill" objectFit="cover" />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <IconUserCircle size={48} stroke={1.5} />
                <span>Upload Photo</span>
              </div>
            )}
            <input type="file" accept="image/*" style={{ display: 'none' }} id="avatar-upload" onChange={handleAvatarUpload} />
            <label htmlFor="avatar-upload" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }}></label>
          </div>
        </div>

        <div className={styles.abhaSection}>
          <h2 className={styles.sectionTitle} style={{ borderBottomColor: '#bbf7d0', display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
            <IconId /> Ayushman Bharat Health Account (ABHA)
          </h2>
          
          <div className={styles.abhaUploadArea}>
            <IconUpload size={32} style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0 }}>Click to Upload ABHA Card Image</p>
            {abhaFile && <p style={{ fontWeight: 'bold', marginTop: '8px' }}>{abhaFile.name}</p>}
            <input type="file" accept="image/*" style={{ display: 'none' }} id="abha-upload" onChange={handleAbhaUpload} />
            <label htmlFor="abha-upload" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }}></label>
          </div>

          {!abhaData ? (
            <button type="button" className={styles.scanBtn} onClick={handleScanAbha} disabled={!abhaFile || isScanning}>
              <IconScan /> {isScanning ? <span className={styles.scanningText}>Scanning with AI...</span> : 'Scan Card with AI'}
            </button>
          ) : (
            <div className={styles.abhaCardPreview}>
              <IconCheck size={32} color="#16a34a" />
              <div className={styles.abhaDetails}>
                <strong style={{ color: '#166534' }}>ABHA Linked Successfully</strong>
                <span style={{ fontSize: '0.9rem', color: '#15803d' }}>ABHA No: <strong>{abhaData.abhaNumber}</strong> | Name: {abhaData.name}</span>
                <span style={{ fontSize: '0.85rem', color: '#16a34a' }}>Demographic data auto-filled securely.</span>
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Demographics & Background</h2>
          <div className={styles.rowGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input name="name" className={styles.input} placeholder="e.g. Rajesh Kumar" value={formData.name} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Age</label>
              <input name="age" type="number" className={styles.input} placeholder="e.g. 45" value={formData.age} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Gender</label>
              <select name="gender" className={styles.select} value={formData.gender} onChange={handleChange}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Region of Birth</label>
              <input name="regionOfBirth" className={styles.input} placeholder="e.g. Rajasthan, India" onChange={handleChange} />
            </div>
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Current Residence</label>
              <input name="residence" className={styles.input} placeholder="e.g. Jaipur, Rajasthan" onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Vitals & Checkups</h2>
          <div className={styles.rowGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Regular Blood Pressure (approx)</label>
              <input name="bp" className={styles.input} placeholder="e.g. 120/80" onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>BMI (Body Mass Index)</label>
              <input name="bmi" type="number" step="0.1" className={styles.input} placeholder="e.g. 24.5" onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Last Blood Report</label>
              <input name="lastBloodReport" type="date" className={styles.input} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Last Full Body Checkup</label>
              <input name="lastBodyCheckup" type="date" className={styles.input} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Medical History</h2>
          <div className={styles.rowGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Known Allergies</label>
              <input name="allergies" className={styles.input} placeholder="e.g. Penicillin, Dust Mites" onChange={handleChange} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Chronic Diseases</label>
              <input name="chronicConditions" className={styles.input} placeholder="e.g. Type 2 Diabetes, Asthma" onChange={handleChange} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Current Medications</label>
              <input name="medications" className={styles.input} placeholder="e.g. Metformin 500mg, Salbutamol" onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Lifestyle & Exposures</h2>
          <div className={styles.rowGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Daily Life Activities / Exercise</label>
              <textarea name="dailyActivities" className={styles.textarea} placeholder="Describe your daily routine, exercise habits, and physical activity level..." onChange={handleChange} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Constant Environmental Exposures</label>
              <textarea name="environmentalExposures" className={styles.textarea} placeholder="e.g. Industrial chemicals, urban air pollution, heavy dust, constant screen time..." onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Upload Reports & Scanned Documents</h2>
          <div className={styles.fileUploadArea}>
            <p>Click or drag and drop your PDFs/Scanned Reports here</p>
            <input type="file" multiple style={{ display: 'none' }} id="file-upload" />
            <label htmlFor="file-upload" style={{ color: 'var(--accent-blue)', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px', display: 'inline-block' }}>Browse Files</label>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>Save Comprehensive Profile</button>
      </form>
    </div>
  );
}
