"""
Ajusta liquidez para RTP 70% em TODOS os tiers

Problema atual:
- Básico (mult 1x): RTP 70% ✅
- Whale (mult 20x): RTP 160% ❌ (com price_multiplier aplicado)

Solução:
- Dividir liquidez atual pelo price_multiplier MÉDIO
- Quando backend multiplicar por price_multiplier específico, todos chegarão a ~70%

Cálculo:
- Média ponderada dos multiplicadores: (1+1+1+2+2+2+4+4+4+10+10+10+20+20+20)/15 = 6.8
- Para RTP 70% em todos: dividir liquidez por (160/70) = 2.29
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

supabase: Client = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

# Fator de correção: 70 / 160 = 0.4375 (aproximadamente 0.44)
CORRECTION_FACTOR = 0.44

def backup_current_state():
    """Backup do estado atual"""
    response = supabase.table('cards_base').select('id, name, rarity, base_liquidity_brl').execute()
    
    backup_file = f'backup_liquidity_before_70rtp_all_tiers_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(response.data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Backup criado: {backup_file}")
    return response.data

def fix_liquidity(cards):
    """Ajusta liquidez para RTP 70% em todos os tiers"""
    
    print("\n" + "="*80)
    print("🎯 AJUSTE FINAL - RTP 70% PARA TODOS OS TIERS")
    print("="*80)
    
    print("\n📊 PROBLEMA:")
    print("-" * 80)
    print("Com price_multiplier aplicado:")
    print("  Básico (mult 1x):  RTP 70%  ✅")
    print("  Padrão (mult 2x):  RTP 85%  ⚠️")
    print("  Premium (mult 4x): RTP 105% ❌")
    print("  Elite (mult 10x):  RTP 130% ❌")
    print("  Whale (mult 20x):  RTP 160% ❌ CRÍTICO")
    
    print("\n💡 SOLUÇÃO:")
    print("-" * 80)
    print(f"• Dividir liquidez por {1/CORRECTION_FACTOR:.2f} (multiplicar por {CORRECTION_FACTOR})")
    print(f"• Quando backend aplicar price_multiplier:")
    print(f"  - Básico: liquidez × 0.44 × 1x  = 70% do original → RTP 70%")
    print(f"  - Padrão: liquidez × 0.44 × 2x  = 88% do original → RTP 70%")
    print(f"  - Premium: liquidez × 0.44 × 4x = 176% do original → RTP 70%")
    print(f"  - Whale: liquidez × 0.44 × 20x = 880% do original → RTP 70%")
    
    # Exemplos
    examples = []
    for card in cards[:5]:
        old_liq = card['base_liquidity_brl']
        new_liq = round(old_liq * CORRECTION_FACTOR, 4)
        examples.append({
            'name': card['name'],
            'rarity': card['rarity'],
            'old': old_liq,
            'new': new_liq
        })
    
    print("\n📋 EXEMPLOS DE MUDANÇAS:")
    print("-" * 80)
    for ex in examples:
        reduction_pct = ((ex['old'] - ex['new']) / ex['old']) * 100
        print(f"{ex['name']:30s} ({ex['rarity']:10s}): R$ {ex['old']:.3f} → R$ {ex['new']:.3f} (-{reduction_pct:.0f}%)")
    
    print("\n" + "="*80)
    print(f"⚠️  ATENÇÃO: Liquidez será reduzida em ~56%")
    print(f"🎯 RTP esperado: ~70% para TODOS os tiers")
    print(f"📦 Total de cartas: {len(cards)}")
    print("="*80)
    
    confirm = input("\n🤔 Confirmar ajuste? (SIM/não): ").strip().upper()
    
    if confirm != 'SIM':
        print("❌ Operação cancelada.")
        return
    
    # Atualizar cartas
    updated = 0
    failed = 0
    
    print("\n⏳ Atualizando cartas...")
    
    for card in cards:
        old_liquidity = card['base_liquidity_brl']
        new_liquidity = round(old_liquidity * CORRECTION_FACTOR, 4)
        
        # Garantir mínimo absoluto
        new_liquidity = max(new_liquidity, 0.001)
        
        try:
            response = supabase.table('cards_base').update({
                'base_liquidity_brl': new_liquidity
            }).eq('id', card['id']).execute()
            
            updated += 1
            
            if updated % 50 == 0:
                print(f"   {updated}/{len(cards)} cartas atualizadas...")
                
        except Exception as e:
            print(f"❌ Erro ao atualizar {card['name']}: {e}")
            failed += 1
    
    print("\n" + "="*80)
    print("✅ AJUSTE COMPLETO")
    print("="*80)
    print(f"✅ Cartas atualizadas: {updated}")
    print(f"❌ Falhas: {failed}")

def show_new_ranges():
    """Mostra os novos ranges"""
    response = supabase.table('cards_base').select('rarity, base_liquidity_brl').execute()
    cards = response.data
    
    print("\n" + "="*80)
    print("📊 LIQUIDEZ FINAL POR RARIDADE")
    print("="*80)
    
    by_rarity = {}
    for card in cards:
        rarity = card['rarity']
        liq = card['base_liquidity_brl']
        
        if rarity not in by_rarity:
            by_rarity[rarity] = []
        by_rarity[rarity].append(liq)
    
    for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
        if rarity in by_rarity:
            liqs = by_rarity[rarity]
            avg = sum(liqs) / len(liqs)
            print(f"\n{rarity.upper():<12}: R$ {min(liqs):.3f} - R$ {max(liqs):.3f}")
            print(f"               Média: R$ {avg:.3f} ({len(liqs)} cartas)")
    
    print("\n" + "="*80)
    print("💡 Execute test-real-rtp.py para validar!")
    print("🎯 RTP esperado: ~70% para TODOS os tiers")
    print("="*80)

if __name__ == '__main__':
    # Backup
    cards = backup_current_state()
    
    # Ajustar
    fix_liquidity(cards)
    
    # Mostrar resultado
    show_new_ranges()
