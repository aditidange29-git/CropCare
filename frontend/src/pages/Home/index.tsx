// CropCare — Home Screen (production wiring)
// Bottom tab bar (mobile) / left sidebar (desktop ≥ 768px)
// Tabs: Home | History | Settings
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, ClockIcon, SettingsIcon, CameraIcon, LeafIcon, LogOutIcon, GlobeIcon, UserIcon } from '../../components/icons/index.tsx';
import { useAuth } from '../../store/AuthContext.tsx';
import { useT } from '../../store/LanguageContext.tsx';
import { getDiagnoses, DiagnosisListItem } from '../../services/diagnosisService.ts';

type TabId = 'home' | 'history' | 'settings';

function getGreetingKey(): 'good_morning' | 'good_afternoon' | 'good_evening' {
  const h = new Date().getHours();
  if (h < 12) return 'good_morning';
  if (h < 17) return 'good_afternoon';
  return 'good_evening';
}

type ConfidenceLabel = 'high' | 'medium' | 'low';

function ConfidenceBadge({ label }: { label: ConfidenceLabel }): React.JSX.Element {
  const map: Record<ConfidenceLabel, { bg: string; color: string; text: string }> = {
    high: { bg: '#dcfce7', color: '#166534', text: 'High' },
    medium: { bg: '#fef9c3', color: '#854d0e', text: 'Medium' },
    low: { bg: '#fee2e2', color: '#991b1b', text: 'Low' },
  };
  const s = map[label];
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', backgroundColor: s.bg, color: s.color }}>
      {s.text}
    </span>
  );
}

