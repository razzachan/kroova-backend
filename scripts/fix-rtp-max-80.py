#!/usr/bin/env python3
"""Ajustar todos os boosters para RTP máximo de 80%"""

import os
import requests
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
print("🎯 AJUSTANDO PARA RTP MÁXIMO 80%")
print("=" * 80)

# Buscar todos os boosters
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': 'id,name,price_brl', 'edition_id': 'eq.ED01'}
)
boosters = response.json()
print(f"\n✅ {len(boosters)} boosters carregados")

booster_prices = {b['id']: b['price_brl'] for b in boosters}
booster_names = {b['id']: b['name'] for b in boosters}

# Buscar todos os jackpots
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/raspadinhas",
    headers=headers,
    params={'select': '*'}
)
jackpots = response.json()
print(f"✅ {len(jackpots)} jackpots carregados")

# Configuração: RTP alvo máximo 80%, sendo conservador
PROBABILITY_CONFIG = {
    0.50: {  # Básico - manter (61-69% OK)
        'minor': 0.005,   # 0.5%
        'major': 0.0002,  # 0.02%
        'grand': 0.00001  # 0.001%
    },
    1.00: {  # Padrão - reduzir levemente (66-75% -> 60-70%)
        'minor': 0.015,   # 1.5% (era 2.0%)
        'major': 0.0008,  # 0.08% (era 0.1%)
        'grand': 0.00004  # 0.004% (era 0.005%)
    },
    2.00: {  # Premium - reduzir (67-80% -> 60-70%)
        'minor': 0.025,   # 2.5% (era 4.0%)
        'major': 0.0006,  # 0.06% (era 0.1%)
        'grand': 0.00003  # 0.003% (era 0.005%)
    },
    5.00: {  # Elite - reduzir bastante (75-93% -> 60-75%)
        'minor': 0.045,   # 4.5% (era 8.0%)
        'major': 0.0015,  # 0.15% (era 0.25%)
        'grand': 0.00003  # 0.003% (era 0.005%)
    },
    10.00: {  # Whale - reduzir drasticamente (101-109% -> 60-75%)
        'minor': 0.07,    # 7.0% (era 15.0%)
        'major': 0.002,   # 0.2% (era 0.5%)
        'grand': 0.00008  # 0.008% (era 0.025%)
    }
}

print("\n" + "=" * 80)
print("📊 NOVAS PROBABILIDADES (RTP ALVO: 60-75%)")
print("=" * 80)
for price, probs in sorted(PROBABILITY_CONFIG.items()):
    print(f"\nR$ {price:.2f}:")
    print(f"  Minor: {probs['minor']*100:.2f}%")
    print(f"  Major: {probs['major']*100:.3f}%")
    print(f"  Grand: {probs['grand']*100:.4f}%")

print("\n" + "=" * 80)
print("🔄 ATUALIZANDO JACKPOTS")
print("=" * 80)

updated_count = 0
failed_count = 0

for jackpot in jackpots:
    booster_id = jackpot['booster_type_id']
    price = booster_prices.get(booster_id)
    
    if price not in PROBABILITY_CONFIG:
        continue
    
    tier_config = PROBABILITY_CONFIG[price]
    jackpot_tier = jackpot['tier']
    new_prob = tier_config[jackpot_tier]
    
    if abs(jackpot['probability'] - new_prob) > 0.00001:
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/raspadinhas",
            headers=headers,
            params={'id': f"eq.{jackpot['id']}"},
            json={'probability': new_prob}
        )
        
        if response.status_code in [200, 204]:
            booster_name = booster_names.get(booster_id, booster_id)
            print(f"✅ {booster_name} - {jackpot_tier}: {jackpot['probability']*100:.4f}% → {new_prob*100:.4f}%")
            updated_count += 1
        else:
            print(f"❌ Erro: {response.status_code}")
            failed_count += 1

print("\n" + "=" * 80)
print("📊 RESUMO")
print("=" * 80)
print(f"✅ Atualizados: {updated_count}")
print(f"❌ Falhas: {failed_count}")

print("\n" + "=" * 80)
print("🎯 TESTANDO...")
print("=" * 80)
