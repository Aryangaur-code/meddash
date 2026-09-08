'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './consultation.module.css';
import { currentConsultation } from '@/data/mockData';
import { AIGeneratedWrapper } from '@/components/shared/AIGeneratedWrapper';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import { EntityPill } from '@/components/shared/EntityPill';
import { KnowledgeGraphInsights, GraphRelationship } from '@/components/shared/KnowledgeGraphInsights';
import { IconMicrophone, IconSend } from '@tabler/icons-react';

export default function Consultation() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || 'Unknown';
  
  const [messages, setMessages] = useState<{sender: string, time: string, text: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [aiSummary, setAiSummary] = useState(currentConsultation.aiSummary);
  const [extractedCodes, setExtractedCodes] = useState(currentConsultation.extractedCodes);
  const [prevMsgCount, setPrevMsgCount] = useState(0);
  
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    if (!patientId) return;
    try {
      const res = await fetch(`/api/chat?patientId=${patientId}&doctorId=DOC-1`);
      const data = await res.json();
      if (data && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [patientId]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Trigger AI analysis update when new messages arrive from patient
    if (messages.length > prevMsgCount && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'Patient') {
        // Simulate AI updating the analysis based on symptoms
        setTimeout(() => {
          setAiSummary(prev => ({
            ...prev,
            subjective: prev.subjective + ' Patient updated: ' + lastMsg.text,
            assessment: 'Type 2 Diabetes Mellitus with poor glycemic control, possible early diabetic retinopathy or refractive changes due to hyperglycemia.',
            plan: 'Order urgent HbA1c, fasting lipid panel, and comprehensive metabolic panel. Schedule ophthalmology referral for dilated eye exam. Start patient on symptomatic management and review diet.'
          }));
          
          setExtractedCodes([
            { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications', confidence: 0.95 },
            { code: 'E11.39', desc: 'Type 2 diabetes mellitus with other diabetic ophthalmic complication', confidence: 0.82 },
            { code: 'R53.83', desc: 'Other fatigue', confidence: 0.88 },
            { code: 'R63.1', desc: 'Polydipsia', confidence: 0.91 }
          ]);
        }, 1000);
      }
      setPrevMsgCount(messages.length);
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newDocMsg = {
      sender: 'Dr. Sharma',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText
    };

    setMessages(prev => [...prev, newDocMsg]);
    setInputText('');

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientId,
          doctorId: 'DOC-1',
          message: newDocMsg
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.transcriptPanel}>
        <div className={styles.panelHeader}>
          <h2>Active Chat Consultation (Patient: {patientId})</h2>
          <div className={styles.recordingStatus}>
            <IconMicrophone size={16} className={styles.pulse} /> AI Listening
          </div>
        </div>
        
        <div className={styles.transcriptFlow}>
          {messages.map((line, idx) => (
            <div key={idx} className={styles.message} style={{ alignSelf: line.sender === 'Dr. Sharma' ? 'flex-end' : 'flex-start', backgroundColor: line.sender === 'Dr. Sharma' ? 'var(--color-surface-raised)' : 'var(--color-surface-overlay)', padding: '12px', borderRadius: '8px', maxWidth: '80%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className={styles.speaker} style={{ color: line.sender === 'Dr. Sharma' ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>{line.sender}</span>
                <span className={styles.time}>{line.time}</span>
              </div>
              <p className={styles.text} style={{ margin: 0 }}>{line.text}</p>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
        
        <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-base)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type your message or use voice..." 
              style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-primary)', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '12px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSend size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className={styles.aiPanel}>
        <div className={styles.panelHeader}>
          <h2>Live AI Clinical Extraction</h2>
        </div>

        <div className={styles.aiContent}>
          <AIGeneratedWrapper title="SOAP NOTE">
            <div className={styles.soapSection}>
              <strong>Subjective</strong>
              <p>{aiSummary.subjective}</p>
            </div>
            <div className={styles.soapSection}>
              <strong>Objective</strong>
              <p>{aiSummary.objective}</p>
            </div>
            <div className={styles.soapSection}>
              <strong>Assessment</strong>
              <p>{aiSummary.assessment}</p>
            </div>
            <div className={styles.soapSection}>
              <strong>Plan</strong>
              <p>{aiSummary.plan}</p>
            </div>
          </AIGeneratedWrapper>

          <AIGeneratedWrapper title="DERIVED DISEASE CODES">
            <div className={styles.codeList}>
              {extractedCodes.map((code, idx) => (
                <div key={idx} className={styles.codeItem}>
                  <div className={styles.codeHeader}>
                    <EntityPill label={code.code} type="code" />
                    <span className={styles.codeDesc}>{code.desc}</span>
                  </div>
                  <ConfidenceBar score={code.confidence} label="Confidence" />
                </div>
              ))}
            </div>
          </AIGeneratedWrapper>

          <KnowledgeGraphInsights 
            relationships={currentConsultation.graphRelationships as GraphRelationship[]}
            summaryInsight={currentConsultation.graphSummary}
          />

          <button className={styles.finalizeBtn}>Review & Finalize Encounter</button>
        </div>
      </div>
    </div>
  );
}
