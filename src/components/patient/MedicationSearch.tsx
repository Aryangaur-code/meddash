'use client';
import React, { useState, useEffect } from 'react';
import styles from './MedicationSearch.module.css';
import { IconSearch, IconPill, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';

export default function MedicationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 1) {
        fetchResults();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/medications/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.medications || []);
    } catch (error) {
      console.error("Failed to fetch medications", error);
    }
    setLoading(false);
  };

  const formatText = (text: string) => {
    if (!text) return <p style={{ color: 'var(--color-text-muted)' }}>No data available</p>;
    
    // 1. Convert literal \n to actual newlines
    let cleaned = text.replace(/\\n/g, '\n');
    
    // 2. Remove weird artifact tags
    cleaned = cleaned.replace(/ul\s*\\?\"\\?\"/g, '');
    cleaned = cleaned.replace(/ul\s*\"\"/g, '');
    cleaned = cleaned.replace(/<\/?span[^>]*>/gi, '');
    cleaned = cleaned.replace(/span/gi, '');
    cleaned = cleaned.replace(/\/?span/gi, '');
    
    // 3. Remove standalone numbers that act as list indices
    cleaned = cleaned.replace(/^\s*\d+\s*$/gm, '');
    
    // 4. Split into lines and filter out pure junk lines
    let lines = cleaned.split('\n').map(l => l.trim()).filter(l => {
      // Keep lines that have actual text, not just punctuation/artifacts
      if (l.length === 0) return false;
      if (l === '/' || l === '\\' || l === 'ul \\"\\"' || l === 'ul ""') return false;
      if (/^[\\\/,\.\-\_]+$/.test(l)) return false; // purely punctuation lines
      return true;
    });
    
    // 5. Merge Category -> Description if separated by commas
    const mergedLines = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === ',' || lines[i] === '.') continue;
      
      if (i + 2 < lines.length && lines[i+1] === ',') {
        mergedLines.push(`**${lines[i]}**: ${lines[i+2].replace(/^,/, '').replace(/,$/, '')}`);
        i += 2;
      } else {
        let cleanLine = lines[i].replace(/^,\s*/, '').replace(/,$/, '');
        if (cleanLine.length > 0 && cleanLine !== ',') {
          mergedLines.push(cleanLine);
        }
      }
    }

    if (mergedLines.length === 0) return <p style={{ color: 'var(--color-text-muted)' }}>No data available</p>;

    return (
      <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {mergedLines.map((line, idx) => {
          if (line.startsWith('**') && line.includes('**:')) {
            const parts = line.split('**:');
            return (
              <li key={idx} style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                <strong style={{ color: 'var(--color-text)', textTransform: 'capitalize' }}>
                  {parts[0].replace(/\*\*/g, '')}:
                </strong> 
                {parts.slice(1).join('**:')}
              </li>
            );
          }
          return (
            <li key={idx} style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              {line}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <div className={styles.searchBarContainer}>
          <IconSearch color="var(--color-text-muted)" />
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Search for any medication or drug..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.resultsList}>
          {loading && <div style={{ padding: '20px', color: 'var(--color-text-muted)' }}>Searching MID database...</div>}
          {!loading && results.length === 0 && query.length > 1 && (
            <div style={{ padding: '20px', color: 'var(--color-text-muted)' }}>No medications found matching &quot;{query}&quot;</div>
          )}
          {!loading && results.map((med, idx) => (
            <div 
              key={idx} 
              className={`${styles.resultCard} ${selectedMed?.Name === med.Name ? styles.selected : ''}`}
              onClick={() => setSelectedMed(med)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconPill color="var(--color-accent)" />
                <div>
                  <div className={styles.medName}>{med.Name}</div>
                  <div className={styles.medContains}>{med.Contains}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.detailsPanel}>
          {selectedMed ? (
            <div className={styles.detailsContent}>
              <h2 className={styles.detailsTitle}>{selectedMed.Name}</h2>
              <p className={styles.detailsContains}><strong>Contains:</strong> {selectedMed.Contains}</p>
              
              <div className={styles.infoSection}>
                <h3><IconInfoCircle size={18} /> Uses & Benefits</h3>
                {formatText(selectedMed.ProductUses || selectedMed.ProductBenefits)}
              </div>

              <div className={styles.infoSection}>
                <h3><IconAlertTriangle size={18} color="#fa114f" /> Side Effects</h3>
                {formatText(selectedMed.SideEffect)}
              </div>

              <div className={styles.infoSection}>
                <h3>How It Works</h3>
                {formatText(selectedMed.HowWorks)}
              </div>
              
              <div className={styles.infoSection}>
                <h3>Safety Advice</h3>
                {formatText(selectedMed.SafetyAdvice)}
              </div>
            </div>
          ) : (
            <div className={styles.emptyDetails}>
              <IconPill size={48} color="var(--color-border)" />
              <p>Select a medication from the search results to view detailed information, side effects, and safety advice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
