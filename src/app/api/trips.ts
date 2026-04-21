/**
 * Trip Plans — /api/trips
 * All endpoints require Bearer token.
 */

import { request } from './client';

export type TripPlanStatus = 'DRAFT' | 'PLANNED' | 'BOOKED' | 'COMPLETED';

// ─── DTOs ───────────────────────────────────────────────────────────────────

export interface TripPlanDto {
  id: string;
  name: string;
  destinations: string[];
  startDate: string;      // ISO LocalDate
  endDate: string;        // ISO LocalDate
  interests: string[];
  status: TripPlanStatus;
  tripSegments: TripSegmentSummaryDto[];
}

/** Lightweight segment shape returned inside TripPlanDto */
export interface TripSegmentSummaryDto {
  id: string;
  departure: string;
  destination: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
}

// ─── Requests ───────────────────────────────────────────────────────────────

export interface TripPlanRequest {
  name: string;
  startDate?: string;   // nullable — derived from first segment
  endDate?: string;     // nullable — derived from last segment
  interests: string[];
}

// ─── API calls ──────────────────────────────────────────────────────────────

/** GET /api/trips/ — all trips owned by current user */
export async function apiGetTrips(): Promise<TripPlanDto[]> {
  return request<TripPlanDto[]>('/trips/');
}

/** GET /api/trips/{id} */
export async function apiGetTrip(id: string): Promise<TripPlanDto> {
  return request<TripPlanDto>(`/trips/${id}`);
}

/** POST /api/trips/ */
export async function apiCreateTrip(body: TripPlanRequest): Promise<TripPlanDto> {
  return request<TripPlanDto>('/trips/', { method: 'POST', body });
}

/** PUT /api/trips/{id} */
export async function apiUpdateTrip(
  id: string,
  body: TripPlanRequest,
): Promise<TripPlanDto> {
  return request<TripPlanDto>(`/trips/${id}`, { method: 'PUT', body });
}

/** PATCH /api/trips/{id}/status?status=PLANNED */
export async function apiUpdateTripStatus(
  id: string,
  status: TripPlanStatus,
): Promise<TripPlanDto> {
  return request<TripPlanDto>(`/trips/${id}/status`, {
    method: 'PATCH',
    params: { status },
  });
}

/** DELETE /api/trips/{id} */
export async function apiDeleteTrip(id: string): Promise<void> {
  return request<void>(`/trips/${id}`, { method: 'DELETE' });
}
