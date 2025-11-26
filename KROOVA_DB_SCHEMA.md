======== INÍCIO DO ARQUIVO ========

# 🏛️ KROOVA — Database Schema (Supabase) (Legacy)

> Nota de transição: a versão atualizada está em `KROUVA_DB_SCHEMA.md`. Use a versão Krouva em implementações novas; este arquivo é mantido como referência histórica.

> Documento de referência para implementação do banco Kroova no Supabase via Copilot.  
> Contém especificações funcionais, tipos PostgreSQL, regras de negócio, e relacionamentos.

---

## 🔐 Contexto Geral

Kroova é uma plataforma de colecionáveis digitais (cartas) com economia híbrida, liquidez mínima garantida, marketplace P2P, reciclagem, e custódia gerenciada automaticamente.
O banco **não salva chaves privadas expostas**: são sempre **criptografadas**.
O usuário **não precisa de CPF para jogar**, somente para movimentar dinheiro.

---

## 🧱 ENTIDADES PRINCIPAIS

users  
wallets  
transactions  
cards_base  
cards_instances  
user_inventory  
pending_inventory  
booster_types  
booster_openings  
market_listings  
recycle_history  
audit_hashes

---

## 👤 USERS

id (uuid PK)  
display_id (text) - prefix + 6 chars ex: usr_a921fe  
email (text unique)  
name (text)  
cpf (text) - obrigatório só quando movimentar dinheiro  
created_at (timestamp)

Regra: **Saques PIX somente para o mesmo CPF.**

---

## 💼 WALLETS (custodial)

id (uuid PK)  
user_id (uuid FK → users)  
balance_brl (numeric 12,2)  
balance_crypto (numeric 18,8)  
wallet_private_enc (text - chave privada criptografada AES)  
created_at (timestamp)

⚠️ Chave só descriptografada em **Edge Function segura**.

---

## 📑 TRANSACTIONS

id (uuid PK)  
user_id (uuid FK)  
type (enum: deposit, withdraw, market_buy, market_sell, recycle, booster_purchase)  
amount_brl (numeric 12,2)  
amount_crypto (numeric 18,8)  
status (enum: pending, confirmed, failed)  
metadata (jsonb)  
created_at (timestamp)

💰 **Taxa de saque = 4%.**

---

## 🃏 CARDS_BASE

id (uuid PK)  
display_id (text) ex: crd_9ae233  
name (text)  
description (text)  
rarity (enum: trash, meme, viral, legendary, godmode)  
archetype (text)  
base_liquidity_brl (numeric 12,2)  
base_liquidity_crypto (numeric 18,8)  
edition_id (text)  
image_url (text)  
metadata (jsonb)

Raridades Temáticas:
trash — lixo digital 💩  
meme — virou piada 😂  
viral — tendência ⚡  
legendary — status cobiçado 👑  
godmode — carta divina 🌌

---

## 🧩 CARDS_INSTANCES

id (uuid PK)  
base_id (uuid FK → cards_base)  
owner_id (uuid FK → users)  
skin (text opcional)  
minted_at (timestamp)  
hash_onchain (text)

---

## 👜 USER_INVENTORY

user_id (uuid FK)  
card_instance_id (uuid FK)  
quantity (integer)  
created_at (timestamp)

---

## ⏳ PENDING_INVENTORY

id (uuid PK)  
email (text)  
items (jsonb) - lista de boosters/cartas  
created_at (timestamp)

📌 Quando o usuário cria conta usando o mesmo email, **os itens são transferidos automaticamente.**

---

## 📦 BOOSTERS

### 🧪 BOOSTER_TYPES

id (uuid PK)  
name (text)  
price_brl (numeric 12,2)  
price_crypto (numeric 18,8)  
rarity_distribution (jsonb)

Exemplo rarity_distribution:
{"trash":60,"meme":25,"viral":10,"legendary":4,"godmode":1}

### ✨ BOOSTER_OPENINGS

id (uuid PK)  
user_id (uuid FK)  
booster_type_id (uuid FK)  
cards_obtained (jsonb)  
opened_at (timestamp)

---

## 🎯 USER_STATS_PITY (fase 1 tracking)

user_id (uuid FK → users)  
edition_id (text)  
attempts_since_last_godmode (integer)  
updated_at (timestamp)

Chave composta `(user_id, edition_id)`.

Uso:
- Incrementa 1 a cada booster aberto sem godmode.
- Reseta para 0 quando ocorre qualquer godmode no booster.
- Fase 1 não altera probabilidades de raridade.
- Preparação para implementação do sistema de pity (ver `KROUVA_PITY_SYSTEM.md` — legacy: `KROOVA_PITY_SYSTEM.md`).

---

## ♻ RECYCLE_HISTORY

id (uuid PK)  
user_id (uuid FK)  
card_instance_id (uuid FK)  
gained_brl (numeric 12,2)  
gained_crypto (numeric 18,8)  
created_at (timestamp)

📌 Reciclagem sempre paga a **liquidez base**.

---

## 🏪 MARKET_LISTINGS

id (uuid PK)  
seller_id (uuid FK)  
card_instance_id (uuid FK)  
price_brl (numeric 12,2)  
price_crypto (numeric 18,8)  
status (enum: active, sold, cancelled)  
created_at (timestamp)

💰 Venda aplica taxa de **4% para a plataforma.**

---

## 🔐 AUDIT_HASHES

id (uuid PK)  
source (text: inventário, lote, transação etc.)  
hash (text)  
created_at (timestamp)

---

## 📊 MERMAID ER DIAGRAM

(cole normalmente no markdown, é apenas visual)

erDiagram  
 users ||--|{ wallets : owns  
 users ||--o{ transactions : makes  
 users ||--o{ cards_instances : owns  
 users ||--o{ user_inventory : holds  
 users ||--o{ recycle_history : recycles  
 users ||--o{ market_listings : sells  
 cards_base ||--o{ cards_instances : minted_from  
 cards_instances ||--|| user_inventory : contained_in  
 booster_types ||--o{ booster_openings : opened  
 users ||--o{ booster_openings : performs

---

## 🏁 FINAL

Este documento é o **contrato de referência** para o Copilot gerar o banco Kroova no Supabase.

======== FIM DO ARQUIVO ========
