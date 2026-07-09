// ============================================================
// lib/repositories/krosna.ts – Looms repository
// ============================================================

import type { Krosno } from '../../types/domain';
import { getState, patchState } from '../db/store';

export async function getAllKrosna(): Promise<Krosno[]> {
  const state = await getState();
  return state.krosna;
}

export async function getKrosnoById(id: number): Promise<Krosno | null> {
  const state = await getState();
  return state.krosna.find((k) => k.id === id) ?? null;
}

export async function createKrosno(
  data: Omit<Krosno, 'id'>,
): Promise<Krosno> {
  const state = await getState();
  const newKrosno: Krosno = { ...data, id: state.nextId.krosno };
  const updatedList = [...state.krosna, newKrosno];
  await patchState('krosna', updatedList);
  await patchState('nextId', { ...state.nextId, krosno: state.nextId.krosno + 1 });
  return newKrosno;
}

export async function updateKrosno(
  id: number,
  data: Partial<Omit<Krosno, 'id'>>,
): Promise<Krosno | null> {
  const state = await getState();
  const index = state.krosna.findIndex((k) => k.id === id);
  if (index === -1) return null;
  const updated = { ...state.krosna[index], ...data };
  const updatedList = [...state.krosna];
  updatedList[index] = updated;
  await patchState('krosna', updatedList);
  return updated;
}

export async function deleteKrosno(id: number): Promise<boolean> {
  const state = await getState();
  const updatedList = state.krosna.filter((k) => k.id !== id);
  if (updatedList.length === state.krosna.length) return false;
  await patchState('krosna', updatedList);
  return true;
}
