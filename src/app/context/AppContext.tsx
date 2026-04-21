import React, { createContext, useContext, useState, useCallback } from 'react';

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
const MOCK_USER: User = {
  id: 'usr-001',
  email: 'alex.morrison@gmail.com',
  firstName: 'Alex',
  lastName: 'Morrison',
  role: 'REGULAR_USER',
  userTripPreference: {
    id: 'pref-001',
    name: 'My Travel Style',
    interests: ['MUSEUMS', 'FOOD', 'NIGHTLIFE', 'ARCHITECTURE'],
    hobbies: ['Photography', 'Reading', 'Cooking'],
    favouriteDestinations: ['Japan', 'Italy', 'New Zealand'],
  },
};

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
          { id: 'act-004', name: "Musée d'Orsay", category: 'MUSEUM', emoji: '🎨', address: "1 Rue de la Légion d'Honneur, 75007 Paris", day: '2026-06-17', startTime: '09:30', endTime: '12:30' },
          { id: 'act-005', name: 'Seine River Cruise', category: 'ACTIVITY', emoji: '⛵', address: 'Port de la Bourdonnais, 75007 Paris', day: '2026-06-17', startTime: '14:00', endTime: '15:30' },
          { id: 'act-006', name: 'Montmartre Walk', category: 'NATURE', emoji: '🌿', address: 'Montmartre, 75018 Paris', day: '2026-06-17', startTime: '16:30', endTime: '19:30' },
          { id: 'act-007', name: 'Palace of Versailles', category: 'LANDMARK', emoji: '👑', address: "Place d'Armes, 78000 Versailles", day: '2026-06-18', startTime: '09:00', endTime: '16:00' },
          { id: 'act-008', name: 'Le Jules Verne', category: 'FOOD', emoji: '🍽️', address: 'Eiffel Tower, 75007 Paris', day: '2026-06-18', startTime: '19:30', endTime: '21:30' },
          { id: 'act-009', name: 'Champs-Élysées Shopping', category: 'SHOPPING', emoji: '🛍️', address: 'Avenue des Champs-Élysées, 75008 Paris', day: '2026-06-19', startTime: '10:00', endTime: '14:00' },
          { id: 'act-010', name: 'Moulin Rouge Show', category: 'NIGHTLIFE', emoji: '🌙', address: '82 Bd de Clichy, 75018 Paris', day: '2026-06-19', startTime: '21:00', endTime: '23:30' },
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
          { id: 'act-013', name: 'Trevi Fountain', category: 'LANDMARK', emoji: '⛲', address: 'Piazza di Trevi, 00187 Rome', day: '2026-06-21', startTime: '17:00', endTime: '18:30' },
          { id: 'act-014', name: 'Vatican Museums', category: 'MUSEUM', emoji: '🎨', address: 'Viale Vaticano, 00165 Rome', day: '2026-06-22', startTime: '08:00', endTime: '13:00' },
          { id: 'act-015', name: "Campo de' Fiori", category: 'NIGHTLIFE', emoji: '🌙', address: "Campo de' Fiori, 00186 Rome", day: '2026-06-22', startTime: '20:00', endTime: '23:00' },
        ],
      },
      {
        id: 'seg-003',
        departure: 'Rome',
        destination: 'Barcelona',
        arrivalDate: '2026-06-26',
        departureDate: '2026-07-05',
        orderIndex: 2,
        destinationLatitude: 41.3851,
        destinationLongitude: 2.1734,
        transport: {
          id: 'tr-003',
          transportType: 'AIRPLANE',
          airplaneTransport: {
            id: 'air-003',
            flightNumber: 'VY 6802',
            carrier: 'Vueling',
            originIATA: 'FCO',
            destinationIATA: 'BCN',
            departureTime: '2026-06-26T14:30:00',
            arrivalTime: '2026-06-26T17:15:00',
            duration: '2h 45m',
            price: 110,
            currency: 'EUR',
            stops: 0,
          },
        },
        accommodation: {
          id: 'acc-003',
          name: 'Gothic Quarter Suites',
          address: 'Carrer de la Boqueria, 21, 08002 Barcelona',
          imageUrl: 'https://images.unsplash.com/photo-1761757821641-3b347c034042?w=800&q=80',
          bookingUrl: 'https://booking.com',
          starRating: 4,
          reviewScore: 8.7,
          checkIn: '2026-06-26',
          checkOut: '2026-07-05',
          priceTotal: 810,
          currency: 'EUR',
        },
        dailyItineraries: [
          { id: 'act-016', name: 'Sagrada Família', category: 'LANDMARK', emoji: '⛪', address: 'Carrer de Mallorca, 401, 08013 Barcelona', day: '2026-06-27', startTime: '09:00', endTime: '11:30' },
          { id: 'act-017', name: 'La Boqueria Market', category: 'FOOD', emoji: '🥑', address: 'La Rambla, 91, 08001 Barcelona', day: '2026-06-27', startTime: '12:00', endTime: '13:30' },
          { id: 'act-018', name: 'Park Güell', category: 'NATURE', emoji: '🌿', address: "Carrer d'Olot, s/n, 08024 Barcelona", day: '2026-06-28', startTime: '10:00', endTime: '12:00' },
          { id: 'act-019', name: 'Barceloneta Beach', category: 'BEACH', emoji: '🏖️', address: 'Barceloneta Beach, Barcelona', day: '2026-06-28', startTime: '15:00', endTime: '19:00' },
          { id: 'act-020', name: 'El Xampanyet', category: 'NIGHTLIFE', emoji: '🥂', address: 'Carrer de Montcada, 22, 08003 Barcelona', day: '2026-06-28', startTime: '21:00', endTime: '23:30' },
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
    tripSegments: [
      {
        id: 'seg-004',
        departure: 'New York',
        destination: 'Tokyo',
        arrivalDate: '2026-08-10',
        departureDate: '2026-08-17',
        orderIndex: 0,
        destinationLatitude: 35.6762,
        destinationLongitude: 139.6503,
        transport: undefined,
        accommodation: undefined,
        dailyItineraries: [
          { id: 'act-021', name: 'Shinjuku Gyoen Park', category: 'NATURE', emoji: '🌸', address: '11 Naitomachi, Shinjuku City, Tokyo', day: '2026-08-11', startTime: '09:00', endTime: '11:30' },
          { id: 'act-022', name: 'Tsukiji Outer Market', category: 'FOOD', emoji: '🍣', address: '4 Chome-16-2 Tsukiji, Chuo City, Tokyo', day: '2026-08-11', startTime: '07:00', endTime: '09:00' },
          { id: 'act-023', name: 'Meiji Shrine', category: 'LANDMARK', emoji: '⛩️', address: '1-1 Yoyogikamizonocho, Shibuya City, Tokyo', day: '2026-08-12', startTime: '08:00', endTime: '10:00' },
        ],
      },
      {
        id: 'seg-005',
        departure: 'Tokyo',
        destination: 'Kyoto',
        arrivalDate: '2026-08-17',
        departureDate: '2026-08-21',
        orderIndex: 1,
        destinationLatitude: 35.0116,
        destinationLongitude: 135.7681,
        transport: {
          id: 'tr-004',
          transportType: 'VEHICLE',
          vehicleTransport: {
            id: 'veh-001',
            distanceKm: 513,
            estimatedFuelCost: 45,
            tollCost: 28,
          },
        },
        accommodation: {
          id: 'acc-004',
          name: 'Ryokan Arashiyama',
          address: '44 Sagatenryuji Susukinobabacho, Ukyo Ward, Kyoto',
          imageUrl: 'https://images.unsplash.com/photo-1772005013946-d274aa80e2f2?w=800&q=80',
          bookingUrl: 'https://booking.com',
          starRating: 5,
          reviewScore: 9.6,
          checkIn: '2026-08-17',
          checkOut: '2026-08-21',
          priceTotal: 680,
          currency: 'JPY',
        },
        dailyItineraries: [
          { id: 'act-024', name: 'Arashiyama Bamboo Grove', category: 'NATURE', emoji: '🎋', address: 'Sagaogurayama Tabuchiyamacho, Ukyo Ward, Kyoto', day: '2026-08-17', startTime: '08:00', endTime: '10:00' },
          { id: 'act-025', name: 'Fushimi Inari Shrine', category: 'LANDMARK', emoji: '⛩️', address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto', day: '2026-08-18', startTime: '07:00', endTime: '09:30' },
          { id: 'act-026', name: 'Nishiki Market', category: 'FOOD', emoji: '🥢', address: 'Nishikikoji Street, Nakagyo Ward, Kyoto', day: '2026-08-18', startTime: '11:00', endTime: '13:00' },
        ],
      },
      {
        id: 'seg-006',
        departure: 'Kyoto',
        destination: 'Seoul',
        arrivalDate: '2026-08-21',
        departureDate: '2026-08-30',
        orderIndex: 2,
        destinationLatitude: 37.5665,
        destinationLongitude: 126.978,
        transport: {
          id: 'tr-005',
          transportType: 'AIRPLANE',
          airplaneTransport: {
            id: 'air-004',
            flightNumber: 'BX 372',
            carrier: 'Air Busan',
            originIATA: 'ITM',
            destinationIATA: 'ICN',
            departureTime: '2026-08-21T09:15:00',
            arrivalTime: '2026-08-21T11:45:00',
            duration: '1h 30m',
            price: 142,
            currency: 'USD',
            stops: 0,
          },
        },
        accommodation: undefined,
        dailyItineraries: [
          { id: 'act-027', name: 'Gyeongbokgung Palace', category: 'LANDMARK', emoji: '🏯', address: '161 Sajik-ro, Jongno-gu, Seoul', day: '2026-08-22', startTime: '09:00', endTime: '12:00' },
          { id: 'act-028', name: 'Gangnam Shopping', category: 'SHOPPING', emoji: '🛍️', address: 'Gangnam-daero, Gangnam-gu, Seoul', day: '2026-08-23', startTime: '13:00', endTime: '19:00' },
        ],
      },
    ],
  },
  {
    id: 'trip-003',
    name: 'New Zealand Road Trip',
    destinations: ['Auckland', 'Queenstown', 'Christchurch'],
    startDate: '2026-09-05',
    endDate: '2026-09-20',
    interests: ['HIKING', 'NATURE', 'PHOTOGRAPHY'],
    status: 'BOOKED',
    coverImage: 'https://images.unsplash.com/photo-1543499543-50b55b44731e?w=800&q=80',
    gradientFrom: '#0a2e0a',
    gradientTo: '#1a7a1a',
    tripSegments: [
      {
        id: 'seg-007',
        departure: 'Sydney',
        destination: 'Auckland',
        arrivalDate: '2026-09-05',
        departureDate: '2026-09-10',
        orderIndex: 0,
        destinationLatitude: -36.8485,
        destinationLongitude: 174.7633,
        transport: {
          id: 'tr-006',
          transportType: 'AIRPLANE',
          airplaneTransport: {
            id: 'air-005',
            flightNumber: 'NZ 106',
            carrier: 'Air New Zealand',
            originIATA: 'SYD',
            destinationIATA: 'AKL',
            departureTime: '2026-09-05T08:00:00',
            arrivalTime: '2026-09-05T13:30:00',
            duration: '3h 30m',
            price: 310,
            currency: 'AUD',
            stops: 0,
          },
        },
        accommodation: {
          id: 'acc-005',
          name: 'Sky Tower Luxury Suites',
          address: 'Federal St, Auckland CBD, Auckland 1010',
          imageUrl: 'https://images.unsplash.com/photo-1758714919725-d2740fc99f14?w=800&q=80',
          bookingUrl: 'https://booking.com',
          starRating: 5,
          reviewScore: 9.2,
          checkIn: '2026-09-05',
          checkOut: '2026-09-10',
          priceTotal: 1150,
          currency: 'NZD',
        },
        dailyItineraries: [
          { id: 'act-029', name: 'Sky Tower Visit', category: 'LANDMARK', emoji: '🗼', address: 'Federal St, Auckland CBD', day: '2026-09-06', startTime: '10:00', endTime: '12:00' },
          { id: 'act-030', name: 'Waiheke Island Tour', category: 'NATURE', emoji: '🌿', address: 'Waiheke Island, Auckland', day: '2026-09-07', startTime: '09:00', endTime: '17:00' },
        ],
      },
      {
        id: 'seg-008',
        departure: 'Auckland',
        destination: 'Queenstown',
        arrivalDate: '2026-09-10',
        departureDate: '2026-09-15',
        orderIndex: 1,
        destinationLatitude: -45.0312,
        destinationLongitude: 168.6626,
        transport: {
          id: 'tr-007',
          transportType: 'VEHICLE',
          vehicleTransport: {
            id: 'veh-002',
            distanceKm: 1230,
            estimatedFuelCost: 120,
            tollCost: 0,
          },
        },
        accommodation: {
          id: 'acc-006',
          name: 'Remarkables Lodge',
          address: '20 Brecon Street, Queenstown 9300',
          imageUrl: 'https://images.unsplash.com/photo-1543499543-50b55b44731e?w=800&q=80',
          bookingUrl: 'https://booking.com',
          starRating: 4,
          reviewScore: 9.0,
          checkIn: '2026-09-10',
          checkOut: '2026-09-15',
          priceTotal: 870,
          currency: 'NZD',
        },
        dailyItineraries: [
          { id: 'act-031', name: 'Milford Sound Cruise', category: 'ACTIVITY', emoji: '⛵', address: 'Milford Sound, Southland', day: '2026-09-11', startTime: '08:00', endTime: '18:00' },
          { id: 'act-032', name: 'Bungee Jumping', category: 'ACTIVITY', emoji: '🏃', address: 'Kawarau Bridge, Queenstown', day: '2026-09-12', startTime: '10:00', endTime: '12:00' },
          { id: 'act-033', name: 'Remarkables Ski', category: 'ACTIVITY', emoji: '⛷️', address: 'The Remarkables, Queenstown', day: '2026-09-13', startTime: '09:00', endTime: '16:00' },
        ],
      },
      {
        id: 'seg-009',
        departure: 'Queenstown',
        destination: 'Christchurch',
        arrivalDate: '2026-09-15',
        departureDate: '2026-09-20',
        orderIndex: 2,
        destinationLatitude: -43.5321,
        destinationLongitude: 172.6362,
        transport: {
          id: 'tr-008',
          transportType: 'AIRPLANE',
          airplaneTransport: {
            id: 'air-006',
            flightNumber: 'NZ 674',
            carrier: 'Air New Zealand',
            originIATA: 'ZQN',
            destinationIATA: 'CHC',
            departureTime: '2026-09-15T13:00:00',
            arrivalTime: '2026-09-15T14:20:00',
            duration: '1h 20m',
            price: 120,
            currency: 'NZD',
            stops: 0,
          },
        },
        accommodation: undefined,
        dailyItineraries: [
          { id: 'act-034', name: 'Christchurch Botanic Gardens', category: 'NATURE', emoji: '🌺', address: 'Rolleston Avenue, Christchurch 8013', day: '2026-09-16', startTime: '10:00', endTime: '12:30' },
          { id: 'act-035', name: 'International Antarctic Centre', category: 'MUSEUM', emoji: '🐧', address: '38 Orchard Road, Christchurch', day: '2026-09-17', startTime: '13:00', endTime: '16:00' },
        ],
      },
    ],
  },
];

const MOCK_AI_MESSAGES: AIMessage[] = [
  { id: 'msg-001', message: "Hi! I'm planning to visit Paris next month. Can you help me optimize my itinerary?", senderType: 'USER', timestamp: '2026-06-01T10:00:00Z' },
  { id: 'msg-002', message: "Of course! Based on your interests in museums and architecture, I've already arranged a great mix of cultural experiences. Your June 16th schedule starts at the Louvre at 10 AM — perfect timing to beat the crowds. Would you like me to check if any attractions conflict with their opening hours?", senderType: 'AI', timestamp: '2026-06-01T10:00:30Z' },
  { id: 'msg-003', message: 'Yes, please check! Also, can you find a great restaurant near the Eiffel Tower for dinner on June 16th?', senderType: 'USER', timestamp: '2026-06-01T10:01:00Z' },
  { id: 'msg-004', message: "All attractions are within their opening hours ✅\n\nFor dinner near the Eiffel Tower, I recommend **Le Jules Verne** (inside the Tower, Michelin-starred, stunning views) or **Bistrot de l'Alycastre** for a more local feel. Both are available at 7:30 PM. Should I add Le Jules Verne to your June 16th itinerary?", senderType: 'AI', timestamp: '2026-06-01T10:01:45Z' },
];

const MOCK_FLIGHT_OFFERS: FlightOffer[] = [
  { id: 'fo-001', flightNumber: 'AF 1234', carrier: 'Air France', originIATA: 'LHR', destinationIATA: 'CDG', departureTime: '2026-06-15T07:30:00', arrivalTime: '2026-06-15T10:05:00', duration: '1h 35m', price: 189, currency: 'EUR', stops: 0 },
  { id: 'fo-002', flightNumber: 'BA 308', carrier: 'British Airways', originIATA: 'LHR', destinationIATA: 'CDG', departureTime: '2026-06-15T09:15:00', arrivalTime: '2026-06-15T11:50:00', duration: '1h 35m', price: 224, currency: 'EUR', stops: 0 },
  { id: 'fo-003', flightNumber: 'U2 9821', carrier: 'easyJet', originIATA: 'LGW', destinationIATA: 'CDG', departureTime: '2026-06-15T11:00:00', arrivalTime: '2026-06-15T13:40:00', duration: '1h 40m', price: 89, currency: 'EUR', stops: 0 },
  { id: 'fo-004', flightNumber: 'VY 7812', carrier: 'Vueling', originIATA: 'LHR', destinationIATA: 'CDG', departureTime: '2026-06-15T14:20:00', arrivalTime: '2026-06-15T17:00:00', duration: '1h 40m', price: 112, currency: 'EUR', stops: 0 },
  { id: 'fo-005', flightNumber: 'KL 1073', carrier: 'KLM', originIATA: 'LHR', destinationIATA: 'CDG', departureTime: '2026-06-15T16:45:00', arrivalTime: '2026-06-15T19:30:00', duration: '1h 45m', price: 156, currency: 'EUR', stops: 1 },
];

const MOCK_TRAIN_OFFERS: TrainOffer[] = [
  { id: 'tr-o-001', trainNumber: 'TGV 6614', operator: 'SNCF', originStation: 'Paris Gare de Lyon', destinationStation: 'Lyon Part-Dieu', departureTime: '2026-06-15T07:02:00', arrivalTime: '2026-06-15T09:02:00', duration: '2h 00m', price: 52, currency: 'EUR', trainClass: 'Standard' },
  { id: 'tr-o-002', trainNumber: 'Eurostar 9008', operator: 'Eurostar', originStation: 'London St Pancras', destinationStation: 'Paris Gare du Nord', departureTime: '2026-06-15T08:31:00', arrivalTime: '2026-06-15T12:00:00', duration: '2h 16m', price: 124, currency: 'EUR', trainClass: 'Standard' },
  { id: 'tr-o-003', trainNumber: 'ICE 513', operator: 'Deutsche Bahn', originStation: 'Paris Est', destinationStation: 'Frankfurt Hbf', departureTime: '2026-06-15T10:17:00', arrivalTime: '2026-06-15T13:54:00', duration: '3h 37m', price: 89, currency: 'EUR', trainClass: 'Comfort' },
  { id: 'tr-o-004', trainNumber: 'Frecciarossa 9400', operator: 'Trenitalia', originStation: 'Paris Lyon', destinationStation: 'Milan Centrale', departureTime: '2026-06-15T14:45:00', arrivalTime: '2026-06-15T21:18:00', duration: '6h 33m', price: 178, currency: 'EUR', trainClass: 'Business' },
];

const MOCK_ACCOMMODATION_OFFERS: AccommodationOffer[] = [
  { id: 'ao-001', name: 'Le Marais Boutique Hotel', address: '12 Rue des Archives, Le Marais, 75004 Paris', imageUrl: 'https://images.unsplash.com/photo-1761757821641-3b347c034042?w=800&q=80', bookingUrl: 'https://booking.com', starRating: 4, reviewScore: 9.1, priceTotal: 600, currency: 'EUR' },
  { id: 'ao-002', name: 'Hôtel Plaza Athénée', address: '25 Avenue Montaigne, 75008 Paris', imageUrl: 'https://images.unsplash.com/photo-1758714919725-d2740fc99f14?w=800&q=80', bookingUrl: 'https://booking.com', starRating: 5, reviewScore: 9.6, priceTotal: 2100, currency: 'EUR' },
  { id: 'ao-003', name: 'Novotel Paris Centre', address: '61 Quai de Grenelle, 75015 Paris', imageUrl: 'https://images.unsplash.com/photo-1642450415071-f929e02abc95?w=800&q=80', bookingUrl: 'https://booking.com', starRating: 3, reviewScore: 8.3, priceTotal: 420, currency: 'EUR' },
  { id: 'ao-004', name: "Citadines Apart'hotel Montmartre", address: '16 Avenue Rachel, 75018 Paris', imageUrl: 'https://images.unsplash.com/photo-1563216225-5d6adc7d9663?w=800&q=80', bookingUrl: 'https://booking.com', starRating: 3, reviewScore: 8.0, priceTotal: 350, currency: 'EUR' },
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
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (firstName: string, lastName: string, email: string, password: string) => boolean;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<TripPlan[]>(MOCK_TRIPS);
  const [aiMessages, setAiMessages] = useState<{ [tripId: string]: AIMessage[] }>({
    'trip-001': MOCK_AI_MESSAGES,
    'trip-002': [],
    'trip-003': [],
  });
  const [planShares] = useState<PlanShare[]>([]);

  const login = useCallback((email: string, _password: string): boolean => {
    if (email) {
      setCurrentUser(MOCK_USER);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  const register = useCallback((firstName: string, lastName: string, email: string, _password: string): boolean => {
    if (firstName && lastName && email) {
      const newUser: User = { ...MOCK_USER, firstName, lastName, email, userTripPreference: undefined };
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
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
