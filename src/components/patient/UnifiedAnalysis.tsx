'use client';
import React, { useState, useEffect } from 'react';
import { IconBone, IconScan, IconHeartbeat } from '@tabler/icons-react';
import XRayAnalysis from './XRayAnalysis';
import CTAnalysis from './CTAnalysis';
import ECGAnalysis from './ECGAnalysis';

type Tab = 'xray' | 'ct' | 'ecg';

export default function UnifiedAnalysis() {
  const [activeTab, setActiveTab] = useState<Tab>('xray');
  const [geminiKey, setGeminiKey] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    }
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
      
      {/* Header and Tabs */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '24px' }}>
            AI Diagnostics Hub
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Gemini API Key:</span>
            <input 
              type="password" 
              placeholder="Enter API Key..." 
              value={geminiKey}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-overlay)',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                width: '240px'
              }}
              onChange={(e) => {
                setGeminiKey(e.target.value);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('gemini_api_key', e.target.value);
                }
              }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('xray')}
            style={{
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'xray' ? 'var(--color-surface-base)' : 'transparent',
              border: '1px solid',
              borderColor: activeTab === 'xray' ? 'var(--color-border)' : 'transparent',
              borderBottom: activeTab === 'xray' ? '1px solid var(--color-surface-base)' : '1px solid transparent',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              marginBottom: '-1px', // Pull down to cover bottom border when active
              color: activeTab === 'xray' ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontWeight: activeTab === 'xray' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: activeTab === 'xray' ? 2 : 1
            }}
          >
            <IconBone size={20} />
            X-Ray Analysis
          </button>

          <button 
            onClick={() => setActiveTab('ct')}
            style={{
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'ct' ? 'var(--color-surface-base)' : 'transparent',
              border: '1px solid',
              borderColor: activeTab === 'ct' ? 'var(--color-border)' : 'transparent',
              borderBottom: activeTab === 'ct' ? '1px solid var(--color-surface-base)' : '1px solid transparent',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              marginBottom: '-1px',
              color: activeTab === 'ct' ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontWeight: activeTab === 'ct' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: activeTab === 'ct' ? 2 : 1
            }}
          >
            <IconScan size={20} />
            CT Scan Volumetric
          </button>

          <button 
            onClick={() => setActiveTab('ecg')}
            style={{
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'ecg' ? 'var(--color-surface-base)' : 'transparent',
              border: '1px solid',
              borderColor: activeTab === 'ecg' ? 'var(--color-border)' : 'transparent',
              borderBottom: activeTab === 'ecg' ? '1px solid var(--color-surface-base)' : '1px solid transparent',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              marginBottom: '-1px',
              color: activeTab === 'ecg' ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontWeight: activeTab === 'ecg' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: activeTab === 'ecg' ? 2 : 1
            }}
          >
            <IconHeartbeat size={20} />
            ECG Cardiology
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ background: 'var(--color-surface-base)', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', minHeight: '600px' }}>
        {activeTab === 'xray' && <XRayAnalysis />}
        {activeTab === 'ct' && <CTAnalysis />}
        {activeTab === 'ecg' && <ECGAnalysis />}
      </div>

    </div>
  );
}
