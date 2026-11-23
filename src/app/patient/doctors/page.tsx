'use client';
import React, { useState, useEffect } from 'react';
import { IconSearch, IconStar, IconMapPin, IconStethoscope, IconBuildingHospital, IconClock, IconBadge } from '@tabler/icons-react';

// ─── Doctor Registry ──────────────────────────────────────────────────────────
// In production this comes from MongoDB. Here we simulate with static data
// + the star points earned via Image Labelling (from localStorage).
const DOCTORS_BASE = [
  { id: 'D-001', name: 'Dr. Aryan Gaur', specialty: 'Orthopedic Surgery', hospital: 'City Bone & Joint Clinic', location: 'Delhi, India', experience: '8 yrs', availability: 'Available Today', rating: 4.8, labellingStars: 0 },
  { id: 'D-002', name: 'Dr. Priya Sharma', specialty: 'Neurology', hospital: 'Apollo Hospital', location: 'Delhi, India', experience: '12 yrs', availability: 'Tomorrow', rating: 4.9, labellingStars: 0 },
  { id: 'D-003', name: 'Dr. Rahul Mehra', specialty: 'Cardiology', hospital: 'Fortis Heart Institute', location: 'Gurgaon, India', experience: '15 yrs', availability: 'Available Today', rating: 4.7, labellingStars: 0 },
  { id: 'D-004', name: 'Dr. Sneha Kapoor', specialty: 'Radiology', hospital: 'Max Healthcare', location: 'Noida, India', experience: '10 yrs', availability: 'Available Today', rating: 4.6, labellingStars: 0 },
  { id: 'D-005', name: 'Dr. Vikram Singh', specialty: 'Oncology', hospital: 'AIIMS Delhi', location: 'Delhi, India', experience: '20 yrs', availability: 'Next Week', rating: 4.9, labellingStars: 0 },
  { id: 'D-006', name: 'Dr. Ananya Joshi', specialty: 'Pulmonology', hospital: 'Medanta Medicity', location: 'Gurgaon, India', experience: '7 yrs', availability: 'Available Today', rating: 4.5, labellingStars: 0 },
];

export default function FindDoctors() {
  const [search, setSearch]     = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [doctors, setDoctors]   = useState(DOCTORS_BASE);

  // Load labelling stars from localStorage (the current logged-in doctor's stars)
  // In a full system, each doctor would have their own star count from DB.
  // Here we simulate: the first doctor in the list gets the logged-in doctor's stars.
  useEffect(() => {
    const stars = parseInt(localStorage.getItem('meddash_doctor_stars') || '0', 10);
    setDoctors(prev =>
      prev.map((d, i) => i === 0 ? { ...d, labellingStars: stars } : d)
    );
  }, []);

  const specialties = ['All', ...Array.from(new Set(DOCTORS_BASE.map(d => d.specialty)))];

  const filtered = doctors
    .filter(d => {
      const q = search.toLowerCase();
      return (
        (specialty === 'All' || d.specialty === specialty) &&
        (d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.hospital.toLowerCase().includes(q))
      );
    })
    // Sort: Top Recommended (≥50 labelling stars) first, then by rating
    .sort((a, b) => {
      const aTop = a.labellingStars >= 50 ? 1 : 0;
      const bTop = b.labellingStars >= 50 ? 1 : 0;
      if (aTop !== bTop) return bTop - aTop;
      return b.rating - a.rating;
    });

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-base)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconStethoscope size={28} color="var(--color-primary-base)" /> Find a Doctor
        </h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '14px' }}>
          Search specialists near you. Doctors with 🏆 <strong>Top Recommended</strong> status have earned it through verified AI training contributions.
        </p>
      </div>

      {/* Search & filter bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <IconSearch size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, specialty, or hospital..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--color-border-base)', background: 'var(--color-surface-base)', color: 'var(--color-text-base)', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <select value={specialty} onChange={e => setSpecialty(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-base)', background: 'var(--color-surface-base)', color: 'var(--color-text-base)', fontSize: '14px' }}>
          {specialties.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Results count */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
        Showing {filtered.length} doctor{filtered.length !== 1 ? 's' : ''}
        {filtered.some(d => d.labellingStars >= 50) && ' · 🏆 Top Recommended shown first'}
      </p>

      {/* Doctor cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map(doc => {
          const isTopRecommended = doc.labellingStars >= 50;
          return (
            <div key={doc.id} style={{
              background: 'var(--color-surface-base)',
              border: `2px solid ${isTopRecommended ? '#f59e0b' : 'var(--color-border-base)'}`,
              borderRadius: '14px', padding: '20px',
              position: 'relative',
              boxShadow: isTopRecommended ? '0 4px 20px #f59e0b22' : 'none',
              transition: 'box-shadow 0.2s',
            }}>

              {/* Top Recommended banner */}
              {isTopRecommended && (
                <div style={{ position: 'absolute', top: '-1px', right: '16px', background: '#f59e0b', color: 'white', fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '0 0 8px 8px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🏆 TOP RECOMMENDED
                </div>
              )}

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: isTopRecommended ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px', fontWeight: 700, color: isTopRecommended ? 'white' : 'var(--color-text-muted)' }}>
                  {doc.name.split(' ').slice(-1)[0][0]}{doc.name.split(' ').slice(-2,-1)[0]?.[0] || ''}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-base)' }}>{doc.name}</h3>
                    {isTopRecommended && <IconBadge size={16} color="#f59e0b" fill="#f59e0b" />}
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--color-primary-base)', fontWeight: 600 }}>{doc.specialty}</p>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      <IconBuildingHospital size={13} /> {doc.hospital}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      <IconMapPin size={13} /> {doc.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '14px' }}>
                <div style={{ background: 'var(--color-surface-elevated)', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Experience</div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{doc.experience}</div>
                </div>
                <div style={{ background: 'var(--color-surface-elevated)', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Rating</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                    <IconStar size={13} fill="#f59e0b" color="#f59e0b" /> {doc.rating}
                  </div>
                </div>
                <div style={{ background: 'var(--color-surface-elevated)', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>AI Credits</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: doc.labellingStars > 0 ? '#f59e0b' : 'var(--color-text-muted)' }}>
                    {doc.labellingStars > 0 ? `⭐ ${doc.labellingStars}` : '—'}
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: doc.availability === 'Available Today' ? '#16a34a' : '#f59e0b', fontWeight: 600 }}>
                  <IconClock size={13} /> {doc.availability}
                </span>
                <button style={{ padding: '7px 18px', background: 'var(--color-primary-base)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Book Appointment
                </button>
              </div>

              {/* Top Recommended explanation */}
              {isTopRecommended && (
                <div style={{ marginTop: '10px', padding: '8px 10px', background: '#fef3c7', borderRadius: '8px', fontSize: '11px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🏆 This doctor earned Top Recommended status by contributing {doc.labellingStars} labelling credits to MedDash AI training.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
