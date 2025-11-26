import { env } from '../config/env.js';

let lastIntegrityAlertTs = 0;
let lastLatencyAlertTs = 0;
let lastRtpHighAlertTs = 0;
let lastRtpLowAlertTs = 0;
const INTEGRITY_COOLDOWN_MS = 60_000; // evita spam
const LATENCY_COOLDOWN_MS = 60_000;
const RTP_COOLDOWN_MS = 60_000;

function getWebhookUrl() {
  if (process.env.NODE_ENV === 'test') {
    return process.env.ALERT_WEBHOOK_URL || env.alertWebhookUrl;
  }
  return env.alertWebhookUrl;
}

async function postWebhook(event: any) {
  const url = getWebhookUrl();
  if (!url) return;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), env.alertWebhookTimeoutMs);
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      signal: ctrl.signal,
    });
    clearTimeout(t);
  } catch {/* ignorar falhas */}
}

export async function maybeIntegrityAlert(verification: { allValid: boolean; allHmacValid: boolean; chainValid: boolean }, source: string, generatedAt: string) {
  if (verification.allValid && verification.allHmacValid && verification.chainValid) return;
  const now = Date.now();
  if (now - lastIntegrityAlertTs < INTEGRITY_COOLDOWN_MS) return;
  lastIntegrityAlertTs = now;
  await postWebhook({
    type: 'INTEGRITY_ALERT',
    source,
    generatedAt,
    verification,
    timestamp: new Date().toISOString(),
  });
}

export async function maybeLatencyAlert(generationMs: number, source: string, generatedAt: string) {
  if (!env.auditDashboardLatencyAlertMs && env.auditDashboardLatencyAlertMs !== 0) return;
  if (generationMs <= env.auditDashboardLatencyAlertMs) return;
  const now = Date.now();
  if (now - lastLatencyAlertTs < LATENCY_COOLDOWN_MS) return;
  lastLatencyAlertTs = now;
  await postWebhook({
    type: 'LATENCY_ALERT',
    source,
    generatedAt,
    generationMs,
    thresholdMs: env.auditDashboardLatencyAlertMs,
    timestamp: new Date().toISOString(),
  });
}

// Funções auxiliares para teste
export function _test_resetAlerts() { lastIntegrityAlertTs = 0; lastLatencyAlertTs = 0; lastRtpHighAlertTs = 0; lastRtpLowAlertTs = 0; }

// RTP Alerts (econômico)
export async function maybeRtpHighAlert(rtpPct: number, thresholds: { high: number; low?: number }, source = 'economicSeries', generatedAt = new Date().toISOString()) {
  const now = Date.now();
  if (now - lastRtpHighAlertTs < RTP_COOLDOWN_MS) return;
  lastRtpHighAlertTs = now;
  await postWebhook({
    type: 'RTP_HIGH_ALERT',
    source,
    generatedAt,
    rtpPct,
    thresholds,
    timestamp: new Date().toISOString(),
  });
}

export async function maybeRtpLowAlert(rtpPct: number, thresholds: { low: number; high?: number }, source = 'economicSeries', generatedAt = new Date().toISOString()) {
  const now = Date.now();
  if (now - lastRtpLowAlertTs < RTP_COOLDOWN_MS) return;
  lastRtpLowAlertTs = now;
  await postWebhook({
    type: 'RTP_LOW_ALERT',
    source,
    generatedAt,
    rtpPct,
    thresholds,
    timestamp: new Date().toISOString(),
  });
}
