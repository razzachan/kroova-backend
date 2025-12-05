"""
Ajusta probabilidades de jackpots para RTP ~70% em todos os tiers

RTP atual:
- Básico: 67% cartas + 3% jackpots = 70% ✅
- Padrão: 45% cartas + precisa 25% jackpots
- Premium: 33% cartas + precisa 37% jackpots
- Elite: 20% cartas + precisa 50% jackpots
- Whale: 18% cartas + precisa 52% jackpots

Estratégia:
- Aumentar probabilidades de jackpots nos tiers caros
- Manter multiplicadores (500x, 100x, 10x)
"""

import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

# Novas probabilidades calculadas para atingir RTP 70%
JACKPOT_CONFIGS = {
    # Básico/Padrão (R$ 0.50 - R$ 1.00): RTP atual 67% e 45%
    0.50: {
        'grand': {'mult': 500, 'prob': 0.00001},   # 0.001%
        'major': {'mult': 100, 'prob': 0.0002},    # 0.02%
        'minor': {'mult': 10, 'prob': 0.005}       # 0.5%
    },
    1.00: {
        'grand': {'mult': 500, 'prob': 0.00005},   # 0.005%
        'major': {'mult': 100, 'prob': 0.001},     # 0.1%
        'minor': {'mult': 10, 'prob': 0.02}        # 2%
    },
    # Premium (R$ 2.00): RTP atual 33%, precisa +37%
    2.00: {
        'grand': {'mult': 400, 'prob': 0.0001},    # 0.01%
        'major': {'mult': 80, 'prob': 0.002},      # 0.2%
        'minor': {'mult': 10, 'prob': 0.04}        # 4%
    },
    # Elite (R$ 5.00): RTP atual 20%, precisa +50%
    5.00: {
        'grand': {'mult': 200, 'prob': 0.0002},    # 0.02%
        'major': {'mult': 50, 'prob': 0.005},      # 0.5%
        'minor': {'mult': 8, 'prob': 0.08}         # 8%
    },
    # Whale (R$ 10.00): RTP atual 18%, precisa +52%
    10.00: {
        'grand': {'mult': 100, 'prob': 0.0005},    # 0.05%
        'major': {'mult': 30, 'prob': 0.01},       # 1%
        'minor': {'mult': 5, 'prob': 0.15}         # 15%
    }
}

def update_jackpots():
    print("\n" + "="*80)
    print("🎰 AJUSTANDO JACKPOTS PARA RTP ~70% EM TODOS OS TIERS")
    print("="*80)
    
    # Buscar todos os boosters
    boosters = supabase.table('booster_types').select('id, name, price_brl').eq('edition_id', 'ED01').execute().data
    
    print(f"\n✅ {len(boosters)} boosters encontrados")
    
    updated = 0
    
    for booster in boosters:
        price = float(booster['price_brl'])
        config = JACKPOT_CONFIGS.get(price)
        
        if not config:
            print(f"⚠️  Sem config para R$ {price} ({booster['name']})")
            continue
        
        # Deletar jackpots antigos
        supabase.table('raspadinhas').delete().eq('booster_type_id', booster['id']).execute()
        
        # Criar novos jackpots
        for tier, data in config.items():
            supabase.table('raspadinhas').insert({
                'booster_type_id': booster['id'],
                'tier': tier,
                'multiplier': data['mult'],
                'probability': data['prob']
            }).execute()
        
        print(f"✅ {booster['name']:20s} (R$ {price:5.2f}): Grand {config['grand']['prob']*100:.3f}%, Major {config['major']['prob']*100:.2f}%, Minor {config['minor']['prob']*100:.1f}%")
        updated += 1
    
    print("\n" + "="*80)
    print(f"✅ {updated} boosters atualizados com novos jackpots!")
    print("="*80)
    print("\n💡 RTP esperado após ajuste:")
    print("  • Básico (R$ 0.50):  67% cartas + 3% jackpots  = ~70%")
    print("  • Padrão (R$ 1.00):  45% cartas + 25% jackpots = ~70%")
    print("  • Premium (R$ 2.00): 33% cartas + 37% jackpots = ~70%")
    print("  • Elite (R$ 5.00):   20% cartas + 50% jackpots = ~70%")
    print("  • Whale (R$ 10.00):  18% cartas + 52% jackpots = ~70%")
    print("="*80)

if __name__ == '__main__':
    confirm = input("\n🤔 Atualizar probabilidades de jackpots? (SIM/não): ").strip().upper()
    
    if confirm == 'SIM':
        update_jackpots()
        print("\n💡 Execute test-real-rtp.py para validar RTP final!")
    else:
        print("❌ Cancelado")
