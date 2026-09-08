'use client';
import React, { useState, useRef } from 'react';
import styles from './XRayAnalysis.module.css';
import { IconUpload, IconBone, IconAlertCircle, IconCheck, IconX, IconStethoscope, IconMapPin, IconBulb, IconUserPlus } from '@tabler/icons-react';

export default function XRayAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    } else {
      setError("Please upload a valid image file.");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Connect to the local FastAPI server
      const response = await fetch("http://localhost:8000/api/analyze-xray", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis server failed to process the image.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to connect to the X-Ray AI model. Please ensure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1><IconBone size={32} color="var(--color-accent)" /> AI Bone Fracture Analysis</h1>
        <p>Upload an X-Ray image for instantaneous clinical evaluation powered by Deep Learning.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.uploadSection}>
          <div 
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="image/*" 
              hidden 
              ref={fileInputRef} 
              onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="X-Ray Preview" className={styles.previewImage} />
            ) : (
              <div className={styles.dropContent}>
                <IconUpload size={48} color="var(--color-text-muted)" />
                <p>Drag and drop your X-Ray here, or click to browse</p>
                <span>Supports JPG, PNG</span>
              </div>
            )}
          </div>
          
          <button 
            className={styles.analyzeButton} 
            disabled={!selectedFile || isAnalyzing}
            onClick={(e) => {
              e.stopPropagation();
              handleAnalyze();
            }}
          >
            {isAnalyzing ? "Analyzing Fracture Proximity..." : "Run AI Analysis"}
          </button>

          {error && <div className={styles.errorBanner}>{error}</div>}
        </div>

        <div className={styles.resultSection}>
          {result ? (
            <div className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <h2>Analysis Results</h2>
                <div className={`${styles.badge} ${result.prediction === 'fractured' ? styles.dangerBadge : styles.safeBadge}`}>
                  {result.prediction === 'fractured' ? <IconAlertCircle size={18} /> : <IconCheck size={18} />}
                  {result.prediction.toUpperCase()}
                </div>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metricBox}>
                  <span>AI Confidence</span>
                  <strong>{(result.confidence * 100).toFixed(1)}%</strong>
                </div>
                <div className={styles.metricBox}>
                  <span>Fracture Probability</span>
                  <strong>{(result.fracture_probability * 100).toFixed(1)}%</strong>
                </div>
              </div>

              <div className={styles.heatmapContainer}>
                <h3>Proximity of Fracture (Grad-CAM Heatmap)</h3>
                <p className={styles.heatmapDesc}>The colored areas indicate the exact structural regions the AI focused on to make its clinical decision.</p>
                <img src={result.heatmap} alt="Fracture Heatmap" className={styles.heatmapImage} />
              </div>

              <div className={styles.detailsPanel}>
                <h3><IconStethoscope size={18} /> Clinical Details</h3>
                <ul>
                  {result.details.exact_location && <li><strong>Exact Location:</strong> {result.details.exact_location}</li>}
                  <li><strong>Clinical Notes:</strong> {result.details.proximity_notes}</li>
                  <li><strong>Recommendation:</strong> {result.details.recommendation}</li>
                </ul>

                {result.prediction === 'fractured' && result.details.ai_solutions && result.details.ai_solutions.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ color: 'var(--color-primary-base)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconBulb size={18} /> AI Derived Solutions
                    </h3>
                    <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
                      {result.details.ai_solutions.map((solution: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '8px' }}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.prediction === 'fractured' && result.details.associated_doctors && result.details.associated_doctors.length > 0 && (
                  <div style={{ marginTop: '24px', backgroundColor: 'var(--color-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconUserPlus size={18} /> Nearest Associated Doctors
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {result.details.associated_doctors.map((doc: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx === result.details.associated_doctors.length - 1 ? 'none' : '1px solid var(--color-border-base)' }}>
                          <div>
                            <strong style={{ display: 'block', fontSize: '15px' }}>{doc.name}</strong>
                            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{doc.specialty}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: 'var(--color-primary-base)' }}>
                              <IconMapPin size={14} /> {doc.distance}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{doc.available}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyResult}>
              <IconBone size={64} color="var(--color-border)" />
              <p>Your analysis results will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
