/**
 * AI Assistant — /api/trips/{tripId}/ai
 * All endpoints require Bearer token.
 */

import { request } from './client';

export type SenderType = 'USER' | 'AI';

// ─── DTOs ───────────────────────────────────────────────────────────────────

export interface AIInteractionDto {
  id: string;
  message: string;
  senderType: SenderType;
  timestamp: string; // ISO ZonedDateTime
}

export interface AIMessageResponse {
  reply: string;
  timestamp: string; // ISO ZonedDateTime
}

// ─── Requests ───────────────────────────────────────────────────────────────

export interface AIMessageRequest {
  message: string;
}

// ─── API calls ──────────────────────────────────────────────────────────────

/**
 * POST /api/trips/{tripId}/ai/chat
 * Send a user message and receive an AI reply.
 * The backend sends the full conversation history + trip context to the LLM.
 */
export async function apiSendAIMessage(
  tripId: string,
  message: string,
): Promise<AIMessageResponse> {
  return request<AIMessageResponse>(`/trips/${tripId}/ai/chat`, {
    method: 'POST',
    body: { message } satisfies AIMessageRequest,
  });
}

/**
 * GET /api/trips/{tripId}/ai/history
 * Fetch full persisted conversation history for the trip.
 */
export async function apiGetAIHistory(
  tripId: string,
): Promise<AIInteractionDto[]> {
  return request<AIInteractionDto[]>(`/trips/${tripId}/ai/history`);
}
