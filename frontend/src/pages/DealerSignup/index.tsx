// CropCare — Dealer Signup Page — Route: /dealer/signup
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '../../components/icons/index.tsx';
import { dealerRegister } from '../../services/authService.ts';
import { ApiError } from '../../services/api.ts';

type FS = { shop_name: string; owner_name: string; email: string; password: string; phone_number: string; whatsapp_number: string; address: string; };

function input(): React.CSSProperties {
  return { height: '48px', width: '100%', padding: '0 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', color: '#1f2937', backgroundColor: '#ffffff', boxSizing: 'border-box', outline: 'none', fontFamily: 'system-ui, -apple-system, sans-serif' };
}

export default function DealerSignupPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [form, setForm] = useState<FS>({ shop_name: '', owner_name: '', email: '', password: '', phone_number: '', whatsapp_number: '', address: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const set = (k: keyof FS) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = '#114b5f'; };
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = '#e5e7eb'; };

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!form.shop_name || !form.owner_name || !form.email || !form.password || !form.phone_number || !form.address) { setError('Please fill in all required fields.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(null); setLoading(true);
    try {
      await dealerRegister({ shop_name: form.shop_name.trim(), owner_name: form.owner_name.trim(), email: form.email.trim(), password: form.password, phone_number: form.phone_number.trim(), location_lat: 20.5937, location_lng: 78.9629, address: form.address.trim() });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f0', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '36px 28px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#166534" strokeWidth="2" strokeLinecap="round" /><polyline points="22 4 12 14.01 9 11.01" stroke="#166534" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#114b5f', margin: '0 0 8px 0' }}>Application Submitted</h2>
          <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, margin: '0 0 24px 0' }}>Your dealer account is under review. You can log in once approved by the admin team.</p>
          <button onClick={() => navigate('/dealer/login')} style={{ height: '48px', width: '100%', backgroundColor: '#114b5f', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  const fields: { key: keyof FS; label: string; placeholder: string; type: string }[] = [
    { key: 'shop_name', label: 'Shop Name *', placeholder: 'e.g. Patil Agro Stores', type: 'text' },
    { key: 'owner_name', label: 'Owner Name *', placeholder: 'Your full name', type: 'text' },
    { key: 'email', label: 'Email Address *', placeholder: 'shop@example.com', type: 'email' },
    { key: 'password', label: 'Password * (min 8 chars)', placeholder: '••••••••', type: 'password' },
    { key: 'phone_number', label: 'Phone Number *', placeholder: '+91 XXXXX XXXXX', type: 'tel' },
    { key: 'whatsapp_number', label: 'WhatsApp Number (optional)', placeholder: '+91 XXXXX XXXXX', type: 'tel' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', background: 'linear-gradient(135deg, #114b5f 0%, #0d3547 100%)' }}>
        <button onClick={() => navigate(-1)} style={{ minWidth: '44px', minHeight: '44px', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Go back">
          <ChevronLeftIcon size={24} color="#ffffff" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Dealer Registration</h1>
      </div>
      <form onSubmit={handleSubmit} style={{ flex: 1, padding: '24px 20px 40px', maxWidth: '560px', width: '100%', margin: '0 auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#991b1b' }}>{error}</div>}
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>{label}</label>
            <input type={type} value={form[key]} placeholder={placeholder} onChange={set(key)} style={input()} onFocus={focus} onBlur={blur} />
          </div>
        ))}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Shop Address *</label>
          <textarea value={form.address} placeholder="Full shop address..." onChange={set('address')} rows={3} style={{ ...input(), height: 'auto', padding: '12px 14px', resize: 'vertical' as const }} onFocus={focus} onBlur={blur} />
        </div>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Your application will be reviewed by admin before you can log in.</p>
        <button type="submit" disabled={loading} style={{ height: '52px', backgroundColor: loading ? '#6b7280' : '#114b5f', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {loading ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Submitting...</> : 'Submit Registration'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>Already registered? <span onClick={() => navigate('/dealer/login')} style={{ color: '#114b5f', fontWeight: 600, cursor: 'pointer' }}>Sign In</span></p>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
