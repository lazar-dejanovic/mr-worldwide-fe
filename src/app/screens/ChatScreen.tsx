import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIChatOverlay } from '../components/AIChatOverlay';
import { motion } from 'motion/react';

export default function ChatScreen() {
  const { trips } = useApp();
  const navigate = useNavigate();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  return (
    <div className="bg-[#F2F2F7] min-h-full pb-4">
      <div className="px-5 pt-2 pb-4">
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          AI Assistant
        </h1>
        <div className="mt-3 p-4 rounded-3xl"
          style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', boxShadow: '0 4px 20px rgba(0,87,231,0.35)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '17px', fontWeight: 700, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                MR AI Travel Assistant
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Ask me anything about your trips
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', marginBottom: '12px' }}>
          Choose a Trip to Chat About
        </h2>
        {trips.map((trip, idx) => (
          <motion.button
            key={trip.id}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl mb-3 text-left"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: 'none' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTripId(trip.id)}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {trip.name}
              </p>
              <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                {trip.destinations.slice(0, 3).join(' → ')}
              </p>
            </div>
            <div className="flex items-center gap-1" style={{ color: '#007AFF', fontSize: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              <Sparkles size={12} />
              Chat
            </div>
            <ChevronRight size={14} color="#C7C7CC" />
          </motion.button>
        ))}
      </div>

      {activeTripId && <AIChatOverlay tripId={activeTripId} onClose={() => setActiveTripId(null)} />}
    </div>
  );
}
