'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { IconSend, IconUpload, IconFileText, IconRobot, IconUser } from '@tabler/icons-react';

export default function AIIntakePage() {
  const router = useRouter();
  const { patients, addAiCase } = useAppContext();
  // Assume logged in as the first patient for demo purposes
  const currentPatient = patients[0]; 

  const [messages, setMessages] = useState<{sender: 'ai' | 'user', text: string}[]>([
    { sender: 'ai', text: `Hello ${currentPatient?.name || 'there'}! I am your AI clinical assistant. What brings you in today?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock conversation state machine
  const [step, setStep] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userText = inputValue;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputValue('');
    setIsProcessing(true);

    // Simulated AI Responses
    setTimeout(() => {
      let aiResponse = '';
      if (step === 0) {
        aiResponse = "I see. How long have you been experiencing these symptoms? Have they worsened recently?";
        setStep(1);
      } else if (step === 1) {
        aiResponse = "Got it. Have you taken any medications for this recently? Or do you have any relevant past medical records you'd like to upload for OCR analysis?";
        setStep(2);
      } else if (step === 2) {
        aiResponse = "Thank you. I have compiled a structured clinical case file based on our conversation and your records. This has been securely sent to your doctor's dashboard for review.\n\n🏥 **Department Routing Assistance:** Based on your reported symptoms, I highly recommend scheduling an appointment with **Cardiology** or **Internal Medicine**.";
        setIsComplete(true);
        generateStructuredCase(userText); // Send case to context
      }
      
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setIsProcessing(false);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMessages(prev => [...prev, { sender: 'user', text: `[Uploaded File: ${file.name}]` }]);
      setIsProcessing(true);
      
      // Simulate Post-Report Analysis (OCR + Plain language summary)
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: `📄 **Post-Report Analysis Complete:**\nI extracted the text from "${file.name}". \n\n*Plain Language Summary:* The report indicates your cholesterol levels are slightly elevated, but your liver enzymes are perfectly normal. However, I noticed a mention of a mild penicillin allergy which I have flagged for your doctor.` 
        }]);
        setIsProcessing(false);
      }, 2500);
    }
  };

  const generateStructuredCase = (lastMessage: string) => {
    const aiCaseData = {
      id: `CASE-${Math.floor(Math.random() * 10000)}`,
      chiefComplaint: "Patient reports recent worsening of symptoms.",
      structuredHPI: [
        "Onset: 3 days ago",
        "Severity: Moderate to severe",
        "Modifying factors: Temporary relief with over-the-counter medication"
      ],
      missingInfo: ["Exact temperature logs not provided", "Unknown fluid intake"],
      contradictions: ["Patient mentioned taking Ibuprofen, but uploaded OCR document suggests possible NSAID sensitivity."],
      status: "Pending Doctor Review"
    };
    if (currentPatient) {
      addAiCase(currentPatient.id, aiCaseData);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--color-surface-base)' }}>
      <header style={{ padding: '24px 0', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>AI Conversational Intake</h1>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Complete this pre-consultation chat so your doctor has your structured medical history ready.</p>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            {msg.sender === 'ai' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-surface-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                <IconRobot size={20} />
              </div>
            )}
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '12px', 
              backgroundColor: msg.sender === 'user' ? 'var(--color-accent)' : 'var(--color-surface-raised)',
              color: msg.sender === 'user' ? '#FFFFFF' : 'var(--color-text-primary)',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-surface-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                <IconUser size={20} />
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--color-text-muted)' }}>
            <IconRobot size={20} />
            <span style={{ fontSize: '14px' }}>AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '24px 0', borderTop: '1px solid var(--color-border)' }}>
        {isComplete ? (
          <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--color-surface-raised)', borderRadius: '8px' }}>
            <h3 style={{ color: 'var(--color-status-safe)', marginBottom: '8px' }}>Case Generation Complete</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>Your structured case has been forwarded to the doctor.</p>
            <button onClick={() => router.push('/patient/diagnostics')} style={{ padding: '12px 24px', backgroundColor: 'var(--color-accent)', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ cursor: 'pointer', padding: '12px', backgroundColor: 'var(--color-surface-raised)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-primary)', transition: 'background 0.2s' }}>
              <IconUpload size={20} />
              <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
            </label>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms..."
              style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)', outline: 'none' }}
            />
            <button 
              onClick={handleSend}
              disabled={isProcessing || !inputValue.trim()}
              style={{ padding: '16px', backgroundColor: 'var(--color-accent)', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: (isProcessing || !inputValue.trim()) ? 'not-allowed' : 'pointer', opacity: (isProcessing || !inputValue.trim()) ? 0.6 : 1 }}
            >
              <IconSend size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
