# Kroova Observability & Distribuição

## Visão Geral
Este documento descreve métricas internas, alertas de desvio estatístico e o mecanismo de snapshots de distribuição (raridades e skins) para auditoria e calibração econômica.

## Métricas
Geradas em memória com fallback opcional para Redis. Endpoints:
- `GET /internal/metrics` (Prometheus)
- `GET /internal/metrics.json` (JSON simples)
- `GET /internal/distribution-summary` (resumo atual de raridades e skins + contadores de alertas)

Camadas atuais de observability implementadas:
1. Counters básicos (HTTP, boosters, raridade, skins, jackpots)
2. Thresholds dinâmicos com histórico (hash + HMAC + cadeia prevHash)
3. Verificação de integridade agregada (hash, hmac, chain)
4. Snapshots de distribuição (raridade + skins) com deltas e persistência
5. Auditor consolidado (cache TTL + métricas de latência + média derivada)
6. Export assinada (JSON/CSV) + regra de frequência inteligente para ancoragem externa
7. Âncoras externas persistidas + verificação simples + métricas (sucesso/falha)
8. Alertas webhook (integridade / latência)
9. Série econômica longitudinal (economicSeries) em memória (fase 1)

### Alertas de Desvio
Counters:
- `skin_deviation_alert_total` (desvio positivo > limiar)
- `skin_deviation_negative_alert_total` (desvio negativo < -limiar)
- `rarity_deviation_alert_total` (desvio positivo > limiar)
- `rarity_deviation_negative_alert_total` (desvio negativo < -limiar)

Thresholds dinâmicos (percentual relativo sobre a probabilidade esperada) controlados via:
- `GET /internal/deviation-thresholds`
- `POST /internal/deviation-thresholds` body parcial:
```json
{
  "skin": { "positive": 0.18, "negative": 0.15, "minSamples": 800 },
  "rarity": { "positive": 0.22 }
}
```

## Snapshots de Distribuição
Capturam estado consolidado com deltas desde o snapshot anterior.
Endpoint base:
- `GET /internal/distribution-snapshot` (gera novo snapshot em memória com deltas)
Persistência:
- `POST /internal/distribution-snapshot/save` (gera e tenta persistir) 
- `GET /internal/distribution-snapshots?limit=50` (lista últimos snapshots persistidos ou fallback em memória)

### Scheduler Automático
Ativado em produção e ambientes != test ao iniciar o servidor:
- Intervalo configurável por `DIST_SNAPSHOT_INTERVAL_MINUTES` (default 15). 
- Implementado em `startSnapshotScheduler()` dentro de `distributionSnapshot.persistence.ts`.

## Estrutura da Tabela (Supabase)
Criação recomendada:
```sql
create table if not exists public.distribution_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  snapshot jsonb not null
);
create index on public.distribution_snapshots (created_at desc);
```

### Campo `snapshot`
Exemplo (parcial):
```json
{
  "timestamp": "2025-11-25T03:15:00.123Z",
  "rarity": {
    "total": 120345,
    "deltaTotal": 4520,
    "items": [ {"key":"card_rarity_trash_total","count":80000,"pct":66.48,"deltaCount":3000,"deltaPct":0.12} ]
  },
  "skins": {
    "total": 120345,
    "deltaTotal": 4520,
    "items": [ {"key":"skin_default_total","count":90000,"pct":74.79,"deltaCount":3500,"deltaPct":0.20} ]
  },
  "alerts": {
    "skinPositive": 12,
    "skinNegative": 1,
    "rarityPositive": 3,
    "rarityNegative": 0
  }
}
```

## Fluxo Operacional
1. Sistema gera métricas continuamente (booster openings, skins, raridades).
2. Ao atingir `minSamples` por categoria, desvios são avaliados e counters de alerta incrementados quando ultrapassam limites.
3. Snapshot manual ou scheduler captura estado + deltas para histórico.
4. Calibração: ajustar thresholds via endpoint para reagir a volatilidade ou mudança de edição.

