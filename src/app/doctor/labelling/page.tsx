'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IconTag, IconCheck, IconChevronRight, IconStar, IconClock, IconAlertTriangle, IconCircleDashed, IconDownload } from '@tabler/icons-react';
import jsPDF from 'jspdf';

// ─── Types ───────────────────────────────────────────────────────────────────
interface BoundingBox { x: number; y: number; w: number; h: number; }
interface LabelEntry {
  imageId: string;
  tumorDetected: boolean | null;
  tumorType: string;
  severity: string;
  boundingBox: BoundingBox | null;
  size: string;
  shape: string;
  margin: string;
  density: string;
  calcification: boolean;
  vascularity: string;
  notes: string;
  labelledAt: string;
}

// ─── 10 public-domain CT scan placeholder images ────────────────────────────
// Using grayscale gradient placeholders since we can't embed 10 real CT DICOMs
const CT_IMAGES = [
  { id: 'CT-001', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Computed_tomography_of_human_brain_-_large.png/400px-Computed_tomography_of_human_brain_-_large.png', region: 'Brain (Axial)', slice: 'Level: Basal Ganglia' },
  { id: 'CT-002', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Thorax_CT_Lungs_-_Emphysema.jpg/400px-Thorax_CT_Lungs_-_Emphysema.jpg', region: 'Thorax (Axial)', slice: 'Level: Carina' },
  { id: 'CT-003', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Computed_tomography_of_human_brain_-_large.png/400px-Computed_tomography_of_human_brain_-_large.png', region: 'Brain (Axial)', slice: 'Level: Posterior Fossa' },
  { id: 'CT-004', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Thorax_CT_Lungs_-_Emphysema.jpg/400px-Thorax_CT_Lungs_-_Emphysema.jpg', region: 'Chest (Coronal)', slice: 'Level: RUL' },
  { id: 'CT-005', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Computed_tomography_of_human_brain_-_large.png/400px-Computed_tomography_of_human_brain_-_large.png', region: 'Abdomen (Axial)', slice: 'Level: Hepatic Dome' },
  { id: 'CT-006', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Thorax_CT_Lungs_-_Emphysema.jpg/400px-Thorax_CT_Lungs_-_Emphysema.jpg', region: 'Chest (Sagittal)', slice: 'Level: Mid-Sagittal' },
  { id: 'CT-007', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Computed_tomography_of_human_brain_-_large.png/400px-Computed_tomography_of_human_brain_-_large.png', region: 'Brain (Axial)', slice: 'Level: Vertex' },
  { id: 'CT-008', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Thorax_CT_Lungs_-_Emphysema.jpg/400px-Thorax_CT_Lungs_-_Emphysema.jpg', region: 'Abdomen (Axial)', slice: 'Level: Pancreatic Head' },
  { id: 'CT-009', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Computed_tomography_of_human_brain_-_large.png/400px-Computed_tomography_of_human_brain_-_large.png', region: 'Pelvis (Axial)', slice: 'Level: Iliac Crest' },
  { id: 'CT-010', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Thorax_CT_Lungs_-_Emphysema.jpg/400px-Thorax_CT_Lungs_-_Emphysema.jpg', region: 'Spine (Sagittal)', slice: 'Level: T8–T12' },
];

const STORAGE_KEY = 'meddash_ct_labels';
const COOLDOWN_KEY = 'meddash_ct_cooldown';
const STARS_KEY   = 'meddash_doctor_stars';

const TUMOR_TYPES = ['Select type...', 'Benign Cyst', 'Meningioma', 'Glioblastoma (GBM)', 'Adenocarcinoma', 'Squamous Cell Carcinoma', 'Metastatic Lesion', 'Hepatocellular Carcinoma', 'Renal Cell Carcinoma', 'Lymphoma', 'Other'];
const SEVERITY    = ['Select severity...', 'Incidental / Benign', 'Low Grade', 'Moderate', 'High Grade / Malignant', 'Critical — Urgent Review'];
const SHAPES      = ['Select shape...', 'Round / Oval', 'Lobulated', 'Spiculated', 'Irregular', 'Linear'];
const MARGINS     = ['Select margin...', 'Well-defined / Smooth', 'Partially defined', 'Ill-defined / Infiltrative', 'Speculated margins'];
const DENSITIES   = ['Select density...', 'Hypodense', 'Isodense', 'Hyperdense', 'Mixed', 'Fat-containing', 'Calcified'];
const VASCULARITIES = ['Select vascularity...', 'Avascular', 'Hypovascular', 'Hypervascular', 'Rim-enhancing'];

function emptyLabel(imageId: string): LabelEntry {
  return { imageId, tumorDetected: null, tumorType: '', severity: '', boundingBox: null, size: '', shape: '', margin: '', density: '', calcification: false, vascularity: '', notes: '', labelledAt: '' };
}

function getHoursUntilReset(cooldownTs: number): number {
  const msLeft = cooldownTs + 24 * 60 * 60 * 1000 - Date.now();
  return Math.max(0, Math.ceil(msLeft / (60 * 60 * 1000)));
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ImageLabelling() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [labels, setLabels]         = useState<LabelEntry[]>(() => {
    if (typeof window === 'undefined') return CT_IMAGES.map(img => emptyLabel(img.id));
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : CT_IMAGES.map(img => emptyLabel(img.id));
    } catch { return CT_IMAGES.map(img => emptyLabel(img.id)); }
  });
  const [stars, setStars] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(STARS_KEY) || '0', 10);
  });
  const [cooldownTs, setCooldownTs] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
  });
  const [isDrawing, setIsDrawing]   = useState(false);
  const [drawStart, setDrawStart]   = useState<{x:number;y:number}|null>(null);
  const [tempBox, setTempBox]       = useState<BoundingBox|null>(null);
  const [justSaved, setJustSaved]   = useState(false);

  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const imageRef    = useRef<HTMLImageElement>(null);

  const current = CT_IMAGES[currentIdx];
  const label   = labels[currentIdx];
  const allDone = labels.every(l => l.labelledAt !== '');
  const isOnCooldown = allDone && Date.now() < cooldownTs + 24 * 60 * 60 * 1000;

  // Persist labels to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
  }, [labels]);

  // Draw bounding box on canvas overlay
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imageRef.current;
    if (!canvas || !img) return;
    canvas.width  = img.clientWidth;
    canvas.height = img.clientHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const box = tempBox || label.boundingBox;
    if (!box) return;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth   = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.setLineDash([]);
    ctx.fillStyle = '#3b82f622';
    ctx.fillRect(box.x, box.y, box.w, box.h);

    // Corner ticks
    const cs = 10; ctx.lineWidth = 3; ctx.strokeStyle = '#3b82f6';
    [[box.x,box.y],[box.x+box.w,box.y],[box.x,box.y+box.h],[box.x+box.w,box.y+box.h]].forEach(([cx,cy]) => {
      ctx.beginPath(); ctx.moveTo(cx-cs,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy-cs); ctx.stroke();
    });

    // Size label
    if (box.w > 20 && box.h > 20) {
      const pxDiam = Math.round(Math.sqrt(box.w * box.w + box.h * box.h));
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#3b82f6dd';
      ctx.fillRect(box.x, box.y - 20, 90, 20);
      ctx.fillStyle = '#fff';
      ctx.fillText(`~${pxDiam}px diagonal`, box.x + 4, box.y - 6);
    }
  }, [label.boundingBox, tempBox]);

  useEffect(() => { redrawCanvas(); }, [redrawCanvas, currentIdx]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);
    setIsDrawing(true); setDrawStart(pos); setTempBox(null);
  };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return;
    const pos = getCanvasPos(e);
    const box: BoundingBox = { x: Math.min(pos.x, drawStart.x), y: Math.min(pos.y, drawStart.y), w: Math.abs(pos.x - drawStart.x), h: Math.abs(pos.y - drawStart.y) };
    setTempBox(box); redrawCanvas();
  };
  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return;
    const pos = getCanvasPos(e);
    const box: BoundingBox = { x: Math.min(pos.x, drawStart.x), y: Math.min(pos.y, drawStart.y), w: Math.abs(pos.x - drawStart.x), h: Math.abs(pos.y - drawStart.y) };
    setIsDrawing(false); setDrawStart(null); setTempBox(null);
    if (box.w > 5 && box.h > 5) updateLabel({ boundingBox: box });
  };

  const updateLabel = (patch: Partial<LabelEntry>) => {
    setLabels(prev => prev.map((l, i) => i === currentIdx ? { ...l, ...patch } : l));
  };

  const handleSave = () => {
    if (label.tumorDetected === null) { alert('Please select whether a tumor is detected.'); return; }
    if (label.tumorDetected && !label.boundingBox) { alert('Please draw a bounding box around the detected region.'); return; }
    if (label.tumorDetected && !label.tumorType) { alert('Please select a tumor type.'); return; }

    const newStars = stars + 5;
    setStars(newStars);
    localStorage.setItem(STARS_KEY, String(newStars));

    const updatedLabels = labels.map((l, i) =>
      i === currentIdx ? { ...l, labelledAt: new Date().toISOString() } : l
    );
    setLabels(updatedLabels);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLabels));

    // Check if all done → set 24hr cooldown
    if (updatedLabels.every(l => l.labelledAt !== '')) {
      const ts = Date.now();
      setCooldownTs(ts);
      localStorage.setItem(COOLDOWN_KEY, String(ts));
    }

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
    if (currentIdx < CT_IMAGES.length - 1) setTimeout(() => setCurrentIdx(i => i + 1), 800);
  };

  const handleReset = () => {
    if (!confirm('Reset all labels and start over?')) return;
    const fresh = CT_IMAGES.map(img => emptyLabel(img.id));
    setLabels(fresh);
    setStars(0); setCurrentIdx(0); setCooldownTs(0);
    localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(COOLDOWN_KEY); localStorage.removeItem(STARS_KEY);
  };

  const downloadReport = () => {
    const labelled = labels.filter(l => l.labelledAt !== '');
    if (labelled.length === 0) { alert('No completed labels to export.'); return; }
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = pdf.internal.pageSize.getWidth();
    let y = 15;

    pdf.setFontSize(20); pdf.setTextColor(15,23,42);
    pdf.text('MedDash — CT Image Labelling Report', 15, y); y += 7;
    pdf.setFontSize(9); pdf.setTextColor(100,116,139);
    pdf.text(`Exported: ${new Date().toLocaleString()}  |  Labels Completed: ${labelled.length}/10  |  Stars Earned: ${stars}`, 15, y);
    pdf.setDrawColor(37,99,235); pdf.line(15, y+2, W-15, y+2); y += 12;

    labelled.forEach((l, i) => {
      const imgMeta = CT_IMAGES.find(img => img.id === l.imageId);
      pdf.setFont('helvetica','bold'); pdf.setFontSize(12); pdf.setTextColor(15,23,42);
      pdf.text(`${i+1}. ${l.imageId} — ${imgMeta?.region || ''}`, 15, y); y += 6;

      const rows = [
        ['Tumor Detected', l.tumorDetected ? 'YES' : 'NO'],
        ['Tumor Type', l.tumorType || '—'],
        ['Severity', l.severity || '—'],
        ['Size Estimate', l.size || '—'],
        ['Shape', l.shape || '—'],
        ['Margin', l.margin || '—'],
        ['Density', l.density || '—'],
        ['Calcification', l.calcification ? 'Present' : 'Absent'],
        ['Vascularity', l.vascularity || '—'],
        ['Bounding Box', l.boundingBox ? `x:${Math.round(l.boundingBox.x)} y:${Math.round(l.boundingBox.y)} w:${Math.round(l.boundingBox.w)} h:${Math.round(l.boundingBox.h)}` : 'None'],
        ['Notes', l.notes || '—'],
        ['Labelled At', new Date(l.labelledAt).toLocaleString()],
      ];
      pdf.setFont('helvetica','normal'); pdf.setFontSize(9);
      rows.forEach(([k, v]) => {
        pdf.setTextColor(100,116,139); pdf.text(k+':', 18, y);
        pdf.setTextColor(15,23,42); const lines = pdf.splitTextToSize(v, W-65);
        pdf.text(lines, 60, y); y += lines.length * 5 + 1;
      });
      y += 5;
      if (y > 260) { pdf.addPage(); y = 20; }
    });
    pdf.save('MedDash_CT_Labels.pdf');
  };

  // ─── COOLDOWN SCREEN ───────────────────────────────────────────────────────
  if (isOnCooldown) {
    const hrs = getHoursUntilReset(cooldownTs);
    return (
      <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <IconClock size={40} color="#f59e0b" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-base)', margin: '0 0 12px' }}>
          Batch Complete! 🎉
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', margin: '0 0 24px' }}>
          You have labelled all 10 CT scans. The next batch of 10 images will be available in:
        </p>
        <div style={{ fontSize: '48px', fontWeight: 800, color: '#f59e0b', margin: '0 0 8px' }}>{hrs}h</div>
        <p style={{ color: 'var(--color-text-muted)', margin: '0 0 32px' }}>Come back in {hrs} hours for your next batch.</p>

        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#d97706' }}>⭐ {stars} Stars</div>
          <div style={{ fontSize: '14px', color: '#92400e', marginTop: '6px' }}>
            {stars >= 50 ? '🏆 TOP RECOMMENDED status unlocked! You appear first in patient searches.' : `${50 - stars} more stars needed for Top Recommended status.`}
          </div>
          <div style={{ background: '#f5f5f5', borderRadius: '8px', height: '8px', margin: '12px 0 4px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', height: '100%', width: `${Math.min(100, (stars / 50) * 100)}%`, borderRadius: '8px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ fontSize: '12px', color: '#92400e' }}>{Math.min(stars, 50)}/50 stars to Top Recommended</div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={downloadReport} style={{ padding: '12px 24px', background: 'var(--color-primary-base)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconDownload size={18} /> Export Label Report
          </button>
          <button onClick={handleReset} style={{ padding: '12px 24px', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-base)', borderRadius: '8px', cursor: 'pointer' }}>
            Reset (Dev)
          </button>
        </div>
      </div>
    );
  }

  // ─── LABELLING UI ──────────────────────────────────────────────────────────
  const labelled = labels.filter(l => l.labelledAt !== '').length;
  const starColor = (n: number) => stars >= n ? '#f59e0b' : '#e2e8f0';

  return (
    <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: 'var(--color-text-base)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconTag size={26} color="var(--color-primary-base)" /> CT Image Labelling
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Annotate CT scans to train the AI model. Earn ⭐ 5 stars per image. Reach 50 stars → Top Recommended in patient searches.
          </p>
        </div>

        {/* Stars progress */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '3px', justifyContent: 'flex-end', marginBottom: '4px' }}>
            {[10,20,30,40,50].map(n => <IconStar key={n} size={18} fill={starColor(n)} color={starColor(n)} />)}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>⭐ {stars}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {stars >= 50 ? '🏆 Top Recommended!' : `${50 - stars} to Top Recommended`}
          </div>
          <div style={{ background: 'var(--color-surface-elevated)', borderRadius: '6px', height: '5px', width: '120px', marginTop: '4px', overflow: 'hidden' }}>
            <div style={{ background: '#f59e0b', height: '100%', width: `${Math.min(100, (stars/50)*100)}%`, borderRadius: '6px' }} />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--color-surface-base)', border: '1px solid var(--color-border-base)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Batch Progress: {labelled}/10</span>
        <div style={{ flex: 1, background: 'var(--color-surface-elevated)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--color-primary-base)', height: '100%', width: `${(labelled/10)*100}%`, borderRadius: '8px', transition: 'width 0.4s ease' }} />
        </div>
        {/* Image thumbnails */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {CT_IMAGES.map((img, i) => (
            <button key={img.id} onClick={() => setCurrentIdx(i)}
              style={{ width: '28px', height: '28px', borderRadius: '6px', border: `2px solid ${i === currentIdx ? 'var(--color-primary-base)' : labels[i].labelledAt ? '#16a34a' : 'var(--color-border-base)'}`, background: labels[i].labelledAt ? '#dcfce7' : i === currentIdx ? 'var(--color-surface-elevated)' : 'var(--color-surface-base)', fontSize: '10px', fontWeight: 700, cursor: 'pointer', color: labels[i].labelledAt ? '#16a34a' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {labels[i].labelledAt ? '✓' : i + 1}
            </button>
          ))}
        </div>
        <button onClick={downloadReport} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--color-border-base)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <IconDownload size={13} /> Export
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' }}>

        {/* ─── LEFT: Image viewer + canvas ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: 'var(--color-surface-base)', border: '1px solid var(--color-border-base)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-base)' }}>{current.id}</span>
                <span style={{ marginLeft: '10px', fontSize: '13px', color: 'var(--color-text-muted)' }}>{current.region}</span>
                <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--color-text-muted)', background: 'var(--color-surface-elevated)', padding: '2px 8px', borderRadius: '12px' }}>{current.slice}</span>
              </div>
              {label.boundingBox && (
                <button onClick={() => updateLabel({ boundingBox: null })}
                  style={{ fontSize: '12px', color: '#dc2626', background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                  Clear Box
                </button>
              )}
            </div>

            {/* CT Image + draw canvas */}
            <div style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imageRef} src={current.url} alt={current.id}
                style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block', filter: 'grayscale(0.3)' }}
                onLoad={redrawCanvas}
                onError={(e) => { (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect fill='%23111'/><text x='50%25' y='50%25' fill='%23555' text-anchor='middle' dy='.3em' font-size='16'>${current.id} — CT Scan</text></svg>`; }}
              />
              <canvas ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'crosshair' }}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} />
            </div>

            <div style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--color-surface-elevated)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconAlertTriangle size={14} color="#f59e0b" />
              <span>Click and drag on the image to draw a bounding box around detected anomaly.</span>
              {label.boundingBox && <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Box placed</span>}
            </div>
          </div>

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}
              style={{ flex: 1, padding: '10px', background: 'var(--color-surface-base)', border: '1px solid var(--color-border-base)', borderRadius: '8px', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentIdx === 0 ? 0.4 : 1, fontSize: '13px', fontWeight: 600 }}>
              ← Previous
            </button>
            <button disabled={currentIdx === CT_IMAGES.length - 1} onClick={() => setCurrentIdx(i => i + 1)}
              style={{ flex: 1, padding: '10px', background: 'var(--color-surface-base)', border: '1px solid var(--color-border-base)', borderRadius: '8px', cursor: currentIdx === CT_IMAGES.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIdx === CT_IMAGES.length - 1 ? 0.4 : 1, fontSize: '13px', fontWeight: 600 }}>
              Next →
            </button>
          </div>
        </div>

        {/* ─── RIGHT: Annotation form ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '80vh' }}>

          {/* Tumor detection toggle */}
          <div style={{ background: 'var(--color-surface-base)', border: '1px solid var(--color-border-base)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '13px' }}>1. Tumor / Lesion Detected?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[true, false].map(val => (
                <button key={String(val)} onClick={() => updateLabel({ tumorDetected: val })}
                  style={{ padding: '12px', borderRadius: '8px', border: `2px solid ${label.tumorDetected === val ? (val ? '#dc2626' : '#16a34a') : 'var(--color-border-base)'}`, background: label.tumorDetected === val ? (val ? '#fee2e2' : '#dcfce7') : 'var(--color-surface-base)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', color: label.tumorDetected === val ? (val ? '#dc2626' : '#16a34a') : 'var(--color-text-muted)' }}>
                  {val ? '⚠ YES — Tumor Detected' : '✓ NO — Normal Scan'}
                </button>
              ))}
            </div>
          </div>

          {/* Only show detailed fields if tumor detected */}
          {label.tumorDetected === true && (<>

            <div style={{ background: 'var(--color-surface-base)', border: '1px solid var(--color-border-base)', borderRadius: '12px', padding: '14px' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '13px' }}>2. Tumor Characteristics</p>

              {[
                { label: 'Tumor Type', key: 'tumorType', options: TUMOR_TYPES },
                { label: 'Severity', key: 'severity', options: SEVERITY },
                { label: 'Shape', key: 'shape', options: SHAPES },
                { label: 'Margin', key: 'margin', options: MARGINS },
                { label: 'Density', key: 'density', options: DENSITIES },
                { label: 'Vascularity', key: 'vascularity', options: VASCULARITIES },
              ].map(({ label: lbl, key, options }) => (
                <div key={key} style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '3px' }}>{lbl}</label>
                  <select value={(label as any)[key] || ''} onChange={e => updateLabel({ [key]: e.target.value } as any)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border-base)', background: 'var(--color-surface-base)', color: 'var(--color-text-base)', fontSize: '13px' }}>
                    {options.map(o => <option key={o} value={o.startsWith('Select') ? '' : o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '3px' }}>Size Estimate (e.g., 18mm, 3cm)</label>
                <input type="text" value={label.size} onChange={e => updateLabel({ size: e.target.value })} placeholder="e.g. 18mm"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border-base)', background: 'var(--color-surface-base)', color: 'var(--color-text-base)', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input type="checkbox" id="calc" checked={label.calcification} onChange={e => updateLabel({ calcification: e.target.checked })} />
                <label htmlFor="calc" style={{ fontSize: '13px', cursor: 'pointer' }}>Calcification Present</label>
              </div>
            </div>

            <div style={{ background: 'var(--color-surface-base)', border: '1px solid var(--color-border-base)', borderRadius: '12px', padding: '14px' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '13px' }}>3. Bounding Box</p>
              {label.boundingBox ? (
                <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px', fontSize: '12px', color: '#166534' }}>
                  ✓ Box placed — x:{Math.round(label.boundingBox.x)} y:{Math.round(label.boundingBox.y)} | {Math.round(label.boundingBox.w)}×{Math.round(label.boundingBox.h)}px
                </div>
              ) : (
                <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                  ⚠ Draw a box on the CT image by clicking and dragging.
                </div>
              )}
            </div>
          </>)}

          {/* Notes */}
          <div style={{ background: 'var(--color-surface-base)', border: '1px solid var(--color-border-base)', borderRadius: '12px', padding: '14px' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
              {label.tumorDetected === true ? '4.' : '2.'} Radiologist Notes
            </label>
            <textarea value={label.notes} onChange={e => updateLabel({ notes: e.target.value })} rows={3} placeholder="Additional clinical observations, differential diagnoses, or caveats..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border-base)', background: 'var(--color-surface-base)', color: 'var(--color-text-base)', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={label.labelledAt !== '' || label.tumorDetected === null}
            style={{ padding: '14px', background: label.labelledAt ? '#16a34a' : 'var(--color-primary-base)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: label.labelledAt ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: label.tumorDetected === null ? 0.5 : 1 }}>
            {label.labelledAt ? <><IconCheck size={18} /> Labelled ✓</> : justSaved ? '⭐ +5 Stars Earned!' : <><IconChevronRight size={18} /> Save & Earn 5 Stars</>}
          </button>

          {label.labelledAt && (
            <div style={{ padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px', color: '#166534', textAlign: 'center' }}>
              ✓ Labelled at {new Date(label.labelledAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
