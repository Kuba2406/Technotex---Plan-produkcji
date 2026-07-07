import type { NextApiRequest, NextApiResponse } from 'next';
import { getSnowalniaItemById, updateSnowalniaItem, deleteSnowalniaItem } from '../../../lib/repositories/snowalnia';
import { methodNotAllowed, serverError, notFound, parseId } from '../../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseId(req.query.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  if (req.method === 'GET') {
    try { const item = await getSnowalniaItemById(id); if (!item) return notFound(res,'Partia snowalnia'); res.status(200).json({ data: item }); }
    catch (err) { serverError(res, err); }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try { const u = await updateSnowalniaItem(id, req.body); if (!u) return notFound(res,'Partia snowalnia'); res.status(200).json({ data: u }); }
    catch (err) { serverError(res, err); }
  } else if (req.method === 'DELETE') {
    try { const d = await deleteSnowalniaItem(id); if (!d) return notFound(res,'Partia snowalnia'); res.status(200).json({ data: { id } }); }
    catch (err) { serverError(res, err); }
  } else { methodNotAllowed(req, res, ['GET','PUT','PATCH','DELETE']); }
}
