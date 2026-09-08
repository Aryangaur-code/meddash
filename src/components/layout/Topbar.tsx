'use client';

import React, { useEffect, useState } from 'react';
import styles from './Topbar.module.css';
import { IconSearch, IconBell } from '@tabler/icons-react';

export default function Topbar({ toggleContext }: { toggleContext: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleContext();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // open command palette
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleContext]);

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.logoPlaceholder}></div>
        <span className={styles.institutionName}>City General Hospital</span>
      </div>

      <div className={styles.center}>
        <button className={styles.searchBar} onClick={() => alert('Search command palette opened!')}>
          <IconSearch size={18} className={styles.searchIcon} />
          <span className={styles.searchPlaceholder}>Search patients, drugs, ICD codes...</span>
          <span className={styles.searchShortcut}>⌘K</span>
        </button>
      </div>

      <div className={styles.right}>
        {isRecording && (
          <div className={styles.recordingIndicator}>
            <div className={styles.pulseDot}></div>
            <span className={styles.recordingLabel}>Recording</span>
          </div>
        )}
        
        <div style={{ position: 'relative' }}>
          <button className={styles.iconButton} onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
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

        <button className={styles.profileDropdown} onClick={() => alert('Profile menu opened!')}>
          <div className={styles.profileAvatar}>DR</div>
          <span className={styles.profileName}>Dr. Sharma</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
