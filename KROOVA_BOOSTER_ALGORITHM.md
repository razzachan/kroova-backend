Algoritmo dinâmico de economia dos boosters KROOVA
(incluindo reciclagem, jackpots e ajuste por custo de anúncio)

1. Visão Geral

A KROOVA não é um “jogo de azar”.
Ela é uma economia de colecionáveis digitais com liquidez mínima garantida e chance de prêmios altos e raros, sempre controlados por matemática.

Cada edição (ED01, ED02, etc.) possui:

preço de booster definido

quantidade de cartas por booster

tabelas de reciclagem

estrutura de prêmios grandes (R$ 5, 10, 20, 50, 100, 200, 500, 1.000)

e um RTP dinâmico (retorno médio ao usuário) ajustado com base em:

custo de anúncios pagos (CAC)

custos operacionais

metas de margem de lucro

A ideia central:

O sistema devolve uma fatia do faturamento em liquidez e prêmios,
mas essa fatia se adapta à realidade dos custos,
garantindo que a operação continue lucrativa.

2. Conceitos-Chave
   2.1. Booster

Preço sugerido para ED01: R$ 0,50

Cartas por booster: 5

Preço “implícito” por carta: R$ 0,10

Esses valores podem mudar em futuras edições, mas a lógica do algoritmo permanece a mesma.

2.2. RTP (Retorno ao Jogador)

Chamaremos de RTP_total a porcentagem da receita de boosters que volta ao usuário em:

reciclagem de cartas comuns

reciclagem de cartas raras

prêmios grandes (R$ 5, 10, 20, 50, 100, 200, 500, 1.000)

O RTP da KROOVA é dinâmico por edição, com limites:

RTP mínimo: 8% (para não parecer “roubo”)

RTP máximo: 25% (para não comprometer a operação)

Em edições com custo de aquisição baixo (ads mais baratos), o RTP pode se aproximar do teto (25%).
Em edições com custo mais alto, o sistema ajusta para perto do mínimo (8–12%).

2.3. Pools Internos

Para cada edição, dividimos o RTP_total em dois “baldes”:

Pool de Reciclagem Normal

Representa a liquidez mínima garantida de todas as cartas.

Exemplo: 60–70% do RTP_total.

Pool de Jackpots (Prêmios Altos)

Alimenta as cartas com reciclagem especial nos valores:
R$ 5, 10, 20, 50, 100, 200, 500, 1.000.

Exemplo: 30–40% do RTP_total.

Exemplo típico de divisão interna:

RTP_total da edição: 20%

14% → Reciclagem normal (todas as cartas têm um valor mínimo)

6% → Jackpots (pagamentos grandes, raros)

3. Relação com Ads, Custos e Lucro

O algoritmo da edição considera:

CAC (Custo de Aquisição de Cliente) via anúncios pagos

Ticket médio (quantos boosters em média um usuário compra)

Custos fixos e variáveis (gateway de pagamento, taxas, servidores, blockchain quando usada)

Margem mínima de lucro desejada por edição

De forma conceitual:

a KROOVA observa o custo médio por booster vendido (já incluindo ads)

calcula quanto precisa ficar com a operação

e o que “sobra” pode ser devolvido ao usuário como liquidez e prêmios.

Ou seja:

RTP_total não é fixo.
Ele é recalculado a cada edição com base nos custos e na performance de vendas.

4. Raridades Visuais e Valor

As cartas existem em modos visuais (skins), que são também camadas de valor:

Default – base

Neon – fosforescente, cyberpunk

Glow – brilho energético

Glitch – pixels corrompidos

Ghost – etéreo, espiritual

Holo – holográfico premium

Dark – sombrio, proibido

Cada edição define:

a frequência de cada modo visual entre todas as cartas

e um multiplicador de valor de reciclagem associado a cada modo

Exemplo conceitual (não são números fixos, apenas hierarquia):

Default → multiplicador base (1x)

Neon → 2x

Glow → 3x

Glitch → 4x

Ghost → 6x

Holo → 8x

Dark → 12x

A conta final de liquidez considera:

Liquidez da carta = Liquidez_base_da_edição × Multiplicador_do_modo_visual
(e, se aplicável, × fator especial Godmode/jackpot)

5. Godmode e Prêmios Grandes

Godmode não é um modo visual.
Ele é um status especial ultra-raro, aplicado sobre cartas já existentes.

