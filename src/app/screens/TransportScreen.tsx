import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Plane, Car, Check, Clock, Users, ArrowRight, Fuel, Route, Train } from 'lucide-react';
import { useApp, FlightOffer, TrainOffer } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

const AIRLINE_LOGOS: Record<string, string> = {
  'Air France': '🇫🇷',
  'British Airways': '🇬🇧',
  'easyJet': '🟠',
  'Vueling': '🟡',
  'KLM': '🔵',
  'Ryanair': '🟦',
  'Air Busan': '🇰🇷',
  'Air New Zealand': '🇳🇿',
};

const TRAIN_OPERATOR_LOGOS: Record<string, string> = {
  'SNCF': '🇫🇷',
  'Eurostar': '🌟',
  'Deutsche Bahn': '🇩🇪',
  'Trenitalia': '🇮🇹',
  'Renfe': '🇪🇸',
  'NS': '🇳🇱',
};

const CLASS_COLORS: Record<string, { bg: string; color: string }> = {
  'Standard': { bg: '#8E8E9320', color: '#8E8E93' },
  'Comfort': { bg: '#007AFF20', color: '#007AFF' },
  'Business': { bg: '#FF950020', color: '#FF9500' },
  'First': { bg: '#5856D620', color: '#5856D6' },
};

function FlightCard({ flight, onSelect, selected }: { flight: FlightOffer; onSelect: () => void; selected: boolean }) {
  const fmt = (dt: string) => new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const logo = AIRLINE_LOGOS[flight.carrier] || '✈️';

  return (
    <motion.button
      className="w-full text-left rounded-2xl overflow-hidden mb-3"
      style={{
        background: '#fff',
        boxShadow: selected ? '0 0 0 2px #007AFF, 0 4px 16px rgba(0,122,255,0.2)' : '0 2px 12px rgba(0,0,0,0.06)',
        border: selected ? '2px solid #007AFF' : '2px solid transparent',
        transition: 'all 0.2s',
      }}
      onClick={onSelect}
      whileTap={{ scale: 0.99 }}
    >
      <div className="p-4">
        {/* Airline Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '20px' }}>{logo}</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                {flight.carrier}
              </p>
              <p style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                {flight.flightNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              €{flight.price}
            </p>
            <p style={{ fontSize: '11px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              per person
            </p>
          </div>
        </div>

        {/* Flight Times */}
        <div className="flex items-center gap-2">
          <div className="text-center" style={{ minWidth: '52px' }}>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1 }}>{fmt(flight.departureTime)}</p>
            <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>{flight.originIATA}</p>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <p style={{ fontSize: '11px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', marginBottom: '4px' }}>{flight.duration}</p>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px" style={{ background: '#C7C7CC' }} />
              {flight.stops === 0
                ? <Plane size={14} color="#007AFF" />
                : <div className="w-2 h-2 rounded-full bg-orange-400" />}
              <div className="flex-1 h-px" style={{ background: '#C7C7CC' }} />
            </div>
            <p style={{ fontSize: '11px', color: flight.stops === 0 ? '#34C759' : '#FF9500', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', marginTop: '4px' }}>
              {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}
            </p>
          </div>

          <div className="text-center" style={{ minWidth: '52px' }}>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1 }}>{fmt(flight.arrivalTime)}</p>
            <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>{flight.destinationIATA}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-3">
          <span className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: '#F2F2F7', fontSize: '11px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            <Clock size={10} /> {flight.duration}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: '#F2F2F7', fontSize: '11px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            <Users size={10} /> 1 pax
          </span>
          {flight.stops === 0 && (
            <span className="px-2 py-1 rounded-md" style={{ background: '#34C75920', color: '#34C759', fontSize: '11px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              Direct
            </span>
          )}
        </div>
      </div>

      {selected && (
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: '#007AFF' }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Selected</span>
          <Check size={16} color="#fff" />
        </div>
      )}
    </motion.button>
  );
}

