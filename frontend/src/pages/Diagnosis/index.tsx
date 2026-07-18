// CropCare — Diagnosis Result Screen
// Route: /diagnosis/:id
// See architecture/04_UI_UX_Spec.md §3.7
// Uses MOCK_DIAGNOSIS for now.
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeftIcon, AlertTriangleIcon, CheckCircleIcon } from '../../components/icons/index.tsx';
import { MOCK_DIAGNOSIS } from '../../data/mockData.ts';

type ConfidenceLabel = 'high' | 'medium' | 'low';

interface ConfidenceConfig {
  bg: string;
  color: string;
  label: string;
  Icon: React.FC<{ size?: number; color?: string }>;
  iconColor: string;
}

const CONFIDENCE_CONFIG: Record<ConfidenceLabel, ConfidenceConfig> = {
  high: {
    bg: '#dcfce7', color: '#166534', label: 'High Confidence',
    Icon: CheckCircleIcon, iconColor: '#16a34a',
  },
  medium: {
    bg: '#fef9c3', color: '#854d0e', label: 'Medium Confidence',
    Icon: AlertTriangleIcon, iconColor: '#ca8a04',
  },
  low: {
    bg: '#fee2e2', color: '#991b1b', label: 'Low Confidence',
    Icon: AlertTriangleIcon, iconColor: '#dc2626',
  },
};

export default function DiagnosisPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // In production, fetch by id. For now always use mock.
  const diagnosis = MOCK_DIAGNOSIS;
  const confidenceLabel = diagnosis.disease.confidence_label;
  const config = CONFIDENCE_CONFIG[confidenceLabel];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      backgroundColor: '#f5f5f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '14px 16px',
        background: 'linear-gradient(135deg, #1a936f 0%, #114b5f 100%)',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            minWidth: '44px', minHeight: '44px', background: 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
          aria-label="Go back"
        >
          <ChevronLeftIcon size={24} color="#ffffff" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
          Diagnosis Result
        </h1>
      </div>

      {/* Low-confidence warning banner */}
      {confidenceLabel === 'low' && (
        <div style={{
          backgroundColor: '#fff7ed', borderBottom: '1.5px solid #fed7aa',
          padding: '12px 16px',
          display: 'flex', alignItems: 'flex-start', gap: '10px',
        }}>
          <AlertTriangleIcon size={20} color="#f0a202" />
          <p style={{ fontSize: '14px', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
            <strong>Our best guess</strong> — verify with an agricultural expert before taking action.
          </p>
        </div>
      )}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 100px' }}>
        {/* Disease card */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px',
          padding: '20px', marginBottom: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          {/* Confidence badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '999px',
            backgroundColor: config.bg, marginBottom: '12px',
          }}>
            <config.Icon size={14} color={config.iconColor} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: config.color }}>
              {config.label}
            </span>
          </div>

          <h2 style={{
            fontSize: '22px', fontWeight: 700, color: '#1f2937',
            margin: '0 0 12px 0', lineHeight: 1.3,
          }}>
            {diagnosis.disease.name}
          </h2>

          <p style={{
            fontSize: '15px', color: '#4b5563', lineHeight: 1.65, margin: 0,
          }}>
            {diagnosis.explanation}
          </p>
        </div>

        {/* Treatment section */}
        <h3 style={{
          fontSize: '17px', fontWeight: 700, color: '#114b5f',
          margin: '0 0 12px 0',
        }}>
          Treatment Guide
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px', marginBottom: '20px',
        }}>
          {/* Organic Remedies */}
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            borderTop: '3px solid #1a936f',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                backgroundColor: '#e8f5f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17 8C8 10 5.9 16.17 3.82 19.34" stroke="#1a936f" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8" stroke="#1a936f" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a936f' }}>
                Organic Remedies
              </span>
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {diagnosis.treatment.organic.map((item, i) => (
                <li key={i} style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Chemical Treatment */}
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            borderTop: '3px solid #114b5f',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                backgroundColor: '#e8eef2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="#114b5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#114b5f' }}>
                Chemical Treatment
              </span>
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {diagnosis.treatment.chemical.map((item, i) => (
                <li key={i} style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div style={{
        position: 'sticky', bottom: 0,
        backgroundColor: '#ffffff', borderTop: '1.5px solid #e5e7eb',
        padding: '16px 16px 24px',
      }}>
        <button
          onClick={() => navigate(`/recommendations/${id ?? 'mock-001'}`)}
          style={{
            width: '100%', height: '54px',
            backgroundColor: '#1a936f', color: '#ffffff',
            border: 'none', borderRadius: '12px',
            fontSize: '17px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(26,147,111,0.25)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#157a5c'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a936f'; }}
        >
          See Recommended Products
        </button>
      </div>
    </div>
  );
}
