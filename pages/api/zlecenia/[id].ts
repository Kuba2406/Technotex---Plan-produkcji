import type { NextApiRequest, NextApiResponse } from 'next';
import { getZlecenieById, updateZlecenie, deleteZlecenie } from '../../../lib/repositories/zlecenia';
import { methodNotAllowed, serverError, notFound, parseId } from '../../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseId(req.query.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    try {
      const item = await getZlecenieById(id);
      if (!item) return notFound(res, 'Zlecenie');
      res.status(200).json({ data: item });
    } catch (err) { serverError(res, err); }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const updated = await updateZlecenie(id, req.body);
      if (!updated) return notFound(res, 'Zlecenie');
      res.status(200).json({ data: updated });
    } catch (err) { serverError(res, err); }
  } else if (req.method === 'DELETE') {
    try {
      const deleted = await deleteZlecenie(id);
      if (!deleted) return notFound(res, 'Zlecenie');
      res.status(200).json({ data: { id } });
    } catch (err) { serverError(res, err); }
  } else {
    methodNotAllowed(req, res, ['GET', 'PUT', 'PATCH', 'DELETE']);
  }
}
