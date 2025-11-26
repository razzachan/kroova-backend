# KROOVA Pity System (Design Draft v2025-11-25)

## 1. Objetivo
Reduzir frustração de jogadores que abrem muitos boosters sem obter um evento raro (godmode / jackpot), fornecendo aumento suave, matematicamente controlado, na probabilidade após sequência de insucessos. Mantém RTP dentro de limites planeados e evita exploração (gaming).

## 2. Termos
- `godmode_base_pct`: percentual base definido na edição (ex.: 1%).
- `attempts_since_last_godmode`: contador por usuário (reseta quando ocorre godmode).
- `pity_thresholds`: lista ordenada de marcos que ativam incrementos.
- `increment_curve`: função ou tabela que define acréscimo relativo à probabilidade base.
- `pity_cap_multiplier`: multiplicador máximo sobre a probabilidade base (ex.: 3x => se base 1%, máximo 3%).

## 3. Comportamento Geral
1. Cada booster aberto sem godmode incrementa `attempts_since_last_godmode`.
2. A probabilidade efetiva para próxima carta do booster é:
   ```
   p_eff = min( godmode_base_pct * pity_cap_multiplier,
                godmode_base_pct + F(attempts_since_last_godmode) )
   ```
   Onde `F(n)` é função de incremento cumulativo.
3. Ao sair godmode:
   - Contador zera.
   - RTP efetivo ajusta-se (jackpot scaling já limita payout). Pity não altera valor do prêmio, só a chance.

## 4. Função F(n) (Exemplo)
Usamos formato piecewise baseado em patamares (mantém previsibilidade):
| Intervalo n | Incremento F(n) adicional sobre base |
|-------------|--------------------------------------|
| 0–49        | 0                                    |
| 50–99       | +0.10 * base                         |
| 100–149     | +0.25 * base                         |
| 150–199     | +0.45 * base                         |
| 200–249     | +0.70 * base                         |
| 250+        | +1.00 * base (até cap)               |

Ou seja, com base 1%:
- n < 50 => 1.00%
- 50 ≤ n < 100 => 1.10%
- 100 ≤ n < 150 => 1.25%
- 150 ≤ n < 200 => 1.45%
- 200 ≤ n < 250 => 1.70%
- 250+ => 2.00% (se cap = 2x). Ajustável.

Alternative contínua (logística suavizada):
```
F(n) = base * k / (1 + e^{-a (n - b)})
```
Parâmetros calibrados para que F(n) aproxime incrementos desejados. Piecewise inicial é mais simples para auditoria.

## 5. RTP e Controle
Pity aumenta frequência de godmode portanto potencialmente aumenta payout médio bruto antes de scaling. O scaling já limita o valor total jackpot por booster, mas se a frequência superar o esperado, `scaleFactor` reduzirá prêmios. Monitorar métrica:
```
jackpot_hits_total / boosters_abertos
```
Comparar com frequência teórica projetada (godmode_base_pct). Se desvio > tolerância (ex.: +30%), recalibrar thresholds.

## 6. Anti-Exploração
- Limite superior (`pity_cap_multiplier`) impede inflação indefinida.
- Incrementos baseados em número de boosters desde último godmode; não consideram bateladas simultâneas.
- Reset completo no evento raro impede farming parcial.
- Possível auditoria: armazenar histórico `(user_id, booster_opening_id, attempts_since_last_godmode_before, godmode_triggered)`.

## 7. Persistência
Tabela sugerida `user_stats_pity`:
```
user_id (PK)
edition_id
attempts_since_last_godmode INT
updated_at TIMESTAMPTZ
```
Estratégias:
- Atualiza após cada booster aberto.
- Reseta a zero quando godmode ocorre.
- Se múltiplas edições ativas, rastrear por edição (pode haver diferentes bases/thresholds).

## 8. Algoritmo na Abertura do Booster
Pseudo-code para cada carta gerada:
```
config = getEditionConfig(edition_id)
basePct = config.rarityDistribution.godmode // percent
pity = loadUserPity(userId, edition_id)
boostedPct = applyPity(basePct, pity.attempts_since_last_godmode)
pickRarityWithAdjustedGodmode(boostedPct, otherDistribution)
if rarity == godmode:
   pity.attempts_since_last_godmode = 0
else:
   pity.attempts_since_last_godmode++
saveUserPity(pity)
```
A distribuição das outras raridades deve ser re-normalizada para manter soma ≈ 100% quando `godmode` muda:
```
remaining = 100 - boostedPct
scale = remaining / (100 - basePct)
trash' = trash * scale
meme'  = meme * scale
...
```
Mantém proporções relativas.

## 9. Métricas Adicionais
- `pity_godmode_overrides_total`: quando um godmode ocorre com probabilidade > base.
- `pity_attempts_histogram`: bucketizar número de tentativas antes do sucesso.
- `pity_active_users_gauge`: usuários com attempts >= primeiro threshold.

## 10. Roadmap de Implementação
Fases:
1. Persistência e contador simples (sem ajustar probabilidade, só medir baseline).
2. Ativar piecewise increment sem re-normalizar (apenas para observar impacto). Desabilitado em produção via feature flag.
3. Introduzir re-normalização das raridades.
4. Ajuste dinâmico de thresholds via config e dashboard.
5. Migração para curva logística se necessário.

## 11. Feature Flags
Adicionar em `edition.ts` ou arquivo separado:
```
{ pityEnabled: boolean, pityCapMultiplier: number, pityThresholds: number[], pityIncrements: number[] }
```
Para ED01 inicial: desativado (`pityEnabled=false`) até coleta de baseline.

## 12. Auditoria & Segurança
- Registrar quando `boostedPct != basePct` em log estruturado.
- Limitar manipulação: somente serviço admin pode alterar thresholds.
- Backfill: reconstruir histórico a partir de transações `booster_openings` se necessário.

## 13. Testes
Unit:
- Função `applyPity(basePct, attempts)` retorna valores esperados piecewise.
- Re-normalização mantém soma 100 ± 0.001.
- Cap respeitado.
Integrado:
- Simulação de 10k boosters sem pity vs com pity mostra aumento controlado dentro meta de escala.

---
Status: Draft pronto para implementação Fase 1.
