'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { IconSend, IconMicrophone } from '@tabler/icons-react';
import { useAppContext } from '@/context/AppContext';

function PatientConsultationContent() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  const { patients } = useAppContext();
  
  // Assume patient[0] is the current logged in patient for this prototype
  const currentPatient = patients[0];
  
  const [messages, setMessages] = useState<{sender: string, time: string, text: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    if (!currentPatient?.id || !doctorId) return;
    try {
      const res = await fetch(`/api/chat?patientId=${currentPatient.id}&doctorId=${doctorId}`);
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
  }, [doctorId, currentPatient]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentPatient?.id || !doctorId) return;

    const newMsg = {
      sender: 'Patient',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText
    };

    // Optimistic update
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: currentPatient.id,
          doctorId: doctorId,
          message: newMsg
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!doctorId || !currentPatient) return <div style={{padding: '48px'}}>Loading consultation...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px', backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>Consultation with Doctor {doctorId}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '14px', fontWeight: 600 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
          Live Chat
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: 'var(--color-surface-raised)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '40px' }}>
            No messages yet. Send a message to start the consultation.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, idx) => {
              const isMe = msg.sender === 'Patient';
              return (
                <div key={idx} style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start', 
                  backgroundColor: isMe ? 'var(--color-accent)' : 'var(--color-surface-base)', 
                  color: isMe ? 'white' : 'var(--color-text-base)',
                  border: isMe ? 'none' : '1px solid var(--color-border)',
                  padding: '12px 16px', 
                  borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0', 
                  maxWidth: '75%' 
                }}>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                    <span>{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.5, fontSize: '15px' }}>{msg.text}</p>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border)', borderRadius: '0 0 12px 12px' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type your message to the doctor..." 
            style={{ flex: 1, padding: '14px 20px', borderRadius: '24px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '15px' }}
          />
          <button type="submit" style={{ padding: '14px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PatientConsultation() {
  return (
    <Suspense fallback={<div style={{color: 'var(--text-primary)', padding: '24px'}}>Connecting to doctor...</div>}>
      <PatientConsultationContent />
    </Suspense>
  );
}
