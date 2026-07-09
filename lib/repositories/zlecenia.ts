// ============================================================
// lib/repositories/zlecenia.ts – Production orders repository
// ============================================================

import type { Zlecenie } from '../../types/domain';
import { getState, patchState } from '../db/store';

export async function getAllZlecenia(): Promise<Zlecenie[]> {
  const state = await getState();
  return state.zlecenia;
}

export async function getZlecenieById(id: number): Promise<Zlecenie | null> {
  const state = await getState();
  return state.zlecenia.find((z) => z.id === id) ?? null;
}

export async function createZlecenie(
  data: Omit<Zlecenie, 'id'>,
): Promise<Zlecenie> {
  const state = await getState();
  const newZlecenie: Zlecenie = { ...data, id: state.nextId.zlecenie };
  const updatedList = [...state.zlecenia, newZlecenie];
  await patchState('zlecenia', updatedList);
  await patchState('nextId', { ...state.nextId, zlecenie: state.nextId.zlecenie + 1 });
  return newZlecenie;
}

export async function updateZlecenie(
  id: number,
  data: Partial<Omit<Zlecenie, 'id'>>,
): Promise<Zlecenie | null> {
  const state = await getState();
  const index = state.zlecenia.findIndex((z) => z.id === id);
  if (index === -1) return null;
  const updated = { ...state.zlecenia[index], ...data };
  const updatedList = [...state.zlecenia];
  updatedList[index] = updated;
  await patchState('zlecenia', updatedList);
  return updated;
}

export async function deleteZlecenie(id: number): Promise<boolean> {
  const state = await getState();
  const updatedList = state.zlecenia.filter((z) => z.id !== id);
  if (updatedList.length === state.zlecenia.length) return false;
  await patchState('zlecenia', updatedList);
  return true;
}
