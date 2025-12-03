"""Ajuste final para RTP máximo 70%"""
import os
from supabase import create_client
from dotenv import load_dotenv
import time

load_dotenv()
supabase = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

# Reduzir 12.5% para atingir RTP 70% no Whale
FACTOR = 0.875

cards = supabase.table('cards_base').select('id, name, base_liquidity_brl').execute().data
print(f"✅ {len(cards)} cartas carregadas")

updated = 0
failed = 0

for card in cards:
    new_liq = round(card['base_liquidity_brl'] * FACTOR, 4)
    new_liq = max(new_liq, 0.001)
    
    retries = 3
    for attempt in range(retries):
        try:
            supabase.table('cards_base').update({
                'base_liquidity_brl': new_liq
            }).eq('id', card['id']).execute()
            updated += 1
            break
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(0.5)
            else:
                print(f"❌ Falha: {card['name']}")
                failed += 1
    
    if updated % 50 == 0:
        print(f"  {updated}/{len(cards)}...")

print(f"\n✅ Atualizado: {updated}")
print(f"❌ Falhas: {failed}")
