import type { NextApiRequest, NextApiResponse } from 'next';
import { getKrosnoById, updateKrosno, deleteKrosno } from '../../../lib/repositories/krosna';
import { methodNotAllowed, serverError, notFound, parseId } from '../../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseId(req.query.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  if (req.method === 'GET') {
    try { const item = await getKrosnoById(id); if (!item) return notFound(res,'Krosno'); res.status(200).json({ data: item }); }
    catch (err) { serverError(res, err); }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try { const u = await updateKrosno(id, req.body); if (!u) return notFound(res,'Krosno'); res.status(200).json({ data: u }); }
    catch (err) { serverError(res, err); }
  } else if (req.method === 'DELETE') {
    try { const d = await deleteKrosno(id); if (!d) return notFound(res,'Krosno'); res.status(200).json({ data: { id } }); }
    catch (err) { serverError(res, err); }
  } else { methodNotAllowed(req, res, ['GET','PUT','PATCH','DELETE']); }
}
