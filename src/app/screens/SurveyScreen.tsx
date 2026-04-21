import { useState } from 'react';
import { useNavigate } from 'react-router';
import { apiUpdatePreferences, apiCreatePreferences } from '../api/preferences';
import { ChevronRight, ChevronLeft, Check, Sparkles, MapPin, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
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
  { id: 'WELLNESS', label: 'Wellness & Spa', emoji: '🧘', color: '#64D2FF' },
  { id: 'SPORTS', label: 'Water Sports', emoji: '⛵', color: '#0A84FF' },
];

const HOBBY_SUGGESTIONS = ['Photography', 'Reading', 'Cooking', 'Yoga', 'Cycling', 'Swimming', 'Writing', 'Painting', 'Music', 'Dancing'];
const DEST_SUGGESTIONS = ['Japan', 'Italy', 'France', 'New Zealand', 'Greece', 'Thailand', 'Iceland', 'Peru', 'Morocco', 'Canada'];

export default function SurveyScreen() {
  const { savePreferences, currentUser } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [interests, setInterests] = useState<string[]>(currentUser?.userTripPreference?.interests || []);
  const [hobbies, setHobbies] = useState<string[]>(currentUser?.userTripPreference?.hobbies || []);
  const [destinations, setDestinations] = useState<string[]>(currentUser?.userTripPreference?.favouriteDestinations || []);
  const [hobbyInput, setHobbyInput] = useState('');
  const [destInput, setDestInput] = useState('');

  const STEPS = [
    { title: 'What are your\ntravel interests?', subtitle: 'Select all that apply — we\'ll personalize your AI recommendations' },
    { title: 'Any hobbies or\npassions?', subtitle: 'This helps us find activities you\'ll love' },
    { title: 'Favourite\ndestinations?', subtitle: 'Places you\'ve loved or always dreamed of visiting' },
    { title: 'You\'re all set!', subtitle: 'Your AI travel profile is ready' },
  ];

  const toggleInterest = (id: string) => {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addHobby = (h: string) => {
    if (h.trim() && !hobbies.includes(h.trim())) setHobbies(prev => [...prev, h.trim()]);
    setHobbyInput('');
  };

  const addDest = (d: string) => {
    if (d.trim() && !destinations.includes(d.trim())) setDestinations(prev => [...prev, d.trim()]);
    setDestInput('');
  };

  const canProceed = () => {
    if (step === 0) return interests.length > 0;
    return true;
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log('step 3, saving preferences...');
      console.log({ interests, hobbies, favouriteDestinations: destinations });
      savePreferences({ interests, hobbies, favouriteDestinations: destinations });
      try {
        await apiCreatePreferences({
          interests,
          hobbies,
          favouriteDestinations: destinations,
        });
        console.log('preferences saved!');
      } catch (err) {
        console.error('Failed to save preferences:', err);
      }
      navigate('/');
    }
  };

  const progress = ((step + 1) / 4) * 100;

  return (
    <div className="h-full flex flex-col" style={{ background: '#fff' }}>
      {/* Header */}
      <div className="px-6 pt-4 pb-2">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <ChevronLeft size={18} color="#000" />
            </button>
          )}
          <div className="flex-1 h-1 rounded-full bg-gray-100">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #007AFF, #5856D6)' }}
              initial={{ width: '25%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <span style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', minWidth: '32px', textAlign: 'right' }}>
            {step + 1}/4
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#000',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              lineHeight: '1.2',
              whiteSpace: 'pre-line',
              marginBottom: '8px',
            }}>
              {STEPS[step].title}
            </h1>
            <p style={{ fontSize: '15px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {STEPS[step].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-wrap gap-3">
                {INTEREST_OPTIONS.map(opt => {
                  const active = interests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleInterest(opt.id)}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl transition-all"
                      style={{
                        background: active ? opt.color : '#F2F2F7',
                        color: active ? '#fff' : '#000',
                        border: active ? 'none' : 'none',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '15px',
                        fontWeight: active ? 600 : 400,
                        boxShadow: active ? `0 4px 12px ${opt.color}50` : 'none',
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{opt.emoji}</span>
                      {opt.label}
                      {active && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: '#fff', border: `2px solid ${opt.color}` }}>
                          <Check size={10} color={opt.color} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {interests.length > 0 && (
                <p style={{ fontSize: '13px', color: '#007AFF', marginTop: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {interests.length} interest{interests.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Input */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
                  <input
                    type="text"
                    placeholder="Type a hobby..."
                    value={hobbyInput}
                    onChange={e => setHobbyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addHobby(hobbyInput)}
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: '15px', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                  />
                </div>
                <button onClick={() => addHobby(hobbyInput)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #007AFF, #0057E7)' }}>
                  <ChevronRight size={20} color="#fff" />
                </button>
              </div>

              {/* Added hobbies */}
              {hobbies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {hobbies.map(h => (
                    <span key={h} className="flex items-center gap-1 px-3 py-2 rounded-full"
                      style={{ background: '#007AFF', color: '#fff', fontSize: '14px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {h}
                      <button onClick={() => setHobbies(prev => prev.filter(x => x !== h))}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '10px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {HOBBY_SUGGESTIONS.filter(h => !hobbies.includes(h)).map(h => (
                  <button key={h} onClick={() => addHobby(h)}
                    className="px-3 py-2 rounded-full"
                    style={{ background: '#F2F2F7', color: '#000', fontSize: '14px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', border: 'none' }}>
                    + {h}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex gap-2 mb-4">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
                  <MapPin size={16} color="#8E8E93" />
                  <input
                    type="text"
                    placeholder="Add a destination..."
                    value={destInput}
                    onChange={e => setDestInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addDest(destInput)}
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: '15px', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                  />
                </div>
                <button onClick={() => addDest(destInput)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #007AFF, #0057E7)' }}>
                  <ChevronRight size={20} color="#fff" />
                </button>
              </div>

              {destinations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {destinations.map(d => (
                    <span key={d} className="flex items-center gap-1 px-3 py-2 rounded-full"
                      style={{ background: '#007AFF', color: '#fff', fontSize: '14px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      📍 {d}
                      <button onClick={() => setDestinations(prev => prev.filter(x => x !== d))}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '10px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Popular picks</p>
              <div className="flex flex-wrap gap-2">
                {DEST_SUGGESTIONS.filter(d => !destinations.includes(d)).map(d => (
                  <button key={d} onClick={() => addDest(d)}
                    className="px-3 py-2 rounded-full"
                    style={{ background: '#F2F2F7', color: '#000', fontSize: '14px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', border: 'none' }}>
                    + {d}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="flex flex-col items-center text-center pt-6"
            >
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles size={40} color="#fff" />
              </motion.div>

              <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#000', marginBottom: '8px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Profile Created!
              </h3>
              <p style={{ fontSize: '15px', color: '#8E8E93', marginBottom: '32px', maxWidth: '260px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Your AI assistant is ready to plan amazing trips based on your preferences.
              </p>

              <div className="w-full rounded-2xl p-5" style={{ background: '#F2F2F7' }}>
                <div className="mb-4">
                  <p style={{ fontSize: '12px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {interests.map(i => {
                      const opt = INTEREST_OPTIONS.find(o => o.id === i);
                      return <span key={i} className="px-2 py-1 rounded-lg text-xs" style={{ background: opt?.color || '#007AFF', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{opt?.emoji} {opt?.label || i}</span>;
                    })}
                  </div>
                </div>
                {destinations.length > 0 && (
                  <div>
                    <p style={{ fontSize: '12px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>Dream Destinations</p>
                    <div className="flex flex-wrap gap-1">
                      {destinations.map(d => <span key={d} className="px-2 py-1 rounded-lg text-xs" style={{ background: '#E5E5EA', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>📍 {d}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Button */}
      <div className="px-6 py-4" style={{ borderTop: '0.5px solid #E5E5EA' }}>
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: canProceed() ? 'linear-gradient(135deg, #007AFF, #0057E7)' : '#E5E5EA',
            color: canProceed() ? '#fff' : '#8E8E93',
            fontSize: '17px',
            fontWeight: 600,
            border: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            transition: 'all 0.2s',
            boxShadow: canProceed() ? '0 4px 16px rgba(0,87,231,0.35)' : 'none',
          }}
        >
          {step === 3 ? 'Start Planning' : 'Continue'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
