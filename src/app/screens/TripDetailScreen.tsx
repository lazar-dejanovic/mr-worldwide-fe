import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ChevronLeft, Share2, Plane, Car, Hotel, Calendar,
  ChevronRight, MapPin, Clock, Sparkles, CheckCircle2,
  AlertCircle, Plus, MoreHorizontal, Train, DollarSign
} from 'lucide-react';
import { useApp, TripSegment, TripPlan, TripPlanStatus } from '../context/AppContext';
import { ShareModal } from '../components/ShareModal';
import { AIChatOverlay } from '../components/AIChatOverlay';
import { AddSegmentModal } from '../components/AddSegmentModal';
import { motion } from 'motion/react';

const STATUS_CONFIG: Record<TripPlanStatus, { color: string; bg: string; label: string; next?: TripPlanStatus }> = {
  DRAFT: { color: '#8E8E93', bg: '#8E8E9320', label: 'Draft', next: 'PLANNED' },
  PLANNED: { color: '#007AFF', bg: '#007AFF20', label: 'Planned', next: 'BOOKED' },
  BOOKED: { color: '#34C759', bg: '#34C75920', label: 'Booked', next: 'COMPLETED' },
  COMPLETED: { color: '#FF9500', bg: '#FF950020', label: 'Completed' },
};