function TrainCard({ train, onSelect, selected }: { train: TrainOffer; onSelect: () => void; selected: boolean }) {
  const fmt = (dt: string) => new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const logo = TRAIN_OPERATOR_LOGOS[train.operator] || '🚄';
  const classStyle = CLASS_COLORS[train.trainClass] || CLASS_COLORS['Standard'];

  return (
    <motion.button
      className="w-full text-left rounded-2xl overflow-hidden mb-3"
      style={{
        background: '#fff',
        boxShadow: selected ? '0 0 0 2px #5856D6, 0 4px 16px rgba(88,86,214,0.2)' : '0 2px 12px rgba(0,0,0,0.06)',
        border: selected ? '2px solid #5856D6' : '2px solid transparent',
        transition: 'all 0.2s',
      }}
      onClick={onSelect}
      whileTap={{ scale: 0.99 }}
    >
      <div className="p-4">
        {/* Operator Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '20px' }}>{logo}</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                {train.operator}
              </p>
              <p style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                {train.trainNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              €{train.price}
            </p>
            <p style={{ fontSize: '11px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              per person
            </p>
          </div>
        </div>

        {/* Train Times */}
        <div className="flex items-center gap-2">
          <div style={{ minWidth: '52px' }}>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1 }}>{fmt(train.departureTime)}</p>
            <p style={{ fontSize: '10px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '1.2', marginTop: '2px' }}>
              {train.originStation.split(' ').slice(0, 2).join(' ')}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <p style={{ fontSize: '11px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', marginBottom: '4px' }}>{train.duration}</p>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px" style={{ background: '#C7C7CC' }} />
              <Train size={14} color="#5856D6" />
              <div className="flex-1 h-px" style={{ background: '#C7C7CC' }} />
            </div>
            <p style={{ fontSize: '11px', color: '#34C759', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', marginTop: '4px' }}>
              Direct
            </p>
          </div>

          <div className="text-right" style={{ minWidth: '52px' }}>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1 }}>{fmt(train.arrivalTime)}</p>
            <p style={{ fontSize: '10px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: '1.2', marginTop: '2px' }}>
              {train.destinationStation.split(' ').slice(0, 2).join(' ')}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-3">
          <span className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: '#F2F2F7', fontSize: '11px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            <Clock size={10} /> {train.duration}
          </span>
          <span className="px-2 py-1 rounded-md" style={{ background: classStyle.bg, color: classStyle.color, fontSize: '11px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            {train.trainClass}
          </span>
          <span className="px-2 py-1 rounded-md" style={{ background: '#34C75920', color: '#34C759', fontSize: '11px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            Eco-friendly
          </span>
        </div>
      </div>

      {selected && (
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: '#5856D6' }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Selected</span>
          <Check size={16} color="#fff" />
        </div>
      )}
    </motion.button>
  );
}

function VehicleCard({ tripId, segmentId }: { tripId: string; segmentId: string }) {
  const { trips } = useApp();
  const trip = trips.find(t => t.id === tripId);
  const segment = trip?.tripSegments.find(s => s.id === segmentId);
  const vehicle = segment?.transport?.vehicleTransport;

  const mockRoute = {
    distance: vehicle?.distanceKm || 650,
    fuel: vehicle?.estimatedFuelCost || 58,
    tolls: vehicle?.tollCost || 22,
    time: '5h 30m',
  };

  return (
    <motion.div
      className="w-full rounded-2xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Map Preview (mocked) */}
      <div className="relative" style={{ height: '140px', background: 'linear-gradient(135deg, #e8f4f8 0%, #d4e8d4 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#007AFF' }}>
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <div className="flex gap-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-4 h-1 rounded-full" style={{ background: '#007AFF', opacity: 0.3 + (i * 0.1) }} />
              ))}
            </div>
            <Route size={24} color="#007AFF" />
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 rounded-lg text-xs" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', backdropFilter: 'blur(4px)' }}>
            Route Preview
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#000', marginBottom: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          Own Vehicle Route
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Route, label: 'Distance', value: `${mockRoute.distance} km`, color: '#007AFF' },
            { icon: Clock, label: 'Est. Time', value: mockRoute.time, color: '#5856D6' },
            { icon: Fuel, label: 'Fuel Cost', value: `€${mockRoute.fuel}`, color: '#FF9500' },
            { icon: ArrowRight, label: 'Tolls', value: mockRoute.tolls > 0 ? `€${mockRoute.tolls}` : 'No tolls', color: '#34C759' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: `${item.color}10` }}>
              <item.icon size={16} color={item.color} />
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{item.value}</p>
              <p style={{ fontSize: '12px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{item.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '0.5px solid #E5E5EA' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Total estimated cost</p>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>€{mockRoute.fuel + mockRoute.tolls}</p>
          </div>
          <Car size={32} color="#8E8E93" />
        </div>
      </div>
    </motion.div>
  );
}

type TransportMode = 'AIRPLANE' | 'TRAIN' | 'VEHICLE';

export default function TransportScreen() {
  const { id, segmentId } = useParams<{ id: string; segmentId: string }>();
  const navigate = useNavigate();
  const { trips, flightOffers, trainOffers, selectTransport, selectTrainTransport } = useApp();
  const [mode, setMode] = useState<TransportMode>('AIRPLANE');
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);

  const trip = trips.find(t => t.id === id);
  const segment = trip?.tripSegments.find(s => s.id === segmentId);

  const handleConfirm = () => {
    if (mode === 'AIRPLANE' && selectedFlightId) {
      const flight = flightOffers.find(f => f.id === selectedFlightId);
      if (flight && id && segmentId) {
        selectTransport(id, segmentId, flight);
        navigate(-1);
      }
    } else if (mode === 'TRAIN' && selectedTrainId) {
      const train = trainOffers.find(t => t.id === selectedTrainId);
      if (train && id && segmentId) {
        selectTrainTransport(id, segmentId, train);
        navigate(-1);
      }
    } else if (mode === 'VEHICLE') {
      navigate(-1);
    }
  };

  const canConfirm = mode === 'VEHICLE' || (mode === 'AIRPLANE' && !!selectedFlightId) || (mode === 'TRAIN' && !!selectedTrainId);

  const TABS: { id: TransportMode; label: string; icon: React.ElementType }[] = [
    { id: 'AIRPLANE', label: 'Flight', icon: Plane },
    { id: 'TRAIN', label: 'Train', icon: Train },
    { id: 'VEHICLE', label: 'Drive', icon: Car },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F2F2F7]">
      {/* Nav Bar */}
      <div className="bg-[#F2F2F7] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <ChevronLeft size={18} color="#000" />
        </button>
        <div className="flex-1">
          <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            Choose Transport
          </h1>
          {segment && (
            <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {segment.departure} → {segment.destination}
            </p>
          )}
        </div>
      </div>

      {/* Transport Mode Toggle */}
      <div className="px-4 pb-4">
        <div className="flex rounded-2xl p-1" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {TABS.map(tab => {
            const active = mode === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl transition-all"
                style={{
                  background: active ? 'linear-gradient(135deg, #007AFF, #0057E7)' : 'transparent',
                  color: active ? '#fff' : '#8E8E93',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  border: 'none',
                  transition: 'all 0.25s',
                  boxShadow: active ? '0 2px 8px rgba(0,87,231,0.35)' : 'none',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {mode === 'AIRPLANE' && (
            <motion.div
              key="flights"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Available Flights
                </p>
                <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {flightOffers.length} results
                </p>
              </div>
              {flightOffers.map(flight => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onSelect={() => setSelectedFlightId(flight.id)}
                  selected={selectedFlightId === flight.id}
                />
              ))}
            </motion.div>
          )}

          {mode === 'TRAIN' && (
            <motion.div
              key="trains"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Train Services
                </p>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: '#34C75920' }}>
                  <span style={{ fontSize: '11px', color: '#34C759', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>🌱 Low CO₂</span>
                </div>
              </div>
              {trainOffers.map(train => (
                <TrainCard
                  key={train.id}
                  train={train}
                  onSelect={() => setSelectedTrainId(train.id)}
                  selected={selectedTrainId === train.id}
                />
              ))}
            </motion.div>
          )}

          {mode === 'VEHICLE' && (
            <motion.div
              key="vehicle"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <VehicleCard tripId={id || ''} segmentId={segmentId || ''} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-4" />
      </div>

      {/* Confirm Button */}
      {canConfirm && (
        <motion.div
          className="px-4 py-4"
          style={{ borderTop: '0.5px solid #E5E5EA', background: '#F2F2F7' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: mode === 'TRAIN'
                ? 'linear-gradient(135deg, #5856D6, #7461E8)'
                : 'linear-gradient(135deg, #007AFF, #0057E7)',
              color: '#fff',
              fontSize: '17px',
              fontWeight: 600,
              border: 'none',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              boxShadow: mode === 'TRAIN'
                ? '0 4px 16px rgba(88,86,214,0.4)'
                : '0 4px 16px rgba(0,87,231,0.4)',
            }}
          >
            <Check size={18} />
            {mode === 'AIRPLANE'
              ? `Select Flight · €${flightOffers.find(f => f.id === selectedFlightId)?.price || ''}`
              : mode === 'TRAIN'
                ? `Select Train · €${trainOffers.find(t => t.id === selectedTrainId)?.price || ''}`
                : 'Select Vehicle Route'}
          </button>
        </motion.div>
      )}
    </div>
  );
}