## Boas Práticas
- Ajustar `minSamples` antes de reduzir thresholds para evitar ruído estatístico.
- Revisar snapshots diários para detectar drift lento.
- Exportar snapshots para análises externas se necessário (ex: BI).
- Manter versionamento dos thresholds aplicado (auditar alterações via logs).

## Governança de Thresholds
Alterações de thresholds são sensíveis e seguem regras:
- Rate limit por actor: intervalo mínimo definido por `THRESHOLD_CHANGE_MIN_SECONDS` (default 60s).
- Actor informado via header `x-actor` ou `x-internal-actor`.
- Histórico inclui `before`, `after`, `actor`, `ts` e `diff` calculado.

Endpoint histórico: `GET /internal/deviation-thresholds/history?limit=50`
Campos adicionais:
- `reason`: motivo declarado para ajuste.
- `hash`: SHA256 imutável (inclui ts, actor, reason, before, after) para auditoria.
Exemplo de item:
```json
{
  "ts": "2025-11-25T03:40:00.000Z",
  "actor": "ops-admin",
  "reason": "aumentar tolerância skins rare",
  "hash": "4f2c9e...",
  "before": { "skin": {"positive":0.15,...}, "rarity": {...} },
  "after": { "skin": {"positive":0.18,...}, "rarity": {...} },
  "diff": { "skin": {"positive":0.03,"negative":0,"minSamples":0}, "rarity": {"positive":0,"negative":0,"minSamples":0} }
}
```

### Verificação de Integridade
Endpoint: `GET /internal/deviation-thresholds/verify?limit=100`
Retorno:
```json
{
  "allValid": true,
  "items": [
    { "ts": "2025-11-25T03:40:00Z", "actor": "ops-admin", "reason": "ajuste x", "hash": "...", "valid": true }
  ]
}
```
Processo: servidor recalcula SHA256 (ts, actor, reason, before, after) e compara com `hash` armazenado.
Se algum `valid=false`, acionar investigação e possível restauração de backup.

Boas práticas adicionais:
- Registrar motivo da mudança (futuro: campo extra ou log separado).
- Validar hash periodicamente para garantir integridade (futuro endpoint de verificação).

## Auditor Consolidado
Endpoint: `GET /internal/audit-dashboard`
Parâmetros:
- `historyLimit` (default 20)
- `snapshotsLimit` (default 10)

Retorno:
```json
{
  "generatedAt": "2025-11-25T03:55:00.000Z",
  "thresholds": { "skin": {"positive":0.16,...}, "rarity": {...} },
  "thresholdHistory": [ {"ts":"...","actor":"...","diff":{...},"hash":"..."} ],
  "thresholdVerification": {
    "allValid": true,
    "allHmacValid": true,
    "chainValid": true,
    "items": [ {"hash":"...","valid":true,"hmac":"<sha256>","hmacValid":true,"prevHash":"<hash-anterior>","prevMatch":true} ]
  },
  "currentDistribution": { "timestamp": "...", "rarity": {...}, "skins": {...}, "alerts": {...} },
  "snapshots": { "source": "memory", "items": [ {"snapshot": {...}} ] }
}
```
Uso principal: fornecer visão única para calibragem (desvios atuais + histórico de ajustes + integridade: hash + HMAC + cadeia + evolução temporal de distribuição).
- Evitar ajustes simultâneos em múltiplos parâmetros sem teste de impacto.
- Aumentar `minSamples` após grande mudança para reduzir falso positivo.

### Cache e Latência do Audit Dashboard
O endpoint aplica cache em memória configurado por `AUDIT_DASHBOARD_CACHE_SECONDS` (default 5s). Quando `cached=true` o payload anterior é servido sem custo de recomputação e sem incremento dos counters. Requisições que reconstruem (`cached=false`) incrementam:
- `audit_dashboard_requests_total`
- `audit_dashboard_generation_ms_total` (acumula milissegundos de geração)

