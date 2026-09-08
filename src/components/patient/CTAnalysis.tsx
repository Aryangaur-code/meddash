'use client';
import React, { useState, useRef } from 'react';
import { IconUpload, IconBrain, IconScanEye, IconAlertCircle } from '@tabler/icons-react';
import Image from 'next/image';

export default function CTAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const isZip = file.name.toLowerCase().endsWith('.zip');
      const endpoint = isZip ? 'http://localhost:8000/api/analyze-ct-volume' : 'http://localhost:8000/api/analyze-ct';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult({ ...data, isZip });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-base)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <IconBrain size={32} color="var(--color-primary-base)" />
          Hybrid AI CT Scan Analysis
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '8px', fontSize: '16px' }}>
          Upload a 2D image (.jpg/.png) for contrast detection, or a 3D ZIP archive of DICOMs for Volumetric V-Net segmentation and Radiomics.
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
              backgroundColor: 'var(--color-surface-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconUpload size={32} color="var(--color-primary-base)" />
            </div>
            <div>
              <p style={{ fontWeight: '600', color: 'var(--color-text-base)', margin: '0 0 4px 0' }}>
                Click or drag to upload DICOM Series
              </p>
              <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '14px' }}>
                Supports .ZIP archives of .dcm files
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
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--color-text-base)' }}>Selected Input</h3>
              
              {file?.name.toLowerCase().endsWith('.zip') ? (
                <div style={{ padding: '24px', backgroundColor: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <IconUpload size={48} color="var(--color-text-muted)" style={{ marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-text-base)' }}>{file.name}</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for 3D Analysis
                  </p>
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <Image src={preview} alt="Original Scan" fill style={{ objectFit: 'contain' }} />
                </div>
              )}
              
              <button 
                onClick={analyzeImage}
                disabled={isAnalyzing}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginTop: '24px',
                  backgroundColor: 'var(--color-primary-base)',
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
                {isAnalyzing ? (
                  <>Analyzing Deep Features...</>
                ) : (
                  <>
                    <IconScanEye size={20} />
                    {file?.name.toLowerCase().endsWith('.zip') ? 'Run 3D Segmentation' : 'Run 2D AI Analysis'}
                  </>
                )}
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

          {result && !result.error && (
            <>
              {result.isZip ? (
                <>
                  <div style={{ 
                    backgroundColor: 'var(--color-surface-base)', 
                    borderRadius: 'var(--radius-xl)', 
                    padding: '24px',
                    border: '1px solid var(--color-border-base)'
                  }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--color-text-base)' }}>3D Segmentation Overlay (Axial MPR)</h3>
                    <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <Image src={result.mpr_overlay} alt="Tumor Segmentation Mask" fill style={{ objectFit: 'contain' }} />
                    </div>
                  </div>

                  <div style={{ 
                    backgroundColor: 'var(--color-surface-base)', 
                    borderRadius: 'var(--radius-xl)', 
                    padding: '32px',
                    border: '1px solid var(--color-border-base)'
                  }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: 'var(--color-text-base)', borderBottom: '1px solid var(--color-border-base)', paddingBottom: '16px' }}>
                      Quantitative Radiomics Report
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Tumor Volume:</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-base)' }}>
                          {result.radiomics.volume_cm3} cm³
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Sphericity Index:</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-base)' }}>
                          {result.radiomics.sphericity_index}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Surface Area:</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-base)' }}>
                          {result.radiomics.surface_area_mm2} mm²
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Max Diameter (RECIST):</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-base)' }}>
                          {result.radiomics.max_diameter_mm} mm
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Voxel Spacing (3D):</span>
                        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                          {result.radiomics.voxel_spacing}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ 
                    backgroundColor: 'var(--color-surface-base)', 
                    borderRadius: 'var(--radius-xl)', 
                    padding: '24px',
                    border: '1px solid var(--color-border-base)'
                  }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--color-text-base)' }}>Grad-CAM Heatmap</h3>
                    <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <Image src={result.heatmap} alt="Grad-CAM Heatmap" fill style={{ objectFit: 'contain' }} />
                    </div>
                  </div>

                  <div style={{ 
                    backgroundColor: 'var(--color-surface-base)', 
                    borderRadius: 'var(--radius-xl)', 
                    padding: '32px',
                    border: '1px solid var(--color-border-base)'
                  }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: 'var(--color-text-base)', borderBottom: '1px solid var(--color-border-base)', paddingBottom: '16px' }}>
                      Analysis Report
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>AI Detection:</span>
                        <span style={{ 
                          fontSize: '18px', fontWeight: 'bold', 
                          color: result.prediction === 'contrast' ? '#ea580c' : '#16a34a',
                          backgroundColor: result.prediction === 'contrast' ? '#ffedd5' : '#dcfce3',
                          padding: '4px 12px', borderRadius: '20px'
                        }}>
                          {result.prediction === 'contrast' ? 'CONTRAST DETECTED' : 'NO CONTRAST'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Confidence Score:</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-base)' }}>
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-base)' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--color-text-base)' }}>Proximity Notes:</h4>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                          {result.details.proximity_notes}
                        </p>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--color-text-base)' }}>Clinical Recommendation:</h4>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.5', fontWeight: '500' }}>
                          {result.details.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
              Upload an image to see analysis results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
