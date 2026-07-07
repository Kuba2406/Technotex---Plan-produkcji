// ============================================================
// pages/api/state/index.ts – Bulk application state endpoint
//
// GET  /api/state         – returns full application state
// POST /api/state         – replaces full application state
// POST /api/state/reset   – resets to seed/initial data
//
// This endpoint powers the frontend's initial data load and
// allows the vanilla-JS frontend to persist state without
// per-entity API calls during the transition period.
// ============================================================

import type { NextApiRequest, NextApiResponse } from 'next';
import { getState, saveState, resetState } from '../../../lib/db/store';
import { methodNotAllowed, serverError } from '../../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const state = await getState();
      res.status(200).json({ data: state });
    } catch (err) {
      serverError(res, err);
    }
  } else if (req.method === 'POST') {
    try {
      const { reset } = req.query;
      if (reset === 'true') {
        const fresh = await resetState();
        return res.status(200).json({ data: fresh });
      }
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body must be a valid state object' });
      }
      const saved = await saveState(req.body);
      res.status(200).json({ data: saved });
    } catch (err) {
      serverError(res, err);
    }
  } else {
    methodNotAllowed(req, res, ['GET', 'POST']);
  }
}
