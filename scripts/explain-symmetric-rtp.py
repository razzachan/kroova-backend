#!/usr/bin/env python3
"""
AJUSTAR LIQUIDEZ PARA RTP SIMÉTRICO
Todos os boosters devem ter RTP ~30%, como slots machines
O price_multiplier escala apenas o stake, não o RTP
"""

import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

print("=" * 80)
print("🎰 AJUSTE DE LIQUIDEZ PARA RTP SIMÉTRICO (COMO SLOTS)")
print("=" * 80)

# Buscar todas as cartas
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={'select': 'id,name,rarity,base_liquidity_brl'}
)
cards = response.json()

print(f"\n✅ {len(cards)} cartas carregadas")

print("\n📊 Análise atual:")
print("  Básico (R$ 0.50, mult 1x): RTP 31-33% ✅")
print("  Padrão (R$ 1.00, mult 2x): RTP 22-27% ⚠️")
print("  Premium (R$ 2.00, mult 4x): RTP 17-23% ❌")
print("  Elite (R$ 5.00, mult 10x): RTP 15-17% ❌")
print("  Whale (R$ 10.00, mult 20x): RTP 12-14% ❌")

print("\n💡 Solução: Multiplicar liquidez pelo price_multiplier")
print("  • Básico (mult 1x): liquidez × 1 = atual")
print("  • Padrão (mult 2x): liquidez × 2 = dobro")
print("  • Premium (mult 4x): liquidez × 4 = 4x")
print("  • Elite (mult 10x): liquidez × 10 = 10x")
print("  • Whale (mult 20x): liquidez × 20 = 20x")
print("\n  Resultado: RTP ~30% para TODOS os boosters")

# Buscar boosters para ver os multiplicadores
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': 'name,price_brl,price_multiplier', 'edition_id': 'eq.ED01', 'order': 'price_brl.asc'}
)
boosters = response.json()

print("\n📋 Multiplicadores por tier:")
for booster in boosters[:5]:  # Mostrar um de cada tier
    print(f"  {booster['name']}: R$ {booster['price_brl']:.2f} → mult {booster['price_multiplier']}x")

# IMPORTANTE: Precisamos criar diferentes pools de cartas por multiplier
# Solução alternativa: Adicionar coluna tier_multiplier nas cartas
# Mas isso requer ALTER TABLE...
#
# Solução PRÁTICA: Usar price_multiplier do booster no cálculo do drop
# O backend vai multiplicar base_liquidity_brl × price_multiplier ao dropar

print("\n" + "=" * 80)
print("⚠️  ATENÇÃO: Mudança de estratégia!")
print("=" * 80)
print("\nA liquidez base das cartas está CORRETA (RTP ~30% para Básico).")
print("\nO que precisa mudar é o BACKEND ao calcular o valor do drop:")
print()
print("  ANTES:")
print("    drop_value = card.base_liquidity_brl × skin_mult")
print()
print("  DEPOIS:")
print("    drop_value = card.base_liquidity_brl × skin_mult × booster.price_multiplier")
print()
print("Isso faz com que:")
print("  • Básico (R$ 0.50, mult 1x): carta vale R$ 0.01 → drop R$ 0.01")
print("  • Whale (R$ 10, mult 20x): carta vale R$ 0.01 → drop R$ 0.20")
print()
print("RTP fica IDÊNTICO (~30%) para todos os tiers!")
print()
print("=" * 80)
print("✅ NENHUMA MUDANÇA NECESSÁRIA NO BANCO DE DADOS")
print("❌ MUDANÇA NECESSÁRIA NO BACKEND (abrir booster)")
print("=" * 80)

# Criar SQL para adicionar comentário explicando isso
sql_comment = """
-- Documentação: Sistema de Liquidez Simétrico
-- 
-- As cartas têm base_liquidity_brl calibrada para RTP ~30% em boosters Básico (mult 1x)
-- 
-- Ao abrir boosters mais caros, o backend DEVE multiplicar a liquidez pelo price_multiplier:
--   drop_value = card.base_liquidity_brl × skin_multiplier × booster.price_multiplier
-- 
-- Isso garante RTP simétrico (~30%) independente do preço do booster, como slots machines.
-- 
-- Exemplo:
--   Carta Trash: base_liquidity_brl = R$ 0.005
--   
--   Básico (R$ 0.50, mult 1x):  R$ 0.005 × 1  = R$ 0.005
--   Padrão (R$ 1.00, mult 2x):  R$ 0.005 × 2  = R$ 0.010
--   Premium (R$ 2.00, mult 4x): R$ 0.005 × 4  = R$ 0.020
--   Elite (R$ 5.00, mult 10x):  R$ 0.005 × 10 = R$ 0.050
--   Whale (R$ 10, mult 20x):    R$ 0.005 × 20 = R$ 0.100
"""

with open('LIQUIDEZ_SIMETRICA_EXPLICACAO.sql', 'w', encoding='utf-8') as f:
    f.write(sql_comment)

print("\n✅ Documentação criada: LIQUIDEZ_SIMETRICA_EXPLICACAO.sql")
print("\n📝 Próximo passo: Modificar backend para aplicar price_multiplier no drop")

print("\n" + "=" * 80)
