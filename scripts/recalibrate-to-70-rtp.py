"""
Recalibra liquidez das cartas para atingir RTP ~70%

RTP atual: 30-36% (Básico)
RTP target: 70% (padrão justo de slots machines)

Estratégia:
- Multiplicar todas as liquidez por fator 2.33 (70/30)
- Manter proporções entre raridades
- Testar RTP final
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

# Fator de correção: 70% / 30% = 2.33
CORRECTION_FACTOR = 2.33

def backup_current_state():
    """Backup do estado atual"""
    response = supabase.table('cards_base').select('id, name, rarity, base_liquidity_brl').execute()
    
    backup_file = f'backup_liquidity_before_70rtp_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(response.data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Backup criado: {backup_file}")
    return response.data

def recalibrate_liquidity(cards):
    """Recalibra liquidez para RTP 70%"""
    
    print("\n" + "="*80)
    print("🎰 RECALIBRANDO LIQUIDEZ PARA RTP ~70%")
    print("="*80)
    
    # Exemplos do que vai acontecer
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
    
    print("\n📊 EXEMPLOS DE MUDANÇAS:")
    print("-" * 80)
    for ex in examples:
        print(f"{ex['name']:30s} ({ex['rarity']:10s}): R$ {ex['old']:.4f} → R$ {ex['new']:.4f}")
    
    print("\n" + "="*80)
    print(f"⚠️  ATENÇÃO: Liquidez será multiplicada por {CORRECTION_FACTOR}")
    print(f"📈 RTP esperado: 30% → 70%")
    print(f"📦 Total de cartas: {len(cards)}")
    print("="*80)
    
    confirm = input("\n🤔 Confirmar recalibração? (SIM/não): ").strip().upper()
    
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
        new_liquidity = max(new_liquidity, 0.0001)
        
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
    print("✅ RECALIBRAÇÃO COMPLETA")
    print("="*80)
    print(f"✅ Cartas atualizadas: {updated}")
    print(f"❌ Falhas: {failed}")
    print("\n💡 Execute test-real-rtp.py para verificar o novo RTP!")

def show_new_ranges():
    """Mostra os novos ranges por raridade"""
    response = supabase.table('cards_base').select('rarity, base_liquidity_brl').execute()
    cards = response.data
    
    print("\n" + "="*80)
    print("📊 NOVOS RANGES DE LIQUIDEZ")
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
            print(f"\n{rarity.upper():12s}: R$ {min(liqs):.4f} - R$ {max(liqs):.4f} (avg R$ {sum(liqs)/len(liqs):.4f})")
            print(f"               {len(liqs)} cartas")

if __name__ == '__main__':
    # Backup
    cards = backup_current_state()
    
    # Recalibrar
    recalibrate_liquidity(cards)
    
    # Mostrar novos ranges
    show_new_ranges()
