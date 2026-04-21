/**
 * Transport — /api/trips/{tripId}/segments/{segmentId}/transport
 * Flight search — /api/flights/search
 * Vehicle route — /api/routes/calculate
 * All endpoints require Bearer token.
 */

import { request } from './client';

export type TransportType = 'AIRPLANE' | 'VEHICLE' | 'TRAIN';

// ─── DTOs ───────────────────────────────────────────────────────────────────

export interface AirplaneTransportDto {
  id: string;
  flightNumber: string;
  departureTime: string;  // ISO LocalDateTime
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
}

export interface VehicleTransportDto {
  id: string;
  distanceKm: number;
  estimatedFuelCost: number;
  tollCost: number;
}

export interface TransportDto {
  id: string;
  transportType: TransportType;
  airplaneTransport?: AirplaneTransportDto;
  vehicleTransport?: VehicleTransportDto;
}

/** Transient DTO returned from flight search — not persisted until user selects */
export interface FlightOfferDto {
  flightNumber: string;
  carrier: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  stops: number;
  bookingUrl?: string;
}

// ─── Requests ───────────────────────────────────────────────────────────────

export interface AirplaneTransportRequest {
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
}

export interface VehicleTransportRequest {
  distanceKm: number;
  estimatedFuelCost: number;
  tollCost: number;
}

export interface TransportRequest {
  transportType: TransportType;
  airplaneTransport?: AirplaneTransportRequest;
  vehicleTransport?: VehicleTransportRequest;
}

export interface RouteCalculationRequest {
  originCity: string;
  destinationCity: string;
}

// ─── API calls ──────────────────────────────────────────────────────────────

const base = (tripId: string, segId: string) =>
  `/trips/${tripId}/segments/${segId}/transport`;

/** GET /api/trips/{tripId}/segments/{segmentId}/transport/ */
export async function apiGetTransport(
  tripId: string,
  segId: string,
): Promise<TransportDto> {
  return request<TransportDto>(`${base(tripId, segId)}/`);
}

/** POST /api/trips/{tripId}/segments/{segmentId}/transport/ */
export async function apiCreateTransport(
  tripId: string,
  segId: string,
  body: TransportRequest,
): Promise<TransportDto> {
  return request<TransportDto>(`${base(tripId, segId)}/`, {
    method: 'POST',
    body,
  });
}

/** PUT /api/trips/{tripId}/segments/{segmentId}/transport/ */
export async function apiUpdateTransport(
  tripId: string,
  segId: string,
  body: TransportRequest,
): Promise<TransportDto> {
  return request<TransportDto>(`${base(tripId, segId)}/`, {
    method: 'PUT',
    body,
  });
}

/** DELETE /api/trips/{tripId}/segments/{segmentId}/transport/ */
export async function apiDeleteTransport(
  tripId: string,
  segId: string,
): Promise<void> {
  return request<void>(`${base(tripId, segId)}/`, { method: 'DELETE' });
}

// ─── Flight search ──────────────────────────────────────────────────────────

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string; // ISO LocalDate
  adults: number;
}

/** GET /api/flights/search */
export async function apiSearchFlights(
  params: FlightSearchParams,
): Promise<FlightOfferDto[]> {
  return request<FlightOfferDto[]>('/flights/search', { params: params as unknown as Record<string, string | number | boolean | undefined> });
}

// ─── Vehicle route calculation ───────────────────────────────────────────────

/** POST /api/routes/calculate */
export async function apiCalculateRoute(
  body: RouteCalculationRequest,
): Promise<VehicleTransportDto> {
  return request<VehicleTransportDto>('/routes/calculate', {
    method: 'POST',
    body,
  });
}
