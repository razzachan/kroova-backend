"""
Recalibra liquidez das cartas para RTP 70% com distribuição correta

Ranges calculados baseados em:
- Booster R$ 0.50, RTP 70% = R$ 0.35 retorno
- 5 cartas por pack = R$ 0.07 média/carta
- Probabilidades: trash 70%, meme 20%, viral 8%, legendary 1.5%, godmode 0.5%
- Proporção: 1x : 3x : 10x : 30x : 100x
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json
from datetime import datetime
import hashlib

load_dotenv()

supabase: Client = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

# Ranges calculados para RTP 70%
NEW_LIQUIDITY_RANGES = {
    'trash': (0.016, 0.030),      # ~R$ 0.023 média
    'meme': (0.048, 0.090),       # ~R$ 0.069 média
    'viral': (0.161, 0.298),      # ~R$ 0.230 média
    'legendary': (0.482, 0.895),  # ~R$ 0.689 média
    'godmode': (1.607, 2.984)     # ~R$ 2.295 média
}

def backup_current_state():
    """Backup do estado atual"""
    response = supabase.table('cards_base').select('id, name, rarity, base_liquidity_brl').execute()
    
    backup_file = f'backup_liquidity_before_70rtp_v2_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(response.data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Backup criado: {backup_file}")
    return response.data

def apply_new_ranges(cards):
    """Aplica os novos ranges calculados"""
    
    print("\n" + "="*80)
    print("🎰 APLICANDO LIQUIDEZ PARA RTP 70%")
    print("="*80)
    
    print("\n📊 NOVOS RANGES:")
    print("-" * 80)
    for rarity, (min_val, max_val) in NEW_LIQUIDITY_RANGES.items():
        avg = (min_val + max_val) / 2
        print(f"{rarity.upper():<12}: R$ {min_val:.3f} - R$ {max_val:.3f} (avg R$ {avg:.3f})")
    
    # Contar cartas por raridade
    by_rarity = {}
    for card in cards:
        rarity = card['rarity']
        if rarity not in by_rarity:
            by_rarity[rarity] = []
        by_rarity[rarity].append(card)
    
    print("\n📦 DISTRIBUIÇÃO:")
    print("-" * 80)
    for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
        if rarity in by_rarity:
            count = len(by_rarity[rarity])
            print(f"{rarity.upper():<12}: {count} cartas")
    
    print("\n" + "="*80)
    print("⚠️  ATENÇÃO: Liquidez será recalculada")
    print("🎯 RTP Target: 70%")
    print(f"📦 Total de cartas: {len(cards)}")
    print("="*80)
    
    confirm = input("\n🤔 Confirmar aplicação? (SIM/não): ").strip().upper()
    
    if confirm != 'SIM':
        print("❌ Operação cancelada.")
        return
    
    # Atualizar cartas
    updated = 0
    failed = 0
    
    print("\n⏳ Atualizando cartas...")
    
    for card in cards:
        rarity = card['rarity']
        
        if rarity not in NEW_LIQUIDITY_RANGES:
            print(f"⚠️  Raridade desconhecida: {rarity} ({card['name']})")
            continue
        
        min_liq, max_liq = NEW_LIQUIDITY_RANGES[rarity]
        
        # Usar hash para distribuição determinística
        hash_value = int(hashlib.md5(card['id'].encode()).hexdigest()[:8], 16)
        normalized = (hash_value % 1000) / 1000.0
        
        new_liquidity = min_liq + (normalized * (max_liq - min_liq))
        new_liquidity = round(new_liquidity, 4)  # 4 casas decimais
        
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
    print("✅ APLICAÇÃO COMPLETA")
    print("="*80)
    print(f"✅ Cartas atualizadas: {updated}")
    print(f"❌ Falhas: {failed}")

def show_final_ranges():
    """Mostra os ranges finais"""
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
    print("💡 Execute test-real-rtp.py para validar o RTP!")
    print("="*80)

if __name__ == '__main__':
    # Backup
    cards = backup_current_state()
    
    # Aplicar novos ranges
    apply_new_ranges(cards)
    
    # Mostrar resultado
    show_final_ranges()
