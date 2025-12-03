#!/usr/bin/env python3
"""Verificar se os 45 jackpots foram criados"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 80)
print("🎰 VERIFICANDO JACKPOTS (RASPADINHAS)")
print("=" * 80)

# Buscar todos os jackpots
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/raspadinhas",
    headers=headers,
    params={'select': '*,booster_types(name,pack_id,price_brl)', 'order': 'booster_types(price_brl).asc'}
)

if response.status_code == 200:
    jackpots = response.json()
    print(f"\n✅ Total de jackpots: {len(jackpots)}")
    
    if len(jackpots) == 45:
        print("✅ PERFEITO! 45 jackpots criados (3 por booster × 15 boosters)")
    else:
        print(f"⚠️  Esperado: 45, Encontrado: {len(jackpots)}")
    
    # Agrupar por booster
    by_booster = {}
    for jp in jackpots:
        booster_name = jp['booster_types']['name']
        if booster_name not in by_booster:
            by_booster[booster_name] = []
        by_booster[booster_name].append(jp)
    
    print(f"\n📊 Jackpots por booster:")
    for booster_name in sorted(by_booster.keys()):
        jackpot_list = by_booster[booster_name]
        print(f"\n{booster_name}:")
        for jp in sorted(jackpot_list, key=lambda x: x['multiplier'], reverse=True):
            print(f"  • {jp['tier'].upper()}: {jp['multiplier']}x (prob: {float(jp['probability'])*100:.5f}%)")
    
else:
    print(f"❌ Erro {response.status_code}: {response.text}")

print("\n" + "=" * 80)
