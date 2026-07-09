// ============================================================
// lib/repositories/artykuly.ts – Articles repository
// ============================================================

import type { Artykul } from '../../types/domain';
import { getState, patchState } from '../db/store';

export async function getAllArtykuly(): Promise<Artykul[]> {
  const state = await getState();
  return state.artykuly;
}

export async function getArtykulById(id: number): Promise<Artykul | null> {
  const state = await getState();
  return state.artykuly.find((a) => a.id === id) ?? null;
}

export async function createArtykul(
  data: Omit<Artykul, 'id'>,
): Promise<Artykul> {
  const state = await getState();
  const newArtykul: Artykul = { ...data, id: state.nextId.artykul };
  const updatedList = [...state.artykuly, newArtykul];
  await patchState('artykuly', updatedList);
  await patchState('nextId', { ...state.nextId, artykul: state.nextId.artykul + 1 });
  return newArtykul;
}

export async function updateArtykul(
  id: number,
  data: Partial<Omit<Artykul, 'id'>>,
): Promise<Artykul | null> {
  const state = await getState();
  const index = state.artykuly.findIndex((a) => a.id === id);
  if (index === -1) return null;
  const updated = { ...state.artykuly[index], ...data };
  const updatedList = [...state.artykuly];
  updatedList[index] = updated;
  await patchState('artykuly', updatedList);
  return updated;
}

export async function deleteArtykul(id: number): Promise<boolean> {
  const state = await getState();
  const updatedList = state.artykuly.filter((a) => a.id !== id);
  if (updatedList.length === state.artykuly.length) return false;
  await patchState('artykuly', updatedList);
  return true;
}
