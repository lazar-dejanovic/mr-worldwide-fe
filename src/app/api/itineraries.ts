/**
 * Daily Itineraries — /api/trips/{tripId}/segments/{segmentId}/itineraries
 * All endpoints require Bearer token.
 */

import { request } from './client';

// ─── DTOs ───────────────────────────────────────────────────────────────────

export interface DailyItineraryDto {
  id: string;
  name: string;
  category: string;
  categoryIconUrl?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  day: string;        // ISO LocalDate
  startTime: string;  // ISO LocalTime  e.g. "10:00"
  endTime: string;    // ISO LocalTime  e.g. "12:30"
}

// ─── Requests ───────────────────────────────────────────────────────────────

export interface DailyItineraryRequest {
  name: string;
  category: string;
  categoryIconUrl?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  day: string;
  startTime: string;
  endTime: string;
}

// ─── API calls ──────────────────────────────────────────────────────────────

const base = (tripId: string, segId: string) =>
  `/trips/${tripId}/segments/${segId}/itineraries`;

/** GET /api/trips/{tripId}/segments/{segmentId}/itineraries/ */
export async function apiGetItineraries(
  tripId: string,
  segId: string,
): Promise<DailyItineraryDto[]> {
  return request<DailyItineraryDto[]>(`${base(tripId, segId)}/`);
}

/** GET /api/trips/{tripId}/segments/{segmentId}/itineraries/{itineraryId} */
export async function apiGetItinerary(
  tripId: string,
  segId: string,
  itineraryId: string,
): Promise<DailyItineraryDto> {
  return request<DailyItineraryDto>(
    `${base(tripId, segId)}/${itineraryId}`,
  );
}

/** POST /api/trips/{tripId}/segments/{segmentId}/itineraries/ */
export async function apiCreateItinerary(
  tripId: string,
  segId: string,
  body: DailyItineraryRequest,
): Promise<DailyItineraryDto> {
  return request<DailyItineraryDto>(`${base(tripId, segId)}/`, {
    method: 'POST',
    body,
  });
}

/** PUT /api/trips/{tripId}/segments/{segmentId}/itineraries/{itineraryId} */
export async function apiUpdateItinerary(
  tripId: string,
  segId: string,
  itineraryId: string,
  body: DailyItineraryRequest,
): Promise<DailyItineraryDto> {
  return request<DailyItineraryDto>(
    `${base(tripId, segId)}/${itineraryId}`,
    { method: 'PUT', body },
  );
}

/** DELETE /api/trips/{tripId}/segments/{segmentId}/itineraries/{itineraryId} */
export async function apiDeleteItinerary(
  tripId: string,
  segId: string,
  itineraryId: string,
): Promise<void> {
  return request<void>(`${base(tripId, segId)}/${itineraryId}`, {
    method: 'DELETE',
  });
}

/**
 * GET /api/trips/{tripId}/segments/{segmentId}/itineraries/suggest
 * AI-generated activity suggestions based on categories
 */
export async function apiSuggestItineraries(
  tripId: string,
  segId: string,
  categories: string[],
): Promise<DailyItineraryDto[]> {
  return request<DailyItineraryDto[]>(`${base(tripId, segId)}/suggest`, {
    params: { categories: categories.join(',') },
  });
}
