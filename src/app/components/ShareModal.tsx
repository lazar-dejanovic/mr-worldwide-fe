import { useState } from 'react';
import { X, Mail, ChevronDown, Check, Copy, UserPlus } from 'lucide-react';
import { useApp, AccessType } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface ShareModalProps {
  tripId: string;
  tripName: string;
  onClose: () => void;
}

const SHARED_USERS = [
  { id: 'u2', name: 'Sophie Laurent', email: 'sophie@gmail.com', accessType: 'EDITOR' as AccessType, avatar: 'SL' },
  { id: 'u3', name: 'Marcus Johnson', email: 'm.johnson@icloud.com', accessType: 'READ_ONLY' as AccessType, avatar: 'MJ' },
];

const AVATAR_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#AF52DE'];

export function ShareModal({ tripId, tripName, onClose }: ShareModalProps) {
  const { shareTrip } = useApp();
  const [email, setEmail] = useState('');
  const [accessType, setAccessType] = useState<AccessType>('READ_ONLY');
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  const [shared, setShared] = useState(SHARED_USERS);
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const handleInvite = () => {
    if (!email.trim()) return;
    shareTrip(tripId, email, accessType);
    setShared(prev => [...prev, {
      id: `u-${Date.now()}`,
      name: email.split('@')[0],
      email: email.trim(),
      accessType,
      avatar: email.substring(0, 2).toUpperCase(),
    }]);
    setEmail('');
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 2000);
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-50 flex flex-col justify-end"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-t-3xl"
          style={{ maxHeight: '85%', overflowY: 'auto' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="px-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Share Trip
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} color="#8E8E93" />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {tripName}
            </p>

            {/* Invite by Email */}
            <div className="mb-5">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', display: 'block', marginBottom: '10px' }}>
                Invite by Email
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
                  <Mail size={16} color="#8E8E93" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: '15px', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                    onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  />
                </div>
                {/* Access type selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowAccessMenu(!showAccessMenu)}
                    className="flex items-center gap-1 px-3 py-3 rounded-xl"
                    style={{ background: '#F2F2F7', whiteSpace: 'nowrap' }}
                  >
                    <span style={{ fontSize: '13px', color: '#000', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {accessType === 'READ_ONLY' ? 'Viewer' : 'Editor'}
                    </span>
                    <ChevronDown size={14} color="#8E8E93" />
                  </button>
                  {showAccessMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: '140px', zIndex: 10 }}>
                      {(['READ_ONLY', 'EDITOR'] as AccessType[]).map(type => (
                        <button
                          key={type}
                          onClick={() => { setAccessType(type); setShowAccessMenu(false); }}
                          className="w-full flex items-center justify-between px-4 py-3"
                          style={{ borderBottom: type === 'READ_ONLY' ? '0.5px solid #E5E5EA' : 'none' }}
                        >
                          <div className="text-left">
                            <p style={{ fontSize: '15px', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                              {type === 'READ_ONLY' ? 'Viewer' : 'Editor'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                              {type === 'READ_ONLY' ? 'Can view only' : 'Can edit'}
                            </p>
                          </div>
                          {accessType === type && <Check size={16} color="#007AFF" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleInvite}
                disabled={!email.trim()}
                className="w-full mt-3 py-3 rounded-xl flex items-center justify-center gap-2"
                style={{
                  background: email.trim() ? (inviteSent ? '#34C759' : 'linear-gradient(135deg, #007AFF, #0057E7)') : '#E5E5EA',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  transition: 'all 0.3s',
                }}
              >
                {inviteSent ? (
                  <><Check size={16} /> Invitation Sent!</>
                ) : (
                  <><UserPlus size={16} /> Send Invitation</>
                )}
              </button>
            </div>

            {/* Shared With */}
            {shared.length > 0 && (
              <div className="mb-5">
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', display: 'block', marginBottom: '10px' }}>
                  Shared With
                </label>
                <div className="rounded-xl overflow-hidden" style={{ border: '0.5px solid #E5E5EA' }}>
                  {shared.map((user, idx) => (
                    <div key={user.id} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: idx < shared.length - 1 ? '0.5px solid #E5E5EA' : 'none' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{user.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '15px', color: '#000', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                        <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                      </div>
                      <span className="px-2 py-1 rounded-md text-xs"
                        style={{
                          background: user.accessType === 'EDITOR' ? '#007AFF20' : '#34C75920',
                          color: user.accessType === 'EDITOR' ? '#007AFF' : '#34C759',
                          fontWeight: 600,
                          fontSize: '11px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        }}>
                        {user.accessType === 'EDITOR' ? 'Editor' : 'Viewer'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{
                background: '#F2F2F7',
                color: copied ? '#34C759' : '#007AFF',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                transition: 'all 0.3s',
              }}
            >
              {copied ? <><Check size={16} /> Link Copied!</> : <><Copy size={16} /> Copy Invite Link</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}