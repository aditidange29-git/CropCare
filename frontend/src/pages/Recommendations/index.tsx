// CropCare — Recommendations Screen
// Route: /recommendations/:diagnosisId
// See architecture/04_UI_UX_Spec.md §3.8
// Uses MOCK_RECOMMENDATIONS for now.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, PhoneIcon, MessageCircleIcon, MapPinIcon } from '../../components/icons/index.tsx';
import { MOCK_RECOMMENDATIONS, MOCK_DIAGNOSIS } from '../../data/mockData.ts';

type StockStatus = 'in_stock' | 'low' | 'out_of_stock';

interface StockConfig { bg: string; color: string; label: string; }
const STOCK_CONFIG: Record<StockStatus, StockConfig> = {
  in_stock: { bg: '#dcfce7', color: '#166534', label: 'In Stock' },
  low: { bg: '#fef9c3', color: '#854d0e', label: 'Low Stock' },
  out_of_stock: { bg: '#fee2e2', color: '#991b1b', label: 'Out of Stock' },
};

export default function RecommendationsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const products = MOCK_RECOMMENDATIONS;

  function handleCall(phone: string): void {
    window.location.href = `tel:${phone}`;
  }

  function handleWhatsApp(phone: string): void {
    const cleaned = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Nearby Products
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: '1px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            For {MOCK_DIAGNOSIS.disease.name}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
        {products.length === 0 ? (
          // Empty state
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '48px 24px', marginTop: '8px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '16px',
              backgroundColor: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MapPinIcon size={36} color="#9ca3af" />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: 0, textAlign: 'center' }}>
              No nearby dealers found
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
              No dealers near you stock a specific product yet. Try searching in your local market for insecticide treatments.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0' }}>
              {products.length} dealer{products.length !== 1 ? 's' : ''} found near you
            </p>
            {products.map((item) => {
              const stockConfig = STOCK_CONFIG[item.stock_status];
              return (
                <div
                  key={item.product_id}
                  style={{
                    backgroundColor: '#ffffff', borderRadius: '12px',
                    padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    border: '1.5px solid #f3f4f6',
                  }}
                >
                  {/* Product header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                      <h3 style={{
                        fontSize: '16px', fontWeight: 700, color: '#1f2937',
                        margin: '0 0 3px 0',
                      }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        {item.dealer.shop_name}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '12px', fontWeight: 600, padding: '3px 10px',
                      borderRadius: '999px', flexShrink: 0,
                      backgroundColor: stockConfig.bg, color: stockConfig.color,
                    }}>
                      {stockConfig.label}
                    </span>
                  </div>

                  {/* Distance */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    marginBottom: '14px',
                  }}>
                    <MapPinIcon size={14} color="#9ca3af" />
                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                      {item.distance_km} km away
                    </span>
                  </div>

                  {/* Contact buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleCall(item.dealer.phone_number)}
                      style={{
                        flex: 1, height: '44px',
                        backgroundColor: '#e8f5f0', color: '#1a936f',
                        border: '1.5px solid #1a936f', borderRadius: '8px',
                        fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d1f0e5'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8f5f0'; }}
                    >
                      <PhoneIcon size={16} color="#1a936f" />
                      Call
                    </button>
                    {item.dealer.whatsapp_number ? (
                      <button
                        onClick={() => handleWhatsApp(item.dealer.whatsapp_number!)}
                        style={{
                          flex: 1, height: '44px',
                          backgroundColor: '#e8f5e0', color: '#16a34a',
                          border: '1.5px solid #16a34a', borderRadius: '8px',
                          fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d1f0d0'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8f5e0'; }}
                      >
                        <MessageCircleIcon size={16} color="#16a34a" />
                        WhatsApp
                      </button>
                    ) : (
                      <div style={{ flex: 1 }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
