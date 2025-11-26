# KROOVA Skins System (Draft v2025-11-25)

## Objetivo
Fornecer camada cosmética com variação de raridade visual e multiplicadores associados (potencial uso futuro em economia secundária, crafting ou efeitos). Mantém separada da raridade de carta base.

## Conceitos
- `skin`: variante visual aplicada à instância da carta.
- `weight`: peso relativo na rolagem (probabilidade proporcional).
- `multiplier`: fator de valor / liquidez potencial futura (ainda não aplicado em cálculo financeiro nesta fase).
- `default`: skin padrão sem bônus.

## Distribuição ED01 (atual)
| Skin    | Peso | Multiplicador |
|---------|------|---------------|
| default | 70   | 1             |
| neon    | 12   | 2             |
| glow    | 8    | 3             |
| glitch  | 5    | 4             |
| ghost   | 3    | 6             |
| holo    | 1.5  | 8             |
| dark    | 0.5  | 12            |

Probabilidade aproximada = peso / soma(pesos). Soma atual = 100.0.

## Algoritmo
1. Carrega `edition.skins`.
2. Calcula soma de pesos.
3. Gera número aleatório em `[0, soma)`.
4. Itera acumulando pesos até exceder o valor aleatório ⇒ retorna skin.
5. Fallback final garante retorno da última skin.

Implementação em `src/modules/skin/skin.util.ts`:
- `rollSkinWeighted(skins, rng)` → retorna nome.
- `chooseSkin(edition)` → acessório para booster.

## Métricas
Counters Prometheus:
`skin_{nome}_total` para cada skin. Incrementado ao mint da instância.
Permite validar desvios entre frequência real e esperada. Desvio > 15% persistente requer auditoria (ver ferramenta futura).

## Roadmap Futuro
Fase 2: Aplicar multiplicador na liquidez base ao reciclar ou em marketplace (ex.: preço mínimo = base_liquidity * multiplier).
Fase 3: Skins exclusivas por evento / temporada (adicionar campo `season_id`).
Fase 4: Sistema de upgrade / fusão (consome múltiplas skins inferiores para criar superior).

## Integração Econômica (planejada)
Multiplicador não altera distribuição de raridade; serve como camada ortogonal. Necessário ajustar RTP split quando multiplicador começar a impactar liquidez para evitar inflação indireta.

## Auditoria
Logs de mint podem registrar `{ skin, rarity, card_instance_id }` (futuro). Ferramenta para comparar contadores vs probabilidade teórica: `freq_real = skin_total / total_cards_mintadas`.

## Testes
`tests/unit/skin.util.test.ts` verifica ordenação de frequência relativa (não garante exatidão probabilística completa mas é proxy rápido).
Para validação estatística profunda, rodar simulação de 100k rolagens e checar erro relativo < 3% para skins com peso >= 5.

---
Status: Fase 1 concluída (rolagem + métricas). Próximas fases dependem de decisões econômicas.