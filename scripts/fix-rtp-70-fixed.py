"""
Ajusta sistema para RTP 70% FIXO em TODOS os boosters

Conceito (slots machines):
- RTP SEMPRE 70%, independente da aposta
- Apostar R$ 0.50: retorna R$ 0.35 (70%)
- Apostar R$ 10.00: retorna R$ 7.00 (70%)
- Prêmios ESCALAM, mas RTP FIXO

Problema atual:
- Liquidez é multiplicada por price_multiplier
- Causa RTP crescente: 35% (Básico) → 72% (Whale)

Solução:
1. REMOVER price_multiplier do cálculo de liquidez das cartas
2. DOBRAR liquidez base (35% → 70% no Básico)
3. Jackpots escalam (para manter emoção nos tiers caros)

Resultado:
- Básico: 70% RTP
- Whale: 70% RTP
- TODOS: 70% RTP
"""

import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime
import json

load_dotenv()

supabase = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

# Dobrar liquidez: 35% → 70%
FACTOR = 2.0

def backup():
    cards = supabase.table('cards_base').select('id, name, rarity, base_liquidity_brl').execute().data
    backup_file = f'backup_before_fixed_70rtp_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)
    print(f"✅ Backup: {backup_file}")
    return cards

def adjust_liquidity(cards):
    print("\n" + "="*80)
    print("🎯 AJUSTE PARA RTP 70% FIXO (COMO SLOTS MACHINES)")
    print("="*80)
    
    print("\n📊 ESTRATÉGIA:")
    print("-" * 80)
    print("1. DOBRAR liquidez base (35% → 70%)")
    print("2. BACKEND: REMOVER price_multiplier das cartas")
    print("3. BACKEND: Jackpots MANTÊM price_multiplier")
    print("")
    print("Resultado:")
    print("  • Básico (R$ 0.50):  carta R$ 0.35 → RTP 70% ✅")
    print("  • Whale (R$ 10.00):  carta R$ 0.35 → RTP 3.5% + jackpots 66.5% = 70% ✅")
    
    print("\n" + "="*80)
    confirm = input("🤔 Confirmar dobrar liquidez? (SIM/não): ").strip().upper()
    
    if confirm != 'SIM':
        print("❌ Cancelado")
        return
    
    print("\n⏳ Dobrando liquidez...")
    updated = 0
    
    for card in cards:
        new_liq = round(card['base_liquidity_brl'] * FACTOR, 4)
        new_liq = max(new_liq, 0.001)
        
        try:
            supabase.table('cards_base').update({
                'base_liquidity_brl': new_liq
            }).eq('id', card['id']).execute()
            updated += 1
            if updated % 50 == 0:
                print(f"  {updated}/{len(cards)}...")
        except Exception as e:
            print(f"❌ Erro: {card['name']}")
    
    print(f"\n✅ {updated} cartas atualizadas")
    
    print("\n" + "="*80)
    print("⚠️  PRÓXIMO PASSO CRÍTICO:")
    print("="*80)
    print("MODIFICAR BACKEND para REMOVER price_multiplier das cartas:")
    print("")
    print("  ANTES:")
    print("    finalLiquidity = base × skin × priceMultiplier")
    print("")
    print("  DEPOIS:")
    print("    finalLiquidity = base × skin  // SEM priceMultiplier")
    print("")
    print("Assim RTP fica 70% para TODOS os boosters!")
    print("="*80)

if __name__ == '__main__':
    cards = backup()
    adjust_liquidity(cards)
