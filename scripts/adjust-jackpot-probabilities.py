#!/usr/bin/env python3
"""Ajustar probabilidades de jackpot para evitar RTP >100% nos boosters caros"""

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
print("🎰 AJUSTANDO PROBABILIDADES DE JACKPOT")
print("=" * 80)

# Buscar todos os boosters
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': 'id,name,price_brl', 'edition_id': 'eq.ED01'}
)
boosters = response.json()
print(f"\n✅ {len(boosters)} boosters carregados")

# Buscar todos os jackpots
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/raspadinhas",
    headers=headers,
    params={'select': '*'}
)
jackpots = response.json()
print(f"✅ {len(jackpots)} jackpots carregados")

# Novas probabilidades (redução de 70% para Major e Grand)
NEW_PROBABILITIES = {
    'minor': 0.025,    # 2.5% - mantém
    'major': 0.0015,   # 0.15% - era 0.5%
    'grand': 0.0003    # 0.03% - era 0.1%
}

print("\n" + "=" * 80)
print("📊 NOVAS PROBABILIDADES")
print("=" * 80)
print(f"Minor: {NEW_PROBABILITIES['minor']*100:.2f}% (sem mudança)")
print(f"Major: {NEW_PROBABILITIES['major']*100:.2f}% (era 0.50%)")
print(f"Grand: {NEW_PROBABILITIES['grand']*100:.2f}% (era 0.10%)")

print("\n" + "=" * 80)
print("🔄 ATUALIZANDO JACKPOTS")
print("=" * 80)

updated_count = 0
failed_count = 0

for jackpot in jackpots:
    jackpot_tier = jackpot['tier']  # 'tier' not 'type'
    new_prob = NEW_PROBABILITIES[jackpot_tier]
    
    # Atualizar apenas se a probabilidade mudou
    if abs(jackpot['probability'] - new_prob) > 0.0001:
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/raspadinhas",
            headers=headers,
            params={'id': f"eq.{jackpot['id']}"},
            json={'probability': new_prob}
        )
        
        if response.status_code in [200, 204]:
            booster = next((b for b in boosters if b['id'] == jackpot['booster_type_id']), None)
            booster_name = booster['name'] if booster else jackpot['booster_type_id']
            print(f"✅ {booster_name} - {jackpot_tier}: {jackpot['probability']*100:.3f}% → {new_prob*100:.3f}%")
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
