'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './Topbar.module.css';
import { IconSearch, IconBell, IconUser, IconSettings, IconLogout } from '@tabler/icons-react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function Topbar({ toggleContext }: { toggleContext: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { doctorProfile } = useAppContext();
  const router = useRouter();

  // Close dropdowns on click outside (optional but good practice)
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleContext();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleContext]);

  // Fallback to "Dr. User" if profile isn't loaded yet
  const name = doctorProfile?.name || 'Dr. User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'DR';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.logoPlaceholder}></div>
        <span className={styles.institutionName}>City General Hospital</span>
      </div>

      <div className={styles.center}>
        <div className={styles.searchBar} onClick={() => searchInputRef.current?.focus()}>
          <IconSearch size={18} className={styles.searchIcon} />
          <input
            ref={searchInputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search patients, drugs, ICD codes..."
          />
          <span className={styles.searchShortcut}>⌘K</span>
        </div>
      </div>

      <div className={styles.right}>
        {isRecording && (
          <div className={styles.recordingIndicator}>
            <div className={styles.pulseDot}></div>
            <span className={styles.recordingLabel}>Recording</span>
          </div>
        )}
        
        <div style={{ position: 'relative' }}>
          <button className={styles.iconButton} onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}>
            <IconBell size={20} />
            <span className={styles.badge}>2</span>
          </button>

          {isNotificationsOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: '-40px',
              width: '380px', backgroundColor: 'var(--color-surface-base)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
              zIndex: 100, overflow: 'hidden'
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Notifications</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', cursor: 'pointer' }} onClick={() => setIsNotificationsOpen(false)}>Mark all read</span>
              </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {/* System Update Notification */}
                <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-overlay)', borderLeft: '4px solid var(--color-accent)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ backgroundColor: 'var(--color-surface-base)', padding: '8px', borderRadius: '50%', color: 'var(--color-accent)' }}>
                      <IconBell size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>System Update (v2.4.1)</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                        Unified AI Diagnostics & 3D V-Net Volumetric segmentation has been successfully deployed.
                      </p>
                      <span style={{ display: 'block', marginTop: '8px', fontSize: '11px', color: 'var(--color-text-ghost)' }}>Just now</span>
                    </div>
                  </div>
                </div>

                {/* Patient DB Status Notification */}
                <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor='var(--color-surface-raised)'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '50%', color: '#10B981' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block', margin: '3px' }}></span>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Patient DB Sync Active</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                        All electronic health records are currently up to date and syncing normally across regions.
                      </p>
                      <span style={{ display: 'block', marginTop: '8px', fontSize: '11px', color: 'var(--color-text-ghost)' }}>2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={profileRef}>
          <button className={styles.profileDropdown} onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}>
            <div className={styles.profileAvatar}>{initials}</div>
            <span className={styles.profileName}>{name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {isProfileOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: '0',
              width: '240px', backgroundColor: 'var(--color-surface-base)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
              zIndex: 100, overflow: 'hidden', padding: '8px 0'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{name}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>{doctorProfile?.degree || 'Doctor'}</p>
              </div>
              
              <button onClick={() => { router.push('/doctor/profile'); setIsProfileOpen(false); }} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', textAlign: 'left', fontSize: '13px' }} onMouseOver={e => e.currentTarget.style.backgroundColor='var(--color-surface-raised)'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'}>
                <IconUser size={18} color="var(--color-text-muted)" /> My Profile
              </button>
              
              <button onClick={() => { router.push('/doctor/settings'); setIsProfileOpen(false); }} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', textAlign: 'left', fontSize: '13px' }} onMouseOver={e => e.currentTarget.style.backgroundColor='var(--color-surface-raised)'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'}>
                <IconSettings size={18} color="var(--color-text-muted)" /> Settings
              </button>
              
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }}></div>
              
              <button onClick={() => { router.push('/'); setIsProfileOpen(false); }} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', color: 'var(--color-status-error)', cursor: 'pointer', textAlign: 'left', fontSize: '13px' }} onMouseOver={e => e.currentTarget.style.backgroundColor='rgba(250, 17, 79, 0.1)'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'}>
                <IconLogout size={18} color="var(--color-status-error)" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
