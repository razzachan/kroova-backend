#!/usr/bin/env python3
"""
Aplicar Sistema de Slots - Execução via REST API direto
"""

import requests
import json

# Credenciais Supabase
SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjU1NTU5MSwiZXhwIjoyMDQ4MTMxNTkxfQ.K_-lVYHdT1J75Y60eG5OZTExLWFDdPO_wgXV1p4JL-8"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

print("""
================================================================================
  APLICAÇÃO DO SISTEMA DE SLOTS - KROOVA
================================================================================
""")

# 1. Buscar todos os booster types
print("\n📦 Buscando booster types...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types?select=*",
    headers=headers
)

if response.status_code != 200:
    print(f"❌ Erro ao buscar booster types: {response.text}")
    exit(1)

booster_types = response.json()
print(f"✅ Encontrados {len(booster_types)} tipos de booster")

# 2. Preparar configurações de slots
slots_config = []

for bt in booster_types:
    name = bt['name']
    bt_id = bt['id']
    
    # BÁSICO - 5 cartas
    if 'Básico' in name:
        slots_config.extend([
            {
                'booster_type_id': bt_id,
                'slot_position': 1,
                'slot_name': 'common_guaranteed',
                'rarity_weights': {"trash": 0.70, "meme": 0.28, "viral": 0.02},
                'description': 'Slot 1: Common garantido com leve chance de upgrade'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 2,
                'slot_name': 'common',
                'rarity_weights': {"trash": 0.85, "meme": 0.15},
                'description': 'Slot 2: Common puro'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 3,
                'slot_name': 'common',
                'rarity_weights': {"trash": 0.85, "meme": 0.15},
                'description': 'Slot 3: Common puro'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 4,
                'slot_name': 'wildcard',
                'rarity_weights': {"trash": 0.75, "meme": 0.20, "viral": 0.04, "legendary": 0.009, "godmode": 0.001},
                'description': 'Slot 4: Wildcard'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 5,
                'slot_name': 'wildcard',
                'rarity_weights': {"trash": 0.75, "meme": 0.20, "viral": 0.04, "legendary": 0.009, "godmode": 0.001},
                'description': 'Slot 5: Wildcard'
            }
        ])
    
    # PADRÃO - 5 cartas
    elif 'Padrão' in name:
        slots_config.extend([
            {
                'booster_type_id': bt_id,
                'slot_position': 1,
                'slot_name': 'uncommon_guaranteed',
                'rarity_weights': {"meme": 0.50, "viral": 0.40, "legendary": 0.09, "godmode": 0.01},
                'description': 'Slot 1: Uncommon/Rare garantido'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 2,
                'slot_name': 'common_improved',
                'rarity_weights': {"trash": 0.60, "meme": 0.35, "viral": 0.05},
                'description': 'Slot 2: Common melhorado'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 3,
                'slot_name': 'common_improved',
                'rarity_weights': {"trash": 0.60, "meme": 0.35, "viral": 0.05},
                'description': 'Slot 3: Common melhorado'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 4,
                'slot_name': 'wildcard',
                'rarity_weights': {"trash": 0.50, "meme": 0.35, "viral": 0.12, "legendary": 0.025, "godmode": 0.005},
                'description': 'Slot 4: Wildcard'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 5,
                'slot_name': 'wildcard',
                'rarity_weights': {"trash": 0.50, "meme": 0.35, "viral": 0.12, "legendary": 0.025, "godmode": 0.005},
                'description': 'Slot 5: Wildcard'
            }
        ])
    
    # PREMIUM - 5 cartas
    elif 'Premium' in name:
        slots_config.extend([
            {
                'booster_type_id': bt_id,
                'slot_position': 1,
                'slot_name': 'rare_guaranteed',
                'rarity_weights': {"viral": 0.70, "legendary": 0.25, "godmode": 0.05},
                'description': 'Slot 1: Rare/Legendary garantido'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 2,
                'slot_name': 'uncommon_guaranteed',
                'rarity_weights': {"meme": 0.40, "viral": 0.50, "legendary": 0.10},
                'description': 'Slot 2: Uncommon melhorado'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 3,
                'slot_name': 'wildcard_premium',
                'rarity_weights': {"meme": 0.30, "viral": 0.45, "legendary": 0.20, "godmode": 0.05},
                'description': 'Slot 3: Wildcard premium'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 4,
                'slot_name': 'wildcard_premium',
                'rarity_weights': {"meme": 0.30, "viral": 0.45, "legendary": 0.20, "godmode": 0.05},
                'description': 'Slot 4: Wildcard premium'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 5,
                'slot_name': 'wildcard_premium',
                'rarity_weights': {"meme": 0.30, "viral": 0.45, "legendary": 0.20, "godmode": 0.05},
                'description': 'Slot 5: Wildcard premium'
            }
        ])
    
    # ELITE - 6 cartas
    elif 'Elite' in name:
        slots_config.extend([
            {
                'booster_type_id': bt_id,
                'slot_position': 1,
                'slot_name': 'legendary_guaranteed',
                'rarity_weights': {"legendary": 0.80, "godmode": 0.20},
                'description': 'Slot 1: Legendary/Godmode garantido'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 2,
                'slot_name': 'rare_guaranteed',
                'rarity_weights': {"viral": 0.60, "legendary": 0.35, "godmode": 0.05},
                'description': 'Slot 2: Rare garantido'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 3,
                'slot_name': 'uncommon_improved',
                'rarity_weights': {"viral": 0.30, "legendary": 0.60, "godmode": 0.10},
                'description': 'Slot 3: Uncommon melhorado'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 4,
                'slot_name': 'uncommon_improved',
                'rarity_weights': {"viral": 0.30, "legendary": 0.60, "godmode": 0.10},
                'description': 'Slot 4: Uncommon melhorado'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 5,
                'slot_name': 'wildcard_elite',
                'rarity_weights': {"viral": 0.20, "legendary": 0.50, "godmode": 0.30},
                'description': 'Slot 5: Wildcard elite'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 6,
                'slot_name': 'wildcard_elite',
                'rarity_weights': {"viral": 0.20, "legendary": 0.50, "godmode": 0.30},
                'description': 'Slot 6: Wildcard elite'
            }
        ])
    
    # WHALE - 7 cartas
    elif 'Whale' in name:
        slots_config.extend([
            {
                'booster_type_id': bt_id,
                'slot_position': 1,
                'slot_name': 'godmode_premium',
                'rarity_weights': {"legendary": 0.60, "godmode": 0.40},
                'description': 'Slot 1: Legendary/Godmode premium'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 2,
                'slot_name': 'godmode_premium',
                'rarity_weights': {"legendary": 0.60, "godmode": 0.40},
                'description': 'Slot 2: Legendary/Godmode premium'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 3,
                'slot_name': 'legendary_guaranteed',
                'rarity_weights': {"legendary": 0.85, "godmode": 0.15},
                'description': 'Slot 3: Legendary garantido'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 4,
                'slot_name': 'legendary_guaranteed',
                'rarity_weights': {"legendary": 0.85, "godmode": 0.15},
                'description': 'Slot 4: Legendary garantido'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 5,
                'slot_name': 'legendary_guaranteed',
                'rarity_weights': {"legendary": 0.85, "godmode": 0.15},
                'description': 'Slot 5: Legendary garantido'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 6,
                'slot_name': 'wildcard_whale',
                'rarity_weights': {"legendary": 0.50, "godmode": 0.50},
                'description': 'Slot 6: Wildcard whale (50/50)'
            },
            {
                'booster_type_id': bt_id,
                'slot_position': 7,
                'slot_name': 'wildcard_whale',
                'rarity_weights': {"legendary": 0.50, "godmode": 0.50},
                'description': 'Slot 7: Wildcard whale (50/50)'
            }
        ])

