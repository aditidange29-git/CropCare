// CropCare — Dealer Pending Approval — polls every 30s for status change
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService.ts';
import { api } from '../../services/api.ts';

export default function DealerPendingPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [justApproved, setJustApproved] = useState(false);

  useEffect(() => {
    // Poll every 30 seconds to check if admin approved the dealer
    const poll = async () => {
      try {
        const token = localStorage.getItem('cropcare_token');
        if (!token) return;
        // Try to fetch dealer products — if status changed to approved this will succeed
        await api.get<{ dealer: { status: string } }>('/dealer/products?page=1');
        // If we get here without a 403, dealer is approved
        setJustApproved(true);
        setTimeout(() => navigate('/dealer/dashboard', { replace: true }), 3000);
      } catch {
        // Still pending or suspended — keep waiting
      }
    };

    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (justApproved) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f0', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '36px 28px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
              <polyline points="22 4 12 14.01 9 11.01" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#114b5f', margin: '0 0 8px 0' }}>Account Approved!</h2>
          <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, margin: '0 0 8px 0' }}>
            Your dealer account has been approved. Redirecting to your dashboard...
          </p>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden', marginTop: '16px' }}>
            <div style={{ height: '100%', backgroundColor: '#1a936f', borderRadius: '2px', animation: 'progress 3s linear forwards' }} />
          </div>
        </div>
        <style>{`@keyframes progress { from { width: 0 } to { width: 100% } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f0', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '36px 28px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#854d0e" strokeWidth="2" />
            <polyline points="12 6 12 12 16 14" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#114b5f', margin: '0 0 8px 0' }}>Pending Approval</h2>
        <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, margin: '0 0 8px 0' }}>
          Your dealer account is under review by the admin team. You'll be automatically redirected once approved.
        </p>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px 0' }}>
          Checking for updates every 30 seconds...
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f0a202', animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
        <button
          onClick={() => { logout(); navigate('/dealer/login'); }}
          style={{ height: '44px', width: '100%', backgroundColor: '#ffffff', color: '#9ca3af', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}
