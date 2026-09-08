'use client';
import React from 'react';
import styles from './claims.module.css';
import { useAppContext } from '@/context/AppContext';
import { EntityPill } from '@/components/shared/EntityPill';
import { IconCheck, IconX, IconClock } from '@tabler/icons-react';

export default function Claims() {
  const { claims, updateClaimStatus } = useAppContext();

  const columns = ['Pending', 'Under AI Audit', 'Approved', 'Rejected'];

  const handleMove = (id: string, currentStatus: string) => {
    const currentIndex = columns.indexOf(currentStatus);
    if (currentIndex < columns.length - 1) {
      updateClaimStatus(id, columns[currentIndex + 1]);
    } else {
      updateClaimStatus(id, columns[0]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Pending': return <IconClock size={16} className={styles.pendingIcon} />;
      case 'Under AI Audit': return <IconClock size={16} className={styles.auditIcon} />;
      case 'Approved': return <IconCheck size={16} className={styles.successIcon} />;
      case 'Rejected': return <IconX size={16} className={styles.dangerIcon} />;
      default: return null;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Claims & Compliance Board</h1>
        <p className={styles.subtitle}>Click a claim to advance its status</p>
      </header>

      <div className={styles.board}>
        {columns.map(status => (
          <div key={status} className={styles.column}>
            <div className={styles.columnHeader}>
              <h2 className={styles.columnTitle}>{status}</h2>
              <span className={styles.columnCount}>{claims.filter((c: any) => c.status === status).length}</span>
            </div>
            
            <div className={styles.cardList}>
              {claims.filter((c: any) => c.status === status).map((claim: any) => (
                <div key={claim.id} className={styles.card} onClick={() => handleMove(claim.id, claim.status)} style={{cursor: 'pointer'}}>
                  <div className={styles.cardHeader}>
                    <span className={styles.claimId}>{claim.id}</span>
                    <span className={styles.claimAmount}>₹{claim.amount}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.patientName}>{claim.patient}</div>
                    <div className={styles.date}>{claim.date}</div>
                  </div>
                  <div className={styles.cardFooter}>
                    {claim.codes?.map((code: string, idx: number) => (
                      <EntityPill key={idx} label={code} type="code" />
                    ))}
                  </div>
                  <div className={styles.statusIndicator}>
                    {getStatusIcon(status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