function SegmentCard({ segment, tripId, isLast, nextSegment }: { segment: TripSegment; tripId: string; isLast: boolean; nextSegment?: TripSegment }) {
  const navigate = useNavigate();
  const hasTransport = !!segment.transport;
  const hasAccommodation = !!segment.accommodation;
  const activityCount = segment.dailyItineraries.length;
  const dateContinuity = !nextSegment || segment.departureDate === nextSegment.arrivalDate;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const nights = segment.arrivalDate && segment.departureDate
    ? Math.ceil((new Date(segment.departureDate).getTime() - new Date(segment.arrivalDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const TransportIcon = segment.transport?.transportType === 'VEHICLE'
    ? Car
    : segment.transport?.transportType === 'TRAIN'
      ? Train
      : Plane;

  const transportColor = hasTransport ? '#007AFF' : '#8E8E93';

  return (
    <div className="relative flex">
      {/* Timeline line */}
      <div className="flex flex-col items-center mr-4" style={{ width: '32px', flexShrink: 0 }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{ background: 'linear-gradient(135deg, #007AFF, #0057E7)', boxShadow: '0 2px 8px rgba(0,87,231,0.4)', flexShrink: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{segment.orderIndex + 1}</span>
        </div>
        {!isLast && (
          <div className="flex-1 w-0.5 my-1" style={{ background: dateContinuity ? '#007AFF40' : '#FF3B3040', minHeight: '20px' }} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 mb-4">
        {/* Segment Header */}
        <motion.div
          className="bg-white rounded-2xl overflow-hidden mb-1"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Destination Header */}
          <div className="px-4 py-4" style={{ borderBottom: '0.5px solid #F2F2F7' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={13} color="#8E8E93" />
                  <span style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {segment.departure}
                  </span>
                  <ChevronRight size={12} color="#8E8E93" />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '1.1' }}>
                  {segment.destination}
                </h3>
              </div>
              <div className="text-right">
                <p style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{formatDate(segment.arrivalDate)}</p>
                <p style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>→ {formatDate(segment.departureDate)}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#007AFF', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', marginTop: '2px' }}>{nights} nights</p>
              </div>
            </div>
          </div>

          {/* Transport Row */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '0.5px solid #F2F2F7' }}
            onClick={() => navigate(`/trips/${tripId}/segments/${segment.id}/transport`)}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: hasTransport ? '#007AFF15' : '#F2F2F7' }}>
              <TransportIcon size={16} color={transportColor} />
            </div>
            <div className="flex-1 text-left">
              {hasTransport ? (
                <>
                  {segment.transport?.airplaneTransport && (
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {segment.transport.airplaneTransport.carrier} · {segment.transport.airplaneTransport.flightNumber}
                    </p>
                  )}
                  {segment.transport?.vehicleTransport && (
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      Own Vehicle · {segment.transport.vehicleTransport.distanceKm} km
                    </p>
                  )}
                  {segment.transport?.trainTransport && (
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {segment.transport.trainTransport.operator} · {segment.transport.trainTransport.trainNumber}
                    </p>
                  )}
                  <p style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {segment.transport?.airplaneTransport
                      ? `${segment.transport.airplaneTransport.originIATA} → ${segment.transport.airplaneTransport.destinationIATA} · ${segment.transport.airplaneTransport.duration}`
                      : segment.transport?.trainTransport
                        ? `${segment.transport.trainTransport.originStation.split(' ')[0]} → ${segment.transport.trainTransport.destinationStation.split(' ')[0]} · ${segment.transport.trainTransport.duration}`
                        : `Est. fuel ${segment.transport?.vehicleTransport?.estimatedFuelCost}€`}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '14px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Add Transport
                </p>
              )}
            </div>
            {hasTransport ? (
              <CheckCircle2 size={16} color="#34C759" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Plus size={12} color="#8E8E93" />
              </div>
            )}
            <ChevronRight size={14} color="#C7C7CC" />
          </button>

          {/* Accommodation Row */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '0.5px solid #F2F2F7' }}
            onClick={() => navigate(`/trips/${tripId}/segments/${segment.id}/accommodation`)}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: hasAccommodation ? '#34C75915' : '#F2F2F7' }}>
              <Hotel size={16} color={hasAccommodation ? '#34C759' : '#8E8E93'} />
            </div>
            <div className="flex-1 text-left">
              {hasAccommodation ? (
                <>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {segment.accommodation!.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {'⭐'.repeat(Math.floor(segment.accommodation!.starRating || 0))} · €{segment.accommodation!.priceTotal}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '14px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Add Accommodation
                </p>
              )}
            </div>
            {hasAccommodation ? (
              <CheckCircle2 size={16} color="#34C759" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Plus size={12} color="#8E8E93" />
              </div>
            )}
            <ChevronRight size={14} color="#C7C7CC" />
          </button>

          {/* Activities Row */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3"
            onClick={() => navigate(`/trips/${tripId}/segments/${segment.id}/itinerary`)}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: activityCount > 0 ? '#FF950015' : '#F2F2F7' }}>
              <Calendar size={16} color={activityCount > 0 ? '#FF9500' : '#8E8E93'} />
            </div>
            <div className="flex-1 text-left">
              {activityCount > 0 ? (
                <>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {activityCount} Activities Planned
                  </p>
                  <p style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                    AI-generated itinerary ready
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '14px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Generate Daily Itinerary
                </p>
              )}
            </div>
            {activityCount > 0 ? (
              <span className="px-2 py-1 rounded-md" style={{ background: '#FF950020', color: '#FF9500', fontSize: '12px', fontWeight: 700, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                {activityCount}
              </span>
            ) : (
              <div className="flex items-center gap-1" style={{ color: '#007AFF', fontSize: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                <Sparkles size={12} /> AI
              </div>
            )}
            <ChevronRight size={14} color="#C7C7CC" />
          </button>
        </motion.div>

        {/* Date Continuity Indicator */}
        {!isLast && !dateContinuity && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl mt-1 mb-2"
            style={{ background: '#FF3B3010', border: '1px solid #FF3B3030' }}>
            <AlertCircle size={13} color="#FF3B30" />
            <span style={{ fontSize: '12px', color: '#FF3B30', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              Date gap between this segment and the next
            </span>
          </div>
        )}
        {!isLast && dateContinuity && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl mt-1 mb-2"
            style={{ background: '#34C75910' }}>
            <CheckCircle2 size={12} color="#34C759" />
            <span style={{ fontSize: '11px', color: '#34C759', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              Dates connect seamlessly to next stop
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function BudgetSummary({ trip }: { trip: TripPlan }) {
  const transportTotal = trip.tripSegments.reduce((sum, s) => {
    if (s.transport?.airplaneTransport) return sum + s.transport.airplaneTransport.price;
    if (s.transport?.trainTransport) return sum + s.transport.trainTransport.price;
    if (s.transport?.vehicleTransport) return sum + s.transport.vehicleTransport.estimatedFuelCost + s.transport.vehicleTransport.tollCost;
    return sum;
  }, 0);

  const accommodationTotal = trip.tripSegments.reduce((sum, s) =>
    sum + (s.accommodation?.priceTotal || 0), 0);

  const total = transportTotal + accommodationTotal;
  const segmentsWithTransport = trip.tripSegments.filter(s => s.transport).length;
  const segmentsWithAccommodation = trip.tripSegments.filter(s => s.accommodation).length;

  if (total === 0) return null;

  const SF = { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' };

  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden mb-4"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '0.5px solid #F2F2F7' }}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#34C75915' }}>
          <DollarSign size={14} color="#34C759" />
        </div>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#000', ...SF }}>Budget Estimate</p>
        <span className="ml-auto px-2 py-0.5 rounded-md" style={{ background: '#34C75920', color: '#34C759', fontSize: '11px', fontWeight: 700, ...SF }}>
          TRACKED
        </span>
      </div>

      <div className="px-4 py-3 flex gap-4" style={{ borderBottom: '0.5px solid #F2F2F7' }}>
        {/* Transport */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Plane size={12} color="#007AFF" />
            <p style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.3px', ...SF, fontWeight: 600 }}>
              Transport
            </p>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#000', ...SF }}>
            €{transportTotal.toLocaleString()}
          </p>
          <p style={{ fontSize: '11px', color: '#8E8E93', ...SF }}>
            {segmentsWithTransport}/{trip.tripSegments.length} segments
          </p>
        </div>

        <div style={{ width: '0.5px', background: '#F2F2F7' }} />

        {/* Accommodation */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Hotel size={12} color="#34C759" />
            <p style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.3px', ...SF, fontWeight: 600 }}>
              Stays
            </p>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#000', ...SF }}>
            €{accommodationTotal.toLocaleString()}
          </p>
          <p style={{ fontSize: '11px', color: '#8E8E93', ...SF }}>
            {segmentsWithAccommodation}/{trip.tripSegments.length} segments
          </p>
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <p style={{ fontSize: '14px', color: '#8E8E93', ...SF }}>Estimated total</p>
        <p style={{ fontSize: '22px', fontWeight: 800, color: '#000', ...SF }}>
          €{total.toLocaleString()}
          <span style={{ fontSize: '12px', fontWeight: 400, color: '#8E8E93', marginLeft: '3px' }}>/ person</span>
        </p>
      </div>
    </motion.div>
  );
}

export default function TripDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trips, updateTripStatus } = useApp();
  const [showShare, setShowShare] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showAddSegment, setShowAddSegment] = useState(false);

  const trip = trips.find(t => t.id === id);
  if (!trip) return (
    <div className="flex flex-col items-center justify-center h-full">
      <p style={{ color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Trip not found</p>
      <button onClick={() => navigate('/')} style={{ color: '#007AFF', marginTop: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Go back</button>
    </div>
  );

  const statusCfg = STATUS_CONFIG[trip.status];
  const nextStatus = statusCfg.next;

  const formatDateRange = (s: string, e: string) => {
    if (!s) return '';
    const start = new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = e ? new Date(e).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    return `${start} – ${end}`;
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F2F2F7]">
      {/* Hero Header */}
      <div className="relative" style={{ height: '220px', flexShrink: 0 }}>
        <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${trip.gradientFrom}80 0%, ${trip.gradientTo}F0 100%)` }} />

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
            <ChevronLeft size={20} color="#fff" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => setShowAI(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
              <Sparkles size={18} color="#fff" />
            </button>
            <button onClick={() => setShowShare(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
              <Share2 size={18} color="#fff" />
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
              <MoreHorizontal size={18} color="#fff" />
            </button>
          </div>
        </div>

        {/* Trip Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded-md"
              style={{ background: statusCfg.bg, color: statusCfg.color, fontSize: '11px', fontWeight: 700, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
              {statusCfg.label.toUpperCase()}
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '1.2', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {trip.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Clock size={12} color="rgba(255,255,255,0.8)" />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4">
        {/* Destinations strip */}
        <div className="bg-white rounded-2xl px-4 py-3 mb-4 flex items-center gap-2"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <MapPin size={14} color="#007AFF" />
          <div className="flex-1 overflow-hidden">
            <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trip.destinations.join(' → ')}
            </p>
          </div>
          {nextStatus && (
            <button
              onClick={() => updateTripStatus(trip.id, nextStatus)}
              className="px-3 py-1 rounded-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #007AFF, #0057E7)', color: '#fff', fontSize: '12px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', border: 'none' }}>
              Mark as {STATUS_CONFIG[nextStatus].label}
            </button>
          )}
        </div>

        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            Trip Segments
          </h2>
          <span style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            {trip.tripSegments.length} stops
          </span>
        </div>

        {/* Budget Summary */}
        <BudgetSummary trip={trip} />

        {/* Segments Timeline */}
        {trip.tripSegments.length > 0 ? (
          <div>
            {trip.tripSegments.map((segment, idx) => (
              <SegmentCard
                key={segment.id}
                segment={segment}
                tripId={trip.id}
                isLast={idx === trip.tripSegments.length - 1}
                nextSegment={trip.tripSegments[idx + 1]}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <MapPin size={36} color="#C7C7CC" />
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#000', marginTop: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>No segments yet</p>
            <p style={{ fontSize: '13px', color: '#8E8E93', textAlign: 'center', marginTop: '6px', maxWidth: '200px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              Add destinations to build your trip timeline
            </p>
          </div>
        )}

        {/* Add Segment Button */}
        <button
          onClick={() => setShowAddSegment(true)}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mb-6"
          style={{ border: '2px dashed #C7C7CC', background: 'transparent', color: '#007AFF', fontSize: '15px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          <Plus size={18} />
          Add Next Destination
        </button>
      </div>

      {/* Modals */}
      {showShare && <ShareModal tripId={trip.id} tripName={trip.name} onClose={() => setShowShare(false)} />}
      {showAI && <AIChatOverlay tripId={trip.id} onClose={() => setShowAI(false)} />}
      {showAddSegment && <AddSegmentModal trip={trip} onClose={() => setShowAddSegment(false)} />}
    </div>
  );
}