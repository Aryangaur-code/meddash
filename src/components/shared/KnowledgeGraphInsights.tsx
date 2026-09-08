import React from 'react';
import { IconSchema, IconAnalyze } from '@tabler/icons-react';
import styles from './KnowledgeGraphInsights.module.css';

export interface GraphRelationship {
  source: {
    label: string;
    type: 'symptom' | 'lab';
  };
  target: {
    label: string;
    type: 'disease';
  };
  predicate: string;
  confidence: number;
}

interface KnowledgeGraphInsightsProps {
  relationships: GraphRelationship[];
  summaryInsight: string;
}

export function KnowledgeGraphInsights({ relationships, summaryInsight }: KnowledgeGraphInsightsProps) {
  const getNodeClass = (type: string) => {
    switch (type) {
      case 'symptom': return styles.nodeSymptom;
      case 'lab': return styles.nodeLab;
      case 'disease': return styles.nodeDisease;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IconSchema className={styles.icon} size={20} />
        <span>GraphRAG Diagnostic Analysis</span>
      </div>
      
      <div className={styles.graphArea}>
        {relationships.map((rel, index) => (
          <div key={index} className={styles.relationshipRow}>
            <div className={`${styles.node} ${getNodeClass(rel.source.type)}`}>
              {rel.source.label}
            </div>
            
            <div className={styles.edge}>
              <span>{rel.predicate}</span>
              <div className={styles.edgeLine} />
              <span className={styles.confidence}>{(rel.confidence * 100).toFixed(0)}% Match</span>
            </div>
            
            <div className={`${styles.node} ${getNodeClass(rel.target.type)}`}>
              {rel.target.label}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insightText}>
        <strong>AI Synthesis:</strong> {summaryInsight}
      </div>
    </div>
  );
}
