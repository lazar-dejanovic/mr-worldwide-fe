/**
 * Trip Segments — /api/trips/{tripId}/segments
 * All endpoints require Bearer token.
 */

import { request } from './client';
import type { TransportDto } from './transport';
import type { AccommodationDto } from './accommodation';
import type { DailyItineraryDto } from './itineraries';

// ─── DTOs ───────────────────────────────────────────────────────────────────

export interface TripSegmentDto {
  id: string;
  departure: string;
  destination: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  transport?: TransportDto;
  accommodation?: AccommodationDto;
  dailyItineraries: DailyItineraryDto[];
}

// ─── Requests ───────────────────────────────────────────────────────────────

export interface TripSegmentRequest {
  departure: string;
  destination: string;
  arrivalDate: string;    // ISO LocalDate
  departureDate: string;  // ISO LocalDate
  destinationLatitude?: number;
  destinationLongitude?: number;
}

export interface SegmentOrderItem {
  segmentId: string;
  orderIndex: number;
}

// ─── API calls ──────────────────────────────────────────────────────────────

/** GET /api/trips/{tripId}/segments/ */
export async function apiGetSegments(tripId: string): Promise<TripSegmentDto[]> {
  return request<TripSegmentDto[]>(`/trips/${tripId}/segments/`);
}

/** GET /api/trips/{tripId}/segments/{segmentId} */
export async function apiGetSegment(
  tripId: string,
  segmentId: string,
): Promise<TripSegmentDto> {
  return request<TripSegmentDto>(`/trips/${tripId}/segments/${segmentId}`);
}

/** POST /api/trips/{tripId}/segments/ */
export async function apiCreateSegment(
  tripId: string,
  body: TripSegmentRequest,
): Promise<TripSegmentDto> {
  return request<TripSegmentDto>(`/trips/${tripId}/segments/`, {
    method: 'POST',
    body,
  });
}

/** PUT /api/trips/{tripId}/segments/{segmentId} */
export async function apiUpdateSegment(
  tripId: string,
  segmentId: string,
  body: TripSegmentRequest,
): Promise<TripSegmentDto> {
  return request<TripSegmentDto>(`/trips/${tripId}/segments/${segmentId}`, {
    method: 'PUT',
    body,
  });
}

/** DELETE /api/trips/{tripId}/segments/{segmentId} */
export async function apiDeleteSegment(
  tripId: string,
  segmentId: string,
): Promise<void> {
  return request<void>(`/trips/${tripId}/segments/${segmentId}`, {
    method: 'DELETE',
  });
}

/** PATCH /api/trips/{tripId}/segments/reorder */
export async function apiReorderSegments(
  tripId: string,
  order: SegmentOrderItem[],
): Promise<TripSegmentDto[]> {
  return request<TripSegmentDto[]>(`/trips/${tripId}/segments/reorder`, {
    method: 'PATCH',
    body: order,
  });
}
