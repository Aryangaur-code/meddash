'use client';
import React, { useState } from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

const NMC_SPECIALTIES = [
  "Anatomy", "Anesthesiology", "Aerospace Medicine", "Biochemistry", "Community Medicine", 
  "Dermatology, Venereology & Leprosy", "Emergency Medicine", "General Medicine", 
  "General Surgery", "Obstetrics & Gynaecology", "Ophthalmology", "Orthopaedics", 
  "Otorhinolaryngology", "Paediatrics", "Pathology", "Psychiatry", "Radio-Diagnosis", 
  "Radio-Therapy", "Respiratory Medicine", "Microbiology", "Pharmacology", "Physiology", 
  "Forensic Medicine", "Nuclear Medicine", "Physical Medicine & Rehabilitation", 
  "Family Medicine", "Geriatrics", "Infectious Diseases", "Rheumatology", "Medical Genetics", "Sports Medicine"
];

const STATE_MEDICAL_COUNCILS = [
  "Andhra Pradesh Medical Council", "Arunachal Pradesh Medical Council", "Assam Medical Council",
  "Bihar Medical Council", "Chhattisgarh Medical Council", "Delhi Medical Council",
  "Goa Medical Council", "Gujarat Medical Council", "Haryana Medical Council",
  "Himachal Pradesh Medical Council", "Jammu & Kashmir Medical Council", "Jharkhand Medical Council",
  "Karnataka Medical Council", "Kerala Medical Council", "Madhya Pradesh Medical Council",
  "Maharashtra Medical Council", "Manipur Medical Council", "Meghalaya Medical Council",
  "Mizoram Medical Council", "Nagaland Medical Council", "Odisha Medical Council",
  "Punjab Medical Council", "Rajasthan Medical Council", "Sikkim Medical Council",
  "Tamil Nadu Medical Council", "Telangana State Medical Council", "Tripura State Medical Council",
  "Uttar Pradesh Medical Council", "Uttarakhand Medical Council", "West Bengal Medical Council"
];

const SECTIONS = [
  {
    title: "1. Professional Credentials",
    fields: ["Doctor full name", "Qualification (e.g., MBBS, MD)", "Specialization", "Medical registration number", "State Medical Council", "Registration date", "Years of experience", "Current Designation"]
  },
  {
    title: "2. Clinic / Facility Details",
    fields: ["Facility / Clinic name", "Facility type", "Registered office address", "City", "State", "PIN code", "Official phone number", "Official email"]
  },
  {
    title: "3. Appointment & Services",
    fields: ["Appointment mode (In-person, Video, Both)", "Walk-in supported", "Maximum daily appointments", "Clinical services offered", "OPD timings"]
  },
  {
    title: "4. Document Uploads",
    fields: ["Profile photograph", "Medical registration certificate", "Government ID proof", "Clinic/Facility registration proof"]
  },
  {
    title: "5. Declaration & Consent",
    fields: ["Declaration of information accuracy", "AI-use policy acceptance", "Patient-data handling acknowledgement", "Digital signature"]
  }
];

export default function DoctorRegistrationWizard({ onChange }: { onChange?: (data: any) => void }) {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [formData, setFormData] = useState<any>({});

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (onChange) onChange(newData);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', gridColumn: '1 / -1' }}>
      <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>Comprehensive Facility & Provider Registration</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--color-text-muted)' }}>
        Please complete the following mandatory registration sections to onboard your healthcare facility to the network.
      </p>

      <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {SECTIONS.map((section, index) => {
          const isExpanded = expandedSection === index;
          return (
            <div key={index} style={{ flexShrink: 0, border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-surface-raised)' }}>
              <button
                type="button"
                onClick={() => toggleSection(index)}
                style={{
                  width: '100%',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  textAlign: 'left'
                }}
              >
                <span>{section.title}</span>
                {isExpanded ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
              </button>

              {isExpanded && (
                <div style={{ padding: '0 16px 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {section.fields.map((field, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                        {field}
                        {field === 'AI-use policy acceptance' && <a href="#" style={{ color: 'var(--color-accent)', marginLeft: '4px', textDecoration: 'none' }}>(View AI Policy)</a>}
                        {field === 'Patient-data handling acknowledgement' && <a href="#" style={{ color: 'var(--color-accent)', marginLeft: '4px', textDecoration: 'none' }}>(View Data Policy)</a>}
                      </label>
                      {field === 'Specialization' ? (
                        <select 
                          value={formData[field] || ''}
                          onChange={e => handleInputChange(field, e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)', fontSize: '13px' }}
                        >
                          <option value="">Select Specialization...</option>
                          {NMC_SPECIALTIES.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      ) : field === 'State Medical Council' ? (
                        <select 
                          value={formData[field] || ''}
                          onChange={e => handleInputChange(field, e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)', fontSize: '13px' }}
                        >
                          <option value="">Select Council...</option>
                          {STATE_MEDICAL_COUNCILS.map(council => (
                            <option key={council} value={council}>{council}</option>
                          ))}
                        </select>
                      ) : field === 'Profile photograph' ? (
                        <input 
                          type="file" 
                          accept=".jpeg,.jpg,.png"
                          onChange={e => handleInputChange(field, e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)', fontSize: '13px' }}
                        />
                      ) : ['Medical registration certificate', 'Government ID proof', 'Clinic/Facility registration proof'].includes(field) ? (
                        <input 
                          type="file" 
                          accept=".pdf"
                          onChange={e => handleInputChange(field, e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)', fontSize: '13px' }}
                        />
                      ) : field === 'Digital signature' ? (
                        <input 
                          type="file" 
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={e => handleInputChange(field, e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)', fontSize: '13px' }}
                        />
                      ) : ['Declaration of information accuracy', 'AI-use policy acceptance', 'Patient-data handling acknowledgement'].includes(field) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                          <input 
                            type="checkbox" 
                            checked={!!formData[field]}
                            onChange={e => handleInputChange(field, e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
                          />
                          <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>I agree</span>
                          {field === 'Declaration of information accuracy' && (
                            <input type="file" accept=".pdf" style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }} title="Optional signed PDF" />
                          )}
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          value={formData[field] || ''}
                          onChange={e => handleInputChange(field, e.target.value)}
                          placeholder="..." 
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)', fontSize: '13px' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
