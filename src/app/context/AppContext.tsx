import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiLogin, apiRegister } from '../api';
import { saveToken, clearToken } from '../api';

// ─── Types matching backend spec ───────────────────────────────────────────
export type TripPlanStatus = 'DRAFT' | 'PLANNED' | 'BOOKED' | 'COMPLETED';
export type TransportType = 'AIRPLANE' | 'VEHICLE' | 'TRAIN';
export type AccessType = 'READ_ONLY' | 'EDITOR';
export type SenderType = 'USER' | 'AI';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'REGULAR_USER' | 'SYSTEM_ADMIN' | 'SUPER_ADMIN';
  userTripPreference?: UserTripPreference;
}

export interface UserTripPreference {
  id: string;
  name?: string;
  interests: string[];
  hobbies: string[];
  favouriteDestinations: string[];
}

export interface AirplaneTransport {
  id: string;
  flightNumber: string;
  carrier: string;
  originIATA: string;
  destinationIATA: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  stops: number;
}

export interface TrainTransport {
  id: string;
  trainNumber: string;
  operator: string;
  originStation: string;
  destinationStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  trainClass: string;
}

export interface VehicleTransport {
  id: string;
  distanceKm: number;
  estimatedFuelCost: number;
  tollCost: number;
}

export interface Transport {
  id: string;
  transportType: TransportType;
  airplaneTransport?: AirplaneTransport;
  vehicleTransport?: VehicleTransport;
  trainTransport?: TrainTransport;
}

export interface Accommodation {
  id: string;
  name: string;
  address: string;
  imageUrl?: string;
  bookingUrl?: string;
  starRating?: number;
  reviewScore?: number;
  checkIn: string;
  checkOut: string;
  priceTotal?: number;
  currency?: string;
}

