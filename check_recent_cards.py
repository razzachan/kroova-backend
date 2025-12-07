from supabase import create_client
import os

sb = create_client(
    'https://mmcytphoeyxeylvaqjgr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw'
)

# Buscar últimas 20 cartas criadas
result = sb.table('cards_instances').select('id,liquidity_brl,obtained_at,cards_base(name,rarity)').eq('owner_id', 'e4306e98-0d10-4bf6-8a81-72f2d7c70d54').order('obtained_at', desc=True).limit(20).execute()

print("\n🔍 ÚLTIMAS 20 CARTAS CRIADAS (mais recentes primeiro):\n")
for card in result.data:
    name = card['cards_base']['name']
    rarity = card['cards_base']['rarity']
    liquidity = card['liquidity_brl']
    timestamp = card['obtained_at']
    
    # Verificar se está com CAP errado (valores muito altos)
    status = "❌ SEM CAP" if liquidity > 10 else "✅ OK"
    
    print(f"{timestamp} | {name:20s} | {rarity:10s} | R$ {liquidity:7.2f} | {status}")
