// CropCare — Dealer Pending Approval Page — Route: /dealer/pending
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService.ts';

export default function DealerPendingPage(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f0', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '36px 28px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#854d0e" strokeWidth="2" /><polyline points="12 6 12 12 16 14" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#114b5f', margin: '0 0 8px 0' }}>Pending Approval</h2>
        <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, margin: '0 0 24px 0' }}>
          Your dealer account is currently under review. You'll have full access once an admin approves your registration.
        </p>
        <button onClick={() => { logout(); navigate('/dealer/login'); }} style={{ height: '48px', width: '100%', backgroundColor: '#ffffff', color: '#c1121f', border: '2px solid #c1121f', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </div>
  );
}
