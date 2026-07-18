// CropCare — Admin Console
// See architecture/04_UI_UX_Spec.md §3.11
// Web-only feel, wider layout.
// Tabs: Dealers | Disease Library | Analytics
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersIcon, BookOpenIcon, BarChartIcon, PlusIcon, CheckCircleIcon, XIcon } from '../../components/icons/index.tsx';
import { MOCK_ADMIN_DEALERS, MOCK_ADMIN_DISEASES } from '../../data/mockData.ts';

type TabId = 'dealers' | 'disease-library' | 'analytics';
type DealerStatus = 'pending' | 'approved' | 'suspended';

const STATUS_CONFIG: Record<DealerStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  approved: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
  suspended: { bg: '#fee2e2', color: '#991b1b', label: 'Suspended' },
};

// ---- Dealers Tab ----
function DealersTab(): React.JSX.Element {
  const [dealers, setDealers] = useState(MOCK_ADMIN_DEALERS);

  function handleApprove(id: string): void {
    setDealers((prev) => prev.map((d) => d.id === id ? { ...d, status: 'approved' as DealerStatus } : d));
  }
  function handleReject(id: string): void {
    setDealers((prev) => prev.map((d) => d.id === id ? { ...d, status: 'suspended' as DealerStatus } : d));
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#114b5f', margin: 0 }}>
          All Dealers ({dealers.length})
        </h2>
        <span style={{
          fontSize: '12px', padding: '3px 10px', borderRadius: '999px',
          backgroundColor: '#fef9c3', color: '#854d0e', fontWeight: 600,
        }}>
          {dealers.filter((d) => d.status === 'pending').length} pending
        </span>
      </div>

      {/* Mobile: cards; Desktop: table */}
      <div className="hidden md:block">
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1.5px solid #e5e7eb' }}>
              {['Shop Name', 'Owner', 'Location', 'Joined', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dealers.map((dealer, i) => {
              const sc = STATUS_CONFIG[dealer.status as DealerStatus];
              return (
                <tr key={dealer.id} style={{ borderBottom: i < dealers.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{dealer.shop_name}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>{dealer.owner_name}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6b7280' }}>{dealer.location}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#9ca3af' }}>{dealer.created_at}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {dealer.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleApprove(dealer.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', height: '32px', backgroundColor: '#dcfce7', color: '#166534', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <CheckCircleIcon size={14} color="#166534" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(dealer.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', height: '32px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <XIcon size={14} color="#991b1b" /> Reject
                        </button>
                      </div>
                    )}
                    {dealer.status !== 'pending' && (
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex md:hidden flex-col" style={{ gap: '10px' }}>
        {dealers.map((dealer) => {
          const sc = STATUS_CONFIG[dealer.status as DealerStatus];
          return (
            <div key={dealer.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: '0 0 3px 0' }}>{dealer.shop_name}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{dealer.owner_name} · {dealer.location}</p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: sc.bg, color: sc.color, flexShrink: 0 }}>{sc.label}</span>
              </div>
              {dealer.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleApprove(dealer.id)}
                    style={{ flex: 1, height: '40px', backgroundColor: '#dcfce7', color: '#166534', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(dealer.id)}
                    style={{ flex: 1, height: '40px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Disease Library Tab ----
function DiseaseLibraryTab(): React.JSX.Element {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#114b5f', margin: 0 }}>Disease Library</h2>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', height: '40px',
          backgroundColor: '#1a936f', color: '#ffffff',
          border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
        }}>
          <PlusIcon size={16} color="#ffffff" /> Add Disease
        </button>
      </div>

      <div className="hidden md:block">
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1.5px solid #e5e7eb' }}>
              {['Disease Name', 'Affected Crops', 'Severity', 'Added'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_ADMIN_DISEASES.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: i < MOCK_ADMIN_DISEASES.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{d.name}</td>
                <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>{d.crops.join(', ')}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px',
                    backgroundColor: d.severity === 'High' ? '#fee2e2' : '#fef9c3',
                    color: d.severity === 'High' ? '#991b1b' : '#854d0e',
                  }}>{d.severity}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#9ca3af' }}>{d.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex md:hidden flex-col" style={{ gap: '10px' }}>
        {MOCK_ADMIN_DISEASES.map((d) => (
          <div key={d.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px 0' }}>{d.name}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{d.crops.join(', ')}</p>
              </div>
              <span style={{
                fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px',
                backgroundColor: d.severity === 'High' ? '#fee2e2' : '#fef9c3',
                color: d.severity === 'High' ? '#991b1b' : '#854d0e',
              }}>{d.severity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Analytics Tab ----
function AdminAnalyticsTab(): React.JSX.Element {
  const stats = [
    { label: 'Total Diagnoses', value: '1,247', trend: '+124 this week' },
    { label: 'Active Dealers', value: '38', trend: '2 pending approval' },
    { label: 'Top Disease', value: 'Leaf Curl Virus', trend: '312 cases' },
    { label: 'Languages Used', value: '3', trend: 'EN · HI · MR' },
  ];

  const diseaseTrend = [
    { name: 'Cotton Leaf Curl Virus', count: 312, max: 312 },
    { name: 'Tomato Early Blight', count: 241, max: 312 },
    { name: 'Wheat Rust', count: 189, max: 312 },
    { name: 'Rice Blast', count: 98, max: 312 },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#114b5f', margin: '0 0 4px 0' }}>{s.value}</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 3px 0' }}>{s.label}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{s.trend}</p>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#114b5f', margin: '0 0 12px 0' }}>
        Top Diseases This Month
      </h3>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {diseaseTrend.map((item) => (
          <div key={item.name} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{item.name}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#114b5f' }}>{item.count}</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', backgroundColor: '#1a936f', borderRadius: '4px',
                width: `${(item.count / item.max) * 100}%`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Main Component ----
export default function AdminConsolePage(): React.JSX.Element {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('dealers');

  const tabs: { id: TabId; label: string; Icon: React.FC<{ size?: number; color?: string }> }[] = [
    { id: 'dealers', label: 'Dealers', Icon: UsersIcon },
    { id: 'disease-library', label: 'Disease Library', Icon: BookOpenIcon },
    { id: 'analytics', label: 'Analytics', Icon: BarChartIcon },
  ];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden',
      backgroundColor: '#f5f5f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px 0',
        background: 'linear-gradient(135deg, #114b5f 0%, #0a2e3a 100%)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', maxWidth: '1200px', margin: '0 auto 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a936f, #114b5f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>CropCare Admin</span>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Platform Console</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('cropcare_mock_user'); navigate('/'); }}
            style={{ padding: '7px 14px', height: '36px', backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', border: 'none', cursor: 'pointer',
                  backgroundColor: 'transparent', minHeight: '44px',
                  borderBottom: isActive ? '2.5px solid #ffffff' : '2.5px solid transparent',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  fontWeight: isActive ? 600 : 400, fontSize: '14px',
                  transition: 'color 0.15s ease',
                }}
              >
                <Icon size={16} color={isActive ? '#ffffff' : 'rgba(255,255,255,0.5)'} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content — max width constrained */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxWidth: '1200px', width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>
          {activeTab === 'dealers' && <DealersTab />}
          {activeTab === 'disease-library' && <DiseaseLibraryTab />}
          {activeTab === 'analytics' && <AdminAnalyticsTab />}
        </div>
      </div>
    </div>
  );
}
