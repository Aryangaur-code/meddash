import React from 'react';
import UnifiedAnalysis from '@/components/patient/UnifiedAnalysis';
import CTTumor3DViewer from '@/components/doctor/CTTumor3DViewer';

export default function DoctorDiagnosticsHub() {
  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <CTTumor3DViewer apiBaseUrl="" />
      
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Diagnostic X-Ray / Grad-CAM</h2>
        <UnifiedAnalysis />
      </div>
    </div>
  );
}
