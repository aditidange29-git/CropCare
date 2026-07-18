// CropCare — Language Select Screen
// See architecture/04_UI_UX_Spec.md §3.2
// Stores cropcare_language in localStorage, navigates to /login
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '../../components/icons/index.tsx';

interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  subtitle: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', subtitle: 'Continue in English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', subtitle: 'हिंदी में जारी रखें' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', subtitle: 'मराठीत सुरू ठेवा' },
];

export default function LanguageSelectPage(): React.JSX.Element {
  const navigate = useNavigate();

  function handleSelect(code: string): void {
    localStorage.setItem('cropcare_language', code);
    navigate('/login');
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100%',
      minHeight: '100vh', backgroundColor: '#f5f5f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '20px 20px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #1a936f, #114b5f)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M17 8C8 10 5.9 16.17 3.82 19.34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#114b5f' }}>CropCare</span>
      </div>

      {/* Title section */}
      <div style={{ padding: '40px 24px 32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1f2937', margin: '0 0 8px 0' }}>
          Choose your language
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
          अपनी भाषा चुनें · आपली भाषा निवडा
        </p>
      </div>

      {/* Language cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px' }}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer', minHeight: '80px', width: '100%',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.borderColor = '#1a936f';
              btn.style.boxShadow = '0 2px 8px rgba(26,147,111,0.15)';
              btn.style.backgroundColor = '#f0faf5';
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.borderColor = '#e5e7eb';
              btn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
              btn.style.backgroundColor = '#ffffff';
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.985)';
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onTouchStart={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.backgroundColor = '#f0faf5';
              btn.style.borderColor = '#1a936f';
            }}
            onTouchEnd={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.backgroundColor = '#ffffff';
              btn.style.borderColor = '#e5e7eb';
            }}
            aria-label={`Select ${lang.label}`}
          >
            <div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#114b5f', lineHeight: 1.2 }}>
                {lang.nativeLabel}
              </div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                {lang.subtitle}
              </div>
            </div>
            <ChevronRightIcon size={20} color="#1a936f" />
          </button>
        ))}
      </div>
    </div>
  );
}
