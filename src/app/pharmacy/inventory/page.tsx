'use client';
import React, { useState, useMemo } from 'react';
import styles from '../pharmacy.module.css';
import { mockMedicines, Medicine } from '@/data/mockData';
import { IconPrinter, IconPlus, IconDownload } from '@tabler/icons-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PharmacyInventory() {
  const [inventory, setInventory] = useState(mockMedicines);
  
  // Settings State
  const [deliveryCost, setDeliveryCost] = useState('40');
  const [promoCode, setPromoCode] = useState('HEALTH10');
  const [promoDiscount, setPromoDiscount] = useState('10');

  // POS / Bill State
  const [posBill, setPosBill] = useState<{ med: Medicine; qty: number }[]>([]);

  const toggleStock = (id: string) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: item.stock > 0 ? 0 : 50 } : item));
  };

  const handleSaveSettings = () => {
    alert('Store settings saved! Delivery and Promos updated.');
  };

  const addToBill = (med: Medicine) => {
    if (med.stock === 0) {
      alert('Cannot add out of stock item to bill.');
      return;
    }
    setPosBill(prev => {
      const existing = prev.find(item => item.med.id === med.id);
      if (existing) {
        return prev.map(item => item.med.id === med.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { med, qty: 1 }];
    });
  };

  const generateBill = () => {
    if (posBill.length === 0) return;
    
    // Initialize PDF document
    const doc = new jsPDF();
    
    // Header Section
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Accent Green
    doc.text('Pharmacy POS Invoice', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}  |  Time: ${new Date().toLocaleTimeString()}`, 14, 32);
    doc.text('Store: Dawaa Dost - Jhotwara', 14, 38);
    
    // Prepare Data for Table
    const tableColumn = ["Item Name", "Category", "Qty", "Price", "Total"];
    const tableRows = posBill.map(item => [
      item.med.name,
      item.med.diseaseCategory,
      item.qty.toString(),
      `Rs. ${item.med.price}`,
      `Rs. ${item.med.price * item.qty}`
    ]);
    
    // Generate Table
    autoTable(doc, {
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 60 },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' },
      }
    });
    
    // Footer / Total Section
    const finalY = (doc as any).lastAutoTable.finalY || 45;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Subtotal: Rs. ${billTotal}`, 140, finalY + 15);
    
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(`Grand Total: Rs. ${billTotal}`, 130, finalY + 25);
    
    // Download the PDF
    doc.save(`POS_Invoice_${Date.now()}.pdf`);
    
    // Clear bill state
    setPosBill([]);
  };

  const billTotal = useMemo(() => {
    return posBill.reduce((sum, item) => sum + (item.med.price * item.qty), 0);
  }, [posBill]);

  return (
    <>
      <h1 className={styles.pageTitle}>Tabular Inventory & POS</h1>

      <div className={styles.inventoryGrid}>
        
        {/* Left Column: Excel/Tabular Inventory */}
        <div className={styles.panel} style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 className={styles.panelTitle} style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Medication Database</h2>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(med => (
                  <tr key={med.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{med.id}</td>
                    <td style={{ fontWeight: 500 }}>{med.name}</td>
                    <td>{med.diseaseCategory}</td>
                    <td>₹{med.price}</td>
                    <td>
                      <div className={`${styles.toggleSwitch} ${med.stock === 0 ? styles.off : ''}`} onClick={() => toggleStock(med.id)}>
                        <div className={styles.toggleKnob}></div>
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => addToBill(med)} 
                        style={{ padding: '4px 8px', background: 'var(--accent-blue-alpha)', color: 'var(--accent-blue)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        disabled={med.stock === 0}
                      >
                        <IconPlus size={16} /> Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: POS Billing & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* POS Bill Panel */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Generate Bill (POS)</h2>
            
            <div style={{ minHeight: '150px' }}>
              {posBill.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
                  Click &quot;Bill&quot; on an item to add it here.
                </div>
              ) : (
                posBill.map((item, idx) => (
                  <div key={idx} className={styles.billItem}>
                    <div>
                      <div>{item.med.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{item.med.price} x {item.qty}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>₹{item.med.price * item.qty}</div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.billSummary}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{billTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                <span>Total to Pay</span>
                <span>₹{billTotal}</span>
              </div>
            </div>

            <button 
              className={styles.actionBtn} 
              style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}
              onClick={generateBill}
              disabled={posBill.length === 0}
            >
              <IconDownload size={20} /> Generate PDF Bill
            </button>
          </div>

          {/* Store Settings Panel */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Store Configurations</h2>
            
            <div className={styles.inputGroup}>
              <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Flat Delivery Cost (₹)</label>
              <input type="number" className={styles.input} value={deliveryCost} onChange={e => setDeliveryCost(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Promo Code</label>
                <input type="text" className={styles.input} value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="e.g. HEAL10" />
              </div>

              <div className={styles.inputGroup} style={{ width: '80px' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>% Off</label>
                <input type="number" className={styles.input} value={promoDiscount} onChange={e => setPromoDiscount(e.target.value)} />
              </div>
            </div>

            <button className={styles.actionBtn} style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} onClick={handleSaveSettings}>Save Config</button>
          </div>

        </div>
      </div>
    </>
  );
}
