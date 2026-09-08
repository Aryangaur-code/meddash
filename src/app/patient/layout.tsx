'use client';
import React from 'react';
import { IconUserHeart, IconStethoscope, IconCalendarEvent, IconBuildingStore, IconActivity, IconPill, IconBrain, IconClipboardText } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Chatbot from '@/components/patient/Chatbot';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-base)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '64px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between', backgroundColor: 'var(--color-surface-base)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-accent)', fontWeight: 600, fontSize: '18px' }}>
          <IconUserHeart size={24} />
          Patient Portal
        </div>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link href="/patient" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: pathname === '/patient' ? 'var(--color-accent)' : 'var(--color-text-muted)', textDecoration: 'none', fontWeight: pathname === '/patient' ? 700 : 500 }}>
            <IconStethoscope size={18} /> Find Doctor
          </Link>
          <Link href="/patient/health" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: pathname === '/patient/health' ? 'var(--color-accent)' : 'var(--color-text-muted)', textDecoration: 'none', fontWeight: pathname === '/patient/health' ? 700 : 500 }}>
            <IconActivity size={18} /> Fitness + Vitals
          </Link>
          <Link href="/patient/records" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: pathname === '/patient/records' ? 'var(--color-accent)' : 'var(--color-text-muted)', textDecoration: 'none', fontWeight: pathname === '/patient/records' ? 700 : 500 }}>
            <IconCalendarEvent size={18} /> My Records
          </Link>
          <Link href="/patient/diagnostics" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: pathname.includes('/patient/diagnostics') ? 'var(--color-accent)' : 'var(--color-text-muted)', textDecoration: 'none', fontWeight: pathname.includes('/patient/diagnostics') ? 700 : 500 }}>
            <IconBrain size={18} /> AI Diagnostics
          </Link>
          <Link href="/patient/intake" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: pathname === '/patient/intake' ? 'var(--color-accent)' : 'var(--color-text-muted)', textDecoration: 'none', fontWeight: pathname === '/patient/intake' ? 700 : 500 }}>
            <IconClipboardText size={18} /> AI Intake
          </Link>
          <Link href="/patient/medications" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: pathname === '/patient/medications' ? 'var(--color-accent)' : 'var(--color-text-muted)', textDecoration: 'none', fontWeight: pathname === '/patient/medications' ? 700 : 500 }}>
            <IconPill size={18} /> Drug Info
          </Link>
          <Link href="/patient/pharmacy" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: pathname === '/patient/pharmacy' ? 'var(--color-accent)' : 'var(--color-text-muted)', textDecoration: 'none', fontWeight: pathname === '/patient/pharmacy' ? 700 : 500 }}>
            <IconBuildingStore size={18} /> Pharmacy Connect
          </Link>
        </nav>
      </header>
      <main style={{ flex: 1, backgroundColor: 'var(--color-surface-raised)', overflowY: 'auto', position: 'relative' }}>
        {children}
        <Chatbot />
      </main>
    </div>
  );
}
