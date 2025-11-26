# 🏪 KROOVA_MARKETPLACE_RULES.md

> Regras oficiais do Marketplace P2P da Kroova  
> Compra e venda de cartas entre jogadores, taxas, limites e proteção básica.

---

## 1. Visão Geral

O marketplace da Kroova é um ambiente **P2P com custódia centralizada**:

- Os jogadores negociam **cartas** entre si.
- A moeda de troca é o **saldo interno da Kroova** (BRL ou cripto, conforme edição).
- A plataforma:
  - cobra uma **taxa sobre cada transação**,
  - garante que o pagamento e a transferência de carta sejam atômicos,
  - registra tudo em `transactions` e `market_listings`.

> “Você não vende só uma carta. Você vende atenção, influência e história.”

---

## 2. Tipos de Operação

Existem dois tipos básicos de operações no marketplace:

1. **Listagem** (anúncio)
   - Jogador coloca uma carta à venda por um preço.
2. **Compra imediata**
   - Outro jogador aceita aquele preço e compra.

Futuramente:

- Leilões, ofertas inversas e pacotes podem ser adicionados,
- Mas o MVP considera apenas **listagem fixa + compra imediata**.

---

## 3. Taxas e Custos

### 3.1. Taxa de Marketplace

- Em cada venda, a Kroova cobra **4%** sobre o valor da transação.
- Essa taxa é descontada automaticamente do valor que o vendedor receberia.

🧮 Fórmula:
