// ============================================================
// lib/repositories/snowalnia.ts – Snowalnia batches repository
// ============================================================

import type { PartiaSnowalnia } from '../../types/domain';
import { getState, patchState } from '../db/store';

export async function getAllSnowalniaItems(): Promise<PartiaSnowalnia[]> {
  const state = await getState();
  return state.snowalnia;
}

export async function getSnowalniaItemById(id: number): Promise<PartiaSnowalnia | null> {
  const state = await getState();
  return state.snowalnia.find((s) => s.id === id) ?? null;
}

export async function createSnowalniaItem(
  data: Omit<PartiaSnowalnia, 'id'>,
): Promise<PartiaSnowalnia> {
  const state = await getState();
  const newItem: PartiaSnowalnia = { ...data, id: state.nextId.snowalnia };
  const updatedList = [...state.snowalnia, newItem];
  await patchState('snowalnia', updatedList);
  await patchState('nextId', { ...state.nextId, snowalnia: state.nextId.snowalnia + 1 });
  return newItem;
}

export async function updateSnowalniaItem(
  id: number,
  data: Partial<Omit<PartiaSnowalnia, 'id'>>,
): Promise<PartiaSnowalnia | null> {
  const state = await getState();
  const index = state.snowalnia.findIndex((s) => s.id === id);
  if (index === -1) return null;
  const updated = { ...state.snowalnia[index], ...data };
  const updatedList = [...state.snowalnia];
  updatedList[index] = updated;
  await patchState('snowalnia', updatedList);
  return updated;
}

export async function deleteSnowalniaItem(id: number): Promise<boolean> {
  const state = await getState();
  const updatedList = state.snowalnia.filter((s) => s.id !== id);
  if (updatedList.length === state.snowalnia.length) return false;
  await patchState('snowalnia', updatedList);
  return true;
}
