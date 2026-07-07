import type { NextApiRequest, NextApiResponse } from 'next';
import { getArtykulById, updateArtykul, deleteArtykul } from '../../../lib/repositories/artykuly';
import { methodNotAllowed, serverError, notFound, parseId } from '../../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseId(req.query.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    try {
      const artykul = await getArtykulById(id);
      if (!artykul) return notFound(res, 'Artykuł');
      res.status(200).json({ data: artykul });
    } catch (err) {
      serverError(res, err);
    }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const updated = await updateArtykul(id, req.body);
      if (!updated) return notFound(res, 'Artykuł');
      res.status(200).json({ data: updated });
    } catch (err) {
      serverError(res, err);
    }
  } else if (req.method === 'DELETE') {
    try {
      const deleted = await deleteArtykul(id);
      if (!deleted) return notFound(res, 'Artykuł');
      res.status(200).json({ data: { id } });
    } catch (err) {
      serverError(res, err);
    }
  } else {
    methodNotAllowed(req, res, ['GET', 'PUT', 'PATCH', 'DELETE']);
  }
}
