// CropCare — Dealer Login Page — Route: /dealer/login
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '../../components/icons/index.tsx';
import { dealerLogin } from '../../services/authService.ts';
import { ApiError } from '../../services/api.ts';

function inputStyle(): React.CSSProperties {
  return { height: '52px', width: '100%', padding: '0 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', color: '#1f2937', backgroundColor: '#ffffff', boxSizing: 'border-box', outline: 'none', fontFamily: 'system-ui, -apple-system, sans-serif' };
}

export default function DealerLoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setError(null); setLoading(true);
    try {
      const result = await dealerLogin(email.trim(), password);
      if (result.dealer.status === 'pending') navigate('/dealer/pending');
      else if (result.dealer.status === 'approved') navigate('/dealer/dashboard', { replace: true });
      else setError('Your account has been suspended. Contact support.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', background: 'linear-gradient(135deg, #114b5f 0%, #0d3547 100%)' }}>
        <button onClick={() => navigate(-1)} style={{ minWidth: '44px', minHeight: '44px', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Go back">
          <ChevronLeftIcon size={24} color="#ffffff" />
        </button>
        <div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>CropCare Dealer</p>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Sign In</h1>
        </div>
      </div>
      <div style={{ flex: 1, padding: '32px 20px', maxWidth: '480px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#114b5f', margin: '0 0 4px 0' }}>Welcome back</h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 28px 0' }}>Sign in to manage your products</p>
        {error && <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#991b1b' }}>{error}</div>}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Email Address</label>
            <input type="email" value={email} placeholder="your@email.com" onChange={(e) => setEmail(e.target.value)} style={inputStyle()} onFocus={(e) => { e.currentTarget.style.borderColor = '#114b5f'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} style={inputStyle()} onFocus={(e) => { e.currentTarget.style.borderColor = '#114b5f'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }} />
          </div>
          <button type="submit" disabled={loading} style={{ height: '52px', backgroundColor: loading ? '#6b7280' : '#114b5f', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
            {loading ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Signing in...</> : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', margin: '24px 0 0 0' }}>
          Don't have an account?{' '}
          <span onClick={() => navigate('/dealer/signup')} style={{ color: '#114b5f', fontWeight: 600, cursor: 'pointer' }}>Register as Dealer</span>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
