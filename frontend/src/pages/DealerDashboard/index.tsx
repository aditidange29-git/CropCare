// CropCare — Dealer Dashboard (production wired)
// Tabs: Catalog | Leads | Analytics — all from real API
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PackageIcon, UsersIcon, BarChartIcon, XIcon } from '../../components/icons/index.tsx';
import { getDealerProducts, createProduct, updateProduct, deleteProduct as deleteProductApi, getDealerLeads, getDealerAnalytics } from '../../services/dealerService.ts';
import { getDiseaseLibrary } from '../../services/adminService.ts';
import { useAuth } from '../../store/AuthContext.tsx';
import { logout } from '../../services/authService.ts';

type StockStatus = 'in_stock' | 'low' | 'out_of_stock';
type TabId = 'catalog' | 'leads' | 'analytics';

const STOCK_CONFIG: Record<StockStatus, { bg: string; color: string; label: string }> = {
  in_stock: { bg: '#dcfce7', color: '#166534', label: 'In Stock' },
  low: { bg: '#fef9c3', color: '#854d0e', label: 'Low Stock' },
  out_of_stock: { bg: '#fee2e2', color: '#991b1b', label: 'Out of Stock' },
};

interface Product {
  id: string; name: string; category: string;
  applicable_disease_codes: string[]; stock_status: StockStatus;
  description?: string; image_url?: string;
}
interface DiseaseOption { disease_code: string; name_translations: { en?: string } }

interface ProductFormState {
  name: string; category: string; stock_status: StockStatus;
  applicable_disease_codes: string[]; description: string; image_url: string;
}
const EMPTY_FORM: ProductFormState = { name: '', category: 'Insecticide', stock_status: 'in_stock', applicable_disease_codes: [], description: '', image_url: '' };

function ProductModal({ product, diseases, onSave, onClose }: {
  product?: Product; diseases: DiseaseOption[];
  onSave: (data: ProductFormState) => Promise<void>; onClose: () => void;
}): React.JSX.Element {
  const [form, setForm] = useState<ProductFormState>(product ? {
    name: product.name, category: product.category,
    stock_status: product.stock_status,
    applicable_disease_codes: product.applicable_disease_codes ?? [],
    description: product.description ?? '', image_url: product.image_url ?? '',
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDisease(code: string) {
    setForm(p => ({
      ...p,
      applicable_disease_codes: p.applicable_disease_codes.includes(code)
        ? p.applicable_disease_codes.filter(c => c !== code)
        : [...p.applicable_disease_codes, code],
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    if (form.applicable_disease_codes.length === 0) { setError('Select at least one disease.'); return; }
    setSaving(true); setError(null);
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e.message ?? 'Failed to save product.'); }
    finally { setSaving(false); }
  }

  const inp: React.CSSProperties = { height: '44px', width: '100%', padding: '0 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'system-ui, sans-serif', backgroundColor: '#fff' };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 20px 36px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#114b5f', margin: 0 }}>{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon size={20} color="#9ca3af" /></button>
        </div>
        {error && <div style={{ backgroundColor: '#fee2e2', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#991b1b', marginBottom: '14px' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Name *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Confidor Insecticide" style={inp} onFocus={e => { e.currentTarget.style.borderColor = '#1a936f'; }} onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }} /></div>
          <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}><option>Insecticide</option><option>Fungicide</option><option>Herbicide</option><option>Fertilizer</option><option>Biopesticide</option></select></div>
          <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock Status</label><div style={{ display: 'flex', gap: '6px' }}>{(['in_stock', 'low', 'out_of_stock'] as StockStatus[]).map(s => (<button key={s} type="button" onClick={() => setForm(p => ({ ...p, stock_status: s }))} style={{ flex: 1, height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, backgroundColor: form.stock_status === s ? '#1a936f' : '#f3f4f6', color: form.stock_status === s ? '#fff' : '#6b7280' }}>{STOCK_CONFIG[s].label}</button>))}</div></div>
          <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applicable Diseases *</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto', padding: '4px 0' }}>{diseases.map(d => { const sel = form.applicable_disease_codes.includes(d.disease_code); return (<button key={d.disease_code} type="button" onClick={() => toggleDisease(d.disease_code)} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '999px', border: sel ? 'none' : '1.5px solid #e5e7eb', cursor: 'pointer', backgroundColor: sel ? '#1a936f' : '#fff', color: sel ? '#fff' : '#6b7280', fontWeight: sel ? 600 : 400 }}>{d.name_translations?.en ?? d.disease_code}</button>); })}</div></div>
          <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief product description..." rows={2} style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' as const }} onFocus={e => { e.currentTarget.style.borderColor = '#1a936f'; }} onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }} /></div>
          <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Image URL</label><input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." style={inp} onFocus={e => { e.currentTarget.style.borderColor = '#1a936f'; }} onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }} /></div>
          <button type="button" onClick={handleSave} disabled={saving} style={{ height: '48px', backgroundColor: saving ? '#9ca3af' : '#1a936f', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', marginTop: '4px' }}>{saving ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}</button>
        </div>
      </div>
    </div>
  );
}

function CatalogTab({ dealerName }: { dealerName: string }): React.JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [diseases, setDiseases] = useState<DiseaseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDealerProducts(1);
      setProducts((result as any).items ?? []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadProducts();
    getDiseaseLibrary().then((d: any) => setDiseases((d as any).diseases ?? [])).catch(() => {});
  }, [loadProducts]);

  async function handleSave(form: ProductFormState) {
    if (editingProduct) {
      await updateProduct(editingProduct.id, form);
    } else {
      await createProduct(form);
    }
    await loadProducts();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(id);
    try { await deleteProductApi(id); await loadProducts(); }
    catch { alert('Failed to delete.'); }
    finally { setDeleting(null); }
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#1a936f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px', position: 'relative' }}>
      {products.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '48px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151', margin: '0 0 6px 0' }}>No products yet</p>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Tap + to add your first product</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {products.map(p => {
            const stock = STOCK_CONFIG[p.stock_status];
            return (
              <div key={p.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1.5px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 6px 0' }}>{p.category}</p>
                    {p.description && <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 6px 0', lineHeight: 1.4 }}>{p.description}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(p.applicable_disease_codes ?? []).slice(0, 3).map(code => (
                        <span key={code} style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '999px', backgroundColor: '#e8f5f0', color: '#1a936f', fontWeight: 500 }}>{code.replace(/_/g, ' ')}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 9px', borderRadius: '999px', backgroundColor: stock.bg, color: stock.color }}>{stock.label}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { setEditingProduct(p); setShowModal(true); }} style={{ fontSize: '12px', fontWeight: 600, color: '#114b5f', background: 'none', border: '1.5px solid #114b5f', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', minHeight: '32px' }}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} style={{ fontSize: '12px', fontWeight: 600, color: '#c1121f', background: 'none', border: '1.5px solid #c1121f', borderRadius: '6px', padding: '4px 10px', cursor: deleting === p.id ? 'not-allowed' : 'pointer', minHeight: '32px', opacity: deleting === p.id ? 0.6 : 1 }}>{deleting === p.id ? '…' : 'Delete'}</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <button onClick={() => { setEditingProduct(undefined); setShowModal(true); }} style={{ position: 'fixed', bottom: '24px', right: '20px', width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#1a936f', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(26,147,111,0.4)', zIndex: 100 }} aria-label="Add product">
        <PlusIcon size={26} color="#ffffff" />
      </button>
      {showModal && <ProductModal product={editingProduct} diseases={diseases} onSave={handleSave} onClose={() => setShowModal(false)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