Funciona assim:

Uma fração minúscula das cartas vem com status Godmode.

Parte dos Godmodes tem reciclagem elevada, vinculada aos prêmios (R$ 5, 10, 20, 50, 100, 200, 500, 1.000).

A probabilidade de cada prêmio é ajustada matematicamente para que a soma de (probabilidade × valor) nunca ultrapasse o pool de jackpots definido naquela edição.

Exemplo de lógica (conceitual):

Entre todos os Godmodes possíveis na edição, alguns são marcados como:

Godmode de R$ 5

Godmode de R$ 10

Godmode de R$ 20

Godmode de R$ 50

Godmode de R$ 100

Godmode de R$ 200

Godmode de R$ 500

Godmode de R$ 1.000

As probabilidades são calibradas de forma que:

(R$ 5 × p5) + (R$ 10 × p10) + ... + (R$ 1.000 × p1000)
= valor médio de jackpots por booster daquela edição.

Essa curva pode ser recalculada para cada nova edição com base:

no volume de vendas real

no custo de aquisição

na margem de lucro que se deseja manter

6. Liquidez Normal vs. Liquidez de Jackpot
   6.1. Liquidez Normal (todas as cartas têm algum valor)

Independente de ser premiado ou não, o usuário nunca fica com “nada”.
Mesmo as cartas mais comuns (Default) têm um valor de reciclagem baixo, que:

reforça a percepção de produto justo

reduz frustração

incentiva o usuário a continuar comprando boosters

Essa liquidez normal é calculada assim:

A partir do RTP dedicado à reciclagem normal

Distribuído entre:

a frequência de cada modo visual

seus multiplicadores

Resultado:
Em média, reciclar tudo de uma edição devolve ao usuário apenas parte do que ele gastou, mas:

o restante é valor simbólico/colecionável

e a chance de “acertar” um prêmio alto equilibra a experiência emocional

6.2. Liquidez de Jackpot (prêmios grandes)

Algumas poucas cartas, com status Godmode vinculado a valores fixos, pagam:

R$ 5

R$ 10

R$ 20

R$ 50

R$ 100

R$ 200

R$ 500

R$ 1.000

Essas cartas:

são estatisticamente raríssimas

podem ser associadas a combos específicos (ex.: Dark Holo de certo arquétipo)

carregam a sensação de "raspadinha cyberpunk"

mas sempre dentro do limite de RTP da edição

7. Ajuste Dinâmico por Edição

A cada nova edição, a KROOVA reavalia:

Custo médio de aquisição (CAC)

Quanto foi gasto em anúncios para cada usuário que comprou boosters.

Ticket médio

Em média, quantos boosters um usuário compra.

Custo operacional por booster

Gateway, taxas, infra, suporte, eventuais mints.

Objetivo de margem de lucro

Quanto a KROOVA quer ganhar por booster ou por usuário.

Com isso, a edição define:

RTP_total dentro da faixa 8–25%

Divisão interna:

RTP_reciclagem_normal (ex.: 60–80% do RTP_total)

RTP_jackpots (ex.: 20–40% do RTP_total)

A distribuição dos prêmios R$ 5–1.000

Os valores de reciclagem por tipo de carta

Dessa forma:

Se o custo de ads baixa e a margem permite, o RTP pode subir (mais prêmios / reciclagem mais generosa).

Se os custos sobem, o sistema reduz automaticamente o espaço de prêmios, mantendo o negócio saudável.

8. Edição 01 — Conceito de Partida

ED01 (Colapso da Interface) pode seguir, por exemplo:

Booster: R$ 0,50

5 cartas por booster

RTP_total-alvo: algo entre 15% e 20% (ponto médio entre segurança e apelo)

Proporção interna:

70% desse RTP → reciclagem normal

30% desse RTP → jackpots R$ 5–1.000

Godmode extremamente raro, ligado aos prêmios altos

Modos visuais com multiplicadores e frequências configurados para reforçar:

sensação de abundância (muitas cartas baratas)

com “mitos” de prêmios altos (pouquíssimas cartas realmente fortíssimas)

Os detalhes exatos (probabilidade de cada prêmio, valor em centavos de cada tipo de carta) podem ser ajustados pelo backend com base:

em simulações

em dados reais de compra

e nas metas de crescimento da KROOVA.

