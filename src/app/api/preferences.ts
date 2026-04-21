/**
 * User Trip Preferences — /api/users/preferences
 * All endpoints require Bearer token.
 */

import { request } from './client';
import type { UserTripPreferenceDto } from './auth';

export interface UserTripPreferenceRequest {
  name?: string;
  interests: string[];
  hobbies: string[];
  favouriteDestinations: string[];
}

/** GET /api/users/preferences/ */
export async function apiGetPreferences(): Promise<UserTripPreferenceDto> {
  return request<UserTripPreferenceDto>('/users/preferences/');
}

/** POST /api/users/preferences/ — create preference profile */
export async function apiCreatePreferences(
  body: UserTripPreferenceRequest,
): Promise<UserTripPreferenceDto> {
  return request<UserTripPreferenceDto>('/users/preferences/', {
    method: 'POST',
    body,
  });
}

/** PUT /api/users/preferences/ — update preference profile */
export async function apiUpdatePreferences(
  body: UserTripPreferenceRequest,
): Promise<UserTripPreferenceDto> {
  return request<UserTripPreferenceDto>('/users/preferences/', {
    method: 'PUT',
    body,
  });
}
