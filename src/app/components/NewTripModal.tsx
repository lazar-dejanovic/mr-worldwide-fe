import { useState } from 'react';
import { X, ChevronRight, MapPin, Calendar, Plus, Trash2, Sparkles, Check } from 'lucide-react';
import { useApp, TripSegment } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

const INTEREST_OPTIONS = [
  { id: 'MUSEUMS', label: 'Museums', emoji: '🏛️', color: '#007AFF' },
  { id: 'NIGHTLIFE', label: 'Nightlife', emoji: '🌙', color: '#5856D6' },
  { id: 'HIKING', label: 'Hiking', emoji: '🥾', color: '#34C759' },
  { id: 'NATURE', label: 'Nature', emoji: '🌿', color: '#30D158' },
  { id: 'FOOD', label: 'Food & Dining', emoji: '🍽️', color: '#FF9500' },
  { id: 'SHOPPING', label: 'Shopping', emoji: '🛍️', color: '#FF2D55' },
  { id: 'BEACHES', label: 'Beaches', emoji: '🏖️', color: '#32ADE6' },
  { id: 'ARCHITECTURE', label: 'Architecture', emoji: '🏰', color: '#AC8E68' },
  { id: 'PHOTOGRAPHY', label: 'Photography', emoji: '📸', color: '#FF6B6B' },
  { id: 'ARTS', label: 'Arts & Culture', emoji: '🎭', color: '#AF52DE' },
];

interface SegmentDraft {
  id: string;
  departure: string;
  destination: string;
  arrivalDate: string;
  departureDate: string;
}

interface NewTripModalProps {
  onClose: () => void;
}

