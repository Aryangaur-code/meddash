'use client';
import React, { useState, useMemo } from 'react';
import styles from './pharmacy.module.css';
import { mockPharmacies, mockMedicines } from '@/data/mockData';
import { IconUpload, IconBuildingStore, IconMessageDots, IconSend, IconShoppingCartCheck, IconBox, IconStethoscope } from '@tabler/icons-react';

export default function PharmacyConnect() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [uploadedPrescription, setUploadedPrescription] = useState<File | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'pharmacy'; text: string }[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Tabs & E-commerce State
  const [activeTab, setActiveTab] = useState<'inventory' | 'chat'>('inventory');
  const [selectedDisease, setSelectedDisease] = useState('Type 2 Diabetes');
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number; gstRate: number; hsn: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const filteredMedicines = useMemo(() => {
    return mockMedicines.filter(m => m.diseaseCategory === selectedDisease);
  }, [selectedDisease]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  }, [cart]);

  const gstTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.qty * (item.gstRate / 100)), 0);
  }, [cart]);

  // Pharmacy Configuration
  const deliveryFee = 40;
  const surgeFee = 20;
  const [promoInput, setPromoInput] = useState('');
  const [discount, setDiscount] = useState(0);

  const finalTotal = useMemo(() => {
    const subtotal = cartTotal;
    const discountAmt = (subtotal * discount) / 100;
    return subtotal > 0 ? subtotal - discountAmt + deliveryFee + surgeFee + gstTotal : 0;
  }, [cartTotal, discount, deliveryFee, surgeFee, gstTotal]);

  const handleApplyPromo = () => {
    if (promoInput.toUpperCase() === 'HEALTH10') {
      setDiscount(10);
      alert('Promo applied successfully! 10% off.');
    } else {
      setDiscount(0);
      alert('Invalid promo code.');
    }
  };

  const addToCart = (med: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) {
        return prev.map(item => item.id === med.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: med.id, name: med.name, price: med.price, qty: 1, gstRate: med.gstRate !== undefined ? med.gstRate : 5, hsn: med.hsn || '3004' }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  // Filters
  const [filterArea, setFilterArea] = useState('All');
  const [filterDelivery, setFilterDelivery] = useState('All');
  const [filterRating, setFilterRating] = useState('All');

  const filteredPharmacies = useMemo(() => {
    return mockPharmacies.filter(p => {
      if (filterArea !== 'All' && p.area !== filterArea) return false;
      if (filterDelivery !== 'All') {
        if (filterDelivery === 'Yes' && p.delivery !== 'Yes') return false;
        if (filterDelivery === 'Limited' && p.delivery !== 'Limited') return false;
      }
      if (filterRating !== 'All') {
        const ratingNum = parseFloat(filterRating);
        if (p.rating < ratingNum) return false;
      }
      return true;
    });
  }, [filterArea, filterDelivery, filterRating]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedPrescription(e.target.files[0]);
      // Mock auto-message when uploading
      setMessages(prev => [...prev, { sender: 'user', text: `Uploaded prescription: ${e.target.files![0].name}` }]);
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'pharmacy', text: "We received your prescription. We are checking availability. Do you need home delivery?" }]);
      }, 1000);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: chatMessage }]);
    setChatMessage('');
    
    // Mock auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'pharmacy', text: "Noted. We have the medications in stock. The total is ₹450. Would you like to place the order now?" }]);
    }, 1500);
  };

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setMessages(prev => [...prev, { sender: 'pharmacy', text: "Order confirmed! It will be ready for pickup or dispatched for delivery shortly." }]);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pharmacy Connect</h1>
      <p className={styles.subtitle}>Upload your prescription, find a nearby pharmacy, and securely place your order.</p>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}><IconBuildingStore /> Select Nearest Pharmacy</h2>
          
          <div className={styles.uploadArea}>
            <IconUpload size={32} style={{ marginBottom: '12px' }} />
            <p style={{ margin: 0 }}>Click to Upload Prescription (PDF/Image)</p>
            {uploadedPrescription && <p style={{ color: 'var(--accent-blue)', marginTop: '8px', fontWeight: 'bold' }}>{uploadedPrescription.name}</p>}
            <input type="file" style={{ display: 'none' }} id="rx-upload" onChange={handleFileUpload} />
            <label htmlFor="rx-upload" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }}></label>
          </div>

          <div className={styles.filterBar}>
            <select className={styles.filterSelect} value={filterArea} onChange={e => setFilterArea(e.target.value)}>
              <option value="All">All Areas</option>
              <option value="Jhotwara">Jhotwara</option>
              <option value="Vaishali Nagar">Vaishali Nagar</option>
              <option value="Mansarovar">Mansarovar</option>
              <option value="Malviya Nagar">Malviya Nagar</option>
            </select>
            <select className={styles.filterSelect} value={filterDelivery} onChange={e => setFilterDelivery(e.target.value)}>
              <option value="All">Any Delivery</option>
              <option value="Yes">Delivery: Yes</option>
              <option value="Limited">Delivery: Limited</option>
            </select>
            <select className={styles.filterSelect} value={filterRating} onChange={e => setFilterRating(e.target.value)}>
              <option value="All">Any Rating</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.8">4.8+ Stars</option>
            </select>
          </div>

          <div className={styles.pharmacyList}>
            {filteredPharmacies.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px' }}>No pharmacies match your filters.</div>
            ) : (
              filteredPharmacies.map(pharmacy => (
                <div 
                  key={pharmacy.id} 
                  className={`${styles.pharmacyCard} ${selectedPharmacy === pharmacy.id ? styles.selected : ''}`}
                  onClick={() => setSelectedPharmacy(pharmacy.id)}
                >
                  <div>
                    <div className={styles.pharmacyName}>{pharmacy.name} {pharmacy.isOpen ? '🟢' : '🔴'}</div>
                    <div className={styles.pharmacyDetails}>{pharmacy.address} • {pharmacy.rating} ⭐ • Delivery: {pharmacy.delivery}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {activeTab === 'inventory' ? <><IconBox /> Inventory & Ordering</> : <><IconMessageDots /> Consult & Order</>}
          </h2>
          
          {!selectedPharmacy ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Please select a pharmacy to view inventory and chat.
            </div>
          ) : (
            <>
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'inventory' ? styles.active : ''}`}
                  onClick={() => setActiveTab('inventory')}
                >
                  Shop by Diagnosis
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.active : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  Consultation
                </button>
              </div>

              {activeTab === 'inventory' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconStethoscope color="var(--accent-blue)" />
                    <select className={styles.filterSelect} value={selectedDisease} onChange={e => setSelectedDisease(e.target.value)} style={{ flex: 1 }}>
                      <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                      <option value="Asthma">Asthma</option>
                      <option value="Hypertension">Hypertension</option>
                      <option value="General / Fever">General / Fever</option>
                    </select>
                  </div>
                  
                  <div className={styles.medicineGrid}>
                    {filteredMedicines.map(med => (
                      <div key={med.id} className={styles.medicineCard}>
                        <div className={styles.medicineInfo}>
                          <span className={styles.medicineName}>{med.name}</span>
                          <span className={styles.medicineDesc}>{med.description}</span>
                          <span className={styles.medicinePrice}>₹{med.price}</span>
                        </div>
                        <button className={styles.addToCartBtn} onClick={() => addToCart(med)}>+ Add</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.chatArea}>
                  <div className={styles.chatMessages}>
                    {messages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>No messages yet. Upload a prescription or say hi!</div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div key={idx} className={`${styles.message} ${msg.sender === 'user' ? styles.messageUser : styles.messagePharmacy}`}>
                          {msg.text}
                        </div>
                      ))
                    )}
                  </div>
                  <div className={styles.chatInputArea}>
                    <input 
                      type="text" 
                      className={styles.chatInput} 
                      placeholder="Type your message..." 
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button className={styles.sendBtn} onClick={handleSendMessage}><IconSend size={20} /></button>
                  </div>
                </div>
              )}

              <div className={styles.orderSection} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
                
                {cart.length > 0 && (
                  <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Cart Items</h3>
                    {cart.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            ₹{item.price} each | HSN: {item.hsn || '3004'} | GST: {item.gstRate}% (CGST {item.gstRate/2}% + SGST {item.gstRate/2}%)
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
                            <button onClick={() => updateQty(item.id, -1)} style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>-</button>
                            <span style={{ padding: '0 8px', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>+</button>
                          </div>
                          <div style={{ width: '60px', textAlign: 'right', fontWeight: 600 }}>₹{item.price * item.qty}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className={styles.cartSummary} style={{ flex: 1, paddingRight: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      <input 
                        type="text" 
                        placeholder="Promo Code" 
                        value={promoInput} 
                        onChange={(e) => setPromoInput(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)', borderRadius: '4px', textTransform: 'uppercase', flex: 1 }}
                      />
                      <button onClick={handleApplyPromo} style={{ padding: '8px 16px', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer' }}>Apply</button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Subtotal:</span> <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>CGST (Intra-state):</span> <span>₹{(gstTotal / 2).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>SGST (Intra-state):</span> <span>₹{(gstTotal / 2).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Delivery Fee:</span> <span>₹{cartTotal > 0 ? deliveryFee : 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Surge Fee:</span> <span>₹{cartTotal > 0 ? surgeFee : 0}</span>
                    </div>
                    {discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--accent-green)', marginBottom: '4px' }}>
                        <span>Discount (10%):</span> <span>-₹{((cartTotal * discount) / 100).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-subtle)' }}>
                      <span>Final Total:</span> <span>₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
                    <select 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)}
                      style={{ padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--surface-1)' }}
                    >
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="UPI">UPI / Online</option>
                    </select>

                    <button className={styles.orderBtn} onClick={handlePlaceOrder} disabled={orderPlaced || cart.length === 0} style={{ padding: '16px', fontSize: '1rem' }}>
                      <IconShoppingCartCheck size={20} />
                      {orderPlaced ? 'Order Placed' : 'Place Order'}
                    </button>

                    {orderPlaced && (
                      <button 
                        onClick={() => window.print()}
                        style={{ padding: '12px', background: 'transparent', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                      >
                        Download Bill (PDF)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
