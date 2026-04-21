import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return (
    /* Outer wrapper: dark background on desktop */
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: '#0A0A0F' }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 'min(390px, 100vw)',
          height: 'min(844px, 100svh)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'clamp(0px, calc((390px - 100vw) * 999 + 48px), 52px)',
          boxShadow: '0 0 0 12px #1C1C1E, 0 0 0 13px #3A3A3C, 0 80px 160px rgba(0,0,0,0.9)',
          background: '#F2F2F7',
          flexShrink: 0,
        }}
      >
        {/* Dynamic Island (decorative notch pill) */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90px',
            height: '28px',
            background: '#000',
            borderRadius: '14px',
            zIndex: 300,
            pointerEvents: 'none',
          }}
        />

        {/* App content — full fill */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <RouterProvider router={router} />
        </div>
      </div>
    </div>
  );
}