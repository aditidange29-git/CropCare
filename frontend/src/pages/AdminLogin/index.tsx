// CropCare — Admin Login — Route: /admin/login
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/authService.ts';
import { ApiError } from '../../services/api.ts';

export default function AdminLoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@cropcare.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inp: React.CSSProperties = { height: '52px', width: '100%', padding: '0 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none', fontFamily: 'system-ui, sans-serif' };

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email || !password) { setError('Enter email and password.'); return; }
    setError(null); setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f0', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '36px 32px', maxWidth: '420px', width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #114b5f, #0a2e3a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#114b5f', margin: 0 }}>Admin Portal</h1>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>CropCare Platform Console</p>
          </div>
        </div>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px', color: '#991b1b' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inp}
              onFocus={e => { e.currentTarget.style.borderColor = '#114b5f'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              style={inp}
              onFocus={e => { e.currentTarget.style.borderColor = '#114b5f'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ height: '52px', backgroundColor: loading ? '#6b7280' : '#114b5f', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Signing in...
              </>
            ) : 'Sign In as Admin'}
          </button>
        </form>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '16px 0 0 0', textAlign: 'center' }}>
          Default: admin@cropcare.com — run seed script to create
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
