// ============================================================
// lib/api-helpers.ts – Shared utilities for API routes
// ============================================================

import type { NextApiRequest, NextApiResponse } from 'next';

export function methodNotAllowed(
  req: NextApiRequest,
  res: NextApiResponse,
  allowed: string[],
) {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: `Method ${req.method} not allowed` });
}

export function serverError(res: NextApiResponse, err: unknown) {
  console.error('[API error]', err);
  res.status(500).json({ error: 'Internal server error' });
}

export function notFound(res: NextApiResponse, entity = 'Resource') {
  res.status(404).json({ error: `${entity} not found` });
}

export function badRequest(res: NextApiResponse, message: string) {
  res.status(400).json({ error: message });
}

export function parseId(raw: string | string[] | undefined): number | null {
  const id = parseInt(String(raw), 10);
  return Number.isFinite(id) ? id : null;
}
