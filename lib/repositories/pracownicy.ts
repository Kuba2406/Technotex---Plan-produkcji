// ============================================================
// lib/repositories/pracownicy.ts – Workers repository
// ============================================================

import type { Pracownik, ZmianyTygodniowe, Nieobecnosc } from '../../types/domain';
import { getState, patchState } from '../db/store';

// ---- Pracownicy ----

export async function getAllPracownicy(): Promise<Pracownik[]> {
  const state = await getState();
  return state.pracownicy;
}

export async function getPracownikById(id: number): Promise<Pracownik | null> {
  const state = await getState();
  return state.pracownicy.find((p) => p.id === id) ?? null;
}

export async function createPracownik(
  data: Omit<Pracownik, 'id'>,
): Promise<Pracownik> {
  const state = await getState();
  const newPracownik: Pracownik = { ...data, id: state.nextId.pracownik };
  const updatedList = [...state.pracownicy, newPracownik];
  await patchState('pracownicy', updatedList);
  await patchState('nextId', { ...state.nextId, pracownik: state.nextId.pracownik + 1 });
  return newPracownik;
}

export async function updatePracownik(
  id: number,
  data: Partial<Omit<Pracownik, 'id'>>,
): Promise<Pracownik | null> {
  const state = await getState();
  const index = state.pracownicy.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated = { ...state.pracownicy[index], ...data };
  const updatedList = [...state.pracownicy];
  updatedList[index] = updated;
  await patchState('pracownicy', updatedList);
  return updated;
}

export async function deletePracownik(id: number): Promise<boolean> {
  const state = await getState();
  const updatedList = state.pracownicy.filter((p) => p.id !== id);
  if (updatedList.length === state.pracownicy.length) return false;
  await patchState('pracownicy', updatedList);
  return true;
}

// ---- Zmiany tygodniowe ----

export async function getZmianyTygodniowe(): Promise<ZmianyTygodniowe> {
  const state = await getState();
  return state.zmianyTygodniowe;
}

export async function saveZmianyTygodniowe(
  zmiany: ZmianyTygodniowe,
): Promise<ZmianyTygodniowe> {
  await patchState('zmianyTygodniowe', zmiany);
  return zmiany;
}

// ---- Nieobecności ----

export async function getAllNieobecnosci(): Promise<Nieobecnosc[]> {
  const state = await getState();
  return state.nieobecnosci;
}

export async function createNieobecnosc(
  data: Omit<Nieobecnosc, 'id'>,
): Promise<Nieobecnosc> {
  const state = await getState();
  const newNieobecnosc: Nieobecnosc = { ...data, id: state.nextId.nieobecnosc };
  const updatedList = [...state.nieobecnosci, newNieobecnosc];
  await patchState('nieobecnosci', updatedList);
  await patchState('nextId', { ...state.nextId, nieobecnosc: state.nextId.nieobecnosc + 1 });
  return newNieobecnosc;
}

export async function deleteNieobecnosc(id: number): Promise<boolean> {
  const state = await getState();
  const updatedList = state.nieobecnosci.filter((n) => n.id !== id);
  if (updatedList.length === state.nieobecnosci.length) return false;
  await patchState('nieobecnosci', updatedList);
  return true;
}
