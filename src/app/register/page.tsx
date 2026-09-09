'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { IconUserHeart, IconStethoscope, IconBuildingStore, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import DoctorRegistrationWizard from './DoctorRegistrationWizard';

type Role = 'patient' | 'doctor' | 'pharmacy';

export default function RegisterPage() {
  const router = useRouter();
  const { setRole, setUserId } = useAppContext();
  
  const [activeRole, setActiveRole] = useState<Role>('patient');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardData, setWizardData] = useState<any>({});
  const [isLogin, setIsLogin] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let profile: any = {};

    if (activeRole === 'doctor') {
      const name = (document.getElementById('common-name') as HTMLInputElement)?.value || wizardData['Doctor full name'] || 'Dr. New User';
      profile = {
        name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
        degree: wizardData['Qualification (e.g., MBBS, MD)'] || 'MBBS',
        specialization: wizardData['Specialization'] || 'General Medicine',
        experience: wizardData['Years of experience'] ? `${wizardData['Years of experience']}+ Years` : '5+ Years',
        postingHospital: wizardData['Facility / Clinic name'] || 'Private Clinic',
        profileText: `${wizardData['Current Designation'] || 'Senior Consultant'} specializing in ${wizardData['Specialization'] || 'General Medicine'}.`,
        age: 35
      };
    } else if (activeRole === 'patient') {
      profile = {
        name: (document.getElementById('common-name') as HTMLInputElement)?.value || 'New Patient',
        age: parseInt((document.getElementById('pat-age') as HTMLInputElement)?.value || '30'),
        gender: (document.getElementById('pat-gender') as HTMLSelectElement)?.value || 'other',
        residence: (document.getElementById('common-address') as HTMLInputElement)?.value || 'Unknown',
        vitals: { bp: '120/80', hr: 72, spo2: 98, temp: 98.6 },
        chronicConditions: [],
        medications: [],
        allergies: [],
      };
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: activeRole, profile })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccessId(data.id);
        setUserId(data.id);
        setRole(activeRole);
      } else {
        alert('Registration failed: ' + (data.details || data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: activeRole, id: loginId })
      });
      const data = await res.json();

      if (data.success) {
        setUserId(data.profile.id);
        setRole(activeRole);
        if (activeRole === 'doctor') router.push('/doctor/profile');
        else if (activeRole === 'patient') router.push('/patient');
        else if (activeRole === 'pharmacy') router.push('/pharmacy/orders');
      } else {
        alert('Invalid ID or role.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishRegistration = () => {
    if (activeRole === 'doctor') router.push('/doctor/profile');
    else if (activeRole === 'patient') router.push('/patient');
    else if (activeRole === 'pharmacy') router.push('/pharmacy/orders');
  };

  if (successId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface-base)' }}>
        <div style={{ padding: '48px', backgroundColor: 'var(--color-surface-raised)', borderRadius: '16px', border: '1px solid var(--color-border)', textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ color: 'var(--color-accent)', marginBottom: '16px' }}>Registration Successful!</h2>
          <p style={{ color: 'var(--color-text-base)', marginBottom: '24px' }}>Please save your Unique ID below to login in the future.</p>
          <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-overlay)', borderRadius: '8px', fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '32px' }}>
            {successId}
          </div>
          <button onClick={finishRegistration} style={{ padding: '12px 24px', backgroundColor: 'var(--color-accent)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Continue to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
      
      <div style={{ width: '100%', maxWidth: '700px', marginBottom: '24px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 500 }}>
          <IconArrowLeft size={20} /> Back to Home
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: '700px', backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '48px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => setIsLogin(false)} style={{ padding: '8px 24px', borderRadius: '24px', border: 'none', background: !isLogin ? 'var(--color-accent)' : 'transparent', color: !isLogin ? 'white' : 'var(--color-text-base)', cursor: 'pointer', fontWeight: 600 }}>Register</button>
          <button onClick={() => setIsLogin(true)} style={{ padding: '8px 24px', borderRadius: '24px', border: 'none', background: isLogin ? 'var(--color-accent)' : 'transparent', color: isLogin ? 'white' : 'var(--color-text-base)', cursor: 'pointer', fontWeight: 600 }}>Login</button>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-primary)', textAlign: 'center', marginBottom: '8px' }}>
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '32px' }}>
          {isLogin ? 'Enter your Unique ID to continue.' : 'Join the AI Medical Co-Pilot network today.'}
        </p>

        {/* Role Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          <button type="button" onClick={() => setActiveRole('patient')} style={{ padding: '24px 16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${activeRole === 'patient' ? 'var(--color-accent)' : 'var(--color-border)'}`, backgroundColor: activeRole === 'patient' ? 'var(--color-surface-overlay)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <IconUserHeart size={32} color={activeRole === 'patient' ? 'var(--color-accent)' : 'var(--color-text-ghost)'} />
            <span style={{ fontWeight: 600, color: activeRole === 'patient' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Patient</span>
          </button>
          <button type="button" onClick={() => setActiveRole('doctor')} style={{ padding: '24px 16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${activeRole === 'doctor' ? 'var(--color-accent)' : 'var(--color-border)'}`, backgroundColor: activeRole === 'doctor' ? 'var(--color-surface-overlay)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <IconStethoscope size={32} color={activeRole === 'doctor' ? 'var(--color-accent)' : 'var(--color-text-ghost)'} />
            <span style={{ fontWeight: 600, color: activeRole === 'doctor' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Doctor</span>
          </button>
          <button type="button" onClick={() => setActiveRole('pharmacy')} style={{ padding: '24px 16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${activeRole === 'pharmacy' ? 'var(--color-accent)' : 'var(--color-border)'}`, backgroundColor: activeRole === 'pharmacy' ? 'var(--color-surface-overlay)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <IconBuildingStore size={32} color={activeRole === 'pharmacy' ? 'var(--color-accent)' : 'var(--color-text-ghost)'} />
            <span style={{ fontWeight: 600, color: activeRole === 'pharmacy' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Pharmacy</span>
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Your Unique ID (e.g., {activeRole === 'doctor' ? 'DOC-12345' : 'P-12345'})</label>
              <input required type="text" value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="Enter ID" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
            </div>
            <button type="submit" disabled={isSubmitting} style={{ padding: '16px', backgroundColor: 'var(--color-accent)', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Common Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Full Name</label>
                <input id="common-name" required type="text" placeholder="John Doe" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Permanent Address</label>
                <input id="common-address" required type="text" placeholder="123 Main Street, City, State, ZIP" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />

            {/* Patient Specific Fields */}
            {activeRole === 'patient' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Age</label>
                  <input id="pat-age" required type="number" min="0" placeholder="e.g. 34" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Gender</label>
                  <select id="pat-gender" required style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Doctor Specific Fields */}
            {activeRole === 'doctor' && (
              <DoctorRegistrationWizard onChange={setWizardData} />
            )}

            <button type="submit" disabled={isSubmitting} style={{ padding: '16px', backgroundColor: 'var(--color-accent)', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'Creating Account...' : `Register`}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
