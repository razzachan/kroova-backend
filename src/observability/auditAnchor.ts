import { env } from '../config/env.js';
import crypto from 'crypto';
import { Metrics } from './metrics.js';
import { supabaseAdmin } from '../config/supabase.js';

export interface AnchorResult {
  anchorId: string;
  anchoredAt: string;
  provider?: string;
  requestId?: string;
  ok: boolean;
  error?: string;
}

export async function anchorAuditBundle(payload: any): Promise<AnchorResult | null> {
  if (!env.auditAnchorEnabled || !env.auditAnchorUrl) return null;
  // Deriva hash SHA256 do payload completo (já inclui assinatura interna do bundle se existir)
  const raw = JSON.stringify(payload);
  const digest = crypto.createHash('sha256').update(raw).digest('hex');
  const body = {
    type: 'AUDIT_EXPORT_ANCHOR',
    digest,
    generatedAt: payload.generatedAt,
    signature: payload.signature,
    version: payload.version,
  };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(env.auditAnchorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    let json: any = {};
    try { json = await res.json(); } catch {}
    const anchorId = json.anchorId || digest;
    const anchoredAt = new Date().toISOString();
    const record = {
      anchorId,
      anchoredAt,
      provider: json.provider || 'external',
      requestId: json.requestId,
      ok: res.ok,
      error: res.ok ? undefined : `status ${res.status}`,
      digest,
      version: payload.version,
      signature: payload.signature,
      generatedAt: payload.generatedAt,
    } as any;
    anchorHistory.push(record);
    if (res.ok) Metrics.incr && Metrics.incr('anchor_success_total'); else Metrics.incr && Metrics.incr('anchor_fail_total');
    // Persistência (ignorar erros silenciosamente, principalmente em test)
    if (process.env.NODE_ENV !== 'test') {
      supabaseAdmin.from('audit_export_anchors').insert({
        anchor_id: record.anchorId,
        digest: record.digest,
        generated_at: record.generatedAt,
        provider: record.provider,
        request_id: record.requestId,
        ok: record.ok,
        error: record.error,
        signature: record.signature,
        version: record.version,
      }).then(()=>{}).catch(()=>{});
    }
    return record;
  } catch (e: any) {
    const record = { anchorId: '', anchoredAt: new Date().toISOString(), ok: false, error: e.message };
    anchorHistory.push(record as any);
    Metrics.incr && Metrics.incr('anchor_fail_total');
    return record as any;
  }
}

// In-memory history for test / listing
const anchorHistory: AnchorResult[] = [];
export async function listAnchors(limit = 100) {
  // Tenta ler de Supabase se habilitado
  if (env.auditAnchorEnabled && process.env.NODE_ENV !== 'test') {
    try {
      const { data } = await supabaseAdmin
        .from('audit_export_anchors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (data) {
        return data.map((row: any) => ({
          anchorId: row.anchor_id,
          anchoredAt: row.created_at,
          provider: row.provider,
          requestId: row.request_id,
          ok: row.ok,
          error: row.error,
          digest: row.digest,
          version: row.version,
          signature: row.signature,
          generatedAt: row.generated_at,
        }));
      }
    } catch {/* fallback memória */}
  }
  return anchorHistory.slice(-limit).reverse();
}
