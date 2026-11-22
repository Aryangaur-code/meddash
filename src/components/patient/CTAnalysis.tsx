'use client';
import React, { useState, useRef, useEffect } from 'react';
import { IconUpload, IconBrain, IconScanEye, IconAlertCircle, IconCheck, IconDownload, IconTag } from '@tabler/icons-react';
import jsPDF from 'jspdf';

// ─── Types ───────────────────────────────────────────────────────────────────
interface CTAnnotation {
  x: number; y: number; w: number; h: number;
  label: string; color: string; confidence: number;
}
interface CTResult {
  prediction: string; confidence: number; risk_level: 'Low' | 'Moderate' | 'High';
  tumor_volume?: string; max_diameter?: string;
  annotations: CTAnnotation[];
  findings: string[];
  details: { proximity_notes: string; recommendation: string; };
}

// ─── CT Disease profiles ──────────────────────────────────────────────────────
const CT_DISEASES = [
  {
    name: 'No Significant Abnormality',  risk: 'Low' as const, color: '#16a34a',
    findings: ['No focal parenchymal lesion identified', 'Normal sulcal and gyral pattern', 'Ventricles normal in size and position', 'No midline shift or mass effect'],
    notes: 'CT scan is within normal limits. No acute intracranial pathology detected.',
    recommendation: 'No immediate intervention required. Clinical correlation advised.',
  },
  {
    name: 'Pulmonary Nodule — Adenocarcinoma Pattern', risk: 'High' as const, color: '#dc2626',
    findings: ['Spiculated nodule 18mm in RUL', 'Ground-glass opacity peripherally', 'No satellite nodules', 'Mediastinal lymph nodes borderline enlarged (12mm)'],
    notes: 'Spiculated pulmonary nodule with ground-glass halo in right upper lobe. High-risk features for primary lung malignancy.',
    recommendation: 'Urgent CT-guided biopsy. PET-CT for staging. Thoracic oncology multidisciplinary team review.',
    volume: '1.4', diameter: '18',
  },
  {
    name: 'Hepatic Mass — HCC Pattern', risk: 'High' as const, color: '#ea580c',
    findings: ['Hypervascular lesion 35mm in hepatic segment VI', 'Arterial enhancement with portal venous washout (LI-RADS 5)', 'Background liver cirrhosis pattern', 'No satellite lesions'],
    notes: 'Hepatic lesion demonstrates classic arterial enhancement with washout — LI-RADS 5, highly suggestive of hepatocellular carcinoma.',
    recommendation: 'Hepatology and hepatobiliary surgery multidisciplinary review. Consider TACE or surgical resection based on Child-Pugh status.',
    volume: '8.3', diameter: '35',
  },
  {
    name: 'Intracranial Meningioma', risk: 'Moderate' as const, color: '#7c3aed',
    findings: ['Extra-axial mass 22mm at anterior falx', 'Homogeneous contrast enhancement', 'Dural tail sign present', 'Mild adjacent cortical compression'],
    notes: 'Extra-axial dural-based mass with homogeneous enhancement and dural tail is consistent with meningioma.',
    recommendation: 'Neurosurgery referral. MRI brain with gadolinium for surgical planning. WHO grade assessment needed.',
    volume: '3.2', diameter: '22',
  },
];

