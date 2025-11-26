# 🔐 KROOVA — Protocolo NFT & Metadados

Este documento define o padrão técnico para criação, identificação, autenticação e registro blockchain das cartas KROOVA.

---

## 💠 Blockchain Recomendada

### 📌 **Polygon (Matic)**

- Baixíssimas taxas (ideal para boosters baratos)
- Ecossistema compatível com Ethereum
- Suporte amplo a marketplaces (OpenSea, Rarible etc.)
- Alta escalabilidade para mint em massa

> _Outras blockchains poderão ser adicionadas conforme expansão, sem alterar o padrão de metadados._

---

## 📦 Tipo de Token

| Tipo         | Descrição           | Uso                            |
| ------------ | ------------------- | ------------------------------ |
| **ERC-721**  | Token único         | Cartas individuais (1/1)       |
| **ERC-1155** | Token multi-unidade | Edições / Impressões múltiplas |

📌 **KROOVA usará ERC-1155** para possibilitar:

- Várias cópias da mesma carta
- Custos reduzidos de mint
- Facilitar booster packs e skins

---

## 🏷️ Identificação das Cartas

Cada NFT possui 3 identificadores:

| Nome            | Tipo                   | Exemplo                    |
| --------------- | ---------------------- | -------------------------- |
| **card_id**     | ID da arte única       | `KRV-032`                  |
| **edition_id**  | Edição                 | `ED01`                     |
| **instance_id** | ID da cópia individual | Hash automático Blockchain |

👉 **Formato final:**

```
KRV-032-ED01#[blockchain_hash]
```

---

## 📊 Metadados Padrão (NFT Metadata JSON)

```json
{
  "name": "Crocodile do PIX",
  "description": "Entidade da Ganância Digital na Interface Kroova.",
  "image": "ipfs://Qm...hash",
  "external_url": "https://kroova.com/card/KRV-032",
  "attributes": [
    { "trait_type": "Raridade", "value": "Épica" },
    { "trait_type": "Arquetipo", "value": "Ganância" },
    { "trait_type": "Tendência", "value": 87 },
    { "trait_type": "Influência Social", "value": 92 },
    { "trait_type": "Impacto Econômico", "value": 85 },
    { "trait_type": "Skin", "value": "Neonburst" },
    { "trait_type": "Valor Base (Liquidez)", "value": "R$ 3,00" },
    { "trait_type": "Edição", "value": "ED01 - Colapso da Interface" }
  ]
}
```

---

## 🔐 Registro de Liquidez (On/Off-chain)

A liquidez **não deve ser registrada diretamente na blockchain**, evitando:

- custos excessivos
- exploits
- manipulação de valores

📌 **Estratégia Kroova:**

- Liquidez registrada **off-chain (banco)** com hash **on-chain para auditoria**.
- Prova de posse via **assinatura Web3** do usuário.

---

## 🔁 Reciclagem (Burn Opcional)

Reciclar cartas pode ser:

| Método                                     | Vantagem                                               |
| ------------------------------------------ | ------------------------------------------------------ |
| **Transferência para carteira do sistema** | Permite reuso, pacotes especiais, reprints controlados |
| **Burn real**                              | Usado apenas em eventos especiais                      |

📌 **Padrão Kroova = NÃO fazer burn automático.**

💡 Cartas recicladas viram **estoque estratégico do mercado.**

---

## 🧬 Skins NFT (Versões Alternativas)

Cada skin é uma **subvariante** do mesmo card, diferenciada via metadata:

| Campo              | Exemplo                                 |
| ------------------ | --------------------------------------- |
| `"Skin"`           | `"Glitch"`, `"Neonburst"`, `"Blackout"` |
| `"ArtworkVariant"` | `"G1"`, `"BX2"`                         |

👉 Isso evita criar novos tokens desnecessários e mantém **identidade evolutiva.**

---

## 🧠 Smart Contract (Funções Obrigatórias)

| Função              | Finalidade                         |
| ------------------- | ---------------------------------- |
| `mintBatch()`       | Mint de boosters                   |
| `mintSingle()`      | Mint isolado                       |
| `verifyOwnership()` | Verificação de posse via carteira  |
| `transferCard()`    | Transações P2P                     |
| `burnCard()`        | (Opcional) Burn controlado         |
| `updateURI()`       | Upgrades auditáveis de metadados   |
| `customURI()`       | URLs flexíveis para metadados IPFS |

🔒 **Metadata pode ser atualizável**, porém **somente com registro histórico**, mantendo transparência.

---

## 📌 Observações Técnicas

- Carteiras externas (MetaMask) serão opcionais.
- Usuários iniciantes podem usar **carteira custodial interna**.
- Dados de liquidez **nunca** ficam 100% on-chain.
- Hashes servem como auditoria contra fraude.

---

> 🔒 _“Blockchain registra o passado. A tendência define o futuro.”_  
> — Protocolo Kroova
