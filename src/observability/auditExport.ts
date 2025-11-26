import crypto from 'crypto';
import { env } from '../config/env.js';
import { getDeviationThresholds, getDeviationThresholdChanges, verifyDeviationThresholdHashes } from './metrics.js';
import { computeDistributionSnapshot } from './distributionSnapshot.js';
import { listPersistentSnapshots } from './distributionSnapshot.persistence.js';
import { anchorAuditBundle } from './auditAnchor.js';

export interface AuditExportBundle {
  generatedAt: string;
  thresholds: any;
  thresholdHistory: any[]; // ascending ts
  thresholdVerification: {
    allValid: boolean;
    allHmacValid: boolean;
    chainValid: boolean;
    items: any[]; // verification items ascending ts
  };
  currentDistribution: any;
  snapshots: any; // persistent snapshots result
  signature?: string; // HMAC over canonical body
  signatureAlgo?: string;
  version: number;
}

function canonicalize(o: any) {
  return JSON.stringify(o);
}

function sortAscendingByTs(list: any[]) {
  return [...list].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
}

let lastAnchorState: { lastThresholdHash?: string; lastSnapshotTimestamp?: string } = {};

function shouldAnchor(currentHistory: any[], currentSnapshots: any[]): boolean {
  // Se não habilitado retorna falso (anchorAuditBundle já trata, mas evita custo)
  if (!env.auditAnchorEnabled) return false;
  // Última entrada de history (mais recente está no final pois ordenado asc?)
  const latestChange = currentHistory[currentHistory.length - 1];
  const latestHash = latestChange ? latestChange.hash : undefined;
  const latestSnapshot = currentSnapshots.length ? currentSnapshots[0].snapshot : undefined;
  const latestSnapshotTs = latestSnapshot ? latestSnapshot.timestamp : undefined;
  // Condições para ancorar: hash mudou OU timestamp de snapshot mudou
  const hashChanged = latestHash && latestHash !== lastAnchorState.lastThresholdHash;
  const snapshotChanged = latestSnapshotTs && latestSnapshotTs !== lastAnchorState.lastSnapshotTimestamp;
  if (hashChanged || snapshotChanged || !lastAnchorState.lastThresholdHash) {
    lastAnchorState.lastThresholdHash = latestHash;
    lastAnchorState.lastSnapshotTimestamp = latestSnapshotTs;
    return true;
  }
  return false;
}

export async function buildAuditExport(historyLimit = 200, snapshotsLimit = 200): Promise<AuditExportBundle & { anchor?: any }> {
  const thresholds = getDeviationThresholds();
  // getDeviationThresholdChanges returns newest first; invert for ascending
  const historyDesc = getDeviationThresholdChanges(historyLimit);
  const history = sortAscendingByTs(historyDesc);
  const verifyDesc = verifyDeviationThresholdHashes(historyLimit);
  const verify = sortAscendingByTs(verifyDesc);
  const distribution = await computeDistributionSnapshot();
  const snapshots = await listPersistentSnapshots(snapshotsLimit);
  const verifyAgg = {
    allValid: verify.every(v => v.valid),
    allHmacValid: verify.every(v => (v.hmacValid === undefined ? true : v.hmacValid)),
    chainValid: verify.every(v => (v.prevMatch === undefined ? true : v.prevMatch)),
    items: verify,
  };
  const base: AuditExportBundle = {
    generatedAt: new Date().toISOString(),
    thresholds,
    thresholdHistory: history,
    thresholdVerification: verifyAgg,
    currentDistribution: distribution,
    snapshots,
    version: 1,
  };
  if (env.auditExportHmacSecret) {
    const signature = crypto.createHmac('sha256', env.auditExportHmacSecret).update(canonicalize(base)).digest('hex');
    base.signature = signature;
    base.signatureAlgo = 'HMAC-SHA256';
  }
  const anchor = shouldAnchor(history, snapshots.items || []) ? await anchorAuditBundle(base) : null;
  return anchor ? { ...base, anchor } : base;
}

export function auditExportToCsv(bundle: AuditExportBundle): string {
  const lines: string[] = [];
  // Section 1: Threshold changes
  lines.push('#threshold_changes');
  lines.push('ts,actor,reason,hash,hmac,prevHash,valid,hmacValid,prevMatch');
  for (const h of bundle.thresholdVerification.items) {
    lines.push([
      h.ts,
      h.actor || '',
      (h.reason || '').replace(/,/g,';'),
      h.hash,
      h.hmac || '',
      h.prevHash || '',
      h.valid,
      h.hmacValid === undefined ? '' : h.hmacValid,
      h.prevMatch === undefined ? '' : h.prevMatch,
    ].join(','));
  }
  // Section 2: Snapshots (compact)
  lines.push('');
  lines.push('#snapshots');
  lines.push('timestamp,rarity_total,skins_total,alerts_skin_pos,alerts_skin_neg,alerts_rarity_pos,alerts_rarity_neg');
  const snapItems = bundle.snapshots.items || [];
  for (const s of snapItems) {
    const snap = s.snapshot;
    if (!snap) continue;
    lines.push([
      snap.timestamp,
      snap.rarity.total,
      snap.skins.total,
      snap.alerts.skinPositive,
      snap.alerts.skinNegative,
      snap.alerts.rarityPositive,
      snap.alerts.rarityNegative,
    ].join(','));
  }
  // Signature footer (applies to JSON bundle, not CSV itself) if present
  if (bundle.signature) {
    lines.push('');
    lines.push(`#signature algo=${bundle.signatureAlgo} value=${bundle.signature}`);
  }
  return lines.join('\n');
}
