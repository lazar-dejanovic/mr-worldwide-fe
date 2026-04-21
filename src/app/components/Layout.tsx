import { Outlet, useNavigate, useLocation } from 'react-router';
import { Map, Compass, PlusCircle, MessageCircle, User } from 'lucide-react';
import { useState } from 'react';
import { NewTripModal } from './NewTripModal';

function IOSStatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return (
    <div className="flex items-center justify-between px-6 py-2 bg-transparent" style={{ height: '44px', zIndex: 100, position: 'relative' }}>
      <span style={{ fontSize: '15px', fontWeight: 600, color: 'inherit', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0" y="7" width="3" height="5" rx="1" opacity="1"/>
          <rect x="4.5" y="4.5" width="3" height="7.5" rx="1" opacity="1"/>
          <rect x="9" y="2" width="3" height="10" rx="1" opacity="1"/>
          <rect x="13.5" y="0" width="3" height="12" rx="1" opacity="0.3"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 10a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0-3.5a5.5 5.5 0 014.04 1.77l1.18-1.18A7.25 7.25 0 008 5a7.25 7.25 0 00-5.22 2.09l1.18 1.18A5.5 5.5 0 018 6.5zm0-3.5a9 9 0 016.57 2.86L15.75 4.7A10.75 10.75 0 008 1.5a10.75 10.75 0 00-7.75 3.2l1.18 1.16A9 9 0 018 3z" opacity="0.3"/>
          <circle cx="8" cy="11" r="1.5"/>
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35"/>
          <rect x="22" y="3.5" width="2.5" height="5" rx="1.5" opacity="0.4"/>
          <rect x="2" y="2" width="16" height="8" rx="1.5"/>
        </svg>
      </div>
    </div>
  );
}

const tabs = [
  { id: 'trips', label: 'Trips', icon: Map, path: '/' },
  { id: 'explore', label: 'Explore', icon: Compass, path: '/explore' },
  { id: 'new', label: '', icon: PlusCircle, path: null },
  { id: 'chat', label: 'AI Chat', icon: MessageCircle, path: '/chat' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNewTrip, setShowNewTrip] = useState(false);

  const isActive = (path: string | null) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] overflow-hidden">
      {/* Status Bar */}
      <div style={{ background: location.pathname.startsWith('/trips/') ? 'transparent' : '#F2F2F7', color: '#000', transition: 'background 0.3s' }}>
        <IOSStatusBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
        <Outlet />
      </div>

      {/* iOS Tab Bar */}
      <div
        style={{
          background: 'rgba(249,249,249,0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '0.5px solid rgba(0,0,0,0.2)',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          zIndex: 50,
        }}
      >
        <div className="flex items-center justify-around" style={{ height: '49px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            if (tab.id === 'new') {
              return (
                <button
                  key={tab.id}
                  onClick={() => setShowNewTrip(true)}
                  className="flex flex-col items-center justify-center"
                  style={{ width: '64px', height: '49px' }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '22px',
                      background: 'linear-gradient(135deg, #007AFF 0%, #0057E7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,87,231,0.4)',
                      marginTop: '-12px',
                    }}
                  >
                    <Icon size={22} color="#fff" strokeWidth={2.5} />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => tab.path && navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-0.5"
                style={{ width: '64px', height: '49px' }}
              >
                <Icon
                  size={24}
                  color={active ? '#007AFF' : '#8E8E93'}
                  strokeWidth={active ? 2 : 1.5}
                />
                <span
                  style={{
                    fontSize: '10px',
                    color: active ? '#007AFF' : '#8E8E93',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: active ? 600 : 400,
                    letterSpacing: '-0.1px',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {showNewTrip && <NewTripModal onClose={() => setShowNewTrip(false)} />}
    </div>
  );
}
