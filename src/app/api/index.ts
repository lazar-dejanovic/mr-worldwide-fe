/**
 * MR Worldwide — API Service Layer
 * ─────────────────────────────────────────────────────────────
 * Re-exports every API function grouped by domain.
 *
 * QUICK START — connecting to your Spring Boot backend:
 *   1. Open /src/app/api/client.ts
 *   2. Set BASE_URL to your server (e.g. "http://localhost:8080/api")
 *   3. Replace each mocked action in AppContext.tsx with the corresponding
 *      api* function below (example shown in each context action's comment).
 *
 * Token handling is automatic:
 *   - apiLogin() saves the JWT to localStorage after a successful login.
 *   - Every subsequent request reads it from there and sends Authorization: Bearer <token>.
 *   - apiLogout() / clearToken() removes it.
 */

// Base client & error type
export { request, saveToken, clearToken, ApiError, BASE_URL } from './client';
export type { } from './client';

// Auth & user management
export * from './auth';

// User trip preferences (survey)
export * from './preferences';

// Trip plans
export * from './trips';

// Trip segments
export * from './segments';

// Transport (flights, trains, vehicle routes)
export * from './transport';

// Accommodation
export * from './accommodation';

// Daily itineraries
export * from './itineraries';

// AI assistant
export * from './ai';

// Plan sharing
export * from './shares';
