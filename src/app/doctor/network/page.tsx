import React from 'react';
import { IconExternalLink, IconStethoscope, IconBuildingHospital, IconMapPin } from '@tabler/icons-react';

export default function SpecialistNetwork() {
  const superSpecialists = [
    { name: 'Dr. Sandeep Vaishya', speciality: 'Neurosurgery', hospital: 'Fortis Memorial Research Institute', location: 'Gurgaon, India', website: 'https://www.fortishealthcare.com', highlight: 'Expert in Gamma Knife Surgery' },
    { name: 'Dr. Naresh Trehan', speciality: 'Cardiothoracic Surgery', hospital: 'Medanta - The Medicity', location: 'Gurgaon, India', website: 'https://www.medanta.org', highlight: 'Pioneer in bypass surgery' },
    { name: 'Dr. Sudhir Rawal', speciality: 'Uro-Oncology', hospital: 'Rajiv Gandhi Cancer Institute', location: 'New Delhi, India', website: 'https://www.rgcirc.org', highlight: 'Robotic Surgery Expert' },
    { name: 'Dr. A.S. Soin', speciality: 'Liver Transplant', hospital: 'Medanta - The Medicity', location: 'Gurgaon, India', website: 'https://www.livertransplantindia.com', highlight: 'Over 2500 Liver Transplants' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Super Specialist Network</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Directly engage and refer complex cases to leading senior specialists.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {superSpecialists.map((doc, idx) => (
          <div key={idx} style={{ background: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-base)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {doc.name}
                </h2>
                <div style={{ color: 'var(--color-accent)', fontWeight: 500, fontSize: '14px', marginTop: '4px' }}>{doc.speciality}</div>
              </div>
              <div style={{ background: 'var(--color-surface-raised)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {doc.highlight}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconBuildingHospital size={16} /> {doc.hospital}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconMapPin size={16} /> {doc.location}</span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-surface-raised)' }}>
              <a href={doc.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--color-accent)', color: 'white', padding: '10px', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 500, transition: 'opacity 0.2s' }}>
                Visit Official Portal <IconExternalLink size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
