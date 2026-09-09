'use client';
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { IconSearch, IconMapPin, IconCertificate, IconCheck, IconStarFilled, IconCoinRupee } from '@tabler/icons-react';
import { DOCTOR_CATEGORIES } from '@/data/categories';

const SYMPTOM_TAGS = ['Diabetes', 'Heart', 'Joint Pain', 'Fever', 'Headache', 'Blood Pressure'];
const CITIES = ['All Rajasthan', 'Jaipur', 'Jodhpur', 'Udaipur', 'Kota'];

export default function PatientDashboard() {
  const { doctorsList, bookAppointment } = useAppContext();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('All Rajasthan');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('rating'); // 'rating' or 'fee'
  const [bookedDoctorId, setBookedDoctorId] = useState<string | null>(null);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  // Filter and Sort Logic
  const filteredDoctors = doctorsList.filter(doc => {
    // 1. City Filter
    if (selectedCity !== 'All Rajasthan' && doc.city !== selectedCity) return false;
    
    // 2. Symptoms Filter
    if (selectedSymptoms.length > 0) {
      const docSymptoms = doc.symptoms || [];
      const hasMatch = selectedSymptoms.some(s => docSymptoms.includes(s.toLowerCase()));
      if (!hasMatch) return false;
    }

    // 3. Category Filter
    if (selectedCategory !== 'All Categories') {
      const docSpec = (doc.specialization || '').toLowerCase();
      const catName = selectedCategory.toLowerCase();
      // Simple substring match for simulation
      if (!docSpec.includes(catName) && !catName.includes(docSpec)) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0); // Highest rating first
    if (sortBy === 'fee') return (a.fee || 0) - (b.fee || 0); // Lowest fee first
    return 0;
  });

  const handleBook = (doc: any) => {
    bookAppointment({ doctorId: doc.id, doctorName: doc.name, date: new Date().toISOString() });
    setBookedDoctorId(doc.id);
    // Redirect to real-time chat
    setTimeout(() => {
      window.location.href = `/patient/consultation?doctorId=${doc.id}`;
    }, 1000);
  };

  const [directDocId, setDirectDocId] = useState('');
  
  const handleDirectConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directDocId) return;
    try {
      const res = await fetch(`/api/doctor/search?id=${directDocId}`);
      const data = await res.json();
      if (data && !data.error) {
        window.location.href = `/patient/consultation?doctorId=${data.id}`;
      } else {
        alert('Doctor not found with that ID.');
      }
    } catch (e) {
      alert('Error searching for doctor.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 32px' }}>
      
      {/* Connect By ID Section */}
      <div style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>Already know your doctor?</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Enter their Unique Doctor ID to connect immediately.</p>
        </div>
        <form onSubmit={handleDirectConnect} style={{ display: 'flex', gap: '8px' }}>
          <input type="text" placeholder="e.g. DOC-12345" value={directDocId} onChange={e => setDirectDocId(e.target.value)} style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-surface-raised)' }} />
          <button type="submit" style={{ padding: '12px 24px', backgroundColor: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>Connect</button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '16px' }}>Find the Best Doctors in Rajasthan</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', marginBottom: '32px' }}>Search by category, symptoms, or location.</p>
        
        {/* Symptom Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
          {SYMPTOM_TAGS.map(sym => {
            const isSelected = selectedSymptoms.includes(sym);
            return (
              <button 
                key={sym} 
                onClick={() => toggleSymptom(sym)}
                style={{
                  background: isSelected ? 'var(--color-accent)' : 'var(--color-surface-base)',
                  color: isSelected ? 'white' : 'var(--color-text-base)',
                  border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  padding: '8px 20px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
                }}
              >
                {isSelected && <IconCheck size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>}
                {sym}
              </button>
            )
          })}
        </div>

        {/* Filters & Sorting */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-surface-base)', color: 'var(--color-text-base)', maxWidth: '300px' }}
          >
            <option value="All Categories">All Specialities / Categories</option>
            {DOCTOR_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.name} style={{textTransform: 'capitalize'}}>
                {cat.name}
              </option>
            ))}
          </select>
          <select 
            value={selectedCity} 
            onChange={e => setSelectedCity(e.target.value)}
            style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-surface-base)', color: 'var(--color-text-base)' }}
          >
            {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
          </select>

          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-surface-base)', color: 'var(--color-text-base)' }}
          >
            <option value="rating">Sort by: Highest Rating</option>
            <option value="fee">Sort by: Lowest Fee</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Recommended Specialists ({filteredDoctors.length})</h2>
        
        {filteredDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)', background: 'var(--color-surface-base)', borderRadius: 'var(--radius-lg)' }}>
            No doctors found matching those criteria. Try removing some filters.
          </div>
        ) : (
          filteredDoctors.map(doc => (
            <div key={doc.id} style={{ display: 'flex', background: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', gap: '24px', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--color-accent)', fontWeight: 600 }}>
                {doc.name.split(' ').slice(-1)[0][0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>{doc.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', color: '#B45309', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 600 }}>
                    <IconStarFilled size={14} /> {doc.rating} ({doc.reviews} reviews)
                  </div>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '12px' }}>{doc.degree} • {doc.specialization}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--color-text-base)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IconMapPin size={16} color="var(--color-accent)" /> {doc.postingHospital}, {doc.city}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><IconCoinRupee size={16} color="var(--color-accent)" /> Approx Fee: ₹{doc.fee}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '160px' }}>
                <button 
                  onClick={() => handleBook(doc)}
                  disabled={bookedDoctorId === doc.id}
                  style={{ width: '100%', padding: '12px 24px', background: bookedDoctorId === doc.id ? '#10B981' : 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                >
                  {bookedDoctorId === doc.id ? <><IconCheck size={18} /> Booked!</> : 'Consult Now'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
