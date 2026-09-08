'use client';
import React, { useState } from 'react';
import styles from '../profile/profile.module.css';
import { IconSettings, IconShieldLock, IconBell, IconPalette } from '@tabler/icons-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'General', icon: IconSettings },
    { id: 'Security', icon: IconShieldLock },
    { id: 'Notifications', icon: IconBell },
    { id: 'Appearance', icon: IconPalette },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerBanner}>
        <h1 style={{ color: 'white', fontSize: '24px', padding: '24px 32px', margin: 0 }}>Account Settings</h1>
      </div>
      
      <div className={styles.profileContent}>
        <div className={styles.sidebar}>
          <div className={styles.avatarCard} style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px',
                    background: activeTab === tab.id ? 'var(--color-surface-raised)' : 'transparent',
                    border: 'none', borderLeft: activeTab === tab.id ? '4px solid var(--color-accent)' : '4px solid transparent',
                    color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === tab.id ? 600 : 400,
                    width: '100%', transition: 'all 0.2s'
                  }}
                >
                  <tab.icon size={20} />
                  {tab.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.mainInfo}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{activeTab} Preferences</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
              
              {activeTab === 'General' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>Language</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>Select your preferred interface language</p>
                    </div>
                    <select className={styles.inputField} style={{ width: '200px' }} defaultValue="en">
                      <option value="en">English (US)</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'Notifications' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>Email Alerts</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>Receive daily appointment summaries</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--color-accent)' }} />
                  </div>
                </>
              )}

              {activeTab === 'Appearance' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>Theme</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>System dark mode is strictly enforced</p>
                  </div>
                  <select className={styles.inputField} style={{ width: '200px' }} defaultValue="dark" disabled>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
              )}

              {activeTab === 'Security' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>Password</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>Last changed 3 months ago</p>
                    </div>
                    <button className={styles.editBtn} style={{ width: 'auto', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--color-border)' }}>Change</button>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button 
                  className={styles.editBtn} 
                  style={{ width: 'auto', padding: '10px 24px', backgroundColor: saved ? 'var(--color-accent)' : 'var(--color-surface-raised)' }}
                  onClick={handleSave}
                >
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
