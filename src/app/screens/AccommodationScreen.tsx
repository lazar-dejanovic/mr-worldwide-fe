import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Star, ExternalLink, Check, Filter, Search } from 'lucide-react';
import { useApp, AccommodationOffer } from '../context/AppContext';
import { motion } from 'motion/react';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < Math.floor(rating) ? '#FF9500' : 'transparent'}
          color={i < Math.floor(rating) ? '#FF9500' : '#D1D1D6'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ReviewBadge({ score }: { score: number }) {
  const getColor = (s: number) => s >= 9 ? '#34C759' : s >= 8 ? '#007AFF' : '#FF9500';
  return (
    <div className="px-2 py-1 rounded-lg flex items-center gap-1"
      style={{ background: getColor(score), alignSelf: 'flex-start' }}>
      <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function HotelCard({ offer, onSelect, selected }: { offer: AccommodationOffer; onSelect: () => void; selected: boolean }) {
  const nights = 5; // derived from segment in real impl

  return (
    <motion.button
      className="w-full text-left rounded-2xl overflow-hidden mb-4"
      style={{
        background: '#fff',
        boxShadow: selected
          ? '0 0 0 2px #007AFF, 0 8px 24px rgba(0,122,255,0.15)'
          : '0 2px 12px rgba(0,0,0,0.08)',
        border: selected ? '2px solid #007AFF' : '2px solid transparent',
        transition: 'all 0.2s',
      }}
      onClick={onSelect}
      whileTap={{ scale: 0.99 }}
    >
      {/* Image */}
      <div className="relative" style={{ height: '160px' }}>
        <img src={offer.imageUrl} alt={offer.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />

        {/* Stars overlay */}
        <div className="absolute top-3 left-3">
          <div className="flex gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <StarRating rating={offer.starRating} />
            <span style={{ fontSize: '11px', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {offer.starRating}★
            </span>
          </div>
        </div>

        {selected && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#007AFF' }}>
            <Check size={14} color="#fff" strokeWidth={2.5} />
          </div>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-3 right-3">
          <div className="text-right">
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1 }}>
              €{(offer.priceTotal / nights).toFixed(0)}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              / night
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', flex: 1 }}>
            {offer.name}
          </h3>
          <ReviewBadge score={offer.reviewScore} />
        </div>

        <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', marginBottom: '12px' }}>
          📍 {offer.address}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {nights} nights total
            </p>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              €{offer.priceTotal}
              <span style={{ fontSize: '13px', fontWeight: 400, color: '#8E8E93' }}> total</span>
            </p>
          </div>
          {offer.bookingUrl && (
            <a
              href={offer.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 px-3 py-2 rounded-xl"
              style={{ background: '#F2F2F7', color: '#007AFF', fontSize: '13px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Booking.com <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default function AccommodationScreen() {
  const { id, segmentId } = useParams<{ id: string; segmentId: string }>();
  const navigate = useNavigate();
  const { trips, accommodationOffers, selectAccommodation } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'score'>('score');

  const trip = trips.find(t => t.id === id);
  const segment = trip?.tripSegments.find(s => s.id === segmentId);

  const filtered = accommodationOffers
    .filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'price' ? a.priceTotal - b.priceTotal : b.reviewScore - a.reviewScore);

  const handleConfirm = () => {
    const offer = accommodationOffers.find(o => o.id === selectedId);
    if (offer && id && segmentId) {
      selectAccommodation(id, segmentId, offer);
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F2F2F7]">
      {/* Nav */}
      <div className="bg-[#F2F2F7] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <ChevronLeft size={18} color="#000" />
        </button>
        <div className="flex-1">
          <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            Choose Accommodation
          </h1>
          {segment && (
            <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {segment.destination} · {segment.arrivalDate} – {segment.departureDate}
            </p>
          )}
        </div>
      </div>

      {/* Search + Sort */}
      <div className="px-4 pb-3 flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Search size={15} color="#8E8E93" />
          <input
            type="text"
            placeholder="Search hotels..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: '15px', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
          />
        </div>
        <button
          onClick={() => setSortBy(s => s === 'price' ? 'score' : 'price')}
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Filter size={16} color="#007AFF" />
        </button>
      </div>

      {/* Sort indicator */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <p style={{ fontSize: '13px', color: '#8E8E93', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          Sorted by:
        </p>
        <button
          onClick={() => setSortBy('score')}
          className="px-2 py-1 rounded-md"
          style={{ background: sortBy === 'score' ? '#007AFF20' : '#F2F2F7', color: sortBy === 'score' ? '#007AFF' : '#8E8E93', fontSize: '12px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', border: 'none' }}>
          Top Rated
        </button>
        <button
          onClick={() => setSortBy('price')}
          className="px-2 py-1 rounded-md"
          style={{ background: sortBy === 'price' ? '#007AFF20' : '#F2F2F7', color: sortBy === 'price' ? '#007AFF' : '#8E8E93', fontSize: '12px', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', border: 'none' }}>
          Lowest Price
        </button>
      </div>

      {/* Hotel List */}
      <div className="flex-1 overflow-y-auto px-4">
        {filtered.map((offer, idx) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
          >
            <HotelCard
              offer={offer}
              onSelect={() => setSelectedId(offer.id)}
              selected={selectedId === offer.id}
            />
          </motion.div>
        ))}
        <div className="h-4" />
      </div>

      {/* Confirm */}
      {selectedId && (
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
              background: 'linear-gradient(135deg, #007AFF, #0057E7)',
              color: '#fff',
              fontSize: '17px',
              fontWeight: 600,
              border: 'none',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              boxShadow: '0 4px 16px rgba(0,87,231,0.4)',
            }}
          >
            <Check size={18} />
            Book {accommodationOffers.find(o => o.id === selectedId)?.name}
          </button>
        </motion.div>
      )}
    </div>
  );
}
