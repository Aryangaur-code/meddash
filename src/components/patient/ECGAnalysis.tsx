'use client';
import React, { useState, useRef } from 'react';
import { IconUpload, IconHeartbeat, IconAlertCircle, IconCheck, IconStethoscope, IconDownload } from '@tabler/icons-react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ECGAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResult(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/analyze-ecg', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current || !result || !preview) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Med-Dash_ECG_Analysis_Report.pdf');
    } catch (err) {
      console.error("PDF Generation Error: ", err);
      setError("Failed to generate PDF report.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-base)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <IconHeartbeat size={32} color="#e11d48" />
          Med - Dash ECG analysis
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '8px', fontSize: '16px' }}>
          Upload a 12-lead ECG image to detect Myocardial Infarction and rhythmic abnormalities instantly.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Left Column - Upload & Original */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--color-border-base)',
              borderRadius: 'var(--radius-xl)',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--color-surface-base)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            <div style={{ 
              width: '64px', height: '64px', 
              borderRadius: '50%', 
              backgroundColor: '#ffe4e6',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconUpload size={32} color="#e11d48" />
            </div>
            <div>
              <p style={{ fontWeight: '600', color: 'var(--color-text-base)', margin: '0 0 4px 0' }}>
                Click or drag to upload ECG Trace
              </p>
              <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '14px' }}>
                Supports JPG, PNG
              </p>
            </div>
          </div>

          {preview && (
            <div style={{ 
              backgroundColor: 'var(--color-surface-base)', 
              borderRadius: 'var(--radius-xl)', 
              padding: '24px',
              border: '1px solid var(--color-border-base)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--color-text-base)' }}>Original ECG</h3>
              <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <Image src={preview} alt="Original ECG" fill style={{ objectFit: 'contain' }} />
              </div>
              
              <button 
                onClick={analyzeImage}
                disabled={isAnalyzing}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginTop: '24px',
                  backgroundColor: '#e11d48',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isAnalyzing ? 0.7 : 1
                }}
              >
                {isAnalyzing ? 'Analyzing Waveforms...' : 'Run AI Analysis'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && (
            <div style={{ 
              padding: '16px', backgroundColor: '#fee2e2', color: '#991b1b', 
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' 
            }}>
              <IconAlertCircle size={24} />
              {error}
            </div>
          )}

          {result && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={downloadPDF}
                  disabled={isDownloading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--color-surface-elevated)',
                    color: 'var(--color-text-base)',
                    border: '1px solid var(--color-border-base)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <IconDownload size={18} />
                  {isDownloading ? 'Generating PDF...' : 'Download PDF Report'}
                </button>
              </div>

              {/* Hidden Report Div just for PDF Rendering */}
              <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div ref={reportRef} style={{ width: '800px', backgroundColor: 'white', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
                  <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h1 style={{ margin: 0, color: '#0f172a', fontSize: '32px', letterSpacing: '-1px' }}>Med<span style={{ color: '#2563eb' }}>Dash</span></h1>
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Advanced Cardiac AI Analysis Report</p>
                    </div>
                    <div style={{ textAlign: 'right', color: '#64748b', fontSize: '12px' }}>
                      <p style={{ margin: 0 }}>Date: {new Date().toLocaleDateString()}</p>
                      <p style={{ margin: '4px 0 0 0' }}>Time: {new Date().toLocaleTimeString()}</p>
                      <p style={{ margin: '4px 0 0 0' }}>Report ID: ECG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <h2 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '20px' }}>Clinical Diagnosis: <span style={{ color: result.prediction.includes('Normal') ? '#16a34a' : '#dc2626' }}>{result.prediction}</span></h2>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}><strong>AI Confidence Score:</strong> {(result.confidence * 100).toFixed(1)}%</p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}><strong>Clinical Notes:</strong> {result.details.proximity_notes}</p>
                    <p style={{ margin: 0, fontSize: '16px' }}><strong>Recommendation:</strong> {result.details.recommendation}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '16px' }}>Original ECG Source</h3>
                      <img src={preview!} style={{ width: '100%', height: '200px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '4px' }} alt="Original ECG" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '16px' }}>AI Grad-CAM Analysis</h3>
                      <img src={result.heatmap} style={{ width: '100%', height: '200px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '4px' }} alt="Heatmap" />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>
                    <p style={{ margin: 0 }}>This report is generated automatically via the MedDash Deep Learning API.</p>
                    <p style={{ margin: '4px 0 0 0' }}>AI interpretations should always be reviewed by a certified healthcare professional before making clinical decisions.</p>
                  </div>
                </div>
              </div>

              {/* Visible UI Results */}
              <div style={{ 
                backgroundColor: 'var(--color-surface-base)', 
                borderRadius: 'var(--radius-xl)', 
                padding: '24px',
                border: '1px solid var(--color-border-base)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--color-text-base)' }}>Analysis Complete</h3>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px' }}>Grad-CAM localized features</p>
                  </div>
                  <div style={{ 
                    backgroundColor: result.prediction.includes('Normal') ? '#dcfce3' : '#fee2e2',
                    color: result.prediction.includes('Normal') ? '#16a34a' : '#dc2626',
                    padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    {result.prediction.includes('Normal') ? <IconCheck size={18} /> : <IconAlertCircle size={18} />}
                    {result.prediction}
                  </div>
                </div>
                
                <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <Image src={result.heatmap} alt="Grad-CAM Heatmap" fill style={{ objectFit: 'contain' }} />
                </div>
                
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border-base)' }}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>AI Confidence Score</span>
                      <strong style={{ fontSize: '18px' }}>{(result.confidence * 100).toFixed(1)}%</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Clinical Observations</span>
                      <span style={{ color: 'var(--color-text-base)' }}>{result.details.proximity_notes}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Recommendation</span>
                      <span style={{ color: 'var(--color-text-base)', fontWeight: '500' }}>{result.details.recommendation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {!result && !error && (
            <div style={{ 
              height: '100%', 
              border: '2px dashed var(--color-border-base)', 
              borderRadius: 'var(--radius-xl)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-muted)'
            }}>
              Upload an ECG trace to view the AI report
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
