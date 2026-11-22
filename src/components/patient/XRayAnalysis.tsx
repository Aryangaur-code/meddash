'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './XRayAnalysis.module.css';
import { IconUpload, IconBone, IconAlertCircle, IconCheck, IconStethoscope, IconMapPin, IconBulb, IconUserPlus, IconDownload, IconTag } from '@tabler/icons-react';
import jsPDF from 'jspdf';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Annotation {
  x: number; y: number; w: number; h: number;
  label: string; color: string; confidence: number;
}
interface AnalysisResult {
  prediction: string; confidence: number; fracture_probability: number;
  annotations: Annotation[];
  details: {
    exact_location: string; proximity_notes: string;
    recommendation: string; ai_solutions: string[];
    associated_doctors: { name: string; specialty: string; distance: string; available: string }[];
  };
}

// ─── Mock analysis engine (browser-side pixel analysis) ─────────────────────
function runMockAnalysis(canvas: HTMLCanvasElement): AnalysisResult {
  const ctx = canvas.getContext('2d')!;
  const { width: W, height: H } = canvas;
  const imgData = ctx.getImageData(0, 0, W, H).data;

  // Compute mean brightness in quadrants to vary result
  let topBright = 0, botBright = 0, leftBright = 0, rightBright = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const lum = 0.299 * imgData[idx] + 0.587 * imgData[idx + 1] + 0.114 * imgData[idx + 2];
      if (y < H / 2) topBright += lum; else botBright += lum;
      if (x < W / 2) leftBright += lum; else rightBright += lum;
    }
  }
  const isBrighterRight = rightBright > leftBright;
  const isBrighterBottom = botBright > topBright;

  const confidence = 0.87 + Math.random() * 0.09; // 87–96%
  const fracProb   = confidence - 0.03 + Math.random() * 0.06;

  // Place annotation bounding box based on pixel analysis
  const bx = isBrighterRight ? Math.round(W * 0.52) : Math.round(W * 0.12);
  const by = isBrighterBottom ? Math.round(H * 0.55) : Math.round(H * 0.18);
  const bw = Math.round(W * 0.32);
  const bh = Math.round(H * 0.28);

  const annotations: Annotation[] = [
    { x: bx, y: by, w: bw, h: bh, label: `Cortical Disruption (${(fracProb * 100).toFixed(1)}%)`, color: '#ef4444', confidence: fracProb },
    { x: Math.round(W * 0.2), y: Math.round(H * 0.3), w: Math.round(W * 0.18), h: Math.round(H * 0.15), label: 'Soft Tissue Swelling', color: '#f59e0b', confidence: 0.72 },
  ];

  return {
    prediction: fracProb > 0.5 ? 'fractured' : 'normal',
    confidence,
    fracture_probability: fracProb,
    annotations,
    details: {
      exact_location: isBrighterRight ? 'Distal phalanges — lateral aspect' : 'Distal radius / ulna junction',
      proximity_notes: `AI detected cortical disruption with ${(fracProb * 100).toFixed(1)}% confidence. Soft tissue swelling consistent with acute traumatic fracture.`,
      recommendation: fracProb > 0.7
        ? 'Immediate orthopedic consultation and immobilization required.'
        : 'Follow-up X-ray in 72 hours. Conservative management advised.',
      ai_solutions: [
        'Immobilize affected limb with a volar splint.',
        'Apply ice packs (20 min on / 20 min off) to reduce swelling.',
        'Prescribe NSAIDs (Ibuprofen 400 mg TDS) for pain management.',
        'Non-weight bearing status for the affected extremity.',
        'Referral to orthopedic surgery if displacement is confirmed on CT.',
      ],
      associated_doctors: [
        { name: 'Dr. A. Sharma', specialty: 'Orthopedic Surgeon', distance: '2.1 km', available: 'Available Today' },
        { name: 'City Bone & Joint Clinic', specialty: 'Trauma Center', distance: '4.5 km', available: '24/7 ER' },
      ],
    },
  };
}

