import { useState } from 'react';
import { X, MapPin, ChevronRight, Calendar } from 'lucide-react';
import { useApp, TripPlan } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface AddSegmentModalProps {
  trip: TripPlan;
  onClose: () => void;
}

export function AddSegmentModal({ trip, onClose }: AddSegmentModalProps) {
  const { addSegment } = useApp();

  // Infer last destination as default departure
  const lastSegment = trip.tripSegments[trip.tripSegments.length - 1];
  const defaultDeparture = lastSegment?.destination || '';
  const defaultArrival = lastSegment?.departureDate || '';

  const [departure, setDeparture] = useState(defaultDeparture);
  const [destination, setDestination] = useState('');
  const [arrivalDate, setArrivalDate] = useState(defaultArrival);
  const [departureDate, setDepartureDate] = useState('');

  const canCreate = departure.trim() && destination.trim() && arrivalDate && departureDate;

  const handleCreate = () => {
    if (!canCreate) return;
    addSegment(trip.id, {
      departure: departure.trim(),
      destination: destination.trim(),
      arrivalDate,
      departureDate,
      orderIndex: trip.tripSegments.length,
    });
    onClose();
  };

  const nights = arrivalDate && departureDate
    ? Math.max(0, Math.ceil((new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const SF = { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' };

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-50 flex flex-col justify-end"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-t-3xl"
          style={{ maxHeight: '88%', overflowY: 'auto' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="px-6 pb-10 pt-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', ...SF }}>
                  Add Destination
                </h2>
                <p style={{ fontSize: '13px', color: '#8E8E93', marginTop: '2px', ...SF }}>
                  Extend your trip with a new stop
                </p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} color="#8E8E93" />
              </button>
            </div>

            {/* Route preview pill */}
            {departure && destination && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-6"
                style={{ background: 'linear-gradient(135deg, #007AFF10, #5856D610)', border: '1px solid #007AFF20' }}
              >
                <MapPin size={14} color="#007AFF" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#007AFF', ...SF }}>
                  {departure}
                </span>
                <ChevronRight size={14} color="#8E8E93" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#5856D6', ...SF }}>
                  {destination}
                </span>
                {nights !== null && nights > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#8E8E93', ...SF }}>
                    {nights} night{nights !== 1 ? 's' : ''}
                  </span>
                )}
              </motion.div>
            )}

            {/* Fields */}
            <div className="space-y-4">
              {/* From */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px', ...SF }}>
                  From (departure city)
                </label>
                <div className="flex items-center gap-3 mt-2 px-4 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
                  <MapPin size={16} color="#8E8E93" />
                  <input
                    type="text"
                    value={departure}
                    onChange={e => setDeparture(e.target.value)}
                    placeholder="e.g. Paris"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: '16px', color: '#000', ...SF }}
                  />
                </div>
              </div>

              {/* To */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px', ...SF }}>
                  To (destination)
                </label>
                <div className="flex items-center gap-3 mt-2 px-4 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
                  <MapPin size={16} color="#007AFF" />
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="e.g. Amsterdam"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: '16px', color: '#000', ...SF }}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px', ...SF }}>
                    Arrival
                  </label>
                  <div className="flex items-center gap-2 mt-2 px-3 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
                    <Calendar size={15} color="#8E8E93" />
                    <input
                      type="date"
                      value={arrivalDate}
                      onChange={e => setArrivalDate(e.target.value)}
                      className="flex-1 bg-transparent outline-none"
                      style={{ fontSize: '14px', color: '#000', ...SF }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px', ...SF }}>
                    Departure
                  </label>
                  <div className="flex items-center gap-2 mt-2 px-3 py-3 rounded-xl" style={{ background: '#F2F2F7' }}>
                    <Calendar size={15} color="#8E8E93" />
                    <input
                      type="date"
                      value={departureDate}
                      min={arrivalDate}
                      onChange={e => setDepartureDate(e.target.value)}
                      className="flex-1 bg-transparent outline-none"
                      style={{ fontSize: '14px', color: '#000', ...SF }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Popular quick-add destinations */}
            <div className="mt-6">
              <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '10px', ...SF }}>
                Popular destinations
              </p>
              <div className="flex flex-wrap gap-2">
                {['Amsterdam', 'Prague', 'Vienna', 'Lisbon', 'Athens', 'Dublin', 'Budapest', 'Copenhagen'].map(city => (
                  <button
                    key={city}
                    onClick={() => setDestination(city)}
                    className="px-3 py-2 rounded-full"
                    style={{
                      background: destination === city ? '#007AFF' : '#F2F2F7',
                      color: destination === city ? '#fff' : '#000',
                      fontSize: '14px',
                      border: 'none',
                      ...SF,
                      transition: 'all 0.15s',
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <motion.button
              onClick={handleCreate}
              disabled={!canCreate}
              className="w-full mt-8 py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{
                background: canCreate ? 'linear-gradient(135deg, #007AFF, #0057E7)' : '#E5E5EA',
                color: canCreate ? '#fff' : '#8E8E93',
                fontSize: '17px',
                fontWeight: 600,
                border: 'none',
                ...SF,
                boxShadow: canCreate ? '0 4px 16px rgba(0,87,231,0.35)' : 'none',
                transition: 'all 0.2s',
              }}
              whileTap={canCreate ? { scale: 0.98 } : {}}
            >
              <MapPin size={18} />
              Add {destination || 'Destination'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
