// CropCare — Diagnosis Loading Screen
// See architecture/04_UI_UX_Spec.md §3.6
// Cycling messages, timeout state at 15s with cancel button
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from '../../components/icons/index.tsx';

const MESSAGES = [
  'Analyzing image...',
  'Identifying disease patterns...',
  'Checking symptoms...',
  'Almost ready...',
];

const CYCLE_INTERVAL = 2200; // ms per message
const TIMEOUT_MS = 15000;
const AUTO_NAVIGATE_MS = 4000; // Mock: navigate after 4s for demo

export default function DiagnosisLoadingPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Cycle through messages
    intervalRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, CYCLE_INTERVAL);

    // Timeout after 15s
    const timeoutTimer = setTimeout(() => {
      setIsTimedOut(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }, TIMEOUT_MS);

    // Auto-navigate after 4s for demo purposes
    const navTimer = setTimeout(() => {
      navigate('/diagnosis/mock-001', { replace: true });
    }, AUTO_NAVIGATE_MS);

    // Progress animation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / AUTO_NAVIGATE_MS) * 100, 95);
      setProgress(pct);
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timeoutTimer);
      clearTimeout(navTimer);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  function handleCancel(): void {
    navigate('/home');
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: '#f5f5f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '32px 24px',
    }}>
      {!isTimedOut ? (
        <>
          {/* Animated logo/spinner */}
          <div style={{ position: 'relative', marginBottom: '36px' }}>
            {/* Outer ring */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              border: '3px solid #e5e7eb',
              borderTopColor: '#1a936f',
              animation: 'spin 1.2s linear infinite',
              position: 'absolute', top: 0, left: 0,
            }} />
            {/* Inner pulsing dot */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #1a936f, #114b5f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 1.8s ease-in-out infinite',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17 8C8 10 5.9 16.17 3.82 19.34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 style={{
            fontSize: '20px', fontWeight: 700, color: '#114b5f',
            margin: '0 0 8px 0', textAlign: 'center',
          }}>
            Analyzing your crop
          </h2>
          <p
            key={messageIndex}
            style={{
              fontSize: '16px', color: '#6b7280', margin: '0 0 36px 0',
              textAlign: 'center',
              animation: 'fadeInUp 0.4s ease',
            }}
          >
            {MESSAGES[messageIndex]}
          </p>

          {/* Progress bar */}
          <div style={{
            width: '100%', maxWidth: '320px', height: '6px',
            backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', backgroundColor: '#1a936f', borderRadius: '3px',
              width: `${progress}%`,
              transition: 'width 0.15s ease',
            }} />
          </div>
        </>
      ) : (
        /* Timeout state */
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px',
          padding: '32px 24px', maxWidth: '360px', width: '100%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            backgroundColor: '#fff7ed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#f0a202" strokeWidth="2" />
              <polyline points="12 6 12 12 16 14" stroke="#f0a202" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: '0 0 8px 0' }}>
            Taking longer than usual
          </h2>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            The analysis is taking more time than expected. Please check your internet connection and try again.
          </p>
          <button
            onClick={handleCancel}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', height: '48px',
              backgroundColor: '#f3f4f6', color: '#374151',
              border: 'none', borderRadius: '8px',
              fontSize: '16px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <XIcon size={18} color="#374151" />
            Cancel
          </button>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.92); opacity: 0.85; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
