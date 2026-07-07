import type { NextApiRequest, NextApiResponse } from 'next';
import { getKlejarniaItemById, updateKlejarniaItem, deleteKlejarniaItem } from '../../../lib/repositories/klejarnia';
import { methodNotAllowed, serverError, notFound, parseId } from '../../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseId(req.query.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  if (req.method === 'GET') {
    try { const item = await getKlejarniaItemById(id); if (!item) return notFound(res,'Partia klejarnia'); res.status(200).json({ data: item }); }
    catch (err) { serverError(res, err); }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try { const u = await updateKlejarniaItem(id, req.body); if (!u) return notFound(res,'Partia klejarnia'); res.status(200).json({ data: u }); }
    catch (err) { serverError(res, err); }
  } else if (req.method === 'DELETE') {
    try { const d = await deleteKlejarniaItem(id); if (!d) return notFound(res,'Partia klejarnia'); res.status(200).json({ data: { id } }); }
    catch (err) { serverError(res, err); }
  } else { methodNotAllowed(req, res, ['GET','PUT','PATCH','DELETE']); }
}
