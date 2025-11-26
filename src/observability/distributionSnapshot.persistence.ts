import { supabaseAdmin } from '../config/supabase.js';
import { computeDistributionSnapshot } from './distributionSnapshot.js';

interface PersistentSnapshotRecord {
  id?: string;
  created_at?: string;
  snapshot: any;
}

// In-memory fallback for test / dev when Supabase not available
const memoryStore: PersistentSnapshotRecord[] = [];

function canPersist(): boolean {
  if (process.env.NODE_ENV === 'test') return false; // avoid external I/O in tests
  return !!process.env.SUPABASE_SERVICE_KEY; // heuristic
}

export async function saveDistributionSnapshot() {
  const snap = await computeDistributionSnapshot();
  if (!canPersist()) {
    memoryStore.push({ snapshot: snap });
    return { persisted: false, snapshot: snap };
  }
  try {
    const { error } = await supabaseAdmin
      .from('distribution_snapshots')
      .insert({ snapshot: snap });
    if (error) {
      memoryStore.push({ snapshot: snap });
      return { persisted: false, snapshot: snap, error: error.message };
    }
    return { persisted: true, snapshot: snap };
  } catch (e: any) {
    memoryStore.push({ snapshot: snap });
    return { persisted: false, snapshot: snap, error: e?.message };
  }
}

export function listMemorySnapshots() {
  return memoryStore.slice();
}

export async function listPersistentSnapshots(limit = 50) {
  if (!canPersist()) return { source: 'memory', items: listMemorySnapshots() };
  try {
    const { data, error } = await supabaseAdmin
      .from('distribution_snapshots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return { source: 'error', error: error.message, items: [] };
    return { source: 'supabase', items: data as PersistentSnapshotRecord[] };
  } catch (e: any) {
    return { source: 'error', error: e?.message, items: [] };
  }
}

// Scheduler (call startSnapshotScheduler() once at boot if desired)
let schedulerHandle: NodeJS.Timeout | null = null;
export function startSnapshotScheduler(intervalMs = 5 * 60 * 1000) {
  if (schedulerHandle) return; // already running
  schedulerHandle = setInterval(() => {
    saveDistributionSnapshot().catch(() => {/* ignore */});
  }, intervalMs);
}

export function stopSnapshotScheduler() {
  if (schedulerHandle) {
    clearInterval(schedulerHandle);
    schedulerHandle = null;
  }
}
