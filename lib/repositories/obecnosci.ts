// ============================================================
// lib/repositories/obecnosci.ts – Attendance repository
// ============================================================

import type { RecordObecnosci, ObecnosciMap } from '../../types/domain';
import { getState, patchState } from '../db/store';

export async function getAllObecnosci(): Promise<ObecnosciMap> {
  const state = await getState();
  return state.obecnosci;
}

export async function getObecnosciForShift(
  dateStr: string,
  zmiana: 1 | 2,
): Promise<RecordObecnosci[]> {
  const state = await getState();
  const key = `${dateStr}_${zmiana}`;
  return state.obecnosci[key] ?? [];
}

export async function saveObecnosciForShift(
  dateStr: string,
  zmiana: 1 | 2,
  records: RecordObecnosci[],
): Promise<RecordObecnosci[]> {
  const state = await getState();
  const key = `${dateStr}_${zmiana}`;
  const updatedMap: ObecnosciMap = { ...state.obecnosci, [key]: records };
  await patchState('obecnosci', updatedMap);
  return records;
}

export async function saveFullObecnosci(
  obecnosci: ObecnosciMap,
): Promise<ObecnosciMap> {
  await patchState('obecnosci', obecnosci);
  return obecnosci;
}