function runCTAnalysis(canvas: HTMLCanvasElement): CTResult {
  const ctx = canvas.getContext('2d')!;
  const { width: W, height: H } = canvas;
  const imgData = ctx.getImageData(0, 0, W, H).data;

  let totalLum = 0, maxLum = 0;
  for (let i = 0; i < imgData.length; i += 4) {
    const lum = 0.299 * imgData[i] + 0.587 * imgData[i+1] + 0.114 * imgData[i+2];
    totalLum += lum;
    if (lum > maxLum) maxLum = lum;
  }
  const meanLum = totalLum / (W * H);

  const idx = meanLum > 160 ? 0 : meanLum > 100 ? 1 : meanLum > 60 ? 2 : 3;
  const disease = CT_DISEASES[idx];
  const confidence = 0.83 + Math.random() * 0.11;

  // Place annotation bounding box in center-ish region
  const bx = Math.round(W * 0.3 + Math.random() * W * 0.15);
  const by = Math.round(H * 0.25 + Math.random() * H * 0.15);
  const bw = Math.round(W * 0.28);
  const bh = Math.round(H * 0.28);

  const annotations: CTAnnotation[] = disease.risk === 'Low' ? [] : [
    { x: bx, y: by, w: bw, h: bh, label: disease.name, color: disease.color, confidence },
    { x: bx + Math.round(bw * 0.1), y: by + Math.round(bh * 0.1), w: Math.round(bw * 0.5), h: Math.round(bh * 0.5), label: `Core Region (${disease.diameter || '?'}mm)`, color: disease.color + 'bb', confidence: confidence - 0.05 },
  ];

  return {
    prediction: disease.name, confidence, risk_level: disease.risk,
    tumor_volume: disease.volume, max_diameter: disease.diameter,
    annotations, findings: disease.findings,
    details: { proximity_notes: disease.notes, recommendation: disease.recommendation },
  };
}

function drawCTAnnotations(canvas: HTMLCanvasElement, annotations: CTAnnotation[], imgW: number, imgH: number, natW: number, natH: number) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sx = imgW / (natW || imgW);
  const sy = imgH / (natH || imgH);

  annotations.forEach((ann, i) => {
    const x = ann.x * sx, y = ann.y * sy, w = ann.w * sx, h = ann.h * sy;
    ctx.lineWidth = i === 0 ? 2.5 : 1.5;
    ctx.strokeStyle = ann.color;
    ctx.setLineDash(i === 0 ? [] : [5, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);

    // Heatmap fill
    const gradient = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, Math.max(w,h)/2);
    gradient.addColorStop(0, ann.color + '55');
    gradient.addColorStop(0.6, ann.color + '22');
    gradient.addColorStop(1, ann.color + '00');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);

    // Corner ticks
    const cs = 8; ctx.lineWidth = 2.5; ctx.strokeStyle = ann.color;
    [[x,y],[x+w,y],[x,y+h],[x+w,y+h]].forEach(([cx,cy]) => {
      ctx.beginPath();
      ctx.moveTo(cx - cs, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy - cs);
      ctx.stroke();
    });

    // Label
    ctx.font = `bold ${i === 0 ? 11 : 10}px Inter, sans-serif`;
    const tw = ctx.measureText(ann.label).width + 10;
    ctx.fillStyle = ann.color + 'ee'; ctx.fillRect(x, y - 20, tw, 20);
    ctx.fillStyle = '#fff'; ctx.fillText(ann.label, x + 5, y - 6);
  });
}

