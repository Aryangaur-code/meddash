'use client';

import React from 'react';
import styles from './Sidebar.module.css';
import {
  IconLayoutDashboard,
  IconStethoscope,
  IconUsers,
  IconPill,
  IconFileInvoice,
  IconChartBar,
  IconSettings,
  IconCalendarEvent,
  IconTag,
  IconStar
} from '@tabler/icons-react';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';

// Read star count from localStorage for sidebar badge
function getStars(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem('meddash_doctor_stars') || '0', 10);
}

const navItems = [
  { icon: IconLayoutDashboard, label: 'Dashboard', path: '/doctor' },
  { icon: IconCalendarEvent, label: 'Schedule', path: '/doctor/schedule' },
  { icon: IconStethoscope, label: 'Consultations', path: '/doctor/consultation' },
  { icon: IconUsers, label: 'Patients', path: '/doctor/patients' },
  { icon: IconPill, label: 'Prescriptions', path: '/doctor/prescriptions' },
  { icon: IconFileInvoice, label: 'Claims', path: '/doctor/claims' },
  { icon: IconUsers, label: 'Specialist Network', path: '/doctor/network' },
  { icon: IconChartBar, label: 'Analytics', path: '/doctor/analytics' },
  { icon: IconTag, label: 'Image Labelling', path: '/doctor/labelling', badge: true },
  { icon: IconSettings, label: 'Settings', path: '/doctor/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const stars = getStars();

  return (
    <nav className={styles.rail}>
      <div className={styles.navItems}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={clsx(styles.navItem, { [styles.active]: isActive })}
              title={item.label === 'Image Labelling' ? `Image Labelling Credits ⭐ ${stars} stars` : item.label}
              aria-label={item.label}
              onClick={() => router.push(item.path)}
              style={{ position: 'relative' }}
            >
              <Icon size={24} stroke={isActive ? 2.5 : 1.5} className={styles.icon} />
              {/* Star badge on Image Labelling icon */}
              {item.badge && stars > 0 && (
                <span style={{
                  position: 'absolute', top: '2px', right: '2px',
                  background: '#f59e0b', color: 'white',
                  borderRadius: '10px', fontSize: '9px', fontWeight: 800,
                  padding: '1px 4px', lineHeight: 1.4, minWidth: '16px',
                  textAlign: 'center', pointerEvents: 'none'
                }}>
                  {stars}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      <div className={styles.bottomSection}>
        {/* Stars credit compact display */}
        {stars > 0 && (
          <div title={`${stars} labelling stars — ${stars >= 50 ? 'TOP RECOMMENDED' : `${50 - stars} to Top Recommended`}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px', cursor: 'pointer' }}
            onClick={() => router.push('/doctor/labelling')}>
            <IconStar size={16} fill={stars >= 50 ? '#f59e0b' : '#94a3b8'} color={stars >= 50 ? '#f59e0b' : '#94a3b8'} />
            <span style={{ fontSize: '9px', color: stars >= 50 ? '#f59e0b' : '#94a3b8', fontWeight: 700 }}>{stars}⭐</span>
          </div>
        )}
        <button className={styles.avatarButton} title="Dr. Profile" onClick={() => router.push('/doctor/profile')}>
          <div className={styles.avatar}>DR</div>
        </button>
      </div>
    </nav>
  );
}
