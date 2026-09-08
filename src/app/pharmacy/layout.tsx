'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IconBox, IconClipboardList, IconLogout, IconUserCircle } from '@tabler/icons-react';
import styles from './pharmacy.module.css';

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Pharmacy Portal</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dawaa Dost - Jhotwara</p>
        </div>
        
        <nav className={styles.sidebarNav}>
          <Link href="/pharmacy/orders" className={`${styles.navItem} ${pathname.includes('/orders') ? styles.active : ''}`}>
            <IconClipboardList size={20} /> Orders
          </Link>
          <Link href="/pharmacy/inventory" className={`${styles.navItem} ${pathname.includes('/inventory') ? styles.active : ''}`}>
            <IconBox size={20} /> Inventory & Settings
          </Link>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button 
            className={styles.navItem} 
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
            onClick={() => router.push('/')}
          >
            <IconLogout size={20} /> Switch Portal
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconUserCircle size={24} />
            <span style={{ fontWeight: 500 }}>Shop Admin</span>
          </div>
        </header>
        
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </main>
    </div>
  );
}
