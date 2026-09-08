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
  IconCalendarEvent
} from '@tabler/icons-react';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';

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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
              title={item.label}
              aria-label={item.label}
              onClick={() => router.push(item.path)}
            >
              <Icon size={24} stroke={isActive ? 2.5 : 1.5} className={styles.icon} />
            </button>
          );
        })}
      </div>
      
      <div className={styles.bottomSection}>
        <button className={styles.avatarButton} title="Dr. Profile" onClick={() => router.push('/doctor/profile')}>
          <div className={styles.avatar}>DR</div>
        </button>
      </div>
    </nav>
  );
}
