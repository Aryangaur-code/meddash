'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { IconStethoscope, IconUserHeart } from '@tabler/icons-react';
import { useAppContext } from '@/context/AppContext';

export default function LandingPage() {
  const router = useRouter();
  const { setRole } = useAppContext();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-surface-base)' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', marginBottom: '16px' }}>AI Medical Co-Pilot</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '18px' }}>Select your portal to continue</p>
      
      <div style={{ marginBottom: '48px' }}>
        <button 
          onClick={() => router.push('/register')}
          style={{ padding: '12px 32px', backgroundColor: 'var(--color-accent)', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-pill)', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
        >
          New User? Register Now
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div 
          onClick={() => { setRole('doctor'); router.push('/doctor'); }}
          style={{ padding: '40px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', backgroundColor: 'var(--color-surface-raised)', width: '280px' }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
        >
          <IconStethoscope size={48} color="var(--color-accent)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Doctor Portal</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '8px' }}>Manage practice, patients, and AI consultations.</p>
        </div>

        <div 
          onClick={() => { setRole('patient'); router.push('/patient'); }}
          style={{ padding: '40px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', backgroundColor: 'var(--color-surface-raised)', width: '280px' }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
        >
          <IconUserHeart size={48} color="var(--color-accent)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Patient Portal</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '8px' }}>Manage health profile, consults, and pharmacy.</p>
        </div>

        <div 
          onClick={() => { setRole('pharmacy'); router.push('/pharmacy/orders'); }}
          style={{ padding: '40px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', backgroundColor: 'var(--color-surface-raised)', width: '280px' }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
            <path d="M3 21h18" /><path d="M5 21v-14l8 -4v18" /><path d="M19 21v-10l-6 -4" /><path d="M9 9h4" /><path d="M11 7v4" />
          </svg>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Pharmacy Portal</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '8px' }}>Manage orders, inventory, and fulfillments.</p>
        </div>
      </div>
    </div>
  );
}
