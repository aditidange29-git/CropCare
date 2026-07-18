// CropCare — Settings Screen (standalone route)
// See architecture/04_UI_UX_Spec.md §3.12
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, LogOutIcon, UserIcon, GlobeIcon } from '../../components/icons/index.tsx';

interface MockUser { name: string; phone_number: string; is_new_user: boolean; }

export default function SettingsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [user, setUser] = useState<MockUser | null>(null);
  const language = localStorage.getItem('cropcare_language') ?? 'en';
  const langLabels: Record<string, string> = { en: 'English', hi: 'हिंदी', mr: 'मराठी' };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cropcare_mock_user');
      if (raw) setUser(JSON.parse(raw) as MockUser);
    } catch { /* ignore */ }
  }, []);

  function handleLogout(): void {
    localStorage.removeItem('cropcare_mock_user');
    localStorage.removeItem('cropcare_language');
    navigate('/');
  }

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
          Settings
        </h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Profile card */}
        <section>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', margin: '0 0 8px 4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Account
          </p>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '28px',
                backgroundColor: '#e8f5f0', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <UserIcon size={28} color="#1a936f" />
              </div>
              <div>
                <p style={{ fontSize: '17px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  {user?.name ?? '—'}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '3px 0 0 0' }}>
                  {user?.phone_number ?? '—'}
                </p>
              </div>
            </div>
            <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '16px 0 12px' }} />
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              Demo mode — no real authentication
            </p>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', margin: '0 0 8px 4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Preferences
          </p>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            {/* Language row */}
            <button
              onClick={() => navigate('/language')}
              style={{
                display: 'flex', alignItems: 'center', width: '100%',
                padding: '16px 16px', border: 'none',
                backgroundColor: 'transparent', cursor: 'pointer',
                minHeight: '56px', gap: '12px',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
            >
              <GlobeIcon size={20} color="#6b7280" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '15px', color: '#1f2937', fontWeight: 500 }}>Language</span>
              </div>
              <span style={{ fontSize: '14px', color: '#9ca3af', marginRight: '4px' }}>
                {langLabels[language] ?? 'English'}
              </span>
              <ChevronRightIcon size={16} color="#9ca3af" />
            </button>
          </div>
        </section>

        {/* App info */}
        <section>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', margin: '0 0 8px 4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            About
          </p>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '16px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
              <span style={{ fontSize: '15px', color: '#374151' }}>App Version</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>v0.1.0</span>
            </div>
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            minHeight: '52px', width: '100%',
            backgroundColor: '#ffffff', color: '#c1121f',
            border: '2px solid #c1121f', borderRadius: '10px',
            fontSize: '16px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fef2f2'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff'; }}
        >
          <LogOutIcon size={20} color="#c1121f" />
          Logout
        </button>
      </div>
    </div>
  );
}
