import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ChevronRight, LogOut, Settings, Bell, Shield, HelpCircle, Star, Globe, MapPin, Sparkles, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

const INTEREST_COLORS: Record<string, string> = {
  MUSEUMS: '#007AFF', NIGHTLIFE: '#5856D6', HIKING: '#34C759', NATURE: '#30D158',
  FOOD: '#FF9500', SHOPPING: '#FF2D55', BEACHES: '#32ADE6', ARCHITECTURE: '#AC8E68',
  PHOTOGRAPHY: '#FF6B6B', ARTS: '#AF52DE', WELLNESS: '#64D2FF', SPORTS: '#0A84FF',
};

const INTEREST_EMOJIS: Record<string, string> = {
  MUSEUMS: '🏛️', NIGHTLIFE: '🌙', HIKING: '🥾', NATURE: '🌿', FOOD: '🍽️',
  SHOPPING: '🛍️', BEACHES: '🏖️', ARCHITECTURE: '🏰', PHOTOGRAPHY: '📸', ARTS: '🎭',
  WELLNESS: '🧘', SPORTS: '⛵',
};

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  value?: string;
  color?: string;
  danger?: boolean;
  onPress?: () => void;
}

function SettingRow({ icon: Icon, label, value, color = '#007AFF', danger, onPress }: SettingRowProps) {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      onClick={onPress}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: danger ? '#FF3B3015' : `${color}15` }}>
        <Icon size={16} color={danger ? '#FF3B30' : color} />
      </div>
      <span className="flex-1 text-left"
        style={{ fontSize: '15px', color: danger ? '#FF3B30' : '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        {label}
      </span>
      {value ? (
        <span style={{ fontSize: '14px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{value}</span>
      ) : (
        <ChevronRight size={16} color="#C7C7CC" />
      )}
    </button>
  );
}

export default function ProfileScreen() {
  const { currentUser, trips, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const prefs = currentUser?.userTripPreference;
  const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
  const bookedTrips = trips.filter(t => t.status === 'BOOKED').length;

  return (
    <div className="bg-[#F2F2F7] min-h-full pb-6">
      {/* Header */}
      <div className="bg-[#F2F2F7] px-5 pt-2 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            Profile
          </h1>
          <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Settings size={18} color="#000" />
          </button>
        </div>

        {/* User Card */}
        <motion.div
          className="bg-white rounded-3xl p-5"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {currentUser?.firstName?.[0] || 'A'}{currentUser?.lastName?.[0] || 'M'}
                </span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: '#007AFF', border: '2px solid #F2F2F7' }}>
                <Edit3 size={10} color="#fff" />
              </button>
            </div>

            <div className="flex-1">
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                {currentUser?.firstName} {currentUser?.lastName}
              </h2>
              <p style={{ fontSize: '14px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                {currentUser?.email}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="px-2 py-0.5 rounded-md"
                  style={{ background: '#007AFF20', color: '#007AFF', fontSize: '11px', fontWeight: 700, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  REGULAR USER
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-0 mt-5 pt-4" style={{ borderTop: '0.5px solid #F2F2F7' }}>
            {[
              { label: 'Trips', value: trips.length, icon: '🧳' },
              { label: 'Countries', value: 12, icon: '🌍' },
              { label: 'Booked', value: bookedTrips, icon: '✅' },
              { label: 'Done', value: completedTrips, icon: '🏆' },
            ].map((stat, idx) => (
              <div key={stat.label} className="flex-1 text-center"
                style={{ borderRight: idx < 3 ? '0.5px solid #F2F2F7' : 'none' }}>
                <p style={{ fontSize: '16px' }}>{stat.icon}</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{stat.value}</p>
                <p style={{ fontSize: '11px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-5 space-y-4">
        {/* Travel Preferences */}
        {prefs && (
          <motion.div
            className="bg-white rounded-3xl p-4"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} color="#007AFF" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Travel Preferences
                </h3>
              </div>
              <button
                onClick={() => navigate('/survey')}
                style={{ fontSize: '13px', color: '#007AFF', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Edit
              </button>
            </div>

            {prefs.interests.length > 0 && (
              <div className="mb-3">
                <p style={{ fontSize: '12px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                  Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {prefs.interests.map(i => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ background: `${INTEREST_COLORS[i] || '#8E8E93'}15`, color: INTEREST_COLORS[i] || '#8E8E93', fontSize: '12px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {INTEREST_EMOJIS[i] || '•'} {i.charAt(0) + i.slice(1).toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {prefs.favouriteDestinations.length > 0 && (
              <div>
                <p style={{ fontSize: '12px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                  Dream Destinations
                </p>
                <div className="flex flex-wrap gap-2">
                  {prefs.favouriteDestinations.map(d => (
                    <span key={d} className="flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ background: '#F2F2F7', color: '#000', fontSize: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      <MapPin size={10} color="#8E8E93" /> {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {prefs.hobbies.length > 0 && (
              <div className="mt-3">
                <p style={{ fontSize: '12px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                  Hobbies
                </p>
                <div className="flex flex-wrap gap-2">
                  {prefs.hobbies.map(h => (
                    <span key={h} className="px-2 py-1 rounded-lg"
                      style={{ background: '#F2F2F7', color: '#8E8E93', fontSize: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Achievements */}
        <motion.div
          className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="px-4 pt-4 pb-2">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              🏆 Achievements
            </h3>
          </div>
          <div className="flex gap-3 px-4 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {[
              { icon: '✈️', label: 'First Trip', desc: 'Planned your first trip', color: '#007AFF' },
              { icon: '🌍', label: 'Globetrotter', desc: '10+ countries visited', color: '#34C759' },
              { icon: '🗺️', label: 'Planner Pro', desc: '3+ active plans', color: '#FF9500' },
              { icon: '⭐', label: 'AI Explorer', desc: 'Used AI 5+ times', color: '#5856D6' },
            ].map(ach => (
              <div key={ach.label} className="flex-shrink-0 flex flex-col items-center text-center rounded-2xl p-3"
                style={{ background: '#F2F2F7', width: '80px' }}>
                <span style={{ fontSize: '24px' }}>{ach.icon}</span>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#000', marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '1.2' }}>{ach.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ borderBottom: '0.5px solid #F2F2F7' }}>
            <SettingRow icon={Bell} label="Notifications" color="#FF9500" />
          </div>
          <div style={{ borderBottom: '0.5px solid #F2F2F7' }}>
            <SettingRow icon={Globe} label="Language" value="English" color="#007AFF" />
          </div>
          <div style={{ borderBottom: '0.5px solid #F2F2F7' }}>
            <SettingRow icon={Shield} label="Privacy & Security" color="#34C759" />
          </div>
          <SettingRow icon={HelpCircle} label="Help & Support" color="#5856D6" />
        </motion.div>

        {/* Sign Out */}
        <motion.div
          className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <SettingRow icon={LogOut} label="Sign Out" danger onPress={handleLogout} />
        </motion.div>

        <p style={{ fontSize: '12px', color: '#C7C7CC', textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          MR Worldwide v1.0.0 · Made with ✈️
        </p>
      </div>
    </div>
  );
}
