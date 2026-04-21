/**
 * Auth endpoints — /api/users
 * Public: login, register, forgot-password, reset-password
 * Protected: /me, /{id}, PUT /{id}, DELETE /{id}
 */

import { request, saveToken, clearToken } from './client';

// ─── DTOs matching backend responses ───────────────────────────────────────

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'REGULAR_USER' | 'SYSTEM_ADMIN' | 'SUPER_ADMIN';
  accessToken?: string; // present on login only
  userTripPreference?: UserTripPreferenceDto;
}

export interface UserTripPreferenceDto {
  id: string;
  name?: string;
  interests: string[];
  hobbies: string[];
  favouriteDestinations: string[];
}

// ─── Request payloads ───────────────────────────────────────────────────────

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  secretKey: string;
}

// ─── API calls ──────────────────────────────────────────────────────────────

/** POST /api/users/login — returns UserDto with accessToken */
export async function apiLogin(body: UserLoginRequest): Promise<UserDto> {
  const dto = await request<UserDto>('/users/login', {
    method: 'POST',
    body,
    auth: false,
  });
  if (dto.accessToken) saveToken(dto.accessToken);
  return dto;
}

/** POST /api/users/register — returns UserDto (no token; user must log in) */
export async function apiRegister(body: UserRegisterRequest): Promise<UserDto> {
  return request<UserDto>('/users/register', {
    method: 'POST',
    body,
    auth: false,
  });
}

/** GET /api/users/me — fetch currently authenticated user */
export async function apiGetMe(): Promise<UserDto> {
  return request<UserDto>('/users/me');
}

/** GET /api/users/{id} */
export async function apiGetUser(id: string): Promise<UserDto> {
  return request<UserDto>(`/users/${id}`);
}

/** PUT /api/users/{id} — update firstName / lastName */
export async function apiUpdateUser(
  id: string,
  body: UserUpdateRequest,
): Promise<UserDto> {
  return request<UserDto>(`/users/${id}`, { method: 'PUT', body });
}

/** DELETE /api/users/{id} — soft-delete */
export async function apiDeleteUser(id: string): Promise<void> {
  return request<void>(`/users/${id}`, { method: 'DELETE' });
}

/** POST /api/users/forgot-password?email= */
export async function apiForgotPassword(email: string): Promise<void> {
  return request<void>('/users/forgot-password', {
    method: 'POST',
    params: { email },
    auth: false,
  });
}

/** POST /api/users/reset-password */
export async function apiResetPassword(
  body: ResetPasswordRequest,
): Promise<void> {
  return request<void>('/users/reset-password', {
    method: 'POST',
    body,
    auth: false,
  });
}

/** Clear JWT from storage (client-side logout) */
export function apiLogout(): void {
  clearToken();
}
