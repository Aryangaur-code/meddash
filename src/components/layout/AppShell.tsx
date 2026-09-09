'use client';

import React, { useState } from 'react';
import styles from './AppShell.module.css';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconLayoutDashboard,
  IconStethoscope,
  IconUsers,
  IconPill,
  IconFileInvoice,
  IconChartBar,
  IconSettings,
  IconCalendarEvent
} from '@tabler/icons-react';

const navItems = [
  { icon: IconLayoutDashboard, label: 'Dashboard', path: '/doctor' },
  { icon: IconCalendarEvent, label: 'Schedule', path: '/doctor/schedule' },
  { icon: IconStethoscope, label: 'Consultations', path: '/doctor/consultation' },
  { icon: IconUsers, label: 'Patients', path: '/doctor/patients' },
  { icon: IconPill, label: 'Prescriptions', path: '/doctor/prescriptions' },
  { icon: IconFileInvoice, label: 'Claims', path: '/doctor/claims' },
  { icon: IconUsers, label: 'Specialist Network', path: '/doctor/network' },
  { icon: IconChartBar, label: 'Analytics', path: '/doctor/analytics' },
  { icon: IconSettings, label: 'Settings', path: '/doctor/settings' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleContextPanel = () => setIsContextCollapsed(!isContextCollapsed);

  return (
    <div className={styles.appShell}>
      {/* Panel 1: Icon-only vertical nav rail */}
      <Sidebar />

      {/* Panel 2 & 3 wrapper */}
      <div className={styles.mainWrapper}>
        <Topbar toggleContext={toggleContextPanel} />

        <div className={styles.contentWrapper}>
          {/* Panel 2: Context sidebar */}
          <div className={`${styles.contextPanel} ${isContextCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.contextContent}>
              <h3 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Navigation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navItems.map(item => {
                  const isActive = pathname === item.path || (item.path !== '/doctor' && pathname.startsWith(item.path));
                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        border: 'none',
                        background: isActive ? 'var(--color-surface-overlay)' : 'transparent',
                        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: isActive ? 600 : 400,
                        width: '100%',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={e => !isActive && (e.currentTarget.style.background = 'var(--color-surface-raised)')}
                      onMouseOut={e => !isActive && (e.currentTarget.style.background = 'transparent')}
                    >
                      <item.icon size={20} stroke={isActive ? 2 : 1.5} />
                      <span style={{ fontSize: '14px' }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panel 3: Main workspace */}
          <main className={styles.workspace}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