9. Resumo em Linguagem Simples

O booster é barato para incentivar volume.

Todo booster contribui com um pedaço do valor para:

liquidez mínima de todas as cartas

um “cofrinho” de prêmios grandes.

Algumas cartas raríssimas pagam muito mais (R$ 5 a R$ 1.000 na reciclagem).

A matemática é feita para:

o usuário poder ganhar bem ocasionalmente

mas a KROOVA sempre ficar com uma margem saudável,
levando em conta:

anúncios

custos do sistema

metas de lucro.

Não é aposta.
É um sistema de colecionáveis com liquidez e raros “momentos épicos” calibrados por edição.

© Kroova Labs — Algoritmo Dinâmico de Boosters — Todos os direitos reservados.

======== FIM DO ARQUIVO ========
 
10. Implementação Atual (Backend v2025-11-25)

Esta seção descreve como o código vigente realiza a parte de jackpots e métricas.

10.1. Distribuição de Raridade

O serviço (`booster.service.ts`) utiliza `rarity_distribution` do tipo de booster e a função `rollRarity()` para escolher cada carta.
Fallback para 'trash' se algo sair fora dos limites. Unicidade tentativa: até 5 tentativas para evitar repetição dentro do mesmo booster.

10.2. Instâncias de Carta

Cada base escolhida gera um registro em `cards_instances` com colunas: `base_id`, `owner_id`, `skin` (por ora sempre 'default').

10.3. Métricas de Raridade

Para cada carta gerada, incrementamos contadores Prometheus:
`card_rarity_trash_total`, `card_rarity_meme_total`, `card_rarity_viral_total`, `card_rarity_legendary_total`, `card_rarity_godmode_total`.

10.4. Jackpot / Godmode Scaling

Quando a raridade escolhida é `godmode` dispara-se a função `applyJackpotReward()` que:
1. Define a tabela de prêmios brutos e pesos (R$ 5, 10, 20, 50, 100, 200, 500, 1.000).
2. Calcula o valor médio teórico (Σ valor × peso / Σ peso).
3. Estima expectativa de godmodes por booster: `cards_per_booster * (pct_godmode/100)`.
4. Determina o payout esperado base = expectativa_godmodes × prêmio_médio.
5. Compara com o alvo de RTP jackpot por booster: `booster_price_brl * planned_jackpot_rtp_pct`.
6. Calcula `scaleFactor = min(1, target_payout / expected_payout_base)` garantindo que nunca exceda o pool planejado (só reduz; não amplia além de 100%).
7. Escolhe um prêmio pela rolagem ponderada.
8. Aplica redução: `scaledPrize = round(chosen.amount * scaleFactor, 2)` com piso mínimo simbólico de R$0,50 para evitar percepção de nulo.
9. Credita saldo na wallet do usuário e registra transação `jackpot_reward` com metadata (prêmio original, escalado, fator).
10. Incrementa métricas `jackpot_hits_total` e `jackpot_payout_brl_total` (valor armazenado em centavos para precisão).

Observação: Se o `expected_payout_base` já for menor que o alvo não há ampliação (mantém-se `scaleFactor <= 1`). Futuro ajuste poderá permitir sobre-distribuição controlada para campanhas.

10.5. Limitações Atuais

- Não há “pity system” ainda (garantia após X boosters).
- Skins ainda não possuem distribuição/multiplicadores reais (sempre 'default').
- Sem ajuste dinâmico de RTP em tempo real (planejado).
- Métricas não incluem latência/histogramas de raridade (apenas contadores absolutos).

10.6. Próximos Incrementos Planejados

- Adicionar controle de convergência: monitorar desvio relativo entre jackpot_payout real e alvo mensal.
- Introduzir módulo de ajuste de `scaleFactor` adaptativo conforme volume.
- Implementar multiplicadores de skins e logging de auditoria de jackpots.
- Acrescentar `pity system` (ex.: garante 1 godmode após N boosters sem ocorrência).

10.7. Segurança & Auditoria

Cada jackpot gera transação explícita; permite rastreio contábil e reconciliação com métricas agregadas. Recomenda-se criar índice em `transactions(type)` e relatório diário que compare soma das transações `jackpot_reward` com métrica `jackpot_payout_brl_total/100`.

Futuro: trigger de auditoria para prevenir duplicidade de crédito em falhas de rede.

Fim da seção de implementação.
