// CropCare — Dealer Dashboard
// See architecture/04_UI_UX_Spec.md §3.10
// Tabs: Catalog | Leads | Analytics
// Uses mock data.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PackageIcon, UsersIcon, BarChartIcon } from '../../components/icons/index.tsx';
import { MOCK_DEALER_PRODUCTS, MOCK_DEALER_LEADS } from '../../data/mockData.ts';

type TabId = 'catalog' | 'leads' | 'analytics';
type StockStatus = 'in_stock' | 'low' | 'out_of_stock';

const STOCK_CONFIG: Record<StockStatus, { bg: string; color: string; label: string }> = {
  in_stock: { bg: '#dcfce7', color: '#166534', label: 'In Stock' },
  low: { bg: '#fef9c3', color: '#854d0e', label: 'Low Stock' },
  out_of_stock: { bg: '#fee2e2', color: '#991b1b', label: 'Out of Stock' },
};

// ---- Add Product Modal ----
interface AddProductModalProps { onClose: () => void; }

function AddProductModal({ onClose }: AddProductModalProps): React.JSX.Element {
  const [form, setForm] = useState({ name: '', category: '', stock_status: 'in_stock' });

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '20px 20px 0 0',
        padding: '24px 20px 36px', width: '100%', maxWidth: '600px',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#114b5f', margin: 0 }}>Add Product</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9ca3af', minWidth: '44px', minHeight: '44px' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Product Name</label>
            <input
              type="text" placeholder="e.g. Confidor (Imidacloprid)"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              style={{ height: '48px', width: '100%', padding: '0 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#1a936f'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              style={{ height: '48px', width: '100%', padding: '0 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', outline: 'none', backgroundColor: '#ffffff' }}
            >
              <option value="">Select category...</option>
              <option value="Insecticide">Insecticide</option>
              <option value="Fungicide">Fungicide</option>
              <option value="Herbicide">Herbicide</option>
              <option value="Fertilizer">Fertilizer</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Stock Status</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['in_stock', 'low', 'out_of_stock'] as StockStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setForm((p) => ({ ...p, stock_status: s }))}
                  style={{
                    flex: 1, height: '40px', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                    backgroundColor: form.stock_status === s ? '#1a936f' : '#f3f4f6',
                    color: form.stock_status === s ? '#ffffff' : '#6b7280',
                  }}
                >
                  {STOCK_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              height: '50px', backgroundColor: '#1a936f', color: '#ffffff',
              border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 600,
              cursor: 'pointer', marginTop: '4px',
            }}
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Catalog Tab ----
function CatalogTab(): React.JSX.Element {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {MOCK_DEALER_PRODUCTS.map((product) => {
          const stock = STOCK_CONFIG[product.stock_status];
          return (
            <div key={product.id} style={{
              backgroundColor: '#ffffff', borderRadius: '12px',
              padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: '1.5px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: '0 0 3px 0' }}>
                    {product.name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>
                    {product.category}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {product.disease_tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: '12px', padding: '2px 8px', borderRadius: '999px',
                        backgroundColor: '#e8f5f0', color: '#1a936f', fontWeight: 500,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px',
                  backgroundColor: stock.bg, color: stock.color, flexShrink: 0, marginLeft: '8px',
                }}>
                  {stock.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Add button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '20px',
          width: '56px', height: '56px', borderRadius: '28px',
          backgroundColor: '#1a936f', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(26,147,111,0.4)',
          zIndex: 100,
        }}
        aria-label="Add product"
      >
        <PlusIcon size={26} color="#ffffff" />
      </button>

      {showModal && <AddProductModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ---- Leads Tab ----
function LeadsTab(): React.JSX.Element {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
      {MOCK_DEALER_LEADS.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '12px',
          padding: '48px 24px', textAlign: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: '0 0 4px 0' }}>No leads yet</p>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
            Leads appear when your products are recommended to farmers
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {MOCK_DEALER_LEADS.map((lead) => (
            <div key={lead.id} style={{
              backgroundColor: '#ffffff', borderRadius: '12px',
              padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: '1.5px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  {lead.disease_name}
                </p>
                <span style={{
                  fontSize: '12px', padding: '2px 8px', borderRadius: '999px',
                  backgroundColor: lead.contacted ? '#dcfce7' : '#f3f4f6',
                  color: lead.contacted ? '#166534' : '#6b7280',
                  fontWeight: 500,
                }}>
                  {lead.contacted ? 'Contacted' : 'Pending'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0' }}>
                {lead.product_recommended}
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                {lead.area} · {lead.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Analytics Tab ----
function AnalyticsTab(): React.JSX.Element {
  const stats = [
    { label: 'Diagnoses Matched', value: '24', trend: '+8 this week' },
    { label: 'Contacts Received', value: '11', trend: '+3 this week' },
    { label: 'Top Disease', value: 'Cotton Leaf Curl', trend: '14 matches' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#114b5f', margin: '0 0 4px 0' }}>
              {s.value}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 3px 0' }}>
              {s.label}
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              {s.trend}
            </p>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#114b5f', margin: '0 0 12px 0' }}>
        This Month
      </h3>
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '12px',
        padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 16px 0' }}>
          Diagnoses matched per day
        </p>
        {/* CSS-only bar chart */}
        {[
          { day: 'Mon', value: 3, max: 8 },
          { day: 'Tue', value: 5, max: 8 },
          { day: 'Wed', value: 8, max: 8 },
          { day: 'Thu', value: 4, max: 8 },
          { day: 'Fri', value: 6, max: 8 },
          { day: 'Sat', value: 2, max: 8 },
          { day: 'Sun', value: 1, max: 8 },
        ].map((bar) => (
          <div key={bar.day} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', width: '30px', flexShrink: 0 }}>{bar.day}</span>
            <div style={{ flex: 1, height: '20px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                backgroundColor: '#1a936f',
                width: `${(bar.value / bar.max) * 100}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <span style={{ fontSize: '12px', color: '#374151', fontWeight: 600, width: '16px' }}>{bar.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Main Component ----
export default function DealerDashboardPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('catalog');

  const tabs: { id: TabId; label: string; Icon: React.FC<{ size?: number; color?: string }> }[] = [
    { id: 'catalog', label: 'Catalog', Icon: PackageIcon },
    { id: 'leads', label: 'Leads', Icon: UsersIcon },
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
        padding: '16px 20px 0',
        background: 'linear-gradient(135deg, #114b5f 0%, #0d3547 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Dealer Dashboard</p>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: '2px 0 0 0' }}>
              Patil Agro Stores
            </h1>
          </div>
          <button
            onClick={() => { localStorage.removeItem('cropcare_mock_user'); navigate('/'); }}
            style={{
              minHeight: '36px', padding: '6px 14px',
              backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
            }}
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0' }}>
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 4px', border: 'none', cursor: 'pointer',
                  backgroundColor: 'transparent',
                  borderBottom: isActive ? '2.5px solid #ffffff' : '2.5px solid transparent',
                  gap: '3px', minHeight: '44px',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : 'rgba(255,255,255,0.5)'} />
                <span style={{
                  fontSize: '12px', fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'catalog' && <CatalogTab />}
      {activeTab === 'leads' && <LeadsTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
}
