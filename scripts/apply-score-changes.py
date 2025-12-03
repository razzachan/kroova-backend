"""Aplicar mudanças de scores no banco de dados"""
import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

# Carregar mudanças
with open('scripts/score_updates.json', 'r', encoding='utf-8') as f:
    updates = json.load(f)

print("="*80)
print("🔄 APLICANDO MUDANÇAS DE SCORES")
print("="*80)

# Criar backup antes
print("\n📦 Criando backup...")
backup_response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={'select': 'id,name,influence_score,rarity_score', 'edition_id': 'eq.ED01', 'limit': '1000'}
)

backup_file = f'scripts/backup_scores_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
with open(backup_file, 'w', encoding='utf-8') as f:
    json.dump(backup_response.json(), f, indent=2)

print(f"✅ Backup salvo: {backup_file}")

# Aplicar updates em lotes de 50
batch_size = 50
total = len(updates)
success = 0
errors = []

print(f"\n🔄 Atualizando {total} cartas em lotes de {batch_size}...")

for i in range(0, total, batch_size):
    batch = updates[i:i+batch_size]
    
    for update in batch:
        # Update individual
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/cards_base",
            headers=headers,
            params={'id': f'eq.{update["id"]}'},
            json={
                'influence_score': update['new_influence'],
                'rarity_score': update['new_rarity']
            }
        )
        
        if response.status_code in [200, 204]:
            success += 1
            if success % 50 == 0:
                print(f"   ✅ {success}/{total} cartas atualizadas...")
        else:
            errors.append({
                'id': update['id'],
                'name': update['name'],
                'error': response.text
            })
    
    # Pequena pausa entre lotes
    import time
    time.sleep(0.1)

print(f"\n{'='*80}")
print("📊 RESULTADO FINAL")
print("="*80)
print(f"✅ Sucesso: {success}/{total} cartas")

if errors:
    print(f"❌ Erros: {len(errors)} cartas")
    print("\nDetalhes dos erros:")
    for err in errors[:5]:  # Mostrar apenas primeiros 5
        print(f"   - {err['name']}: {err['error'][:100]}")
else:
    print("✅ Nenhum erro encontrado!")

# Verificar resultado
print("\n🔍 Verificando duplicação após mudanças...")
verify_response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={'select': 'rarity,rarity_score', 'edition_id': 'eq.ED01', 'limit': '1000'}
)

from collections import Counter
cards = verify_response.json()
by_rarity = {}

for card in cards:
    rarity = card['rarity']
    if rarity not in by_rarity:
        by_rarity[rarity] = []
    if card['rarity_score']:
        by_rarity[rarity].append(card['rarity_score'])

print("\n📈 TAXAS DE SCORES ÚNICOS:")
for rarity in ['trash', 'meme', 'viral', 'legendary']:
    if rarity in by_rarity:
        scores = by_rarity[rarity]
        unique = len(set(scores))
        total = len(scores)
        rate = unique/total*100
        
        status = "✅" if rate >= 70 else "⚠️" if rate >= 50 else "❌"
        print(f"   {status} {rarity.upper():12} | {unique:3d}/{total:3d} únicos ({rate:5.1f}%)")

print("\n" + "="*80)
print("✅ OPERAÇÃO CONCLUÍDA!")
print("="*80)
print(f"💾 Backup disponível em: {backup_file}")
print("🎮 Scores agora têm variação semântica para gameplay competitivo!")