Métrica derivada exposta como gauge em `/internal/metrics`:
```
# HELP audit_dashboard_generation_ms_avg Average ms to generate audit dashboard
# TYPE audit_dashboard_generation_ms_avg gauge
audit_dashboard_generation_ms_avg 3.42
```
Estratégia recomendada:
- Ajustar TTL com base no ritmo de mudança dos thresholds e necessidade de frescor.
- Observar `audit_dashboard_generation_ms_avg`; se subir progressivamente, investigar fontes (verificação de cadeia, volume de snapshots, I/O Supabase).
- Para investigações pontuais, definir `AUDIT_DASHBOARD_CACHE_SECONDS=0` e medir latência real sem cache.
- Acionar alerta se média > objetivo interno (ex: 50ms) ou crescimento > 30% semana.

### Alertas Webhook
Variáveis de ambiente:
- `ALERT_WEBHOOK_URL`: endpoint que receberá POST JSON.
- `ALERT_WEBHOOK_TIMEOUT_MS`: timeout (default 2000ms).
- `AUDIT_DASHBOARD_LATENCY_ALERT_MS`: limiar de latência para disparo (default 250ms).

Tipos de eventos enviados:
```json
{ "type": "INTEGRITY_ALERT", "generatedAt": "...", "verification": { "allValid": false, "allHmacValid": true, "chainValid": true }, "timestamp": "..." }
{ "type": "LATENCY_ALERT", "generatedAt": "...", "generationMs": 340, "thresholdMs": 250, "timestamp": "..." }
```
Cooldown: mínimo 60s entre alertas do mesmo tipo para evitar spam.
Critérios:
- Integridade: qualquer falha em hash / HMAC / cadeia dispara uma vez por janela.
- Latência: geração acima do limiar definido.

Boas práticas:
- Usar canal separado (ex: Slack webhook) para visibilidade imediata.
- Registrar correlação entre falha de integridade e mudanças operacionais recentes.
- Ajustar limiar de latência após medir baseline em produção.

### Ancoragem Externa de Export
Objetivo: garantir não-repúdio e prova de existência de um bundle de auditoria em tempo específico.

Fluxo:
1. Geração do bundle `/internal/audit-export` (JSON) inclui `signature` (HMAC local) e cálculo de `digest` SHA256.
2. Se `AUDIT_ANCHOR_ENABLED=true` e `AUDIT_ANCHOR_URL` definido, envia POST:
```json
{ "type":"AUDIT_EXPORT_ANCHOR", "digest":"<sha256>", "generatedAt":"...", "signature":"<hmac>", "version":1 }
```
3. Resposta externa deve retornar `anchorId` (ou id derivado). Bundle final incorpora:
```json
"anchor": { "anchorId": "anchor-1732545630000", "anchoredAt": "2025-11-25T04:30:40.000Z", "provider": "mock-anchor", "ok": true }
```

Frequência inteligente: âncora ocorre somente se houve mudança no último `thresholdHistory` (hash diferente) ou novo snapshot persistente desde a âncora anterior. Evita duplicação sem necessidade.

Variáveis:
- `AUDIT_ANCHOR_ENABLED` (boolean)
- `AUDIT_ANCHOR_URL` (endpoint externo de ancoragem)

Boas práticas de ancoragem:
- Persistir `anchorId` em storage separado (futuro: tabela audit_export_anchors).
- Opcional: publicar digest em blockchain ou serviço de timestamp RFC3161.
- Auditar periodicidade: ancorar apenas quando thresholdHistory mudar ou a cada N snapshots.
- Manter rota interna futura para revalidar existência da âncora (`/internal/audit-anchor/verify`).
 - Consultar histórico de âncoras via `GET /internal/audit-anchors?limit=50`.

Métricas associadas:
- Endpoint de verificação: `GET /internal/audit-anchors/verify/:anchorId` retorna `{ found, anchor }` para checagem rápida local.
- `anchor_success_total`: incrementado em âncoras bem-sucedidas.
- `anchor_fail_total`: incrementado em falhas (timeout, HTTP != 2xx).

## Série Econômica (economicSeries)
Objetivo: registrar evolução temporal agregada da geração e payout (boosters, jackpots, distribuição de raridade e skins, alertas) para análises de tendência e futura correlação econômica (reciclagem, marketplace, RTP real vs planejado).

