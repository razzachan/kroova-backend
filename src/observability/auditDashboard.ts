import { getDeviationThresholds, getDeviationThresholdChanges, verifyDeviationThresholdHashes } from './metrics.js';
import { maybeIntegrityAlert, maybeLatencyAlert } from './alertWebhook.js';
import { computeDistributionSnapshot } from './distributionSnapshot.js';
import { listPersistentSnapshots } from './distributionSnapshot.persistence.js';
import { env } from '../config/env.js';
import { Metrics } from './metrics.js';

let cached: any = null;
let cachedAt = 0;

function shouldUseCache() {
  if (env.auditDashboardCacheSeconds <= 0) return false;
  const ageMs = Date.now() - cachedAt;
  return cached && ageMs < env.auditDashboardCacheSeconds * 1000;
}

export async function buildAuditDashboard(limitHistory = 20, limitSnapshots = 10) {
  const start = Date.now();
  if (shouldUseCache()) {
    return { ...cached, cached: true, generationMs: cached.generationMs };
  }
  const thresholds = getDeviationThresholds();
  const history = getDeviationThresholdChanges(limitHistory);
  const verify = verifyDeviationThresholdHashes(limitHistory);
  const distribution = await computeDistributionSnapshot();
  const snapshots = await listPersistentSnapshots(limitSnapshots);
  const snapshot = await Metrics.snapshot();
  const generationMs = Date.now() - start;
  // métricas simples (somatório de ms e contagem de requisições)
  Metrics.incr && Metrics.incr('audit_dashboard_requests_total');
  Metrics.incr && Metrics.incr('audit_dashboard_generation_ms_total', generationMs);
  const payload = {
    generatedAt: new Date().toISOString(),
    thresholds,
    thresholdHistory: history,
    thresholdVerification: {
      allValid: verify.every(v => v.valid),
      allHmacValid: verify.every(v => (v.hmacValid === undefined ? true : v.hmacValid)),
      chainValid: verify.every(v => (v.prevMatch === undefined ? true : v.prevMatch)),
      items: verify,
    },
    currentDistribution: distribution,
    snapshots,
    rtpAlerts: {
      totalHighAlerts: snapshot['economic_rtp_high_alert_total'] || 0,
      totalLowAlerts: snapshot['economic_rtp_low_alert_total'] || 0,
    },
    generationMs,
    cached: false,
  };
  // Alertas webhook (não bloquear resposta)
  maybeIntegrityAlert(payload.thresholdVerification, 'audit-dashboard', payload.generatedAt);
  maybeLatencyAlert(payload.generationMs, 'audit-dashboard', payload.generatedAt);
  cached = payload;
  cachedAt = Date.now();
  return payload;
}
