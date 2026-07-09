import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllObecnosci, saveObecnosciForShift, saveFullObecnosci } from '../../../lib/repositories/obecnosci';
import { methodNotAllowed, serverError, badRequest } from '../../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // ?date=YYYY-MM-DD&zmiana=1  for a specific shift
    const { date, zmiana } = req.query;
    try {
      if (date && zmiana) {
        const { getObecnosciForShift } = await import('../../../lib/repositories/obecnosci');
        const records = await getObecnosciForShift(String(date), Number(zmiana) as 1 | 2);
        return res.status(200).json({ data: records });
      }
      res.status(200).json({ data: await getAllObecnosci() });
    } catch (err) { serverError(res, err); }
  } else if (req.method === 'PUT') {
    // Full map replacement: { obecnosci: ObecnosciMap }
    try {
      if (!req.body?.obecnosci) return badRequest(res, 'Missing obecnosci in body');
      const saved = await saveFullObecnosci(req.body.obecnosci);
      res.status(200).json({ data: saved });
    } catch (err) { serverError(res, err); }
  } else if (req.method === 'POST') {
    // Save a single shift: { date, zmiana, records }
    try {
      const { date, zmiana, records } = req.body ?? {};
      if (!date || !zmiana || !Array.isArray(records)) {
        return badRequest(res, 'Body must include date, zmiana (1|2), and records array');
      }
      const saved = await saveObecnosciForShift(date, zmiana, records);
      res.status(200).json({ data: saved });
    } catch (err) { serverError(res, err); }
  } else { methodNotAllowed(req, res, ['GET', 'POST', 'PUT']); }
}