export interface DailyItinerary {
  id: string;
  name: string;
  category: string;
  emoji: string;
  address?: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface TripSegment {
  id: string;
  departure: string;
  destination: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  transport?: Transport;
  accommodation?: Accommodation;
  dailyItineraries: DailyItinerary[];
}

export interface TripPlan {
  id: string;
  name: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  interests: string[];
  status: TripPlanStatus;
  tripSegments: TripSegment[];
  coverImage: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface AIMessage {
  id: string;
  message: string;
  senderType: SenderType;
  timestamp: string;
}

export interface PlanShare {
  id: string;
  sharedWithUser: User;
  accessType: AccessType;
  inviteSentAt: string;
}

export interface FlightOffer {
  id: string;
  flightNumber: string;
  carrier: string;
  originIATA: string;
  destinationIATA: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  stops: number;
}

export interface TrainOffer {
  id: string;
  trainNumber: string;
  operator: string;
  originStation: string;
  destinationStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  trainClass: string;
}

export interface AccommodationOffer {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  bookingUrl: string;
  starRating: number;
  reviewScore: number;
  priceTotal: number;
  currency: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_TRIPS: TripPlan[] = [
  {
    id: 'trip-001',
    name: 'European Summer Adventure',
    destinations: ['London', 'Paris', 'Rome', 'Barcelona'],
    startDate: '2026-06-15',
    endDate: '2026-07-05',
    interests: ['MUSEUMS', 'FOOD', 'ARCHITECTURE', 'NIGHTLIFE'],
    status: 'PLANNED',
    coverImage: 'https://images.unsplash.com/photo-1679231926690-cb1e8abfcefd?w=800&q=80',
    gradientFrom: '#1a1a6e',
    gradientTo: '#0057E7',
    tripSegments: [
      {
        id: 'seg-001',
        departure: 'London',
        destination: 'Paris',
        arrivalDate: '2026-06-15',
        departureDate: '2026-06-20',
        orderIndex: 0,
        destinationLatitude: 48.8566,
        destinationLongitude: 2.3522,
        transport: {
          id: 'tr-001',
          transportType: 'AIRPLANE',
          airplaneTransport: {
            id: 'air-001',
            flightNumber: 'AF 1234',
            carrier: 'Air France',
            originIATA: 'LHR',
            destinationIATA: 'CDG',
            departureTime: '2026-06-15T07:30:00',
            arrivalTime: '2026-06-15T10:05:00',
            duration: '1h 35m',
            price: 189,
            currency: 'EUR',
            stops: 0,
          },
        },
        accommodation: {
          id: 'acc-001',
          name: 'Le Marais Boutique Hotel',
          address: '12 Rue des Archives, Le Marais, 75004 Paris',
          imageUrl: 'https://images.unsplash.com/photo-1761757821641-3b347c034042?w=800&q=80',
          bookingUrl: 'https://booking.com',
          starRating: 4,
          reviewScore: 9.1,
          checkIn: '2026-06-15',
          checkOut: '2026-06-20',
          priceTotal: 600,
          currency: 'EUR',
        },
        dailyItineraries: [
          { id: 'act-001', name: 'Louvre Museum', category: 'MUSEUM', emoji: '🏛️', address: 'Rue de Rivoli, 75001 Paris', day: '2026-06-16', startTime: '10:00', endTime: '13:00' },
          { id: 'act-002', name: 'Café de Flore', category: 'FOOD', emoji: '☕', address: '172 Bd Saint-Germain, 75006 Paris', day: '2026-06-16', startTime: '13:30', endTime: '14:30' },
          { id: 'act-003', name: 'Eiffel Tower', category: 'LANDMARK', emoji: '🗼', address: 'Champ de Mars, 5 Avenue Anatole, 75007 Paris', day: '2026-06-16', startTime: '16:00', endTime: '18:30' },
        ],
      },
      {
        id: 'seg-002',
        departure: 'Paris',
        destination: 'Rome',
        arrivalDate: '2026-06-20',
        departureDate: '2026-06-26',
        orderIndex: 1,
        destinationLatitude: 41.9028,
        destinationLongitude: 12.4964,
        transport: {
          id: 'tr-002',
          transportType: 'AIRPLANE',
          airplaneTransport: {
            id: 'air-002',
            flightNumber: 'FR 8234',
            carrier: 'Ryanair',
            originIATA: 'CDG',
            destinationIATA: 'FCO',
            departureTime: '2026-06-20T11:45:00',
            arrivalTime: '2026-06-20T14:00:00',
            duration: '2h 15m',
            price: 95,
            currency: 'EUR',
            stops: 0,
          },
        },
        accommodation: {
          id: 'acc-002',
          name: 'Colosseum View Hotel',
          address: 'Via Sacra 3, Foro Romano, 00186 Rome',
          imageUrl: 'https://images.unsplash.com/photo-1758714919725-d2740fc99f14?w=800&q=80',
          bookingUrl: 'https://booking.com',
          starRating: 5,
          reviewScore: 9.4,
          checkIn: '2026-06-20',
          checkOut: '2026-06-26',
          priceTotal: 1080,
          currency: 'EUR',
        },
        dailyItineraries: [
          { id: 'act-011', name: 'Colosseum & Forum', category: 'LANDMARK', emoji: '🏛️', address: 'Piazza del Colosseo, 1, 00184 Rome', day: '2026-06-21', startTime: '09:00', endTime: '12:00' },
          { id: 'act-012', name: 'Trattoria da Enzo', category: 'FOOD', emoji: '🍝', address: 'Via dei Vascellari, 29, 00153 Rome', day: '2026-06-21', startTime: '13:00', endTime: '14:30' },
        ],
      },
    ],
  },
  {
    id: 'trip-002',
    name: 'Japan & Korea Discovery',
    destinations: ['Tokyo', 'Kyoto', 'Seoul'],
    startDate: '2026-08-10',
    endDate: '2026-08-30',
    interests: ['NATURE', 'FOOD', 'ARCHITECTURE', 'SHOPPING'],
    status: 'DRAFT',
    coverImage: 'https://images.unsplash.com/photo-1773379444640-5d9c2e9d973c?w=800&q=80',
    gradientFrom: '#0d0221',
    gradientTo: '#C41E3A',
    tripSegments: [],
  },
];

const MOCK_FLIGHT_OFFERS: FlightOffer[] = [
  { id: 'fo-001', flightNumber: 'AF 1234', carrier: 'Air France', originIATA: 'LHR', destinationIATA: 'CDG', departureTime: '2026-06-15T07:30:00', arrivalTime: '2026-06-15T10:05:00', duration: '1h 35m', price: 189, currency: 'EUR', stops: 0 },
  { id: 'fo-002', flightNumber: 'BA 308', carrier: 'British Airways', originIATA: 'LHR', destinationIATA: 'CDG', departureTime: '2026-06-15T09:15:00', arrivalTime: '2026-06-15T11:50:00', duration: '1h 35m', price: 224, currency: 'EUR', stops: 0 },
  { id: 'fo-003', flightNumber: 'U2 9821', carrier: 'easyJet', originIATA: 'LGW', destinationIATA: 'CDG', departureTime: '2026-06-15T11:00:00', arrivalTime: '2026-06-15T13:40:00', duration: '1h 40m', price: 89, currency: 'EUR', stops: 0 },
];

const MOCK_TRAIN_OFFERS: TrainOffer[] = [
  { id: 'tr-o-001', trainNumber: 'TGV 6614', operator: 'SNCF', originStation: 'Paris Gare de Lyon', destinationStation: 'Lyon Part-Dieu', departureTime: '2026-06-15T07:02:00', arrivalTime: '2026-06-15T09:02:00', duration: '2h 00m', price: 52, currency: 'EUR', trainClass: 'Standard' },
  { id: 'tr-o-002', trainNumber: 'Eurostar 9008', operator: 'Eurostar', originStation: 'London St Pancras', destinationStation: 'Paris Gare du Nord', departureTime: '2026-06-15T08:31:00', arrivalTime: '2026-06-15T12:00:00', duration: '2h 16m', price: 124, currency: 'EUR', trainClass: 'Standard' },
];

const MOCK_ACCOMMODATION_OFFERS: AccommodationOffer[] = [
  { id: 'ao-001', name: 'Le Marais Boutique Hotel', address: '12 Rue des Archives, Le Marais, 75004 Paris', imageUrl: 'https://images.unsplash.com/photo-1761757821641-3b347c034042?w=800&q=80', bookingUrl: 'https://booking.com', starRating: 4, reviewScore: 9.1, priceTotal: 600, currency: 'EUR' },
  { id: 'ao-002', name: 'Hôtel Plaza Athénée', address: '25 Avenue Montaigne, 75008 Paris', imageUrl: 'https://images.unsplash.com/photo-1758714919725-d2740fc99f14?w=800&q=80', bookingUrl: 'https://booking.com', starRating: 5, reviewScore: 9.6, priceTotal: 2100, currency: 'EUR' },
  { id: 'ao-003', name: 'Novotel Paris Centre', address: '61 Quai de Grenelle, 75015 Paris', imageUrl: 'https://images.unsplash.com/photo-1642450415071-f929e02abc95?w=800&q=80', bookingUrl: 'https://booking.com', starRating: 3, reviewScore: 8.3, priceTotal: 420, currency: 'EUR' },
];

// ─── Context ────────────────────────────────────────────────────────────────
interface AppContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  trips: TripPlan[];
  aiMessages: { [tripId: string]: AIMessage[] };
  flightOffers: FlightOffer[];
  accommodationOffers: AccommodationOffer[];
  trainOffers: TrainOffer[];
  planShares: PlanShare[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  savePreferences: (prefs: Partial<UserTripPreference>) => void;
  createTrip: (name: string, interests: string[]) => TripPlan;
  updateTripStatus: (tripId: string, status: TripPlanStatus) => void;
  addSegment: (tripId: string, segment: Omit<TripSegment, 'id' | 'dailyItineraries'>) => void;
  selectTransport: (tripId: string, segmentId: string, flight: FlightOffer) => void;
  selectTrainTransport: (tripId: string, segmentId: string, train: TrainOffer) => void;
  selectAccommodation: (tripId: string, segmentId: string, acc: AccommodationOffer) => void;
  sendAIMessage: (tripId: string, message: string) => void;
  shareTrip: (tripId: string, email: string, accessType: AccessType) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function mapApiUserToUser(dto: {
  id?: string;
  base?: { id?: string };
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}): User {
  return {
    id: (dto as any).base?.id ?? (dto as any).id ?? '',
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    role: dto.role as User['role'],
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<TripPlan[]>(MOCK_TRIPS);
  const [aiMessages, setAiMessages] = useState<{ [tripId: string]: AIMessage[] }>({
    'trip-001': [],
    'trip-002': [],
  });
  const [planShares] = useState<PlanShare[]>([]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const dto = await apiLogin({ email, password });
    console.log('API response:', dto);
    console.log('mapped user:', mapApiUserToUser(dto as any));
    const user = mapApiUserToUser(dto as any);
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  const register = useCallback(async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
  ): Promise<void> => {
    await apiRegister({ firstName, lastName, email, password });
    const dto = await apiLogin({ email, password });
    const user = mapApiUserToUser(dto as any);
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  const savePreferences = useCallback((prefs: Partial<UserTripPreference>) => {
    setCurrentUser(prev => prev ? {
      ...prev,
      userTripPreference: {
        id: prev.userTripPreference?.id || 'pref-new',
        interests: [],
        hobbies: [],
        favouriteDestinations: [],
        ...prev.userTripPreference,
        ...prefs,
      }
    } : prev);
  }, []);

  const createTrip = useCallback((name: string, interests: string[]): TripPlan => {
    const newTrip: TripPlan = {
      id: `trip-${Date.now()}`,
      name,
      destinations: [],
      startDate: '',
      endDate: '',
      interests,
      status: 'DRAFT',
      coverImage: 'https://images.unsplash.com/photo-1576737064520-f45d313d17ff?w=800&q=80',
      gradientFrom: '#0d2137',
      gradientTo: '#0057E7',
      tripSegments: [],
    };
    setTrips(prev => [newTrip, ...prev]);
    setAiMessages(prev => ({ ...prev, [newTrip.id]: [] }));
    return newTrip;
  }, []);

  const addSegment = useCallback((tripId: string, segmentData: Omit<TripSegment, 'id' | 'dailyItineraries'>) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      const newSegment: TripSegment = {
        ...segmentData,
        id: `seg-${Date.now()}`,
        dailyItineraries: [],
      };
      const updated = [...t.tripSegments, newSegment];
      const destinations = updated.map(s => s.destination);
      return { ...t, tripSegments: updated, destinations };
    }));
  }, []);

  const updateTripStatus = useCallback((tripId: string, status: TripPlanStatus) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status } : t));
  }, []);

  const selectTransport = useCallback((tripId: string, segmentId: string, flight: FlightOffer) => {
    setTrips(prev => prev.map(t => t.id !== tripId ? t : {
      ...t,
      tripSegments: t.tripSegments.map(s => s.id !== segmentId ? s : {
        ...s,
        transport: {
          id: `tr-${Date.now()}`,
          transportType: 'AIRPLANE' as TransportType,
          airplaneTransport: {
            id: `air-${Date.now()}`,
            flightNumber: flight.flightNumber,
            carrier: flight.carrier,
            originIATA: flight.originIATA,
            destinationIATA: flight.destinationIATA,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            duration: flight.duration,
            price: flight.price,
            currency: flight.currency,
            stops: flight.stops,
          },
        },
      }),
    }));
  }, []);

  const selectTrainTransport = useCallback((tripId: string, segmentId: string, train: TrainOffer) => {
    setTrips(prev => prev.map(t => t.id !== tripId ? t : {
      ...t,
      tripSegments: t.tripSegments.map(s => s.id !== segmentId ? s : {
        ...s,
        transport: {
          id: `tr-${Date.now()}`,
          transportType: 'TRAIN' as TransportType,
          trainTransport: {
            id: `train-${Date.now()}`,
            trainNumber: train.trainNumber,
            operator: train.operator,
            originStation: train.originStation,
            destinationStation: train.destinationStation,
            departureTime: train.departureTime,
            arrivalTime: train.arrivalTime,
            duration: train.duration,
            price: train.price,
            currency: train.currency,
            trainClass: train.trainClass,
          },
        },
      }),
    }));
  }, []);

  const selectAccommodation = useCallback((tripId: string, segmentId: string, offer: AccommodationOffer) => {
    setTrips(prev => prev.map(t => t.id !== tripId ? t : {
      ...t,
      tripSegments: t.tripSegments.map(s => s.id !== segmentId ? s : {
        ...s,
        accommodation: {
          id: `acc-${Date.now()}`,
          name: offer.name,
          address: offer.address,
          imageUrl: offer.imageUrl,
          bookingUrl: offer.bookingUrl,
          starRating: offer.starRating,
          reviewScore: offer.reviewScore,
          checkIn: s.arrivalDate,
          checkOut: s.departureDate,
          priceTotal: offer.priceTotal,
          currency: offer.currency,
        },
      }),
    }));
  }, []);

  const sendAIMessage = useCallback((tripId: string, message: string) => {
    const userMsg: AIMessage = { id: `msg-${Date.now()}`, message, senderType: 'USER', timestamp: new Date().toISOString() };
    setAiMessages(prev => ({ ...prev, [tripId]: [...(prev[tripId] || []), userMsg] }));
    setTimeout(() => {
      const aiResponses = [
        "Great question! Based on your itinerary, I can see that your schedule on that day has some free time in the afternoon. I'd suggest visiting a local café or taking a leisurely stroll through the nearby neighborhoods. Would you like specific recommendations?",
        "I've analyzed your trip plan. The timing looks great! Your accommodation is well-positioned near the main attractions. Would you like me to suggest any nearby restaurants for dinner?",
        "I can help with that! Looking at your preferences for museums and food experiences, I'd recommend adjusting the morning slot to start at 9 AM instead — this way you'll have more time before the crowds arrive.",
        "Absolutely! I've checked the opening hours for all your planned activities and everything looks good. There are no conflicts in your schedule. The weather forecast for those dates also looks favorable! ☀️",
      ];
      const aiReply: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        senderType: 'AI',
        timestamp: new Date().toISOString(),
      };
      setAiMessages(prev => ({ ...prev, [tripId]: [...(prev[tripId] || []), aiReply] }));
    }, 1200);
  }, []);

  const shareTrip = useCallback((_tripId: string, _email: string, _accessType: AccessType) => {
    // Mock implementation
  }, []);

  return (
    <AppContext.Provider value={{
      isAuthenticated, currentUser, trips, aiMessages,
      flightOffers: MOCK_FLIGHT_OFFERS,
      accommodationOffers: MOCK_ACCOMMODATION_OFFERS,
      trainOffers: MOCK_TRAIN_OFFERS,
      planShares,
      login, logout, register, savePreferences, createTrip,
      updateTripStatus, addSegment, selectTransport, selectTrainTransport, selectAccommodation,
      sendAIMessage, shareTrip,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}