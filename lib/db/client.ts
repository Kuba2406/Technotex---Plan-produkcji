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
import { initialData } from '../../seed/initial-data';

// Lazy-load the Supabase client so the app works without credentials
let _client: import('@supabase/supabase-js').SupabaseClient | null = null;

function getClient() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Supabase credentials not configured. ' +
          'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js');
    _client = createClient(url, key);
  }
  return _client!;
}

// ---- Table names ----
const STATE_TABLE = 'app_state';
const STATE_ROW_ID = 1;

/**
 * Load application state from Supabase.
 * If no row exists yet, return initial seed data.
 */
export async function getSupabaseState(): Promise<AppState> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from(STATE_TABLE)
    .select('payload')
    .eq('id', STATE_ROW_ID)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase read error: ${error.message}`);
  }

  if (!data) {
    return initialData;
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
