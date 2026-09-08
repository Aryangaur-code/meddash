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
  const { setRole } = useAppContext();
  
  const [activeRole, setActiveRole] = useState<Role>('patient');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardData, setWizardData] = useState<any>({});
  const { updateDoctorProfile } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (activeRole === 'doctor') {
      const name = (document.getElementById('common-name') as HTMLInputElement)?.value || wizardData['Doctor full name'] || 'Dr. New User';
      const newProfile = {
        name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
        degree: wizardData['Qualification (e.g., MBBS, MD)'] || 'MBBS',
        specialization: wizardData['Specialization'] || 'General Medicine',
        experience: wizardData['Years of experience'] ? `${wizardData['Years of experience']}+ Years` : '5+ Years',
        postingHospital: wizardData['Facility / Clinic name'] || 'Private Clinic',
        profileText: `${wizardData['Current Designation'] || 'Senior Consultant'} specializing in ${wizardData['Specialization'] || 'General Medicine'}. Passionate about integrating AI and technology into clinical workflows to improve patient outcomes.`,
        age: 35
      };
      updateDoctorProfile(newProfile);
    }
    
    // Simulate API call for registration
    setTimeout(() => {
      setIsSubmitting(false);
      setRole(activeRole);
      
      // Route to respective portal
      if (activeRole === 'doctor') router.push('/doctor/profile');
      else if (activeRole === 'patient') router.push('/patient');
      else if (activeRole === 'pharmacy') router.push('/pharmacy/orders');
      
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
      
      <div style={{ width: '100%', maxWidth: '700px', marginBottom: '24px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 500 }}>
          <IconArrowLeft size={20} /> Back to Home
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: '700px', backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-primary)', textAlign: 'center', marginBottom: '8px' }}>
          Create an Account
        </h1>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '32px' }}>
          Join the AI Medical Co-Pilot network today.
        </p>

        {/* Role Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          <button
            type="button"
            onClick={() => setActiveRole('patient')}
            style={{
              padding: '24px 16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${activeRole === 'patient' ? 'var(--color-accent)' : 'var(--color-border)'}`,
              backgroundColor: activeRole === 'patient' ? 'var(--color-surface-overlay)' : 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <IconUserHeart size={32} color={activeRole === 'patient' ? 'var(--color-accent)' : 'var(--color-text-ghost)'} />
            <span style={{ fontWeight: 600, color: activeRole === 'patient' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Patient</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveRole('doctor')}
            style={{
              padding: '24px 16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${activeRole === 'doctor' ? 'var(--color-accent)' : 'var(--color-border)'}`,
              backgroundColor: activeRole === 'doctor' ? 'var(--color-surface-overlay)' : 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <IconStethoscope size={32} color={activeRole === 'doctor' ? 'var(--color-accent)' : 'var(--color-text-ghost)'} />
            <span style={{ fontWeight: 600, color: activeRole === 'doctor' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('pharmacy')}
            style={{
              padding: '24px 16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${activeRole === 'pharmacy' ? 'var(--color-accent)' : 'var(--color-border)'}`,
              backgroundColor: activeRole === 'pharmacy' ? 'var(--color-surface-overlay)' : 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <IconBuildingStore size={32} color={activeRole === 'pharmacy' ? 'var(--color-accent)' : 'var(--color-text-ghost)'} />
            <span style={{ fontWeight: 600, color: activeRole === 'pharmacy' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Pharmacy</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Common Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Full Name</label>
              <input id="common-name" required type="text" placeholder="John Doe" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Email Address</label>
              <input required type="email" placeholder="john@example.com" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Contact Number</label>
              <input required type="tel" placeholder="+91 98765 43210" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Password</label>
              <input required type="password" placeholder="••••••••" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Permanent Address</label>
              <input required type="text" placeholder="123 Main Street, City, State, ZIP" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />

          {/* Patient Specific Fields */}
          {activeRole === 'patient' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Age</label>
                <input required type="number" min="0" placeholder="e.g. 34" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Gender</label>
                <select required style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Blood Group</label>
                <select required style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
                  <option value="">Select</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          )}

          {/* Doctor Specific Fields */}
          {activeRole === 'doctor' && (
            <DoctorRegistrationWizard onChange={setWizardData} />
          )}

          {/* Pharmacy Specific Fields */}
          {activeRole === 'pharmacy' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Pharmacy Name</label>
                <input required type="text" placeholder="e.g. City Health Pharmacy" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Pharmacy License Number</label>
                <input required type="text" placeholder="e.g. DL-12345678" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Operating Hours</label>
                <input required type="text" placeholder="e.g. Mon-Sat, 8:00 AM - 10:00 PM" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }} />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              marginTop: '16px', padding: '16px', backgroundColor: 'var(--color-accent)', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: '16px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Creating Account...' : `Register as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}
          </button>
        </form>

      </div>
    </div>
  );
}
