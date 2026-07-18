// CropCare — Recommendations Screen
// Route: /recommendations/:diagnosisId
// See architecture/04_UI_UX_Spec.md §3.8
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeftIcon, PhoneIcon, MessageCircleIcon, MapPinIcon, AlertTriangleIcon } from '../../components/icons/index.tsx';
import { getRecommendations, recordContact, RecommendationItem } from '../../services/recommendationService.ts';
import { getDiagnosisById } from '../../services/diagnosisService.ts';
import { ApiError } from '../../services/api.ts';

type StockStatus = 'in_stock' | 'low' | 'out_of_stock';

interface StockConfig { bg: string; color: string; label: string; }
const STOCK_CONFIG: Record<StockStatus, StockConfig> = {
  in_stock: { bg: '#dcfce7', color: '#166534', label: 'In Stock' },
  low: { bg: '#fef9c3', color: '#854d0e', label: 'Low Stock' },
  out_of_stock: { bg: '#fee2e2', color: '#991b1b', label: 'Out of Stock' },
};

export default function RecommendationsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { diagnosisId } = useParams<{ diagnosisId: string }>();

  const [products, setProducts] = useState<RecommendationItem[]>([]);
  const [diseaseName, setDiseaseName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contactingId, setContactingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [recs, diag] = await Promise.all([
          getRecommendations(diagnosisId!),
          getDiagnosisById(diagnosisId!),
        ]);
        if (!cancelled) {
          setProducts(recs);
          setDiseaseName(diag.disease.name);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load recommendations. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [diagnosisId]);


  async function handleCall(dealerId: string): Promise<void> {
    const key = `${dealerId}-call`;
    if (contactingId === key) return;
    setContactingId(key);
    try {
      const result = await recordContact(diagnosisId!, dealerId, 'call');
      window.location.href = result.deep_link;
    } catch {
      // fall back silently — contact was not recorded but user action is unblocked
    } finally {
      setContactingId(null);
    }
  }

  async function handleWhatsApp(dealerId: string): Promise<void> {
    const key = `${dealerId}-whatsapp`;
    if (contactingId === key) return;
    setContactingId(key);
    try {
      const result = await recordContact(diagnosisId!, dealerId, 'whatsapp');
      window.open(result.deep_link, '_blank');
    } catch {
      // fall back silently
    } finally {
      setContactingId(null);
    }
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: '#f5f5f0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        gap: '14px',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          border: '4px solid #e5e7eb', borderTopColor: '#1a936f',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>Loading recommendations...</p>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: '#f5f5f0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
      }}>
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '360px', width: '100%',
        }}>
          <AlertTriangleIcon size={36} color="#dc2626" />
          <p style={{ fontSize: '16px', color: '#374151', margin: '14px 0 20px', lineHeight: 1.5 }}>
            {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              Promise.all([getRecommendations(diagnosisId!), getDiagnosisById(diagnosisId!)])
                .then(([recs, diag]) => { setProducts(recs); setDiseaseName(diag.disease.name); })
                .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load recommendations.'))
                .finally(() => setLoading(false));
            }}
            style={{
              height: '44px', padding: '0 28px',
              backgroundColor: '#1a936f', color: '#ffffff',
              border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
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
          {diseaseName ? (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: '1px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              For {diseaseName}
            </p>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
        {products.length === 0 ? (
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
              const isCallingThis = contactingId === `${item.dealer.id}-call`;
              const isWAing = contactingId === `${item.dealer.id}-whatsapp`;
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
                  {item.distance_km != null && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      marginBottom: '14px',
                    }}>
                      <MapPinIcon size={14} color="#9ca3af" />
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                        {item.distance_km} km away
                      </span>
                    </div>
                  )}

                  {/* Contact buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleCall(item.dealer.id)}
                      disabled={isCallingThis}
                      style={{
                        flex: 1, height: '44px',
                        backgroundColor: '#e8f5f0', color: '#1a936f',
                        border: '1.5px solid #1a936f', borderRadius: '8px',
                        fontSize: '14px', fontWeight: 600, cursor: isCallingThis ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        opacity: isCallingThis ? 0.7 : 1,
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => { if (!isCallingThis) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d1f0e5'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8f5f0'; }}
                    >
                      <PhoneIcon size={16} color="#1a936f" />
                      {isCallingThis ? '...' : 'Call'}
                    </button>
                    {item.dealer.whatsapp_number ? (
                      <button
                        onClick={() => handleWhatsApp(item.dealer.id)}
                        disabled={isWAing}
                        style={{
                          flex: 1, height: '44px',
                          backgroundColor: '#e8f5e0', color: '#16a34a',
                          border: '1.5px solid #16a34a', borderRadius: '8px',
                          fontSize: '14px', fontWeight: 600, cursor: isWAing ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          opacity: isWAing ? 0.7 : 1,
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => { if (!isWAing) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d1f0d0'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8f5e0'; }}
                      >
                        <MessageCircleIcon size={16} color="#16a34a" />
                        {isWAing ? '...' : 'WhatsApp'}
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
