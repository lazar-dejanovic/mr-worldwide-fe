import { useState } from 'react';
import { Search, TrendingUp, Compass, MapPin, Star, ChevronRight, Sparkles, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';

const SF = { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' };

interface Destination {
  name: string;
  country: string;
  emoji: string;
  image: string;
  rating: number;
  priceRange: string;
  tags: string[];
  description: string;
  hot?: boolean;
  new?: boolean;
}

const TRENDING: Destination[] = [
  {
    name: 'Bangkok',
    country: 'Thailand',
    emoji: '🇹🇭',
    image: 'https://images.unsplash.com/photo-1540660235365-083e8894cec4?w=400&q=70',
    rating: 4.7,
    priceRange: '$$',
    tags: ['Culture', 'Food', 'Temples'],
    description: 'Vibrant street life, ornate shrines, and incredible food.',
    hot: true,
  },
  {
    name: 'Santorini',
    country: 'Greece',
    emoji: '🇬🇷',
    image: 'https://images.unsplash.com/photo-1671760085670-2be5869f38dd?w=400&q=70',
    rating: 4.9,
    priceRange: '$$$',
    tags: ['Romance', 'Beaches', 'Views'],
    description: 'Iconic white-washed buildings and stunning Aegean sunsets.',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    emoji: '🇮🇩',
    image: 'https://images.unsplash.com/photo-1656247203824-3d6f99461ba4?w=400&q=70',
    rating: 4.8,
    priceRange: '$$',
    tags: ['Nature', 'Wellness', 'Temples'],
    description: 'Sacred temples, terraced rice paddies, and lush jungles.',
    hot: true,
  },
  {
    name: 'Marrakech',
    country: 'Morocco',
    emoji: '🇲🇦',
    image: 'https://images.unsplash.com/photo-1596750320291-a082a23dcc19?w=400&q=70',
    rating: 4.6,
    priceRange: '$$',
    tags: ['Markets', 'Culture', 'Architecture'],
    description: 'Ancient medinas, spice souks, and ornate palaces.',
    new: true,
  },
  {
    name: 'Iceland',
    country: 'Iceland',
    emoji: '🇮🇸',
    image: 'https://images.unsplash.com/photo-1604403667191-ace082e0cf02?w=400&q=70',
    rating: 4.9,
    priceRange: '$$$',
    tags: ['Nature', 'Aurora', 'Adventure'],
    description: 'Northern lights, geysers, and otherworldly landscapes.',
  },
  {
    name: 'New York',
    country: 'United States',
    emoji: '🗽',
    image: 'https://images.unsplash.com/photo-1695189993006-975fb45964de?w=400&q=70',
    rating: 4.7,
    priceRange: '$$$',
    tags: ['Urban', 'Culture', 'Food'],
    description: 'The city that never sleeps — endless culture and energy.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌍' },
  { id: 'beach', label: 'Beaches', emoji: '🏖️' },
  { id: 'culture', label: 'Culture', emoji: '🏛️' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'romance', label: 'Romance', emoji: '💕' },
];

const AI_PICKS = [
  { emoji: '🏯', title: 'Hidden gems in Kyoto', subtitle: '7 off-the-beaten-path temples' },
  { emoji: '🌮', title: 'Mexico City food tour', subtitle: 'Street tacos to fine dining' },
  { emoji: '🛶', title: 'Vietnam river routes', subtitle: 'Ha Long Bay to Hội An' },
];

function DestinationCard({ dest, index, onPress }: { dest: Destination; index: number; onPress: () => void }) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden cursor-pointer flex-shrink-0"
      style={{ width: '200px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', position: 'relative', height: '160px' }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      whileTap={{ scale: 0.97 }}
      onClick={onPress}
    >
      <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.75) 100%)' }} />

      {dest.hot && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md"
          style={{ background: '#FF3B30', fontSize: '10px', fontWeight: 700, color: '#fff', ...SF }}>
          🔥 HOT
        </div>
      )}
      {dest.new && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md"
          style={{ background: '#34C759', fontSize: '10px', fontWeight: 700, color: '#fff', ...SF }}>
          ✨ NEW
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', ...SF }}>{dest.name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', ...SF }}>{dest.country}</p>
          <div className="flex items-center gap-1">
            <Star size={10} fill="#FFD60A" color="#FFD60A" />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, ...SF }}>{dest.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DestinationListCard({ dest, index }: { dest: Destination; index: number }) {
  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden flex cursor-pointer"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.07)', height: '100px' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileTap={{ scale: 0.98 }}
    >
      <div style={{ width: '100px', flexShrink: 0 }}>
        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between">
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#000', ...SF }}>{dest.name}</p>
            <div className="flex items-center gap-0.5">
              <Star size={10} fill="#FFD60A" color="#FFD60A" />
              <span style={{ fontSize: '11px', color: '#000', fontWeight: 600, ...SF }}>{dest.rating}</span>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#8E8E93', ...SF }}>{dest.country}</p>
          <p style={{ fontSize: '12px', color: '#8E8E93', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...SF }}>{dest.description}</p>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {dest.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-md"
              style={{ background: '#F2F2F7', color: '#8E8E93', fontSize: '10px', ...SF }}>
              {tag}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-md ml-auto"
            style={{ background: '#007AFF10', color: '#007AFF', fontSize: '10px', fontWeight: 600, ...SF }}>
            {dest.priceRange}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExplorePlaceholder() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = TRENDING.filter(d => {
    const matchesSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' ||
      d.tags.some(t => t.toLowerCase().includes(activeCategory)) ||
      d.description.toLowerCase().includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#F2F2F7] min-h-full pb-6">
      {/* Header */}
      <div className="px-5 pt-2 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#000', ...SF }}>
              Explore
            </h1>
            <p style={{ fontSize: '14px', color: '#8E8E93', ...SF }}>Discover your next adventure</p>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', boxShadow: '0 4px 12px rgba(0,87,231,0.35)' }}>
            <Globe size={20} color="#fff" />
          </div>
        </div>

        {/* Search */}
        <motion.div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: searchFocused ? '#fff' : '#fff',
            boxShadow: searchFocused ? '0 0 0 2px #007AFF, 0 4px 12px rgba(0,122,255,0.1)' : '0 2px 8px rgba(0,0,0,0.07)',
            transition: 'all 0.2s',
          }}
          animate={{ scale: searchFocused ? 1.01 : 1 }}
        >
          <Search size={16} color="#8E8E93" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search destinations, countries..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: '15px', color: '#000', ...SF }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: '#C7C7CC', fontSize: '18px' }}>×</button>
          )}
        </motion.div>
      </div>

      {/* Categories */}
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 px-5 py-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full"
              style={{
                background: activeCategory === cat.id ? '#007AFF' : '#fff',
                color: activeCategory === cat.id ? '#fff' : '#000',
                fontSize: '13px',
                fontWeight: activeCategory === cat.id ? 600 : 400,
                border: 'none',
                ...SF,
                boxShadow: activeCategory === cat.id ? '0 2px 8px rgba(0,122,255,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '14px' }}>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {/* AI Picks Strip */}
        {!searchQuery && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={15} color="#5856D6" />
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#000', ...SF }}>AI Picks for You</h2>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', background: '#fff' }}>
              {AI_PICKS.map((pick, idx) => (
                <motion.button
                  key={pick.title}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{ borderBottom: idx < AI_PICKS.length - 1 ? '0.5px solid #F2F2F7' : 'none' }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #5856D610, #007AFF10)', fontSize: '20px' }}>
                    {pick.emoji}
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#000', ...SF }}>{pick.title}</p>
                    <p style={{ fontSize: '12px', color: '#8E8E93', ...SF }}>{pick.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}>
                    <Sparkles size={10} color="#fff" />
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff', ...SF }}>AI</span>
                  </div>
                  <ChevronRight size={14} color="#C7C7CC" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Trending / Horizontal Scroll */}
        {!searchQuery && activeCategory === 'all' && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} color="#FF3B30" />
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#000', ...SF }}>Trending Now</h2>
            </div>
          </div>
        )}
        {!searchQuery && activeCategory === 'all' && (
          <div className="overflow-x-auto -mx-5 px-5 mb-5" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-3">
              {TRENDING.slice(0, 5).map((dest, idx) => (
                <DestinationCard
                  key={dest.name}
                  dest={dest}
                  index={idx}
                  onPress={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Destinations / Filtered List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#000', ...SF }}>
              {searchQuery
                ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
                : activeCategory === 'all'
                  ? 'All Destinations'
                  : `${CATEGORIES.find(c => c.id === activeCategory)?.label} Destinations`}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={activeCategory + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {filtered.map((dest, idx) => (
                  <DestinationListCard key={dest.name} dest={dest} index={idx} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <span style={{ fontSize: '48px' }}>🔍</span>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#000', marginTop: '12px', ...SF }}>No results found</p>
                <p style={{ fontSize: '13px', color: '#8E8E93', marginTop: '4px', ...SF }}>
                  Try a different search or category
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Plan with AI CTA */}
        {!searchQuery && (
          <motion.div
            className="mt-5 rounded-3xl p-5"
            style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', boxShadow: '0 6px 24px rgba(0,87,231,0.35)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Compass size={22} color="#fff" />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', ...SF }}>Plan with AI</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', ...SF }}>
                  Get a personalized trip built for your style
                </p>
              </div>
              <button
                onClick={() => navigate('/chat')}
                className="px-4 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '13px', fontWeight: 600, border: 'none', ...SF }}
              >
                Start
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
