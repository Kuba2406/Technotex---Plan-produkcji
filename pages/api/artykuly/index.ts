import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllArtykuly, createArtykul } from '../../../lib/repositories/artykuly';
import { methodNotAllowed, serverError } from '../../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const artykuly = await getAllArtykuly();
      res.status(200).json({ data: artykuly });
    } catch (err) {
      serverError(res, err);
    }
  } else if (req.method === 'POST') {
    try {
      const created = await createArtykul(req.body);
      res.status(201).json({ data: created });
    } catch (err) {
      serverError(res, err);
    }
  } else {
    methodNotAllowed(req, res, ['GET', 'POST']);
  }
}