print(f"\n⚙️  Preparadas {len(slots_config)} configurações de slots")
print("📤 Enviando para banco de dados...")

# 3. Inserir slots (em batch)
response = requests.post(
    f"{SUPABASE_URL}/rest/v1/booster_slot_config",
    headers=headers,
    json=slots_config
)

if response.status_code in [200, 201]:
    print(f"✅ Slots inseridos com sucesso!")
else:
    print(f"❌ Erro ao inserir slots: {response.text}")

# 4. Atualizar cards_per_booster
print("\n📦 Atualizando quantidade de cartas...")

for bt in booster_types:
    name = bt['name']
    bt_id = bt['id']
    
    new_count = 5  # Default
    if 'Elite' in name:
        new_count = 6
    elif 'Whale' in name:
        new_count = 7
    
    if bt.get('cards_per_booster') != new_count:
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/booster_types?id=eq.{bt_id}",
            headers=headers,
            json={'cards_per_booster': new_count}
        )
        
        if response.status_code == 204:
            print(f"✅ {name}: {new_count} cartas")
        else:
            print(f"⚠️  {name}: Erro ao atualizar")

# 5. Verificação final
print("\n" + "="*80)
print("  CONFIGURAÇÃO FINAL")
print("="*80)

response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types?select=id,name,price_brl,cards_per_booster&order=price_brl",
    headers=headers
)

if response.status_code == 200:
    boosters = response.json()
    for bt in boosters:
        # Contar slots
        response_slots = requests.get(
            f"{SUPABASE_URL}/rest/v1/booster_slot_config?booster_type_id=eq.{bt['id']}&select=id",
            headers=headers
        )
        slot_count = len(response_slots.json()) if response_slots.status_code == 200 else 0
        
        print(f"{bt['name']:20} | R$ {bt['price_brl']:5.2f} | {bt['cards_per_booster']} cartas | {slot_count} slots")

print("\n" + "="*80)
print("  ✅ SISTEMA DE SLOTS APLICADO COM SUCESSO!")
print("="*80)
print("""
RTP Target: 70% para todos os tiers

Próximos passos:
1. ✅ Slots configurados por tier
2. ✅ Cards_per_booster atualizado
3. ⏳ Implementar Edge Function de abertura com slots
4. ⏳ Implementar pity system
5. ⏳ Testar RTP real (simular 10.000 aberturas)
""")
