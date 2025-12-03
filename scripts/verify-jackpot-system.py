"""Verificar sistema de jackpots (raspadinha)"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 80)
print("🎰 VERIFICANDO SISTEMA DE JACKPOTS (RASPADINHA)")
print("=" * 80)

# Buscar edition_configs
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/edition_configs",
    headers=headers,
    params={'select': '*', 'id': 'eq.ED01'}
)

if response.status_code == 200:
    edition = response.json()[0]
    
    print(f"\n⚙️ EDITION CONFIG ED01:")
    print(f"   Jackpot Hard Cap: R$ {edition.get('jackpot_hard_cap', 'N/A')}")
    print(f"   Godmode Multiplier: {edition.get('godmode_multiplier', 'N/A')}x")
    
    # Verificar se tem jackpot_tiers
    if 'jackpot_tiers' in edition:
        print(f"\n🎰 JACKPOT TIERS:")
        tiers = edition['jackpot_tiers']
        for tier_name, tier_config in tiers.items():
            print(f"   {tier_name}: {tier_config}")
    else:
        print(f"\n❌ 'jackpot_tiers' NÃO EXISTE no edition_config")

# Buscar raspadinhas (tabela de jackpots)
print("\n" + "=" * 80)
print("🎫 VERIFICANDO TABELA DE RASPADINHAS")
print("=" * 80)

response = requests.get(
    f"{SUPABASE_URL}/rest/v1/raspadinhas",
    headers=headers,
    params={'select': '*', 'limit': '1'}
)

if response.status_code == 200:
    print("\n✅ Tabela 'raspadinhas' EXISTE")
    
    # Buscar todas raspadinhas
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/raspadinhas",
        headers=headers,
        params={'select': '*'}
    )
    
    raspadinhas = response.json()
    print(f"\n📊 Total de raspadinhas cadastradas: {len(raspadinhas)}")
    
    if raspadinhas:
        print("\n🎰 RASPADINHAS POR BOOSTER:")
        print("-" * 80)
        
        for r in raspadinhas:
            booster_id = r.get('booster_type_id', 'N/A')
            tier = r.get('tier', 'N/A')
            prob = r.get('probability', 0) * 100
            mult = r.get('multiplier', 0)
            
            print(f"Booster: {booster_id[:8]}... | Tier: {tier:10} | "
                  f"Prob: {prob:6.3f}% | Mult: {mult:4}x")
    
elif response.status_code == 404:
    print("\n❌ Tabela 'raspadinhas' NÃO EXISTE")
    print("⚠️  Sistema de jackpot tipo slot machine NÃO foi implementado")
else:
    print(f"\n⚠️  Erro ao verificar: {response.status_code}")

print("\n" + "=" * 80)
print("📊 RESUMO")
print("=" * 80)
print()
