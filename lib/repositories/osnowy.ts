// ============================================================
// lib/repositories/osnowy.ts – Warps repository
// ============================================================

import type { Osnowa } from '../../types/domain';
import { getState, patchState } from '../db/store';

export async function getAllOsnowy(): Promise<Osnowa[]> {
  const state = await getState();
  return state.osnowy;
}

export async function getOsnowaById(id: number): Promise<Osnowa | null> {
  const state = await getState();
  return state.osnowy.find((o) => o.id === id) ?? null;
}

export async function createOsnowa(
  data: Omit<Osnowa, 'id'>,
): Promise<Osnowa> {
  const state = await getState();
  const newOsnowa: Osnowa = { ...data, id: state.nextId.osnowa };
  const updatedList = [...state.osnowy, newOsnowa];
  await patchState('osnowy', updatedList);
  await patchState('nextId', { ...state.nextId, osnowa: state.nextId.osnowa + 1 });
  return newOsnowa;
}

export async function updateOsnowa(
  id: number,
  data: Partial<Omit<Osnowa, 'id'>>,
): Promise<Osnowa | null> {
  const state = await getState();
  const index = state.osnowy.findIndex((o) => o.id === id);
  if (index === -1) return null;
  const updated = { ...state.osnowy[index], ...data };
  const updatedList = [...state.osnowy];
  updatedList[index] = updated;
  await patchState('osnowy', updatedList);
  return updated;
}

export async function deleteOsnowa(id: number): Promise<boolean> {
  const state = await getState();
  const updatedList = state.osnowy.filter((o) => o.id !== id);
  if (updatedList.length === state.osnowy.length) return false;
  await patchState('osnowy', updatedList);
  return true;
}
