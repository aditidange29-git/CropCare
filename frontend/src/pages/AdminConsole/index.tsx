// CropCare — Admin Console
// See architecture/04_UI_UX_Spec.md §3.11
// Web-only feel, wider layout.
// Tabs: Dealers | Disease Library | Analytics
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersIcon, BookOpenIcon, BarChartIcon, PlusIcon } from '../../components/icons/index.tsx';
import { getAdminDealers, approveDealer, rejectDealer, getAdminAnalytics } from '../../services/adminService.ts';
import { ApiError } from '../../services/api.ts';

type TabId = 'dealers' | 'disease-library' | 'analytics';
type DealerStatus = 'pending' | 'approved' | 'suspended';

const STATUS_CONFIG: Record<DealerStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  approved: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
  suspended: { bg: '#fee2e2', color: '#991b1b', label: 'Suspended' },
};

// ---- Dealers Tab ----
function DealersTab(): React.JSX.Element {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  async function loadDealers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDealers();
      setDealers((data as any).dealers ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load dealers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDealers(); }, []);

  async function handleApprove(id: string): Promise<void> {
    setActioning(id + '_approve');
    try {
      await approveDealer(id);
      setDealers(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d));
    } catch (e: any) {
      alert('Failed to approve: ' + e.message);
    } finally { setActioning(null); }
  }

  async function handleReject(id: string): Promise<void> {
    if (!window.confirm('Reject this dealer?')) return;
    setActioning(id + '_reject');
    try {
      await rejectDealer(id);
      setDealers(prev => prev.map(d => d.id === id ? { ...d, status: 'suspended' } : d));
    } catch (e: any) {
      alert('Failed to reject: ' + e.message);
    } finally { setActioning(null); }
  }

  const pendingCount = dealers.filter(d => d.status === 'pending').length;

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#114b5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#991b1b', marginBottom: '12px' }}>{error}</p>
        <button onClick={loadDealers} style={{ padding: '8px 20px', backgroundColor: '#114b5f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#114b5f', margin: 0 }}>All Dealers ({dealers.length})</h2>
        {pendingCount > 0 && (
          <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '999px', backgroundColor: '#fef9c3', color: '#854d0e', fontWeight: 600 }}>
            {pendingCount} pending approval
          </span>
        )}
      </div>

      {dealers.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '16px', color: '#374151', margin: 0 }}>No dealers registered yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dealers.map((dealer: any) => {
            const sc = STATUS_CONFIG[dealer.status as DealerStatus] ?? STATUS_CONFIG.pending;
            return (
              <div key={dealer.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: dealer.status === 'pending' ? '1.5px solid #f0a202' : '1.5px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: '0 0 2px 0' }}>{dealer.shop_name}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px 0' }}>{dealer.owner_name} · {dealer.email}</p>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{dealer.phone_number} · Registered: {new Date(dealer.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                    {dealer.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(dealer.id)}
                          disabled={actioning === dealer.id + '_approve'}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', height: '36px', backgroundColor: '#1a936f', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: actioning === dealer.id + '_approve' ? 0.6 : 1 }}
                        >
                          {actioning === dealer.id + '_approve' ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(dealer.id)}
                          disabled={actioning === dealer.id + '_reject'}
                          style={{ padding: '6px 14px', height: '36px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: actioning === dealer.id + '_reject' ? 0.6 : 1 }}
                        >
                          {actioning === dealer.id + '_reject' ? '...' : 'Reject'}
                        </button>
                      </>
                    )}
                    {dealer.status === 'approved' && (
                      <button
                        onClick={() => handleReject(dealer.id)}
                        style={{ padding: '6px 12px', height: '32px', backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '32px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>Disease library management coming soon.</p>
      </div>
    </div>
  );
}

// ---- Analytics Tab ----
function AdminAnalyticsTab(): React.JSX.Element {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAnalytics()
      .then((data) => setAnalytics(data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = analytics ? [
    { label: 'Total Diagnoses', value: String(analytics.total_diagnoses ?? '—'), trend: '' },
    { label: 'Active Dealers', value: String(analytics.active_dealers ?? '—'), trend: `${analytics.pending_dealers ?? 0} pending approval` },
    { label: 'Registered Farmers', value: String(analytics.total_farmers ?? '—'), trend: '' },
    { label: 'Total Users', value: String(analytics.total_users ?? '—'), trend: '' },
  ] : [
    { label: 'Total Diagnoses', value: '—', trend: '' },
    { label: 'Active Dealers', value: '—', trend: '' },
    { label: 'Registered Farmers', value: '—', trend: '' },
    { label: 'Total Users', value: '—', trend: '' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#114b5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#114b5f', margin: '0 0 4px 0' }}>{s.value}</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 3px 0' }}>{s.label}</p>
              {s.trend ? <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{s.trend}</p> : null}
            </div>
          ))}
        </div>
      )}
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
            onClick={() => { localStorage.removeItem('cropcare_token'); localStorage.removeItem('cropcare_user'); localStorage.removeItem('cropcare_role'); navigate('/admin/login'); }}
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
