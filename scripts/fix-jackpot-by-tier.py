#!/usr/bin/env python3
"""Ajustar probabilidades de jackpot de forma diferenciada por tier de preço"""

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
print("🎰 AJUSTANDO PROBABILIDADES DE JACKPOT POR TIER")
print("=" * 80)

# Buscar todos os boosters
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': 'id,name,price_brl', 'edition_id': 'eq.ED01'}
)
boosters = response.json()
print(f"\n✅ {len(boosters)} boosters carregados")

# Criar mapa de booster_id -> price
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

# Definir probabilidades por tier de preço
PROBABILITY_CONFIG = {
    0.50: {  # Básico
        'minor': 0.005,   # 0.5%
        'major': 0.0002,  # 0.02%
        'grand': 0.00001  # 0.001%
    },
    1.00: {  # Padrão
        'minor': 0.02,    # 2.0%
        'major': 0.001,   # 0.1%
        'grand': 0.00005  # 0.005%
    },
    2.00: {  # Premium
        'minor': 0.04,    # 4.0%
        'major': 0.001,   # 0.1% (era 0.2%)
        'grand': 0.00005  # 0.005% (era 0.01%)
    },
    5.00: {  # Elite
        'minor': 0.08,    # 8.0%
        'major': 0.0025,  # 0.25% (era 0.5%)
        'grand': 0.00005  # 0.005% (novo, não tinha Grand)
    },
    10.00: {  # Whale
        'minor': 0.15,    # 15.0%
        'major': 0.005,   # 0.5% (era 1.0%)
        'grand': 0.00025  # 0.025% (era 0.05%)
    }
}

print("\n" + "=" * 80)
print("📊 CONFIGURAÇÃO DE PROBABILIDADES POR TIER")
print("=" * 80)
for price, probs in PROBABILITY_CONFIG.items():
    print(f"\nR$ {price:.2f}:")
    print(f"  Minor: {probs['minor']*100:.2f}%")
    print(f"  Major: {probs['major']*100:.3f}%")
    print(f"  Grand: {probs['grand']*100:.3f}%")

print("\n" + "=" * 80)
print("🔄 ATUALIZANDO JACKPOTS")
print("=" * 80)

updated_count = 0
failed_count = 0

for jackpot in jackpots:
    booster_id = jackpot['booster_type_id']
    price = booster_prices.get(booster_id)
    
    if price not in PROBABILITY_CONFIG:
        print(f"⚠️ Preço {price} não configurado para booster {booster_id}")
        continue
    
    tier_config = PROBABILITY_CONFIG[price]
    jackpot_tier = jackpot['tier']
    new_prob = tier_config[jackpot_tier]
    
    # Atualizar apenas se a probabilidade mudou significativamente
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
            print(f"❌ Erro ao atualizar {jackpot['id']}: {response.status_code}")
            failed_count += 1

print("\n" + "=" * 80)
print("📊 RESUMO")
print("=" * 80)
print(f"✅ Atualizados: {updated_count}")
print(f"❌ Falhas: {failed_count}")
print(f"📦 Total: {len(jackpots)}")

print("\n" + "=" * 80)
print("🎯 PRÓXIMO PASSO")
print("=" * 80)
print("Execute o teste de RTP novamente:")
print("$env:SIM_COUNT=2000; python scripts/test-real-rtp.py")
print("=" * 80)
