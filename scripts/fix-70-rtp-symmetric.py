"""
Corrige liquidez para RTP 70% SIMÉTRICO

Problema atual:
- Básico: RTP 110% (muito alto, quebraria o negócio)
- Whale: RTP 19% (muito baixo)

Solução:
- Dividir liquidez atual por fator de correção
- Target: RTP 70% para BÁSICO
- Resultado: RTP 70% para TODOS os tiers (simétrico)
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

# RTP atual do Básico: ~110%
# RTP target: 70%
# Fator de correção: 70 / 110 = 0.636
CORRECTION_FACTOR = 0.636

def backup_current_state():
    """Backup do estado atual"""
    response = supabase.table('cards_base').select('id, name, rarity, base_liquidity_brl').execute()
    
    backup_file = f'backup_liquidity_before_fix_70rtp_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(response.data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Backup criado: {backup_file}")
    return response.data

def fix_liquidity(cards):
    """Corrige liquidez para RTP 70% simétrico"""
    
    print("\n" + "="*80)
    print("🎯 CORREÇÃO FINAL - RTP 70% SIMÉTRICO")
    print("="*80)
    
    print("\n📊 PROBLEMA ATUAL:")
    print("-" * 80)
    print("Básico (R$ 0.50):  RTP 110% ❌ Sistema paga MAIS que recebe")
    print("Padrão (R$ 1.00):  RTP 68%  ⚠️  Próximo do target")
    print("Whale (R$ 10.00):  RTP 19%  ❌ Muito baixo")
    
    print("\n💡 SOLUÇÃO:")
    print("-" * 80)
    print(f"• Dividir TODAS as liquidez por {1/CORRECTION_FACTOR:.2f} (multiplicar por {CORRECTION_FACTOR})")
    print(f"• RTP Básico: 110% → 70% ✅")
    print(f"• RTP mantém-se simétrico para todos os tiers")
    
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
    print(f"⚠️  ATENÇÃO: Liquidez será reduzida em ~36%")
    print(f"🎯 RTP esperado: ~70% para TODOS os boosters")
    print(f"📦 Total de cartas: {len(cards)}")
    print("="*80)
    
    confirm = input("\n🤔 Confirmar correção? (SIM/não): ").strip().upper()
    
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
    print("✅ CORREÇÃO COMPLETA")
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
    print("🎯 RTP esperado: ~70% para TODOS os boosters")
    print("="*80)

if __name__ == '__main__':
    # Backup
    cards = backup_current_state()
    
    # Corrigir
    fix_liquidity(cards)
    
    # Mostrar resultado
    show_new_ranges()
