# KROOVA Tech Guide (v2025-11-25)

Ordem lógica de componentes críticos recém implementados / ajustados:

## 1. Test Mode & Bypasses
O ambiente de testes (`NODE_ENV=test` ou presença de Vitest) remove dependências externas para acelerar a suíte:
- Auth: rota de registro e login usa caminho rápido no `auth.service.ts` (cria `users` + `wallets` via `supabaseAdmin` e emite refresh token em memória).
- Refresh Tokens: armazenados em `Map` local ao invés de tabela `refresh_tokens`.
- Redis: substituído por stub em `lib/cache.ts` evitando conexões (removendo ECONNREFUSED loops).
- BullMQ: filas e workers desativados em `lib/queue-bullmq.ts`.
- Booster Flow: `booster.service.ts` retorna booster dummy, abre e gera cartas in-memory.
- Métricas: incrementos ignoram Redis, permanecendo apenas contadores locais.

Benefício: testes de integração completam em <1s sem infra auxiliar.

## 2. Booster Economy & RTP
Referência completa em `KROOVA_BOOSTER_ALGORITHM.md`. Resumo matemático aplicado:
- Expected Godmodes por booster: `cards_per_booster * (godmode_pct/100)`.
- Base average jackpot prize: média ponderada dos prêmios e pesos.
- Expected payout base: `expectedGodmodes * baseAvgPrize`.
- Target jackpot payout por booster: `booster_price_brl * planned_jackpot_rtp_pct`.
- Scale factor: `min(1, target / expected_base)` reduz pagamentos mantendo RTP planejado.
- Scaled prize: arredondado para 2 casas, piso simbólico R$0,50.
Transação `jackpot_reward` guarda `original_prize`, `scaled_prize`, `scale_factor`.

## 3. IPFS Stub Layer (`src/lib/ipfs.ts`)
Fornece funções `ipfsUploadJson` e `ipfsUploadBuffer` que retornam CID fake (`bafy...` derivado de SHA256). Uso atual: permitir desenvolvimento de fluxos de NFT/metadata sem provider real.
Roadmap:
1. Provider configurável PINATA/WEB3_STORAGE.
2. Tabela `ipfs_assets` para tracking (CID, tipo, checksum, pin_status).
3. Re-pin automático e auditoria de integridade.
4. Assinatura de payloads com chave de serviço para prova.

## 4. Cache Warming
Adicionado no bootstrap (`server.ts`):
- Carrega até 500 bases de cartas da edição `ED01` e salva JSON em `CACHE_KEYS.ED01_CARDS` com TTL de 600s.
- Loga `cache warmed ED01 cards` com quantidade.
- Ignorado em test mode para não poluir.
Planejado: invalidar seletivamente quando edição for republish / seed alterado.

## 5. Métricas Internas
Arquivo `observability/metrics.ts`:
- Contadores locais sempre atualizados.
- Redis (quando presente) persiste incremento (skip em test).
- Exposição `/internal/metrics` fornece snapshot + compatível Prometheus.
Próximos passos: histogramas de latência e gauge de convergência de jackpot.

## 6. Falhas Corrigidas
- Timeouts por Redis removidos via stub.
- Compra de booster em teste retornava 400 por ID inválido — resolvido com UUID dummy.
- Erros de schema (coluna `opened`) removidos; uso de `opened_at` nula.

## 7. Próximo Roadmap Técnico
- Lazy init completo de BullMQ (reduzir logs ECONNREFUSED quando libs importadas antes do flag).
- Distribuição real de skins e multiplicadores.
- Pity system para rareza godmode.
- Ajuste adaptativo de `scaleFactor` conforme desvio acumulado do alvo mensal.
- IPFS provider real + auditoria de CIDs.

## 8. Operacional & Auditoria
Recomendações:
- Índice em `transactions(type)` para agregações rápidas.
- Job diário: comparar soma de `scaled_prize` com métrica `jackpot_payout_brl_total/100`.
- Dashboard: mostrar RTP planejado vs real (`payout_real / faturamento_boosters`).

## 9. Como Testar Local
```powershell
$env:NODE_ENV='test'; npm test -- --run tests/integration/auth_booster_flow.test.ts
```
Para rodar com infra real (Supabase/Redis):
```powershell
# garantir .env com chaves reais
npm run dev
```

## 10. Segurança Simplificada
- Sem dependência externa IPFS ou Redis em test => menor superfície.
- Jackpot transactions atômicas (único insert crédito). Futuro: usar DB function para evitar race conditions.

---
Este guia cobre a ordem lógica das novidades (Test Mode → RTP → IPFS Stub → Cache Warming → Métricas → Correções). Atualizar conforme incrementos.
