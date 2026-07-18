// CropCare — Login Screen (production wiring)
// Calls POST /auth/farmer/demo-login via AuthContext.farmerLogin()
// See architecture/04_UI_UX_Spec.md §3.3, 06_API_Design.md §1
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '../../components/icons/index.tsx';
import { useAuth } from '../../store/AuthContext.tsx';
import { useT } from '../../store/LanguageContext.tsx';
import { ApiError } from '../../services/api.ts';

interface FormState { name: string; phone: string; }
interface FormErrors { name?: string; phone?: string; general?: string; }

function validatePhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 10;
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    height: '52px', width: '100%', padding: '0 16px',
    border: `2px solid ${hasError ? '#c1121f' : '#d1d5db'}`,
    borderRadius: '8px', fontSize: '16px', color: '#1f2937',
    backgroundColor: '#ffffff', boxSizing: 'border-box',
    outline: 'none', fontFamily: 'system-ui, -apple-system, sans-serif',
  };
}

export default function DemoLoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { farmerLogin } = useAuth();
  const t = useT();
  const [form, setForm] = useState<FormState>({ name: '', phone: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(field: keyof FormState, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (submitted) setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = t('name_required');
    if (!form.phone.trim()) errs.phone = t('phone_required');
    else if (!validatePhone(form.phone)) errs.phone = t('phone_invalid');
    return errs;
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await farmerLogin(form.name.trim(), form.phone.trim());
      navigate('/home', { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t('login_failed');
      setErrors({ general: msg });
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Desktop illustration panel */}
      <div style={{ width: '45%', flexShrink: 0, background: 'linear-gradient(160deg, #1a936f 0%, #114b5f 100%)', display: 'none', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '40px' }} className="hidden md:flex">
        <svg width="160" height="160" viewBox="0 0 200 200" fill="none" aria-hidden="true">
          <path d="M100 40 C140 50, 155 80, 150 120 C145 150, 120 168, 100 170 C80 168, 55 150, 50 120 C45 80, 60 50, 100 40Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <path d="M100 50 C130 60, 140 90, 135 125 C130 148, 118 162, 100 165" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M100 80 L80 100M100 100 L75 110M100 120 L85 130" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 800, margin: '24px 0 8px', textAlign: 'center' }}>CropCare</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', textAlign: 'center', maxWidth: '260px', lineHeight: 1.6 }}>AI-powered disease detection for healthier crops and better yields</p>
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <button onClick={() => navigate('/language')} style={{ minWidth: '44px', minHeight: '44px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Go back">
            <ChevronLeftIcon size={24} color="#374151" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, #1a936f, #114b5f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 8C8 10 5.9 16.17 3.82 19.34" stroke="white" strokeWidth="2.5" strokeLinecap="round" /><path d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </div>
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#114b5f' }}>CropCare</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 28px 32px', maxWidth: '480px', width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#114b5f', margin: '0 0 6px 0' }}>{t('welcome')}</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 32px 0' }}>{t('login_subtitle')}</p>

          {errors.general && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#991b1b' }}>{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="name" style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '7px' }}>{t('your_name')}</label>
              <input id="name" type="text" value={form.name} placeholder={t('name_placeholder')} onChange={(e) => handleChange('name', e.target.value)} style={inputStyle(!!errors.name)} onFocus={(e) => { if (!errors.name) { e.currentTarget.style.borderColor = '#1a936f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,147,111,0.12)'; } }} onBlur={(e) => { if (!errors.name) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; } }} aria-invalid={!!errors.name} />
              {errors.name && <p role="alert" style={{ fontSize: '13px', color: '#c1121f', margin: '5px 0 0 0' }}>{errors.name}</p>}
            </div>
            <div style={{ marginBottom: '36px' }}>
              <label htmlFor="phone" style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '7px' }}>{t('phone_number')}</label>
              <input id="phone" type="tel" value={form.phone} placeholder={t('phone_placeholder')} onChange={(e) => handleChange('phone', e.target.value)} style={inputStyle(!!errors.phone)} onFocus={(e) => { if (!errors.phone) { e.currentTarget.style.borderColor = '#1a936f'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,147,111,0.12)'; } }} onBlur={(e) => { if (!errors.phone) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; } }} aria-invalid={!!errors.phone} />
              {errors.phone && <p role="alert" style={{ fontSize: '13px', color: '#c1121f', margin: '5px 0 0 0' }}>{errors.phone}</p>}
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', height: '52px', backgroundColor: loading ? '#6b7280' : '#1a936f', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '17px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'system-ui, -apple-system, sans-serif' }} onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#157a5c'; }} onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = loading ? '#6b7280' : '#1a936f'; }}>
              {loading ? <><div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{t('signing_in')}</> : `${t('continue')} →`}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', margin: '28px 0 0 0', lineHeight: 1.5 }}>{t('login_note')}</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
