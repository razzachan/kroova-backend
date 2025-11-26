import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes.js";
import { walletRoutes } from "./wallet.routes.js";
import { boosterRoutes } from "./booster.routes.js";
import { Metrics } from "../../observability/metrics.js";
import { getDeviationThresholds, setDeviationThresholds, getDeviationThresholdChanges, verifyDeviationThresholdHashes } from "../../observability/metrics.js";
import { buildAuditDashboard } from "../../observability/auditDashboard.js";
import { computeDistributionSnapshot, getPreviousDistributionSnapshot } from "../../observability/distributionSnapshot.js";
import { saveDistributionSnapshot, listPersistentSnapshots } from "../../observability/distributionSnapshot.persistence.js";
import { cardRoutes } from "./card.routes.js";
import { marketRoutes } from "./market.routes.js";
import { nftRoutes } from "./nft.routes.js";
import { listEconomicSeries } from "../../observability/economicSeries.js";
import { env } from "../../config/env.js";
import { startEconomicSeriesScheduler } from "../../observability/economicSeries.js";
import { ROOT_MESSAGE } from "../../config/brand.js";

export async function routes(app: FastifyInstance) {
  // Optional protection for internal endpoints (enabled via env)
  app.addHook('onRequest', (req, reply, done) => {
    if (env.internalGuardEnabled && req.url.startsWith('/internal')) {
      const token = (req.headers['x-internal-token'] as string) || '';
      if (!token || token !== env.internalToken) {
        reply.code(403).send({ error: 'forbidden' });
        return;
      }
    }
    done();
  });
  // Health check
  app.get("/", async () => {
    return { ok: true, message: ROOT_MESSAGE };
  });
  app.get("/health", async () => {
    return { ok: true };
  });

  // Registra todas as rotas com prefixo /api/v1
  await app.register(authRoutes, { prefix: "/api/v1" });
  await app.register(walletRoutes, { prefix: "/api/v1" });
  await app.register(boosterRoutes, { prefix: "/api/v1" });

  // Metrics endpoints (internal)
  app.get('/internal/metrics', async (_req, reply) => {
    const prom = await Metrics.renderPrometheus();
    reply.header('Content-Type', 'text/plain');
    return reply.send(prom);
  });

  app.get('/internal/metrics.json', async (_req, reply) => {
    return reply.send(await Metrics.snapshot());
  });
  // Resumo de distribuição (raridades + skins) baseado em counters atuais
  app.get('/internal/distribution-summary', async (_req, reply) => {
    const snap = await Metrics.snapshot();
    const rarityKeys = Object.keys(snap).filter(k => k.startsWith('card_rarity_'));
    const skinKeys = Object.keys(snap).filter(k => k.startsWith('skin_') && !k.endsWith('_alert_total'));
    const totalCards = rarityKeys.reduce((a, k) => a + snap[k], 0);
    const totalSkins = skinKeys.reduce((a, k) => a + snap[k], 0);
    const rarities = rarityKeys.map(k => ({ key: k, count: snap[k], pct: totalCards ? (snap[k] / totalCards * 100) : 0 }));
    const skins = skinKeys.map(k => ({ key: k, count: snap[k], pct: totalSkins ? (snap[k] / totalSkins * 100) : 0 }));
    return reply.send({
      totalCards,
      totalSkins,
      rarities,
      skins,
      skinDeviationAlertsPositive: snap['skin_deviation_alert_total'] || 0,
      skinDeviationAlertsNegative: snap['skin_deviation_negative_alert_total'] || 0,
      rarityDeviationAlertsPositive: snap['rarity_deviation_alert_total'] || 0,
      rarityDeviationAlertsNegative: snap['rarity_deviation_negative_alert_total'] || 0,
    });
  });

  // GET current deviation thresholds
  app.get('/internal/deviation-thresholds', async (_req, reply) => {
    return reply.send(getDeviationThresholds());
  });

  // POST update deviation thresholds (partial)
  app.post('/internal/deviation-thresholds', async (req, reply) => {
    const body = req.body as any;
    if (typeof body !== 'object' || body === null) {
      return reply.code(400).send({ error: 'Invalid body' });
    }
    // Basic numeric validation
    const sanitize = (obj: any, type: 'skin'|'rarity') => {
      if (!obj) return undefined;
      const out: any = {};
      if (obj.positive !== undefined) {
        const v = Number(obj.positive);
        if (isNaN(v) || v <= 0 || v > 1) return reply.code(400).send({ error: `${type}.positive invalid` });
        out.positive = v;
      }
      if (obj.negative !== undefined) {
        const v = Number(obj.negative);
        if (isNaN(v) || v <= 0 || v > 1) return reply.code(400).send({ error: `${type}.negative invalid` });
        out.negative = v;
      }
      if (obj.minSamples !== undefined) {
        const v = Number(obj.minSamples);
        if (!Number.isInteger(v) || v <= 0) return reply.code(400).send({ error: `${type}.minSamples invalid` });
        out.minSamples = v;
      }
      return out;
    };
    const update: any = {};
    const skinSan = sanitize(body.skin, 'skin');
    if (skinSan) update.skin = skinSan;
    const raritySan = sanitize(body.rarity, 'rarity');
    if (raritySan) update.rarity = raritySan;
    if (!update.skin && !update.rarity) {
      return reply.code(400).send({ error: 'No valid threshold fields provided' });
    }
    const actorHeader = (req.headers['x-actor'] || req.headers['x-internal-actor']) as string | undefined;
    const actor = actorHeader && actorHeader.trim() ? actorHeader.trim() : 'internal-api';
    const reason = typeof body.reason === 'string' && body.reason.trim() ? body.reason.trim().slice(0, 240) : undefined;
    try {
      setDeviationThresholds(update, actor, reason);
    } catch (e: any) {
      if (e.message.startsWith('RATE_LIMIT')) {
        return reply.code(429).send({ error: 'Rate limit threshold change', detail: e.message });
      }
      return reply.code(500).send({ error: 'Internal threshold error', detail: e.message });
    }
    return reply.send({ ok: true, thresholds: getDeviationThresholds(), actor, reason });
  });

  // Histórico de mudanças de thresholds
  app.get('/internal/deviation-thresholds/history', async (req, reply) => {
    const limit = Number((req.query as any).limit) || 50;
    return reply.send({ items: getDeviationThresholdChanges(limit) });
  });

  // Verificação de integridade (hash) das últimas mudanças
  app.get('/internal/deviation-thresholds/verify', async (req, reply) => {
    const limit = Number((req.query as any).limit) || 100;
    const result = verifyDeviationThresholdHashes(limit);
    const allValid = result.every(r => r.valid);
    const allHmacValid = result.every(r => (r.hmacValid === undefined ? true : r.hmacValid));
    const chainValid = result.every(r => (r.prevMatch === undefined ? true : r.prevMatch));
    return reply.send({ allValid, allHmacValid, chainValid, items: result });
  });

  // Auditor consolidado
  app.get('/internal/audit-dashboard', async (req, reply) => {
    const limitHistory = Number((req.query as any).historyLimit) || 20;
    const limitSnapshots = Number((req.query as any).snapshotsLimit) || 10;
    const data = await buildAuditDashboard(limitHistory, limitSnapshots);
    return reply.send(data);
  });

  // Export assinada (JSON/CSV) de auditoria
  app.get('/internal/audit-export', async (req, reply) => {
    const historyLimit = Number((req.query as any).historyLimit) || 200;
    const snapshotsLimit = Number((req.query as any).snapshotsLimit) || 200;
    const format = String((req.query as any).format || 'json');
    const bundle = await (await import('../../observability/auditExport.js')).buildAuditExport(historyLimit, snapshotsLimit);
    if (format === 'csv') {
      const csv = (await import('../../observability/auditExport.js')).auditExportToCsv(bundle);
      reply.header('Content-Type', 'text/csv');
      return reply.send(csv);
    }
    return reply.send(bundle);
  });

  // Lista âncoras (in-memory)
  app.get('/internal/audit-anchors', async (req, reply) => {
    const limit = Number((req.query as any).limit) || 50;
    const anchors = await (await import('../../observability/auditAnchor.js')).listAnchors(limit);
    return reply.send({ items: anchors });
  });

  // Verifica existência de anchorId (básico)
  app.get('/internal/audit-anchors/verify/:anchorId', async (req, reply) => {
    const anchorId = (req.params as any).anchorId;
    const anchors = await (await import('../../observability/auditAnchor.js')).listAnchors(200);
    const found = anchors.find((a: any) => a.anchorId === anchorId);
    return reply.send({ anchorId, found: !!found, anchor: found || null });
  });

  // Distribution snapshot with deltas (raridades + skins)
  app.get('/internal/distribution-snapshot', async (_req, reply) => {
    const snap = await computeDistributionSnapshot();
    return reply.send({ snapshot: snap, previous: getPreviousDistributionSnapshot() });
  });

  // Persist and return snapshot
  app.post('/internal/distribution-snapshot/save', async (_req, reply) => {
    const res = await saveDistributionSnapshot();
    return reply.send(res);
  });

  // List stored snapshots (memory or supabase)
  app.get('/internal/distribution-snapshots', async (req, reply) => {
    const limit = Number((req.query as any).limit) || 50;
    const list = await listPersistentSnapshots(limit);
    return reply.send(list);
  });

  // CSV export de snapshots (simplificado)
  app.get('/internal/distribution-snapshots.csv', async (req, reply) => {
    const limit = Number((req.query as any).limit) || 20;
    const list = await listPersistentSnapshots(limit);
    const rows = list.items.map((it: any) => {
      const s = it.snapshot;
      if (!s) return null;
      // campos fixos
      const base: any = {
        timestamp: s.timestamp,
        rarity_total: s.rarity.total,
        skins_total: s.skins.total,
        alerts_skin_pos: s.alerts.skinPositive,
        alerts_skin_neg: s.alerts.skinNegative,
        alerts_rarity_pos: s.alerts.rarityPositive,
        alerts_rarity_neg: s.alerts.rarityNegative,
      };
      // raridades
      for (const r of s.rarity.items) {
        const name = r.key.replace('card_rarity_','').replace('_total','');
        base[`rarity_${name}_count`] = r.count;
        base[`rarity_${name}_pct`] = r.pct.toFixed(4);
      }
      // skins
      for (const sk of s.skins.items) {
        const name = sk.key.replace('skin_','').replace('_total','');
        base[`skin_${name}_count`] = sk.count;
        base[`skin_${name}_pct`] = sk.pct.toFixed(4);
      }
      return base;
    }).filter(Boolean);
    if (rows.length === 0) return reply.code(404).send('no snapshots');
    const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => r[h] ?? '').join(','))).join('\n');
    reply.header('Content-Type', 'text/csv');
    return reply.send(csv);
  });
  
  // Série econômica (longitudinal)
  app.get('/internal/economic-series', async (req, reply) => {
    const q = req.query as any;
    const limit = Number(q.limit) || 100;
    const since = typeof q.since === 'string' ? q.since : undefined;
    const items = listEconomicSeries(limit, since);
    return reply.send({ items, count: items.length });
  });
  // Export série econômica
  app.get('/internal/economic-series/export', async (req, reply) => {
    if (!env.economicSeriesExportEnabled) return reply.code(404).send({ error: 'economicSeries export disabled' });
    const q = req.query as any;
    const limit = Number(q.limit) || 500;
    const format = String(q.format || 'json');
    const mod = await import('../../observability/economicSeriesExport.js');
    const bundle = await mod.buildEconomicSeriesExport(limit);
    if (format === 'csv') {
      const csv = mod.economicSeriesExportToCsv(bundle);
      reply.header('Content-Type', 'text/csv');
      return reply.send(csv);
    }
    return reply.send(bundle);
  });
  // inicia scheduler (idempotente)
  startEconomicSeriesScheduler();
  await app.register(cardRoutes, { prefix: "/api/v1" });
  await app.register(marketRoutes, { prefix: "/api/v1" });
  await app.register(nftRoutes, { prefix: "/api/v1" });
}
