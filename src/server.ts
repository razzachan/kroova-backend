import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { cacheSet, CACHE_KEYS } from './lib/cache.js';
import { supabaseAdmin } from './config/supabase.js';
import { startSnapshotScheduler } from './observability/distributionSnapshot.persistence.js';

// Diagnostic helpers (lightweight)
function logActiveHandles(tag: string) {
  // Using any to avoid TS complaining about _getActiveHandles (internal API)
  const handles = (process as any)._getActiveHandles?.() || [];
  const requests = (process as any)._getActiveRequests?.() || [];
  console.log(`[diag] ${tag} activeHandles=${handles.length} activeRequests=${requests.length}`);
}

async function start() {
  try {
    const app = await buildApp();
    // Verifica conectividade básica Supabase (falha não bloqueia start, mas alerta)
    try {
      const { data, error } = await supabaseAdmin.from('booster_types').select('id').limit(1);
      if (error) {
        console.error('[supabase] connectivity check error:', error.message);
      } else {
        console.log(`[supabase] connectivity ok booster_types_count_hint=${data ? data.length : 0}`);
      }
    } catch (e) {
      console.error('[supabase] connectivity exception:', (e as Error).message);
    }
    // Cache warming (edição ED01) - evita múltiplas round-trips iniciais (skippable via NO_WARM)
    if (env.nodeEnv !== 'test' && process.env.NO_WARM !== 'true') {
      try {
        const { data: bases } = await supabaseAdmin
          .from('cards_base')
          .select('id, rarity, edition_id')
          .eq('edition_id', 'ED01')
          .limit(500);
        if (bases && bases.length > 0) {
          await cacheSet(CACHE_KEYS.ED01_CARDS, JSON.stringify(bases), 600);
          app.log.info({ warmed: bases.length }, 'cache warmed ED01 cards');
        }
      } catch (e) {
        app.log.warn({ err: (e as Error).message }, 'cache warming skipped');
      }
    } else if (process.env.NO_WARM === 'true') {
      console.log('[diag] NO_WARM flag set, skipping cache warming');
    }
    // Defensive: prefer explicit host and add global error handlers
    process.on('uncaughtException', (err) => {
      console.error('uncaughtException', err);
    });
    process.on('unhandledRejection', (reason) => {
      console.error('unhandledRejection', reason);
    });
    await app.listen({ port: Number(env.port), host: String((env as any).bindHost || '127.0.0.1') });
    app.log.info({ port: env.port, env: env.nodeEnv }, "backend started");
    logActiveHandles('post-listen');
    app.server.on('close', () => {
      console.log('[diag] server close event');
    });
    // Inicia scheduler de snapshots de distribuição (desativado em test)
    if (env.nodeEnv !== 'test' && process.env.NO_SCHEDULER !== 'true') {
      startSnapshotScheduler(env.distributionSnapshotIntervalMinutes * 60 * 1000);
      app.log.info({ intervalMin: env.distributionSnapshotIntervalMinutes }, 'distribution snapshot scheduler started');
    } else if (process.env.NO_SCHEDULER === 'true') {
      console.log('[diag] NO_SCHEDULER flag set, scheduler disabled');
    }
    // Heartbeat + active handles sampler to keep process alive & observe resources
    setInterval(() => {
      logActiveHandles('heartbeat');
    }, 10000);
  } catch (error) {
    console.error("❌ Error starting server:", error);
    // Do not exit in dev; allow investigation
    if (env.nodeEnv === 'production') process.exit(1);
  }
}

start();
