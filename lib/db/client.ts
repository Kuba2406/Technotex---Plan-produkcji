// ============================================================
// lib/db/client.ts – Supabase client + state persistence
//
// This file provides the Supabase integration layer.
// It is only loaded when STORAGE_BACKEND=supabase.
//
// Set-up instructions:
// 1. Create a free project at https://supabase.com
// 2. Run the SQL in supabase/schema.sql in the Supabase SQL editor
// 3. Copy .env.example to .env.local and fill in the values
// 4. Set STORAGE_BACKEND=supabase in .env.local
// ============================================================

import type { AppState } from '../../types/domain';

// Lazy-load the Supabase client so the app works without credentials
let _client: import('@supabase/supabase-js').SupabaseClient | null = null;

function getClient() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Supabase credentials not configured. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js');
    _client = createClient(url, key);
  }
  return _client!;
}

// ---- Table names ----
// The single-table approach stores the whole state as a JSON blob.
// This is intentionally simple for MVP v1.
// In a future iteration, each entity type can have its own table.
const STATE_TABLE = 'app_state';
const STATE_ROW_ID = 1;

/**
 * Load application state from Supabase.
 * Falls back to returning null if no row exists.
 */
export async function getSupabaseState(): Promise<AppState> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from(STATE_TABLE)
    .select('payload')
    .eq('id', STATE_ROW_ID)
    .single();

  if (error || !data) {
    throw new Error(`Supabase read error: ${error?.message ?? 'no data'}`);
  }

  return data.payload as AppState;
}

/**
 * Persist application state to Supabase (upsert).
 */
export async function saveSupabaseState(state: AppState): Promise<AppState> {
  const supabase = getClient();
  const { error } = await supabase
    .from(STATE_TABLE)
    .upsert({ id: STATE_ROW_ID, payload: state, updated_at: new Date().toISOString() });

  if (error) {
    throw new Error(`Supabase write error: ${error.message}`);
  }

  return state;
}
