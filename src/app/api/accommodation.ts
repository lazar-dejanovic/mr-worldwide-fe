/**
 * Accommodation — /api/trips/{tripId}/segments/{segmentId}/accommodation
 * Search — /api/accommodation/search
 * All endpoints require Bearer token.
 */

import { request } from './client';

// ─── DTOs ───────────────────────────────────────────────────────────────────

export interface AccommodationDto {
  id: string;
  name: string;
  address: string;
  imageUrl?: string;
  bookingUrl?: string;
  starRating?: number;
  reviewScore?: number;
  checkIn: string;   // ISO LocalDate
  checkOut: string;  // ISO LocalDate
  priceTotal?: number;
  currency?: string;
}

/** Transient DTO from search — not persisted until user selects */
export interface AccommodationOfferDto {
  name: string;
  address: string;
  imageUrl: string;
  bookingUrl: string;
  starRating: number;
  reviewScore: number;
  priceTotal: number;
  currency: string;
}

// ─── Requests ───────────────────────────────────────────────────────────────

export interface AccommodationRequest {
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

export interface AccommodationSearchParams {
  cityName: string;
  checkIn: string;   // ISO LocalDate
  checkOut: string;  // ISO LocalDate
  adults: number;
}

// ─── API calls ──────────────────────────────────────────────────────────────

const base = (tripId: string, segId: string) =>
  `/trips/${tripId}/segments/${segId}/accommodation`;

/** GET /api/trips/{tripId}/segments/{segmentId}/accommodation/ */
export async function apiGetAccommodation(
  tripId: string,
  segId: string,
): Promise<AccommodationDto> {
  return request<AccommodationDto>(`${base(tripId, segId)}/`);
}

/** POST /api/trips/{tripId}/segments/{segmentId}/accommodation/ */
export async function apiCreateAccommodation(
  tripId: string,
  segId: string,
  body: AccommodationRequest,
): Promise<AccommodationDto> {
  return request<AccommodationDto>(`${base(tripId, segId)}/`, {
    method: 'POST',
    body,
  });
}

/** PUT /api/trips/{tripId}/segments/{segmentId}/accommodation/ */
export async function apiUpdateAccommodation(
  tripId: string,
  segId: string,
  body: AccommodationRequest,
): Promise<AccommodationDto> {
  return request<AccommodationDto>(`${base(tripId, segId)}/`, {
    method: 'PUT',
    body,
  });
}

/** DELETE /api/trips/{tripId}/segments/{segmentId}/accommodation/ */
export async function apiDeleteAccommodation(
  tripId: string,
  segId: string,
): Promise<void> {
  return request<void>(`${base(tripId, segId)}/`, { method: 'DELETE' });
}

// ─── Accommodation search ────────────────────────────────────────────────────

/** GET /api/accommodation/search */
export async function apiSearchAccommodation(
  params: AccommodationSearchParams,
): Promise<AccommodationOfferDto[]> {
  return request<AccommodationOfferDto[]>('/accommodation/search', { params: params as unknown as Record<string, string | number | boolean | undefined> });
}
