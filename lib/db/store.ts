// ============================================================
// lib/db/store.ts – Server-side application state store
//
// Provides a simple in-memory store that is used as the
// default backend. The store is initialised from seed data
// on first access.
//
// Swap strategy (controlled via STORAGE_BACKEND env var):
//   "memory"   – in-process, resets on server restart (default)
//   "file"     – persists to a JSON file on disk
//   "supabase" – persists to Supabase/PostgreSQL (see client.ts)
// ============================================================

import type { AppState } from '../../types/domain';
import { initialData } from '../../seed/initial-data';
import fs from 'fs';
import path from 'path';

// Deep clone helper
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ---- In-memory store (server singleton) ----
// In Next.js, modules are cached in the Node.js process so this
// global variable persists across API route calls in the same
// server process.
let memoryStore: AppState | null = null;

function getFilePath(): string {
  return process.env.DATA_FILE_PATH
    ? path.resolve(process.env.DATA_FILE_PATH)
    : path.join(process.cwd(), 'data', 'app-state.json');
}

function loadFromFile(): AppState | null {
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as AppState;
    }
  } catch {
    // Fall through to return null
  }
  return null;
}

function saveToFile(state: AppState): void {
  const filePath = getFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[store] Failed to save state to file:', err);
  }
}

// ---- Public API ----

/**
 * Returns the current application state.
 * On first call, initialises from the configured backend.
 */
export async function getState(): Promise<AppState> {
  const backend = process.env.STORAGE_BACKEND ?? 'memory';

  if (backend === 'file') {
    const stored = loadFromFile();
    return stored ? stored : deepClone(initialData);
  }

if (backend === 'supabase') {
  const { getSupabaseState } = await import('./client');
  try {
    return await getSupabaseState();
  } catch (err) {
    console.error('[store] Supabase read failed:', err);
    console.warn('[store] Supabase unavailable, falling back to memory store');
  }
}

  // Default: in-memory
  if (!memoryStore) {
    memoryStore = deepClone(initialData);
  }
  return memoryStore;
}

/**
 * Persists the full application state.
 * Returns the saved state.
 */
export async function saveState(state: AppState): Promise<AppState> {
  const backend = process.env.STORAGE_BACKEND ?? 'memory';

if (backend === 'supabase') {
  const { saveSupabaseState } = await import('./client');
  try {
    return await saveSupabaseState(state);
  } catch (err) {
    console.error('[store] Supabase save failed:', err);
    console.warn('[store] Supabase save failed, writing to memory as fallback');
  }
}

  // Default: in-memory
  memoryStore = deepClone(state);
  return memoryStore;
}

/**
 * Patches a single top-level key in the state.
 * Convenience wrapper that reads, merges, and saves.
 */
export async function patchState(
  key: keyof AppState,
  value: AppState[typeof key],
): Promise<AppState> {
  const current = await getState();
  const updated: AppState = { ...current, [key]: value };
  return saveState(updated);
}

/**
 * Resets the store to the initial seed data.
 * Useful for testing / fresh-start scenarios.
 */
export async function resetState(): Promise<AppState> {
  return saveState(deepClone(initialData));
}
