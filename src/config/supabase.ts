import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// New strategy: stub ONLY if SUPABASE_STUB_ENABLED=true (explicit opt-in for tests)
// Otherwise require real credentials; fail fast if missing.
let supabase: any;
let supabaseAdmin: any;

const useStub = process.env.SUPABASE_STUB_ENABLED === 'true';

if (useStub) {
  type Row = Record<string, any>;
  const mem: Record<string, Row[]> = {
    users: [], wallets: [], refresh_tokens: [], pending_inventory: [], user_inventory: [],
    cards_base: [], cards_instances: [], transactions: [], booster_openings: [], market_listings: [], recycle_history: [], user_stats_pity: [], audit_hashes: []
  };
  function from(table: string) {
    const state = { table, filters: [] as { field: string; value: any }[] };
    function applyFilters(rows: Row[]) { return rows.filter(r => state.filters.every(f => r[f.field] === f.value)); }
    return {
      insert(data: any) { const arr = mem[table] || (mem[table] = []); const toInsert = Array.isArray(data) ? data : [data]; toInsert.forEach(d => arr.push({ ...d })); return Promise.resolve({ data: toInsert, error: null }); },
      update(patch: any) { return { eq(field: string, value: any) { state.filters.push({ field, value }); const arr = mem[table] || (mem[table] = []); const filtered = applyFilters(arr); filtered.forEach(row => Object.assign(row, patch)); return Promise.resolve({ data: filtered, error: null }); } }; },
      select(_cols?: string) { return this; },
      order(_field: string, _opts?: any) { return this; },
      eq(field: string, value: any) { state.filters.push({ field, value }); return this; },
      single() { const arr = mem[table] || (mem[table] = []); const filtered = applyFilters(arr); return Promise.resolve({ data: filtered[0] || null, error: null }); },
      limit(n: number) { const arr = mem[table] || (mem[table] = []); const filtered = applyFilters(arr).slice(0, n); return Promise.resolve({ data: filtered, error: null }); }
    } as any;
  }
  const authStub = {
    getUser: (_token: string) => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@test.com', role: 'authenticated' } }, error: null })
  };
  supabase = { from, auth: authStub };
  supabaseAdmin = { from, auth: authStub };
  console.log('[supabase] Using in-memory stub (SUPABASE_STUB_ENABLED=true)');
} else {
  if (!env.supabaseUrl || !env.supabaseAnonKey || !env.supabaseServiceKey) {
    throw new Error('Missing Supabase credentials: set SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_KEY');
  }
  supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
  supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export { supabase, supabaseAdmin };
