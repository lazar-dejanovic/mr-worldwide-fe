/**
 * Plan Sharing — /api/trips/{tripId}/share
 * All endpoints require Bearer token.
 */

import { request } from './client';
import type { UserDto } from './auth';
import type { TripPlanDto } from './trips';

export type AccessType = 'READ_ONLY' | 'EDITOR';

// ─── DTOs ───────────────────────────────────────────────────────────────────

export interface PlanShareDto {
  id: string;
  sharedWithUser: UserDto;
  accessType: AccessType;
  inviteSentAt: string; // ISO ZonedDateTime
}

// ─── Requests ───────────────────────────────────────────────────────────────

export interface PlanShareRequest {
  email: string;       // email of the user to invite
  accessType: AccessType;
}

// ─── API calls ──────────────────────────────────────────────────────────────

/** POST /api/trips/{tripId}/share/ — share the plan with another user */
export async function apiShareTrip(
  tripId: string,
  body: PlanShareRequest,
): Promise<PlanShareDto> {
  return request<PlanShareDto>(`/trips/${tripId}/share/`, {
    method: 'POST',
    body,
  });
}

/** GET /api/trips/{tripId}/share/ — list all shares for this trip */
export async function apiGetShares(tripId: string): Promise<PlanShareDto[]> {
  return request<PlanShareDto[]>(`/trips/${tripId}/share/`);
}

/** DELETE /api/trips/{tripId}/share/{shareId} — revoke access */
export async function apiDeleteShare(
  tripId: string,
  shareId: string,
): Promise<void> {
  return request<void>(`/trips/${tripId}/share/${shareId}`, {
    method: 'DELETE',
  });
}

/** GET /api/trips/{tripId}/share/shared-with-me — trips shared with current user */
export async function apiGetSharedWithMe(): Promise<TripPlanDto[]> {
  // Note: this endpoint path is relative to the trip, but spec groups it here.
  // Adjust path if your BE exposes it differently (e.g. /api/trips/shared-with-me).
  return request<TripPlanDto[]>('/trips/shared-with-me');
}
