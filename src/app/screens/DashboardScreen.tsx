import { useNavigate } from 'react-router';
import { ChevronRight, MapPin, Calendar, Globe, Sparkles, Bell, Plus } from 'lucide-react';
import { useApp, TripPlan, TripPlanStatus } from '../context/AppContext';
import { motion } from 'motion/react';
import { useState } from 'react';
import { NewTripModal } from '../components/NewTripModal';

const STATUS_STYLES: Record<TripPlanStatus, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: '#8E8E9320', color: '#8E8E93', label: 'Draft' },
  PLANNED: { bg: '#007AFF20', color: '#007AFF', label: 'Planned' },
  BOOKED: { bg: '#34C75920', color: '#34C759', label: 'Booked' },
  COMPLETED: { bg: '#FF950020', color: '#FF9500', label: 'Completed' },
};

function StatusBadge({ status }: { status: TripPlanStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className="px-2 py-1 rounded-md"
      style={{
        background: style.bg,
        color: style.color,
        fontSize: '11px',
        fontWeight: 700,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        letterSpacing: '0.2px',
      }}>
      {style.label.toUpperCase()}
    </span>
  );
}

function TripCard({ trip, index }: { trip: TripPlan; index: number }) {
  const navigate = useNavigate();
  const daysUntil = Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const duration = trip.startDate && trip.endDate
    ? Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="rounded-3xl overflow-hidden cursor-pointer mb-4"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
    >
      {/* Image + Gradient */}
      <div className="relative" style={{ height: '160px' }}>
        <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${trip.gradientFrom}30 0%, ${trip.gradientTo}CC 100%)` }} />

        {/* Status + Destinations count */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <StatusBadge status={trip.status} />
          {daysUntil > 0 && daysUntil < 90 && (
            <span className="px-2 py-1 rounded-md"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', backdropFilter: 'blur(4px)' }}>
              {daysUntil}d away
            </span>
          )}
        </div>

        {/* Trip name overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '1.2', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            {trip.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="bg-white px-4 py-3">
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={12} color="#8E8E93" />
          <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            {trip.destinations.join(' → ')}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {trip.startDate && (
              <div className="flex items-center gap-1">
                <Calendar size={12} color="#8E8E93" />
                <span style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {formatDate(trip.startDate)}
                </span>
              </div>
            )}
            {duration && (
              <span style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                • {duration} days
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span style={{ fontSize: '13px', color: '#007AFF', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {trip.tripSegments.length} stops
            </span>
            <ChevronRight size={14} color="#007AFF" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AIBannerCard() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl p-4 mb-5 flex items-center gap-4 cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, #0057E7 0%, #5856D6 100%)',
        boxShadow: '0 4px 20px rgba(0,87,231,0.35)',
      }}
      onClick={() => navigate(`/trips/trip-001`)}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <Sparkles size={22} color="#fff" />
      </div>
      <div className="flex-1">
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', marginBottom: '2px' }}>
          AI SUGGESTED
        </p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          Paris June itinerary is ready!
        </p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          10 activities planned across 5 days
        </p>
      </div>
      <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
    </motion.div>
  );
}

export default function DashboardScreen() {
  const { trips, currentUser } = useApp();
  const navigate = useNavigate();
  const [showNewTrip, setShowNewTrip] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const activeTrips = trips.filter(t => t.status === 'PLANNED' || t.status === 'BOOKED');
  const draftTrips = trips.filter(t => t.status === 'DRAFT');

  return (
    <div className="bg-[#F2F2F7] min-h-full pb-4">
      {/* Header */}
      <div className="bg-[#F2F2F7] px-5 pt-2 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: '15px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {getGreeting()},
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '1.2', marginTop: '2px' }}>
              {currentUser?.firstName || 'Traveler'} ✈️
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Bell size={18} color="#000" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #007AFF, #0057E7)' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                {currentUser?.firstName?.[0] || 'A'}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 mt-4">
          {[
            { label: 'Trips', value: trips.length, icon: '🧳' },
            { label: 'Countries', value: 12, icon: '🌍' },
            { label: 'Days', value: 87, icon: '📅' },
          ].map(stat => (
            <div key={stat.label} className="flex-1 bg-white rounded-2xl px-3 py-3 text-center"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '20px' }}>{stat.icon}</p>
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5">
        {/* AI Banner */}
        <AIBannerCard />

        {/* Active Trips */}
        {activeTrips.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Active Trips
              </h2>
              <button className="flex items-center gap-1" style={{ color: '#007AFF', fontSize: '14px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                See all <ChevronRight size={14} />
              </button>
            </div>
            {activeTrips.map((trip, idx) => (
              <TripCard key={trip.id} trip={trip} index={idx} />
            ))}
          </div>
        )}

        {/* Draft Trips */}
        {draftTrips.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                Drafts
              </h2>
            </div>
            {draftTrips.map((trip, idx) => (
              <TripCard key={trip.id} trip={trip} index={idx + activeTrips.length} />
            ))}
          </div>
        )}

        {trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Globe size={56} color="#C7C7CC" strokeWidth={1} />
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#000', marginTop: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>No trips yet</p>
            <p style={{ fontSize: '14px', color: '#8E8E93', textAlign: 'center', marginTop: '8px', maxWidth: '220px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              Tap the + button to create your first AI-powered trip plan
            </p>
            <button
              onClick={() => setShowNewTrip(true)}
              className="mt-5 flex items-center gap-2 px-6 py-3 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #007AFF, #0057E7)', color: '#fff', fontSize: '15px', fontWeight: 600, border: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', boxShadow: '0 4px 16px rgba(0,87,231,0.35)' }}
            >
              <Plus size={18} /> Plan My First Trip
            </button>
          </div>
        )}
      </div>

      {showNewTrip && <NewTripModal onClose={() => setShowNewTrip(false)} />}
    </div>
  );
}