'use client';

import React, { useState } from 'react';
import styles from './AppShell.module.css';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);

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
              <p>Context Panel</p>
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