function HomeTabContent({ userName }: { userName: string }): React.JSX.Element {
  const navigate = useNavigate();
  const t = useT();
  const [recentDiagnoses, setRecentDiagnoses] = useState<DiagnosisListItem[]>([]);
  const [loadingDiagnoses, setLoadingDiagnoses] = useState(true);

  useEffect(() => {
    getDiagnoses(1, 5)
      .then((result) => setRecentDiagnoses(result.items))
      .catch(() => setRecentDiagnoses([]))
      .finally(() => setLoadingDiagnoses(false));
  }, []);

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f5f5f0' }}>
      {/* Greeting header */}
      <div style={{ padding: '24px 20px 20px', background: 'linear-gradient(135deg, #1a936f 0%, #114b5f 100%)' }}>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: '0 0 3px 0' }}>{t(getGreetingKey())},</p>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{userName || 'Farmer'}</h1>
      </div>

      <div style={{ padding: '20px 16px 88px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Primary Scan CTA */}
        <button
          onClick={() => navigate('/camera')}
          style={{ width: '100%', minHeight: '160px', background: 'linear-gradient(135deg, #1a936f 0%, #114b5f 100%)', border: 'none', borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '28px', boxShadow: '0 4px 20px rgba(26,147,111,0.3)', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
          onMouseEnter={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = 'translateY(-2px)'; btn.style.boxShadow = '0 8px 28px rgba(26,147,111,0.35)'; }}
          onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = 'translateY(0)'; btn.style.boxShadow = '0 4px 20px rgba(26,147,111,0.3)'; }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
          aria-label="Scan your crop to begin diagnosis"
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CameraIcon size={30} color="#ffffff" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{t('scan_crop')}</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{t('scan_crop_sub')}</div>
          </div>
        </button>

        {/* Ask AI section */}
        <button
          onClick={() => navigate('/ai-chat')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
            padding: '16px 18px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #e5e7eb',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            textAlign: 'left',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.borderColor = '#1a936f';
            btn.style.boxShadow = '0 2px 8px rgba(26,147,111,0.15)';
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.borderColor = '#e5e7eb';
            btn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
          }}
          aria-label="Ask AI a farming question"
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #1a936f, #114b5f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>KM</span>
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#114b5f', margin: '0 0 2px 0' }}>{t('ask_kisan_mitra')}</p>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{t('kisan_mitra_sub')}</p>
          </div>
        </button>

        {/* Recent Diagnoses */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#114b5f', margin: '0 0 12px 0' }}>{t('recent_diagnoses')}</h2>
          {loadingDiagnoses ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '10px', backgroundColor: '#f3f4f6', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ height: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px', width: '65%' }} />
                    <div style={{ height: '13px', backgroundColor: '#f3f4f6', borderRadius: '4px', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentDiagnoses.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '40px 24px', border: '1.5px dashed #d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '16px', backgroundColor: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LeafIcon size={36} color="#1a936f" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: '0 0 4px 0' }}>{t('no_scans_yet')}</p>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>{t('no_scans_sub')}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentDiagnoses.slice(0, 2).map((item) => (
                <button key={item.id} onClick={() => navigate(`/diagnosis/${item.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '14px 16px', border: '1.5px solid #f3f4f6', cursor: 'pointer', width: '100%', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'border-color 0.15s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a936f'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#f3f4f6'; }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '10px', backgroundColor: '#e8f5f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.thumbnail_url ? <img src={item.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : <LeafIcon size={24} color="#1a936f" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.disease_name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>{new Date(item.created_at).toLocaleDateString('en-IN')}</span>
                      <ConfidenceBadge label={item.confidence_label} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

function HistoryTabContent(): React.JSX.Element {
  const navigate = useNavigate();
  const t = useT();
  const crops = ['All', 'Cotton', 'Tomato', 'Wheat', 'Rice'];
  const [activeFilter, setActiveFilter] = useState('All');
  const [diagnoses, setDiagnoses] = useState<DiagnosisListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiagnoses(1, 50)
      .then((result) => setDiagnoses(result.items))
      .catch(() => setDiagnoses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === 'All'
    ? diagnoses
    : diagnoses.filter((d) => d.disease_name.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f5f5f0' }}>
      <div style={{ padding: '20px 20px 16px', background: 'linear-gradient(135deg, #1a936f 0%, #114b5f 100%)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{t('history')}</h1>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px 16px 8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {crops.map((crop) => (
          <button key={crop} onClick={() => setActiveFilter(crop)} style={{ padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '32px', fontSize: '13px', fontWeight: 500, backgroundColor: activeFilter === crop ? '#1a936f' : '#ffffff', color: activeFilter === crop ? '#ffffff' : '#6b7280', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {crop}
          </button>
        ))}
      </div>

      <div style={{ padding: '8px 16px 88px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '10px', backgroundColor: '#f3f4f6', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px', width: '65%' }} />
                  <div style={{ height: '13px', backgroundColor: '#f3f4f6', borderRadius: '4px', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '16px', backgroundColor: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClockIcon size={36} color="#1a936f" />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: 0, textAlign: 'center' }}>{t('no_diagnoses')}</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, textAlign: 'center' }}>{t('no_diagnoses_sub')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {filtered.map((item) => (
              <button key={item.id} onClick={() => navigate(`/diagnosis/${item.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '14px 16px', border: '1.5px solid #f3f4f6', cursor: 'pointer', width: '100%', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'border-color 0.15s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a936f'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#f3f4f6'; }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '10px', backgroundColor: '#e8f5f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.thumbnail_url ? <img src={item.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : <LeafIcon size={24} color="#1a936f" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.disease_name}</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 4px 0' }}>{new Date(item.created_at).toLocaleDateString('en-IN')}</p>
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

function SettingsTabContent(): React.JSX.Element {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const t = useT();
  const language = localStorage.getItem('cropcare_language') ?? 'en';
  const langLabels: Record<string, string> = { en: 'English', hi: 'हिंदी', mr: 'मराठी' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f5f5f0' }}>
      <div style={{ padding: '20px 20px 16px', background: 'linear-gradient(135deg, #1a936f 0%, #114b5f 100%)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{t('settings')}</h1>
      </div>

      <div style={{ padding: '20px 16px 88px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* User card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{t('account')}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '26px', backgroundColor: '#e8f5f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={26} color="#1a936f" />
            </div>
            <div>
              <p style={{ fontSize: '17px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{user?.name ?? '—'}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '2px 0 0 0' }}>{(user as any)?.phone_number ?? '—'}</p>
            </div>
          </div>
          <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '16px 0 12px' }} />
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{t('your_account')}</p>
        </div>

        {/* Language card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{t('language')}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <GlobeIcon size={22} color="#6b7280" />
              <span style={{ fontSize: '15px', color: '#1f2937' }}>{langLabels[language] ?? 'English'}</span>
            </div>
            <button onClick={() => navigate('/language')} style={{ fontSize: '13px', fontWeight: 600, color: '#1a936f', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', minHeight: '36px' }}>
              {t('change')}
            </button>
          </div>
        </div>

        {/* App version */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('version')}</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>v1.0.0</span>
        </div>

        {/* Logout */}
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minHeight: '52px', width: '100%', backgroundColor: '#ffffff', color: '#c1121f', border: '2px solid #c1121f', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fef2f2'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff'; }}>
          <LogOutIcon size={20} color="#c1121f" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
}

// ---- Nav icons with active state ----
function NavIcon({ Icon, active }: { Icon: React.FC<{ size?: number; color?: string }>; active: boolean }): React.JSX.Element {
  return <Icon size={22} color={active ? '#1a936f' : '#9ca3af'} />;
}

export default function HomePage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const { user } = useAuth();
  const t = useT();

  const TABS: { id: TabId; labelKey: 'home' | 'history' | 'settings'; Icon: React.FC<{ size?: number; color?: string }> }[] = [
    { id: 'home', labelKey: 'home', Icon: HomeIcon },
    { id: 'history', labelKey: 'history', Icon: ClockIcon },
    { id: 'settings', labelKey: 'settings', Icon: SettingsIcon },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f5f5f0' }}>
      {/* Desktop sidebar */}
      <aside
        style={{ width: '240px', flexShrink: 0, backgroundColor: '#ffffff', borderRight: '1.5px solid #e5e7eb', flexDirection: 'column', padding: '24px 0 0' }}
        className="hidden md:flex"
        aria-label="Sidebar navigation"
      >
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a936f, #114b5f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#114b5f' }}>CropCare</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {TABS.map(({ id, labelKey, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', minHeight: '44px', width: '100%', textAlign: 'left', backgroundColor: isActive ? '#e8f5f0' : 'transparent', color: isActive ? '#1a936f' : '#6b7280', fontWeight: isActive ? 600 : 400, fontSize: '15px' }} aria-current={isActive ? 'page' : undefined} onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'; }} onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}>
                <Icon size={20} color={isActive ? '#1a936f' : '#9ca3af'} />
                {t(labelKey)}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>v1.0.0</span>
        </div>
      </aside>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'home' && <HomeTabContent userName={user?.name ?? ''} />}
        {activeTab === 'history' && <HistoryTabContent />}
        {activeTab === 'settings' && <SettingsTabContent />}
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '64px', backgroundColor: '#ffffff', borderTop: '1.5px solid #e5e7eb', display: 'flex', zIndex: 50 }}
        className="flex md:hidden"
        aria-label="Bottom navigation"
      >
        {TABS.map(({ id, labelKey, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', minHeight: '44px', gap: '3px' }} aria-label={t(labelKey)} aria-current={isActive ? 'page' : undefined}>
              <NavIcon Icon={Icon} active={isActive} />
              <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 400, color: isActive ? '#1a936f' : '#9ca3af' }}>{t(labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
