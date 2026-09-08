'use client';
import React, { useState } from 'react';
import styles from '../pharmacy.module.css';
import { IconUpload, IconCheck, IconTruck } from '@tabler/icons-react';

export default function PharmacyOrders() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-1045',
      patientName: 'Rajesh Kumar',
      items: ['Salbutamol Inhaler (100mcg) x1', 'Budesonide Inhaler (200mcg) x1'],
      total: 470,
      status: 'pending', // pending, completed
    }
  ]);

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [dispatchProof, setDispatchProof] = useState<File | null>(null);

  const handleProcessOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
    alert('Order marked as Dispatched!');
  };

  return (
    <>
      <h1 className={styles.pageTitle}>Incoming Orders</h1>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Active Queue</h2>
          {orders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span>{order.id}</span>
                <span className={`${styles.badge} ${order.status === 'completed' ? styles.completed : ''}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div style={{ marginBottom: '8px' }}><strong>Patient:</strong> {order.patientName}</div>
              <div style={{ marginBottom: '8px' }}><strong>Items:</strong></div>
              <ul style={{ margin: '0 0 12px 20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {order.items.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
              <div style={{ fontWeight: 600, color: 'var(--accent-green)' }}>Total Value: ₹{order.total}</div>
            </div>
          ))}
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Order Fulfillment: ORD-1045</h2>
          
          {orders[0].status === 'completed' ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#16a34a' }}>
              <IconCheck size={64} />
              <h2>Order Dispatched Successfully</h2>
            </div>
          ) : (
            <>
              <div className={styles.uploadArea}>
                <IconUpload size={24} style={{ marginBottom: '8px' }} />
                <div>Upload Payment Receipt / Invoice Image</div>
                <input type="file" accept="image/*" style={{ display: 'none' }} id="payment-upload" onChange={e => setPaymentProof(e.target.files?.[0] || null)} />
                <label htmlFor="payment-upload" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }}></label>
                {paymentProof && <div style={{ color: '#16a34a', marginTop: '8px', fontWeight: 'bold' }}>{paymentProof.name}</div>}
              </div>

              <div className={styles.uploadArea} style={{ marginTop: '16px' }}>
                <IconTruck size={24} style={{ marginBottom: '8px' }} />
                <div>Upload Dispatch Proof (Package Image)</div>
                <input type="file" accept="image/*" style={{ display: 'none' }} id="dispatch-upload" onChange={e => setDispatchProof(e.target.files?.[0] || null)} />
                <label htmlFor="dispatch-upload" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }}></label>
                {dispatchProof && <div style={{ color: '#16a34a', marginTop: '8px', fontWeight: 'bold' }}>{dispatchProof.name}</div>}
              </div>

              <button 
                className={styles.actionBtn} 
                onClick={() => handleProcessOrder('ORD-1045')}
                disabled={!paymentProof || !dispatchProof}
              >
                Mark as Dispatched
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