Captura:
- Periódica via scheduler: intervalo `ECONOMIC_SERIES_INTERVAL_SECONDS` (default 60s).
- Event-driven: disparada em `boosterOpen` e `jackpotHit` respeitando janela mínima `ECONOMIC_SERIES_EVENT_MIN_SECONDS` (default 15s) para evitar excesso.

Buffer:
- In-memory ring limitado por `ECONOMIC_SERIES_MAX_ENTRIES` (default 500); descarta entradas antigas quando excede.

Schema por entrada:
```
ts (ISO)
rarityPct { trash: %, meme: %, viral: %, legendary: %, godmode: % }
skinPct { default: %, neon: %, glow: %, ... }
boosterOpensCumulative
jackpotHitsCumulative
jackpotPayoutCentsCumulative (soma em cents)
jackpotAvgPayoutCents (média simples)
periodJackpotHits (delta)
periodJackpotPayoutCents (delta)
periodBoosterOpens (delta)
alerts { rarityPositive, rarityNegative, skinPositive, skinNegative }
marketListingsCumulative / periodMarketListings
marketTradesCumulative / periodMarketTrades
marketVolumeCentsCumulative / periodMarketVolumeCents
marketFeeCentsCumulative / periodMarketFeeCents
marketFloorRejectionsCumulative / periodMarketFloorRejections
recycleConversionsCumulative / periodRecycleConversions
recycleValueCentsCumulative / periodRecycleValueCents
boosterRevenueCentsCumulative / periodBoosterRevenueCents
rtpPct ( (jackpotPayoutCentsCumulative + recycleValueCentsCumulative) / boosterRevenueCentsCumulative * 100 )
grossMarginPct ( (boosterRevenueCentsCumulative - jackpotPayoutCentsCumulative - recycleValueCentsCumulative) / boosterRevenueCentsCumulative * 100 )
 boosterRevenueByTypeCents { standard: centsTotal, premium: centsTotal, ... }
 boosterRevenueByTypePeriodCents { standard: centsDelta, premium: centsDelta, ... }
 boosterRevenueByChannelCents { internal: centsTotal, stripe: centsTotal, crypto: centsTotal, ... }
 boosterRevenueByChannelPeriodCents { internal: centsDelta, stripe: centsDelta, crypto: centsDelta, ... }
 rtpHighAlertTriggered (boolean na entrada se ultrapassou limiar alto)
 rtpLowAlertTriggered (boolean na entrada se caiu abaixo do limiar baixo)
 integrity { hash, prevHash, hmacValid, chainValid }  // somente quando persistência + integridade ativadas
```

Endpoint:
`GET /internal/economic-series?limit=N&since=ISO_TS` -> `{ items, count }` (ordem ascendente, últimos N respeitando filtro since).

Roadmap Fase 2:
- Persistência Supabase (tabela economic_series + HMAC + prevHash opcional).
- Inclusão de reciclagem, marketplace (trades, volume), custos e RTP efetivo.
- Export econômico (CSV/JSON) com assinatura e possível ancoragem.
- Alertas de divergência RTP planejado vs real.
- Cálculo de margens: receita boosters vs custo reciclagem + jackpots (profit e RTP efetivo).
- Dashboards de liquidez e velocidade de giro (turnover) do marketplace (listings vs trades por janela).
- Ajuste futuro: revenue granular por tipo de booster e canais (interno vs stripe vs crypto) para segmentação de RTP.
 - (Concluído) Revenue granular por tipo e canal + mapas cumulativos e de período.
 - (Concluído) Alertas de RTP alto/baixo com thresholds configuráveis.

Boas práticas iniciais:
- Ajustar intervalo periódico conforme volatilidade (menor em stress test, maior em produção estável).
- Usar `since` para consumo incremental por dashboards sem reprocessar todo buffer.
- Analisar ratio jackpotAvgPayoutCents vs preço médio do booster para calibrar plannedJackpotRtpPct.
 - Usar segmentação de receita para investigar divergência de RTP por tipo/canal.
 - Tratar entradas com `rtpLowAlertTriggered=true` como candidatas a revisão de probabilidade ou precificação.

