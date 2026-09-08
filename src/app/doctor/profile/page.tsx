'use client';
import React, { useState } from 'react';
import styles from './profile.module.css';
import { useAppContext } from '@/context/AppContext';
import { IconBuildingHospital, IconBriefcase, IconCertificate, IconTrophy, IconLink, IconStethoscope, IconEdit, IconCheck } from '@tabler/icons-react';

export default function Profile() {
  const { doctorProfile, updateDoctorProfile } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(doctorProfile);

  const handleSave = () => {
    updateDoctorProfile(editForm);
    setIsEditing(false);
  };

  if (!doctorProfile) return <div style={{padding: '32px'}}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBanner}></div>
      
      <div className={styles.profileContent}>
        <div className={styles.sidebar}>
          <div className={styles.avatarCard}>
            <div className={styles.avatarLarge}>
              <IconStethoscope size={48} className={styles.avatarIcon} />
            </div>
            
            {isEditing ? (
              <>
                <input className={styles.inputField} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
                <input className={styles.inputField} value={editForm.degree} onChange={e => setEditForm({...editForm, degree: e.target.value})} placeholder="Degree" />
                <input className={styles.inputField} type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: Number(e.target.value)})} placeholder="Age" />
              </>
            ) : (
              <>
                <h1 className={styles.name}>{doctorProfile.name}</h1>
                <p className={styles.degree}>{doctorProfile.degree}</p>
                <div className={styles.ageBadge}>{doctorProfile.age} Years Old</div>
              </>
            )}
            
            <button 
              className={styles.editBtn} 
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? <><IconCheck size={16}/> Save Profile</> : <><IconEdit size={16}/> Edit Profile</>}
            </button>
          </div>
        </div>

        <div className={styles.mainInfo}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>About Profile</h2>
            {isEditing ? (
              <textarea className={styles.textareaField} rows={4} value={editForm.profileText} onChange={e => setEditForm({...editForm, profileText: e.target.value})} />
            ) : (
              <p className={styles.profileText}>{doctorProfile.profileText}</p>
            )}
          </div>

          <div className={styles.grid2}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><IconBriefcase size={20} className={styles.iconPrimary}/> Current Posting</h2>
              {isEditing ? (
                <input className={styles.inputField} value={editForm.postingHospital} onChange={e => setEditForm({...editForm, postingHospital: e.target.value})} />
              ) : (
                <p className={styles.highlightText}>{doctorProfile.postingHospital}</p>
              )}
            </div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><IconBuildingHospital size={20} className={styles.iconPrimary}/> Experience</h2>
               {isEditing ? (
                <input className={styles.inputField} value={editForm.experience} onChange={e => setEditForm({...editForm, experience: e.target.value})} />
              ) : (
                <p className={styles.highlightText}>{doctorProfile.experience}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
