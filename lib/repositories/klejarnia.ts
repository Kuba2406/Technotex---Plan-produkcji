// ============================================================
// lib/repositories/klejarnia.ts – Klejarnia batches repository
// ============================================================

import type { PartiaKlejarnia } from '../../types/domain';
import { getState, patchState } from '../db/store';

export async function getAllKlejarniaItems(): Promise<PartiaKlejarnia[]> {
  const state = await getState();
  return state.klejarnia;
}

export async function getKlejarniaItemById(id: number): Promise<PartiaKlejarnia | null> {
  const state = await getState();
  return state.klejarnia.find((k) => k.id === id) ?? null;
}

export async function createKlejarniaItem(
  data: Omit<PartiaKlejarnia, 'id'>,
): Promise<PartiaKlejarnia> {
  const state = await getState();
  const newItem: PartiaKlejarnia = { ...data, id: state.nextId.klejarnia };
  const updatedList = [...state.klejarnia, newItem];
  await patchState('klejarnia', updatedList);
  await patchState('nextId', { ...state.nextId, klejarnia: state.nextId.klejarnia + 1 });
  return newItem;
}

export async function updateKlejarniaItem(
  id: number,
  data: Partial<Omit<PartiaKlejarnia, 'id'>>,
): Promise<PartiaKlejarnia | null> {
  const state = await getState();
  const index = state.klejarnia.findIndex((k) => k.id === id);
  if (index === -1) return null;
  const updated = { ...state.klejarnia[index], ...data };
  const updatedList = [...state.klejarnia];
  updatedList[index] = updated;
  await patchState('klejarnia', updatedList);
  return updated;
}

export async function deleteKlejarniaItem(id: number): Promise<boolean> {
  const state = await getState();
  const updatedList = state.klejarnia.filter((k) => k.id !== id);
  if (updatedList.length === state.klejarnia.length) return false;
  await patchState('klejarnia', updatedList);
  return true;
}