### Segmentação de Receita
Implementada via ledger em memória alimentado pelo fluxo de compra de boosters. Para cada compra:
- Atualiza mapa cumulativo por tipo (`boosterRevenueByTypeCents`) e canal (`boosterRevenueByChannelCents`).
- Calcula deltas de período (`boosterRevenueByTypePeriodCents`, `boosterRevenueByChannelPeriodCents`) comparando última captura.
Benefícios:
- Permite calcular RTP segmentado offline (ex.: jackpot payouts associados a boosters premium vs standard em análises futuras).
- Suporta decisão de ajuste de preço por canal (ex.: crypto vs fiat) baseado em margem.

### Alertas de RTP
Dois thresholds configuráveis via ambiente:
- `ECONOMIC_SERIES_RTP_ALERT_HIGH_PCT`
- `ECONOMIC_SERIES_RTP_ALERT_LOW_PCT`
Lógica:
1. Após calcular `rtpPct`, compara com limites.
2. Se `rtpPct > HIGH_PCT` incrementa `economic_rtp_high_alert_total` e marca entrada com `rtpHighAlertTriggered=true`.
3. Se `rtpPct < LOW_PCT` incrementa `economic_rtp_low_alert_total` e marca entrada com `rtpLowAlertTriggered=true`.
4. Entradas podem acionar ambos? (raríssimo) Por regra de negócio atual: tratamos separadamente; se limites cruzarem (config errado) ambos podem acionar — monitorar.
Boas práticas:
- Evitar thresholds muito próximos (ex.: high=65, low=64) para reduzir ruído.
- Revisar média móvel do RTP antes de ajustar limites.
- Usar lookback de N entradas para decidir se alerta persistente merece ação (ex.: 3 consecutivos baixo).

Counters novos:
- `economic_rtp_high_alert_total`
- `economic_rtp_low_alert_total`

### Integridade da Série Econômica
Quando `ECONOMIC_SERIES_PERSIST_ENABLED=true` e `ECONOMIC_SERIES_INTEGRITY_ENABLED=true`:
- Cada linha persistida armazena `hash` (SHA256 do JSON canônico da entrada), `prev_hash` (hash da entrada anterior persistida) e `hmac` (opcional usando `ECONOMIC_SERIES_HMAC_SECRET`).
- Cadeia permite detectar remoção ou alteração retroativa. Verificação futura: recalcular e comparar; se qualquer quebra, aciona webhook de integridade.
Recomendações:
- Rotacionar `HMAC_SECRET` somente com reprocessamento ou corte controlado da cadeia.
- Export incluir `hash`, `prev_hash` e `hmac` para auditoria externa.

### Export Econômico
Endpoint dedicado (JSON/CSV) inclui agora mapas de receita segmentada e flags de alerta RTP. Assinatura HMAC cobre todo bundle, garantindo não-repúdio. Para ancoragem externa definir `ECONOMIC_EXPORT_ANCHOR_ENABLED=true` e URL do provedor.

### Futuras Extensões (Segmentação/RTP)
- Calcular RTP segmentado por tipo (necessário mapear payouts por origem do booster — backlog).
- Margem por canal (incluir custos específicos de processamento/fee por canal).
- Heatmap temporal de receita vs payouts (ex.: variação por hora do dia).
- Janela móvel adaptativa: ajustar intervalo de captura quando volatilidade de RTP maior que X.

## Próximas Extensões (Sugestões)
- Export assinada (JSON + CSV) incluindo assinatura global (ex: HMAC do bundle).
- Encadeamento externo (anchor em blockchain ou timestamp server) para reforçar não-repúdio.
- Painel visual agregando tendência (sparkline por raridade/skin).
- Correlação entre desvios e impacto econômico (RTP, reciclagem, marketplace).
- Alertas automáticos via webhook quando `chainValid=false` ou `allHmacValid=false`.
- Persistência + integridade da economicSeries + métricas ampliadas (reciclagem, marketplace, custos operacionais, margem, LTV por booster).

---
Última atualização: 2025-11-25
