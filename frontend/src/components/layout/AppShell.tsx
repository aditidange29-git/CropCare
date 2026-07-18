// CropCare — AppShell layout component
// Mobile (< 768px): bottom tab bar
// Desktop (≥ 768px): left sidebar 240px wide
// Used by: Home, History, Settings screens
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, ClockIcon, SettingsIcon } from '../icons/index.tsx';

type TabId = 'home' | 'history' | 'settings';

interface NavItem {
  id: TabId;
  label: string;
  path: string;
  Icon: React.FC<{ size?: number; color?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', path: '/home', Icon: HomeIcon },
  { id: 'history', label: 'History', path: '/history', Icon: ClockIcon },
  { id: 'settings', label: 'Settings', path: '/settings', Icon: SettingsIcon },
];

interface AppShellProps {
  children: React.ReactNode;
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

export default function AppShell({ children, activeTab: controlledTab, onTabChange }: AppShellProps): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [internalTab, setInternalTab] = useState<TabId>('home');

  // Derive active tab from path or controlled prop
  const activeTab = controlledTab ?? internalTab;

  useEffect(() => {
    const matched = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));
    if (matched) setInternalTab(matched.id);
  }, [location.pathname]);

  function handleTabClick(item: NavItem): void {
    setInternalTab(item.id);
    onTabChange?.(item.id);
    if (!onTabChange) navigate(item.path);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f5f5f0' }}>
      {/* Desktop sidebar */}
      <aside
        style={{
          width: '240px',
          flexShrink: 0,
          backgroundColor: '#ffffff',
          borderRight: '1.5px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0 0',
        }}
        className="hidden md:flex"
        aria-label="Sidebar navigation"
      >
        {/* Logo area */}
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #1a936f, #114b5f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#114b5f', letterSpacing: '0.3px' }}>CropCare</span>
          </div>
        </div>
        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', borderRadius: '8px', border: 'none',
                  cursor: 'pointer', minHeight: '44px', width: '100%', textAlign: 'left',
                  backgroundColor: isActive ? '#e8f5f0' : 'transparent',
                  color: isActive ? '#1a936f' : '#6b7280',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '15px',
                  transition: 'background-color 0.15s ease',
                }}
                aria-current={isActive ? 'page' : undefined}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
              >
                <item.Icon size={20} color={isActive ? '#1a936f' : '#9ca3af'} />
                {item.label}
              </button>
            );
          })}
        </nav>
        {/* Version */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>v0.1.0</span>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: '64px', backgroundColor: '#ffffff',
          borderTop: '1.5px solid #e5e7eb',
          display: 'flex', zIndex: 50,
        }}
        className="flex md:hidden"
        aria-label="Bottom navigation"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                minHeight: '44px', gap: '2px',
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.Icon size={22} color={isActive ? '#1a936f' : '#9ca3af'} />
              <span style={{
                fontSize: '11px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#1a936f' : '#9ca3af',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
