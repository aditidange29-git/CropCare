// CropCare — Splash Screen
// See architecture/04_UI_UX_Spec.md §3.1
// Auto-navigates to /language after 2s
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashPage(): React.JSX.Element {
  const navigate = useNavigate();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the progress bar
    if (progressRef.current) {
      progressRef.current.style.width = '0%';
      // Force reflow
      void progressRef.current.offsetWidth;
      progressRef.current.style.transition = 'width 2s linear';
      progressRef.current.style.width = '100%';
    }

    const timer = setTimeout(() => {
      navigate('/language');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f5f5f0',
        position: 'relative',
      }}
    >
      {/* Logo mark */}
      <div style={{
        width: '96px', height: '96px', borderRadius: '24px',
        background: 'linear-gradient(135deg, #1a936f 0%, #114b5f 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(26,147,111,0.25)',
      }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 00.84 1.5 4.68 4.68 0 003.76-2.26"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
          <path d="M2 22C4.5 20 6.5 17.5 7.82 14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand name */}
      <h1 style={{
        fontSize: '36px', fontWeight: 800, color: '#114b5f',
        margin: '0 0 8px 0', letterSpacing: '0.5px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        CropCare
      </h1>

      {/* Tagline */}
      <p style={{
        fontSize: '16px', color: '#6b7280', margin: 0,
        textAlign: 'center', padding: '0 32px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        AI-powered crop disease detection
      </p>

      {/* Progress bar at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '4px', backgroundColor: '#e5e7eb',
      }}>
        <div
          ref={progressRef}
          style={{
            height: '100%',
            backgroundColor: '#1a936f',
            width: '0%',
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>
    </div>
  );
}
