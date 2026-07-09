// ============================================================
// lib/repositories/typy-krosien.ts – Loom types repository
// ============================================================

import type { TypKrosna } from '../../types/domain';
import { getState, patchState } from '../db/store';

export async function getAllTypyKrosien(): Promise<TypKrosna[]> {
  const state = await getState();
  return state.typyKrosien;
}

export async function getTypKrosnaById(id: number): Promise<TypKrosna | null> {
  const state = await getState();
  return state.typyKrosien.find((t) => t.id === id) ?? null;
}

export async function createTypKrosna(
  data: Omit<TypKrosna, 'id'>,
): Promise<TypKrosna> {
  const state = await getState();
  const newType: TypKrosna = { ...data, id: state.nextId.typKrosna };
  const updatedList = [...state.typyKrosien, newType];
  await patchState('typyKrosien', updatedList);
  await patchState('nextId', { ...state.nextId, typKrosna: state.nextId.typKrosna + 1 });
  return newType;
}

export async function updateTypKrosna(
  id: number,
  data: Partial<Omit<TypKrosna, 'id'>>,
): Promise<TypKrosna | null> {
  const state = await getState();
  const index = state.typyKrosien.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const updated = { ...state.typyKrosien[index], ...data };
  const updatedList = [...state.typyKrosien];
  updatedList[index] = updated;
  await patchState('typyKrosien', updatedList);
  return updated;
}

export async function deleteTypKrosna(id: number): Promise<boolean> {
  const state = await getState();
  const updatedList = state.typyKrosien.filter((t) => t.id !== id);
  if (updatedList.length === state.typyKrosien.length) return false;
  await patchState('typyKrosien', updatedList);
  return true;
}
