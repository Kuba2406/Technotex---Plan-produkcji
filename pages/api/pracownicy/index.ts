import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllPracownicy, createPracownik } from '../../../lib/repositories/pracownicy';
import { methodNotAllowed, serverError } from '../../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try { res.status(200).json({ data: await getAllPracownicy() }); }
    catch (err) { serverError(res, err); }
  } else if (req.method === 'POST') {
    try { res.status(201).json({ data: await createPracownik(req.body) }); }
    catch (err) { serverError(res, err); }
  } else { methodNotAllowed(req, res, ['GET', 'POST']); }
}