const SF = { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' };

export function NewTripModal({ onClose }: NewTripModalProps) {
  const { createTrip, addSegment } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: name, 1: destinations, 2: interests

  const [tripName, setTripName] = useState('');
  const [segments, setSegments] = useState<SegmentDraft[]>([
    { id: 'draft-0', departure: '', destination: '', arrivalDate: '', departureDate: '' },
  ]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addNewSegment = () => {
    const last = segments[segments.length - 1];
    setSegments(prev => [
      ...prev,
      {
        id: `draft-${Date.now()}`,
        departure: last?.destination || '',
        destination: '',
        arrivalDate: last?.departureDate || '',
        departureDate: '',
      },
    ]);
  };

  const updateSegment = (id: string, field: keyof SegmentDraft, value: string) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    // Auto-fill departure of next segment
    if (field === 'destination') {
      setSegments(prev => {
        const idx = prev.findIndex(s => s.id === id);
        if (idx < prev.length - 1) {
          return prev.map((s, i) => i === idx + 1 ? { ...s, departure: value } : s);
        }
        return prev;
      });
    }
    if (field === 'departureDate') {
      setSegments(prev => {
        const idx = prev.findIndex(s => s.id === id);
        if (idx < prev.length - 1 && !prev[idx + 1].arrivalDate) {
          return prev.map((s, i) => i === idx + 1 ? { ...s, arrivalDate: value } : s);
        }
        return prev;
      });
    }
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 1) return;
    setSegments(prev => prev.filter(s => s.id !== id));
  };

  const canProceedStep0 = tripName.trim().length >= 2;
  const canProceedStep1 = segments.some(s => s.destination.trim() && s.arrivalDate);

  const handleCreate = () => {
    if (!tripName.trim()) return;
    const trip = createTrip(tripName.trim(), selectedInterests);

    // Add segments
    segments.forEach((seg, idx) => {
      if (seg.destination.trim()) {
        addSegment(trip.id, {
          departure: seg.departure.trim() || 'Home',
          destination: seg.destination.trim(),
          arrivalDate: seg.arrivalDate,
          departureDate: seg.departureDate || seg.arrivalDate,
          orderIndex: idx,
        });
      }
    });

    onClose();
    navigate(`/trips/${trip.id}`);
  };

  const STEPS = [
    { title: 'Name your trip', subtitle: 'Give your adventure a memorable name' },
    { title: 'Add destinations', subtitle: 'Build your multi-stop itinerary' },
    { title: 'Travel interests', subtitle: 'Personalize your AI recommendations' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-50 flex flex-col justify-end"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-t-3xl flex flex-col"
          style={{ maxHeight: '92%' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="px-6 pt-2 pb-4 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{ fontSize: '22px', fontWeight: 700, color: '#000', ...SF }}
                  >
                    {STEPS[step].title}
                  </motion.h2>
                </AnimatePresence>
                <p style={{ fontSize: '13px', color: '#8E8E93', marginTop: '2px', ...SF }}>
                  {STEPS[step].subtitle}
                </p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 mt-1">
                <X size={16} color="#8E8E93" />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2 mt-4">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? '24px' : '6px',
                    height: '6px',
                    background: i <= step ? '#007AFF' : '#E5E5EA',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-6">
            <AnimatePresence mode="wait">
              {/* Step 0: Trip Name */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <input
                      type="text"
                      value={tripName}
                      onChange={e => setTripName(e.target.value)}
                      placeholder="e.g. European Summer Adventure"
                      autoFocus
                      className="w-full px-4 py-4 rounded-2xl outline-none"
                      style={{
                        background: '#F2F2F7',
                        border: 'none',
                        fontSize: '18px',
                        color: '#000',
                        ...SF,
                      }}
                      onKeyDown={e => e.key === 'Enter' && canProceedStep0 && setStep(1)}
                    />
                  </div>

                  {/* Trip name suggestions */}
                  <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '10px', ...SF }}>Quick suggestions</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      'European Summer Adventure',
                      'Asia Road Trip',
                      'Weekend Getaway',
                      'Beach Holiday 2026',
                      'Cultural Exploration',
                      'Mountain Escape',
                    ].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => setTripName(suggestion)}
                        className="px-3 py-2 rounded-xl text-sm"
                        style={{
                          background: tripName === suggestion ? '#007AFF' : '#F2F2F7',
                          color: tripName === suggestion ? '#fff' : '#000',
                          border: 'none',
                          fontSize: '13px',
                          ...SF,
                          transition: 'all 0.15s',
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Destinations */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-3 mb-4">
                    {segments.map((seg, idx) => (
                      <motion.div
                        key={seg.id}
                        className="bg-white rounded-2xl p-4"
                        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #F2F2F7' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, #007AFF, #0057E7)' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', ...SF }}>{idx + 1}</span>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#000', ...SF }}>Stop {idx + 1}</span>
                          </div>
                          {segments.length > 1 && (
                            <button onClick={() => removeSegment(seg.id)}>
                              <Trash2 size={14} color="#FF3B30" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <p style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px', ...SF, fontWeight: 600 }}>From</p>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#F2F2F7' }}>
                              <MapPin size={12} color="#8E8E93" />
                              <input
                                type="text"
                                value={seg.departure}
                                onChange={e => updateSegment(seg.id, 'departure', e.target.value)}
                                placeholder={idx === 0 ? 'Home city' : segments[idx - 1]?.destination || 'City'}
                                className="flex-1 bg-transparent outline-none"
                                style={{ fontSize: '14px', color: '#000', ...SF }}
                              />
                            </div>
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px', ...SF, fontWeight: 600 }}>To</p>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#F2F2F7' }}>
                              <MapPin size={12} color="#007AFF" />
                              <input
                                type="text"
                                value={seg.destination}
                                onChange={e => updateSegment(seg.id, 'destination', e.target.value)}
                                placeholder="Destination"
                                className="flex-1 bg-transparent outline-none"
                                style={{ fontSize: '14px', color: '#000', ...SF }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px', ...SF, fontWeight: 600 }}>Arrive</p>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#F2F2F7' }}>
                              <Calendar size={12} color="#8E8E93" />
                              <input
                                type="date"
                                value={seg.arrivalDate}
                                onChange={e => updateSegment(seg.id, 'arrivalDate', e.target.value)}
                                className="flex-1 bg-transparent outline-none"
                                style={{ fontSize: '13px', color: '#000', ...SF }}
                              />
                            </div>
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px', ...SF, fontWeight: 600 }}>Depart</p>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#F2F2F7' }}>
                              <Calendar size={12} color="#8E8E93" />
                              <input
                                type="date"
                                value={seg.departureDate}
                                min={seg.arrivalDate}
                                onChange={e => updateSegment(seg.id, 'departureDate', e.target.value)}
                                className="flex-1 bg-transparent outline-none"
                                style={{ fontSize: '13px', color: '#000', ...SF }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={addNewSegment}
                    className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 mb-6"
                    style={{ border: '2px dashed #C7C7CC', background: 'transparent', color: '#007AFF', fontSize: '15px', fontWeight: 600, ...SF }}
                  >
                    <Plus size={18} />
                    Add Another Stop
                  </button>
                </motion.div>
              )}

              {/* Step 2: Interests */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-wrap gap-2 mb-6">
                    {INTEREST_OPTIONS.map(opt => {
                      const active = selectedInterests.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleInterest(opt.id)}
                          className="flex items-center gap-2 px-4 py-3 rounded-2xl relative"
                          style={{
                            background: active ? opt.color : '#F2F2F7',
                            color: active ? '#fff' : '#000',
                            fontSize: '14px',
                            fontWeight: active ? 600 : 400,
                            border: 'none',
                            ...SF,
                            boxShadow: active ? `0 4px 12px ${opt.color}50` : 'none',
                            transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>{opt.emoji}</span>
                          {opt.label}
                          {active && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ background: '#fff', border: `2px solid ${opt.color}` }}>
                              <Check size={8} color={opt.color} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Summary preview */}
                  {tripName && (
                    <div className="rounded-2xl p-4 mb-6" style={{ background: 'linear-gradient(135deg, #007AFF10, #5856D610)', border: '1px solid #007AFF20' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} color="#007AFF" />
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#007AFF', ...SF }}>Trip Summary</p>
                      </div>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: '#000', marginBottom: '4px', ...SF }}>{tripName}</p>
                      {segments.filter(s => s.destination).length > 0 && (
                        <p style={{ fontSize: '13px', color: '#8E8E93', ...SF }}>
                          {segments.filter(s => s.destination).map(s => s.destination).join(' → ')}
                        </p>
                      )}
                      {selectedInterests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedInterests.map(i => {
                            const opt = INTEREST_OPTIONS.find(o => o.id === i);
                            return (
                              <span key={i} className="px-2 py-0.5 rounded-md text-xs"
                                style={{ background: opt?.color || '#007AFF', color: '#fff', ...SF }}>
                                {opt?.emoji} {opt?.label || i}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '0.5px solid #F2F2F7' }}>
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="py-4 px-6 rounded-2xl"
                  style={{
                    background: '#F2F2F7',
                    color: '#000',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: 'none',
                    ...SF,
                  }}
                >
                  Back
                </button>
              )}

              {step < 2 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl"
                  style={{
                    background: (step === 0 ? canProceedStep0 : canProceedStep1)
                      ? 'linear-gradient(135deg, #007AFF, #0057E7)'
                      : '#E5E5EA',
                    color: (step === 0 ? canProceedStep0 : canProceedStep1) ? '#fff' : '#8E8E93',
                    fontSize: '17px',
                    fontWeight: 600,
                    border: 'none',
                    ...SF,
                    transition: 'all 0.2s',
                    boxShadow: (step === 0 ? canProceedStep0 : canProceedStep1) ? '0 4px 16px rgba(0,87,231,0.35)' : 'none',
                  }}
                >
                  Continue
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #007AFF, #0057E7)',
                    color: '#fff',
                    fontSize: '17px',
                    fontWeight: 600,
                    border: 'none',
                    ...SF,
                    boxShadow: '0 4px 16px rgba(0,87,231,0.35)',
                  }}
                >
                  <Sparkles size={18} />
                  Create Trip
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