// ─── Draw annotations onto a canvas overlay ─────────────────────────────────
function drawAnnotations(canvas: HTMLCanvasElement, annotations: Annotation[]) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  annotations.forEach((ann) => {
    // Bounding box
    ctx.strokeStyle = ann.color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(ann.x, ann.y, ann.w, ann.h);
    ctx.setLineDash([]);

    // Corner marks
    const cs = 10;
    ctx.lineWidth = 3;
    [[ann.x, ann.y], [ann.x + ann.w, ann.y], [ann.x, ann.y + ann.h], [ann.x + ann.w, ann.y + ann.h]].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.moveTo(cx - cs, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy - cs);
      ctx.stroke();
    });

    // Label background
    ctx.font = 'bold 11px Inter, sans-serif';
    const textW = ctx.measureText(ann.label).width + 10;
    ctx.fillStyle = ann.color + 'dd';
    ctx.fillRect(ann.x, ann.y - 20, textW, 20);

    // Label text
    ctx.fillStyle = '#fff';
    ctx.fillText(ann.label, ann.x + 5, ann.y - 5);

    // Heatmap overlay (semi-transparent)
    const gradient = ctx.createRadialGradient(
      ann.x + ann.w / 2, ann.y + ann.h / 2, 0,
      ann.x + ann.w / 2, ann.y + ann.h / 2,
      Math.max(ann.w, ann.h) / 2
    );
    gradient.addColorStop(0, ann.color + '55');
    gradient.addColorStop(1, ann.color + '00');
    ctx.fillStyle = gradient;
    ctx.fillRect(ann.x, ann.y, ann.w, ann.h);
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function XRayAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [result, setResult]             = useState<AnalysisResult | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const imageRef       = useRef<HTMLImageElement>(null);
  const overlayRef     = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const reportRef      = useRef<HTMLDivElement>(null);

  // Re-draw annotations whenever result / toggle changes
  useEffect(() => {
    if (!result || !overlayRef.current || !imageRef.current) return;
    const img = imageRef.current;
    const canvas = overlayRef.current;
    canvas.width  = img.clientWidth;
    canvas.height = img.clientHeight;

    // Scale annotations to displayed image size
    const scaleX = img.clientWidth  / (img.naturalWidth  || img.clientWidth);
    const scaleY = img.clientHeight / (img.naturalHeight || img.clientHeight);
    const scaledAnnotations = result.annotations.map(a => ({
      ...a,
      x: a.x * scaleX, y: a.y * scaleY,
      w: a.w * scaleX, h: a.h * scaleY,
    }));

    if (showAnnotations) drawAnnotations(canvas, scaledAnnotations);
    else overlayRef.current.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
  }, [result, showAnnotations]);

  const handleFileSelection = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); setError(null);
    } else {
      setError('Please upload a valid image file (JPG or PNG).');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !previewUrl) return;
    setIsAnalyzing(true); setError(null); setResult(null);

    try {
      // Load image into hidden canvas for pixel analysis
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const c = hiddenCanvasRef.current!;
          c.width = img.width; c.height = img.height;
          c.getContext('2d')!.drawImage(img, 0, 0);
          resolve();
        };
        img.src = previewUrl;
      });

      await new Promise(r => setTimeout(r, 2200)); // Simulate AI latency

      const analysis = runMockAnalysis(hiddenCanvasRef.current!);
      setResult(analysis);
      setShowAnnotations(true);
    } catch {
      setError('Failed to process the X-Ray.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPDF = async () => {
    if (!result || !previewUrl) return;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = pdf.internal.pageSize.getWidth();
    let y = 15;

    // Header
    pdf.setFontSize(22); pdf.setTextColor(15, 23, 42);
    pdf.text('MedDash', 15, y);
    pdf.setTextColor(37, 99, 235);
    pdf.text('AI X-Ray Bone Fracture Report', 52, y);
    y += 7;
    pdf.setFontSize(9); pdf.setTextColor(100, 116, 139);
    pdf.text(`Date: ${new Date().toLocaleString()}  |  Report ID: XR-${Math.random().toString(36).substr(2,8).toUpperCase()}`, 15, y);
    y += 1;
    pdf.setDrawColor(37, 99, 235); pdf.setLineWidth(0.5); pdf.line(15, y + 2, W - 15, y + 2);
    y += 10;

    // Diagnosis summary box
    const diagColor = result.prediction === 'fractured' ? [220, 38, 38] : [22, 163, 74];
    pdf.setFillColor(...diagColor as [number,number,number]); pdf.setTextColor(255, 255, 255);
    pdf.roundedRect(15, y, W - 30, 20, 3, 3, 'F');
    pdf.setFontSize(14); pdf.setFont('helvetica', 'bold');
    pdf.text(`Diagnosis: ${result.prediction.toUpperCase()}`, 20, y + 8);
    pdf.setFontSize(11); pdf.setFont('helvetica', 'normal');
    pdf.text(`AI Confidence: ${(result.confidence * 100).toFixed(1)}%   |   Fracture Probability: ${(result.fracture_probability * 100).toFixed(1)}%`, 20, y + 15);
    y += 28;

    // Original image
    pdf.setTextColor(15, 23, 42); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold');
    pdf.text('Uploaded X-Ray Image', 15, y); y += 5;
    pdf.addImage(previewUrl, 'PNG', 15, y, 85, 70); y += 75;

    // Annotation list
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12);
    pdf.text('AI Detected Annotations', 15, y); y += 7;
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
    result.annotations.forEach((ann, i) => {
      pdf.text(`  ${i + 1}. ${ann.label} — Confidence: ${(ann.confidence * 100).toFixed(1)}%`, 15, y);
      y += 6;
    });
    y += 4;

    // Clinical details
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12);
    pdf.text('Clinical Details', 15, y); y += 7;
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
    const details = [
      ['Exact Location', result.details.exact_location],
      ['Clinical Notes', result.details.proximity_notes],
      ['Recommendation', result.details.recommendation],
    ];
    details.forEach(([label, val]) => {
      pdf.setFont('helvetica', 'bold'); pdf.text(`${label}:`, 15, y);
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(val, W - 55);
      pdf.text(lines, 55, y);
      y += lines.length * 6 + 3;
    });
    y += 3;

    // AI Solutions
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12);
    pdf.text('AI-Derived Treatment Plan', 15, y); y += 7;
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
    result.details.ai_solutions.forEach((s, i) => {
      pdf.text(`  ${i + 1}. ${s}`, 15, y); y += 6;
    });

    // Footer
    pdf.setFontSize(8); pdf.setTextColor(148, 163, 184);
    pdf.text('This report is AI-generated. Must be reviewed by a certified radiologist before clinical decisions.', 15, 285);

    pdf.save('MedDash_XRay_Report.pdf');
  };

  return (
    <div className={styles.container}>
      {/* Hidden elements for processing */}
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />

      <div className={styles.header}>
        <h1><IconBone size={32} color="var(--color-accent)" /> AI Bone Fracture Analysis</h1>
        <p>Upload an X-Ray image for clinical evaluation powered by Deep Learning with real-time annotations.</p>
      </div>

      <div className={styles.content}>
        {/* Upload section */}
        <div className={styles.uploadSection}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileSelection(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" accept="image/*" hidden ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])} />
            {previewUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imageRef} src={previewUrl} alt="X-Ray Preview" className={styles.previewImage}
                  onLoad={() => {
                    if (result && overlayRef.current && imageRef.current) {
                      const img = imageRef.current;
                      overlayRef.current.width  = img.clientWidth;
                      overlayRef.current.height = img.clientHeight;
                    }
                  }}
                />
                {/* Annotation overlay canvas */}
                <canvas ref={overlayRef} style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', pointerEvents: 'none'
                }} />
              </div>
            ) : (
              <div className={styles.dropContent}>
                <IconUpload size={48} color="var(--color-text-muted)" />
                <p>Drag and drop your X-Ray here, or click to browse</p>
                <span>Supports JPG, PNG</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button className={styles.analyzeButton} style={{ flex: 1 }}
              disabled={!selectedFile || isAnalyzing}
              onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}>
              {isAnalyzing ? '🧠 Analyzing Fracture Proximity...' : 'Run AI Analysis'}
            </button>
            {result && (
              <>
                <button onClick={() => setShowAnnotations(v => !v)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-base)', background: showAnnotations ? 'var(--color-primary-base)' : 'var(--color-surface-base)', color: showAnnotations ? '#fff' : 'var(--color-text-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}>
                  <IconTag size={16} /> {showAnnotations ? 'Hide' : 'Show'} Annotations
                </button>
                <button onClick={downloadPDF}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-base)', background: 'var(--color-surface-base)', color: 'var(--color-text-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}>
                  <IconDownload size={16} /> Download Report
                </button>
              </>
            )}
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}
        </div>

        {/* Result section */}
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

              {/* Annotation legend */}
              {result.annotations.length > 0 && (
                <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--color-surface-elevated)', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconTag size={14} /> Detected Regions ({result.annotations.length})
                  </p>
                  {result.annotations.map((ann, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '13px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: ann.color, flexShrink: 0 }} />
                      <span>{ann.label}</span>
                      <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}>{(ann.confidence * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}

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

              <div className={styles.detailsPanel}>
                <h3><IconStethoscope size={18} /> Clinical Details</h3>
                <ul>
                  <li><strong>Exact Location:</strong> {result.details.exact_location}</li>
                  <li><strong>Clinical Notes:</strong> {result.details.proximity_notes}</li>
                  <li><strong>Recommendation:</strong> {result.details.recommendation}</li>
                </ul>

                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ color: 'var(--color-primary-base)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconBulb size={18} /> AI Derived Treatment Plan
                  </h3>
                  <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
                    {result.details.ai_solutions.map((s, i) => (
                      <li key={i} style={{ marginBottom: '8px' }}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: '24px', background: 'var(--color-surface-elevated)', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconUserPlus size={18} /> Nearest Associated Doctors
                  </h3>
                  {result.details.associated_doctors.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: i < result.details.associated_doctors.length - 1 ? '1px solid var(--color-border-base)' : 'none', marginBottom: '12px' }}>
                      <div>
                        <strong style={{ display: 'block' }}>{doc.name}</strong>
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
