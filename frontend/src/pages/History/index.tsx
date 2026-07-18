// CropCare — History Screen (standalone route)
// Also used as a tab inside Home.
// See architecture/04_UI_UX_Spec.md §3.9
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ClockIcon, LeafIcon } from '../../components/icons/index.tsx';
import { MOCK_HISTORY } from '../../data/mockData.ts';

type ConfidenceLabel = 'high' | 'medium' | 'low';

function ConfidenceBadge({ label }: { label: ConfidenceLabel }): React.JSX.Element {
  const map: Record<ConfidenceLabel, { bg: string; color: string; text: string }> = {
    high: { bg: '#dcfce7', color: '#166534', text: 'High' },
    medium: { bg: '#fef9c3', color: '#854d0e', text: 'Medium' },
    low: { bg: '#fee2e2', color: '#991b1b', text: 'Low' },
  };
  const s = map[label];
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px',
      backgroundColor: s.bg, color: s.color, flexShrink: 0,
    }}>
      {s.text}
    </span>
  );
}

export default function HistoryPage(): React.JSX.Element {
  const navigate = useNavigate();
  const crops = ['All', 'Cotton', 'Tomato', 'Wheat'];
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? MOCK_HISTORY
    : MOCK_HISTORY.filter((h) => h.crop === activeFilter);

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
          Diagnosis History
        </h1>
      </div>

      {/* Filter chips */}
      <div style={{
        display: 'flex', gap: '8px', padding: '14px 16px 8px',
        overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0,
        backgroundColor: '#ffffff', borderBottom: '1px solid #f3f4f6',
      }}>
        {crops.map((crop) => (
          <button
            key={crop}
            onClick={() => setActiveFilter(crop)}
            style={{
              padding: '6px 16px', borderRadius: '999px', border: 'none',
              cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '32px',
              fontSize: '13px', fontWeight: 500,
              backgroundColor: activeFilter === crop ? '#1a936f' : '#f3f4f6',
              color: activeFilter === crop ? '#ffffff' : '#6b7280',
              transition: 'all 0.15s ease',
            }}
          >
            {crop}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
        {filtered.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '48px 24px', marginTop: '8px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '16px',
              backgroundColor: '#e8f5f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ClockIcon size={36} color="#1a936f" />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: 0, textAlign: 'center' }}>
              No diagnoses found
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, textAlign: 'center' }}>
              {activeFilter === 'All' ? 'Your past diagnoses will appear here' : `No ${activeFilter} scans yet`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate('/diagnosis/mock-001')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  backgroundColor: '#ffffff', borderRadius: '12px',
                  padding: '14px 16px', border: '1.5px solid #f3f4f6',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a936f'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#f3f4f6'; }}
              >
                {/* Thumbnail placeholder */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '10px',
                  backgroundColor: '#e8f5f0', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <LeafIcon size={26} color="#1a936f" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '15px', fontWeight: 600, color: '#1f2937',
                    margin: '0 0 3px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.disease_name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 5px 0' }}>
                    {item.crop} · {item.date}
                  </p>
                  <ConfidenceBadge label={item.confidence_label} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