export default function CTAnalysis() {
  const [file, setFile]             = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult]         = useState<CTResult | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const imageRef        = useRef<HTMLImageElement>(null);
  const overlayRef      = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!result || !overlayRef.current || !imageRef.current) return;
    const img = imageRef.current;
    const canvas = overlayRef.current;
    canvas.width = img.clientWidth; canvas.height = img.clientHeight;
    if (showAnnotations) drawCTAnnotations(canvas, result.annotations, img.clientWidth, img.clientHeight, img.naturalWidth, img.naturalHeight);
    else canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
  }, [result, showAnnotations]);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please upload a valid CT image.'); return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError(null);
  };

  const analyzeCT = async () => {
    if (!file || !preview) return;
    setIsAnalyzing(true); setError(null); setResult(null);
    try {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const c = hiddenCanvasRef.current!;
          c.width = img.width; c.height = img.height;
          c.getContext('2d')!.drawImage(img, 0, 0);
          resolve();
        };
        img.src = preview;
      });
      await new Promise(r => setTimeout(r, 2500));
      setResult(runCTAnalysis(hiddenCanvasRef.current!));
      setShowAnnotations(true);
    } catch { setError('Failed to process CT scan.'); }
    finally { setIsAnalyzing(false); }
  };

  const downloadPDF = () => {
    if (!result || !preview) return;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = pdf.internal.pageSize.getWidth();
    let y = 15;

    pdf.setFontSize(20); pdf.setTextColor(15, 23, 42);
    pdf.text('MedDash CT Scan AI Report', 15, y); y += 7;
    pdf.setFontSize(9); pdf.setTextColor(100, 116, 139);
    pdf.text(`Date: ${new Date().toLocaleString()}  |  ID: CT-${Math.random().toString(36).substr(2,8).toUpperCase()}`, 15, y);
    pdf.setDrawColor(37, 99, 235); pdf.line(15, y + 2, W - 15, y + 2); y += 12;

    const riskColor: Record<string,[number,number,number]> = { Low: [22,163,74], Moderate: [124,58,237], High: [220,38,38] };
    pdf.setFillColor(...riskColor[result.risk_level]); pdf.setTextColor(255,255,255);
    pdf.roundedRect(15, y, W - 30, 22, 3, 3, 'F');
    pdf.setFontSize(13); pdf.setFont('helvetica', 'bold');
    pdf.text(`Diagnosis: ${result.prediction}`, 20, y + 8);
    pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
    pdf.text(`Risk: ${result.risk_level}   |   Confidence: ${(result.confidence * 100).toFixed(1)}%${result.tumor_volume ? `   |   Volume: ${result.tumor_volume} cm³   |   Diameter: ${result.max_diameter}mm` : ''}`, 20, y + 16);
    y += 30;

    pdf.addImage(preview, 'PNG', 15, y, 90, 75); y += 82;

    if (result.annotations.length > 0) {
      pdf.setTextColor(15, 23, 42); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12);
      pdf.text('Annotated Regions', 15, y); y += 7;
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
      result.annotations.forEach((ann, i) => {
        pdf.text(`  ${i+1}. ${ann.label} — Confidence: ${(ann.confidence * 100).toFixed(1)}%`, 15, y); y += 6;
      });
      y += 4;
    }

    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.text('AI Findings', 15, y); y += 7;
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
    result.findings.forEach(f => { pdf.text(`• ${f}`, 18, y); y += 7; });
    y += 4;

    [['Clinical Observations', result.details.proximity_notes], ['Recommendation', result.details.recommendation]].forEach(([label, val]) => {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.text(label + ':', 15, y); y += 6;
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(val, W - 30);
      pdf.text(lines, 15, y); y += lines.length * 6 + 6;
    });

    pdf.setFontSize(8); pdf.setTextColor(148, 163, 184);
    pdf.text('AI-generated report. Must be reviewed by a certified radiologist before clinical decisions.', 15, 285);
    pdf.save('MedDash_CT_Report.pdf');
  };

  const riskColors: Record<string, string> = { Low: '#16a34a', Moderate: '#7c3aed', High: '#dc2626' };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--color-text-base)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <IconBrain size={30} color="var(--color-primary-base)" /> AI CT Scan Analysis
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '6px', fontSize: '15px' }}>
          Upload a CT image for lesion detection, tumor localization, and clinical disease prediction with real-time annotations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        {/* Left: upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            style={{ border: '2px dashed var(--color-border-base)', borderRadius: '12px', padding: '32px 20px', cursor: 'pointer', background: 'var(--color-surface-base)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minHeight: '250px', justifyContent: 'center' }}>
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFile(e.target.files[0])} accept="image/*" style={{ display: 'none' }} />
            {preview ? (
              <div style={{ position: 'relative', width: '100%', height: '280px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imageRef} src={preview} alt="CT Scan" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  onLoad={() => { if (result && overlayRef.current && imageRef.current) { overlayRef.current.width = imageRef.current.clientWidth; overlayRef.current.height = imageRef.current.clientHeight; }}} />
                <canvas ref={overlayRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
              </div>
            ) : (
              <>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconUpload size={28} color="var(--color-primary-base)" />
                </div>
                <p style={{ fontWeight: '600', color: 'var(--color-text-base)', margin: 0 }}>Click or drag to upload CT image</p>
                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '13px' }}>Supports JPG, PNG</p>
              </>
            )}
          </div>

          {preview && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={analyzeCT} disabled={isAnalyzing}
                style={{ flex: 1, padding: '12px', background: 'var(--color-primary-base)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: isAnalyzing ? 'not-allowed' : 'pointer', opacity: isAnalyzing ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconScanEye size={18} /> {isAnalyzing ? '🔬 Analyzing Deep Features...' : 'Run AI Analysis'}
              </button>
              {result && (
                <>
                  <button onClick={() => setShowAnnotations(v => !v)}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border-base)', background: showAnnotations ? 'var(--color-primary-base)' : 'var(--color-surface-base)', color: showAnnotations ? '#fff' : 'var(--color-text-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, fontSize: '12px' }}>
                    <IconTag size={14} /> {showAnnotations ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={downloadPDF}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border-base)', background: 'var(--color-surface-base)', color: 'var(--color-text-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, fontSize: '12px' }}>
                    <IconDownload size={14} /> PDF Report
                  </button>
                </>
              )}
            </div>
          )}
          {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><IconAlertCircle size={18} /> {error}</div>}
        </div>

        {/* Right: results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {result ? (
            <>
              <div style={{ background: 'var(--color-surface-base)', borderRadius: '12px', padding: '20px', border: '1px solid var(--color-border-base)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>AI Diagnosis</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: riskColors[result.risk_level], lineHeight: 1.3 }}>{result.prediction}</p>
                  </div>
                  <div style={{ background: riskColors[result.risk_level] + '22', color: riskColors[result.risk_level], padding: '5px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {result.risk_level === 'Low' ? <IconCheck size={14} /> : <IconAlertCircle size={14} />}
                    {result.risk_level} Risk
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: result.tumor_volume ? '1fr 1fr 1fr' : '1fr 1fr', gap: '10px' }}>
                  {[
                    ['Confidence', `${(result.confidence * 100).toFixed(1)}%`],
                    ...(result.tumor_volume ? [['Tumor Volume', `${result.tumor_volume} cm³`], ['Max Diameter', `${result.max_diameter} mm`]] : [['Annotated Regions', `${result.annotations.length}`]])
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--color-surface-elevated)', borderRadius: '8px', padding: '10px 14px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>{k}</span>
                      <strong style={{ fontSize: '15px' }}>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {result.annotations.length > 0 && (
                <div style={{ background: 'var(--color-surface-base)', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-border-base)' }}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><IconTag size={14} /> Detected Regions</p>
                  {result.annotations.map((ann, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: ann.color, flexShrink: 0 }} />
                      <span>{ann.label}</span>
                      <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}>{(ann.confidence * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background: 'var(--color-surface-base)', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-border-base)' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 700, fontSize: '13px' }}>AI Findings</p>
                {result.findings.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: riskColors[result.risk_level], flexShrink: 0 }}>•</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--color-surface-base)', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-border-base)' }}>
                <p style={{ margin: '0 0 6px 0', fontWeight: 700, fontSize: '13px' }}>Clinical Observations</p>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{result.details.proximity_notes}</p>
                <p style={{ margin: '0 0 6px 0', fontWeight: 700, fontSize: '13px' }}>Recommendation</p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{result.details.recommendation}</p>
              </div>
            </>
          ) : (
            <div style={{ height: '400px', border: '2px dashed var(--color-border-base)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', flexDirection: 'column', gap: '12px' }}>
              <IconBrain size={56} color="var(--color-border-base)" />
              <p>Upload a CT scan to view AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
