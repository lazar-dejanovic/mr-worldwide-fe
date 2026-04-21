import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Sparkles, Clock, MapPin, Plus } from 'lucide-react';
import { useApp, DailyItinerary } from '../context/AppContext';
import { AIChatOverlay } from '../components/AIChatOverlay';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  MUSEUM: { bg: '#007AFF15', color: '#007AFF' },
  FOOD: { bg: '#FF950015', color: '#FF9500' },
  LANDMARK: { bg: '#5856D615', color: '#5856D6' },
  NATURE: { bg: '#34C75915', color: '#34C759' },
  NIGHTLIFE: { bg: '#FF2D5515', color: '#FF2D55' },
  SHOPPING: { bg: '#FF6B6B15', color: '#FF6B6B' },
  ACTIVITY: { bg: '#32ADE615', color: '#32ADE6' },
  BEACH: { bg: '#0A84FF15', color: '#0A84FF' },
};

function ActivityCard({ activity, index }: { activity: DailyItinerary; index: number }) {
  const catStyle = CATEGORY_COLORS[activity.category] || { bg: '#8E8E9315', color: '#8E8E93' };
  const [startH, startM] = activity.startTime.split(':').map(Number);
  const [endH, endM] = activity.endTime.split(':').map(Number);
  const durationMin = (endH * 60 + endM) - (startH * 60 + startM);
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;
  const durationStr = hours > 0 ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`) : `${mins}m`;

  return (
    <motion.div
      className="flex gap-3 mb-4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      {/* Time Column */}
      <div className="flex flex-col items-center" style={{ width: '52px', flexShrink: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1 }}>
          {activity.startTime}
        </p>
        <div className="flex-1 w-0.5 my-1 rounded-full" style={{ background: catStyle.color + '40', minHeight: '12px' }} />
        <p style={{ fontSize: '11px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          {activity.endTime}
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 rounded-2xl p-4"
        style={{
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderLeft: `3px solid ${catStyle.color}`,
        }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <span style={{ fontSize: '20px' }}>{activity.emoji}</span>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '1.2' }}>
              {activity.name}
            </h4>
          </div>
          <span className="px-2 py-1 rounded-md flex-shrink-0"
            style={{ background: catStyle.bg, color: catStyle.color, fontSize: '10px', fontWeight: 700, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '0.3px' }}>
            {activity.category}
          </span>
        </div>

        {activity.address && (
          <div className="flex items-start gap-1 mb-2">
            <MapPin size={12} color="#8E8E93" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '1.4' }}>
              {activity.address}
            </p>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Clock size={11} color="#C7C7CC" />
          <span style={{ fontSize: '12px', color: '#C7C7CC', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            {durationStr}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ItineraryScreen() {
  const { id, segmentId } = useParams<{ id: string; segmentId: string }>();
  const navigate = useNavigate();
  const { trips } = useApp();
  const [showAI, setShowAI] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const trip = trips.find(t => t.id === id);
  const segment = trip?.tripSegments.find(s => s.id === segmentId);

  if (!segment) return (
    <div className="flex items-center justify-center h-full">
      <p style={{ color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Segment not found</p>
    </div>
  );

  // Build unique days
  const allDays = Array.from(new Set(segment.dailyItineraries.map(a => a.day))).sort();
  if (!selectedDay && allDays.length > 0) {
    // Init to first day (useEffect would be ideal, but this works for initialization)
  }
  const activeDayKey = selectedDay || allDays[0] || '';

  const activitiesForDay = segment.dailyItineraries
    .filter(a => a.day === activeDayKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayNum = Math.ceil((date.getTime() - new Date(segment.arrivalDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { dayNum, weekday: date.toLocaleDateString('en-US', { weekday: 'short' }), date: date.getDate() };
  };

  return (
    <div className="flex flex-col bg-[#F2F2F7]" style={{ height: '100%', position: 'relative' }}>
      {/* Nav */}
      <div className="bg-white px-4 py-3 flex items-center gap-3" style={{ boxShadow: '0 0.5px 0 rgba(0,0,0,0.1)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronLeft size={18} color="#000" />
        </button>
        <div className="flex-1">
          <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            {segment.destination}
          </h1>
          <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            {segment.arrivalDate} – {segment.departureDate}
          </p>
        </div>
        <button
          onClick={() => setShowAI(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', border: 'none' }}>
          <Sparkles size={14} color="#fff" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>AI</span>
        </button>
      </div>

      {/* Day Selector */}
      {allDays.length > 0 ? (
        <div className="bg-white overflow-x-auto"
          style={{ boxShadow: '0 0.5px 0 rgba(0,0,0,0.1)', scrollbarWidth: 'none' }}>
          <div className="flex px-4 py-3 gap-2">
            {allDays.map(day => {
              const { dayNum, weekday, date } = formatDayLabel(day);
              const active = (activeDayKey === day);
              const dayActivities = segment.dailyItineraries.filter(a => a.day === day).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col items-center rounded-2xl px-3 py-2 flex-shrink-0"
                  style={{
                    background: active ? 'linear-gradient(135deg, #007AFF, #0057E7)' : '#F2F2F7',
                    minWidth: '56px',
                    transition: 'all 0.2s',
                    border: 'none',
                    boxShadow: active ? '0 2px 8px rgba(0,87,231,0.3)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '11px', color: active ? 'rgba(255,255,255,0.8)' : '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {weekday}
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: active ? '#fff' : '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '1.1' }}>
                    {date}
                  </span>
                  <span style={{ fontSize: '10px', color: active ? 'rgba(255,255,255,0.7)' : '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Day {dayNum}
                  </span>
                  {dayActivities > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full mt-1"
                      style={{ background: active ? 'rgba(255,255,255,0.7)' : '#007AFF' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {activeDayKey ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDayKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activitiesForDay.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                        {activitiesForDay.length} {activitiesForDay.length === 1 ? 'activity' : 'activities'}
                      </p>
                      <button
                        onClick={() => setShowAI(true)}
                        className="flex items-center gap-1"
                        style={{ color: '#007AFF', fontSize: '13px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                        <Sparkles size={13} /> Reschedule
                      </button>
                    </div>

                    {activitiesForDay.map((act, idx) => (
                      <ActivityCard key={act.id} activity={act} index={idx} />
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <span style={{ fontSize: '48px' }}>📅</span>
                    <p style={{ fontSize: '17px', fontWeight: 600, color: '#000', marginTop: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      Nothing planned yet
                    </p>
                    <p style={{ fontSize: '14px', color: '#8E8E93', textAlign: 'center', marginTop: '6px', maxWidth: '200px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      Let AI generate activities for this day
                    </p>
                    <button
                      onClick={() => setShowAI(true)}
                      className="mt-4 flex items-center gap-2 px-5 py-3 rounded-2xl"
                      style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', color: '#fff', fontSize: '15px', fontWeight: 600, border: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                      <Sparkles size={16} /> Generate with AI
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <span style={{ fontSize: '48px' }}>🗓️</span>
            <p style={{ fontSize: '17px', fontWeight: 600, color: '#000', marginTop: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>No itinerary yet</p>
            <p style={{ fontSize: '14px', color: '#8E8E93', textAlign: 'center', marginTop: '6px', maxWidth: '220px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              Your AI assistant will generate a personalized day-by-day plan for {segment.destination}
            </p>
            <button
              onClick={() => setShowAI(true)}
              className="mt-4 flex items-center gap-2 px-5 py-3 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', color: '#fff', fontSize: '15px', fontWeight: 600, border: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              <Sparkles size={16} /> Generate Itinerary
            </button>
          </div>
        )}

        {/* Add Activity Button */}
        {activitiesForDay.length > 0 && (
          <button
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2"
            style={{ border: '2px dashed #C7C7CC', background: 'transparent', color: '#007AFF', fontSize: '15px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            <Plus size={18} />
            Add Activity
          </button>
        )}
      </div>

      {showAI && id && <AIChatOverlay tripId={id} onClose={() => setShowAI(false)} />}
    </div>
  );
}