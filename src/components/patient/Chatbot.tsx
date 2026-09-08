'use client';
import React, { useState } from 'react';
import { IconMessageCircle2, IconX, IconSend, IconRobot } from '@tabler/icons-react';
import Link from 'next/link';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{text: string, isBot: boolean, action?: string}[]>([
    { text: "Hello! I am your AI Health Assistant. Please describe your symptoms or how you are feeling today.", isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');

    // Simulate AI thinking and response
    setTimeout(() => {
      let botResponse = "I'm analyzing your symptoms...";
      let action = "";
      
      const lowerInput = userMessage.toLowerCase();
      if (lowerInput.includes('headache') || lowerInput.includes('migraine')) {
        botResponse = "Based on your symptoms, you might be experiencing a migraine or tension headache. I recommend consulting a Neurologist for an accurate diagnosis.";
        action = "Neurology";
      } else if (lowerInput.includes('chest') || lowerInput.includes('heart') || lowerInput.includes('breath')) {
        botResponse = "Chest pain or shortness of breath can be serious. This could be related to cardiovascular issues. Please consult a Cardiologist immediately.";
        action = "Cardiologists (Heart Specialists)";
      } else if (lowerInput.includes('bone') || lowerInput.includes('joint') || lowerInput.includes('pain')) {
        botResponse = "Joint or bone pain can indicate arthritis or musculoskeletal strain. An Orthopedic specialist would be best suited to help you.";
        action = "Orthopaedics (Bones)";
      } else if (lowerInput.includes('fever') || lowerInput.includes('cold') || lowerInput.includes('cough')) {
        botResponse = "These sound like symptoms of a viral infection or flu. A General Medicine practitioner can provide you with the right medication.";
        action = "General Medicine";
      } else {
        botResponse = "Thank you for sharing. Based on this, a general consultation would be the best first step to accurately diagnose your condition.";
        action = "Internal Medicine";
      }

      setMessages(prev => [...prev, { text: botResponse, isBot: true, action }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ position: 'fixed', bottom: '32px', right: '32px', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-accent)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <IconMessageCircle2 size={32} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', width: '350px', height: '500px', background: 'var(--color-surface-base)', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', zIndex: 1000, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          
          <div style={{ background: 'var(--color-accent)', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <IconRobot size={24} /> AI Health Assistant
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <IconX size={20} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isBot ? 'flex-start' : 'flex-end' }}>
                <div style={{ background: msg.isBot ? 'var(--color-surface-raised)' : 'var(--color-accent)', color: msg.isBot ? 'var(--color-text-base)' : 'white', padding: '12px 16px', borderRadius: '12px', borderBottomLeftRadius: msg.isBot ? '0' : '12px', borderBottomRightRadius: msg.isBot ? '12px' : '0', maxWidth: '85%', fontSize: '14px', lineHeight: 1.5 }}>
                  {msg.text}
                </div>
                {msg.action && (
                  <Link href="/patient" style={{ marginTop: '8px', fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-accent)', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600 }}>
                    Find {msg.action} Specialist
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms..."
              style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-surface-raised)', color: 'var(--color-text-base)' }}
            />
            <button onClick={handleSend} style={{ background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSend size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
