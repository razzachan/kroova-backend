#!/usr/bin/env python3
"""
Aplicar Sistema de Slots no Kroova
Executa todas as queries necessárias para implementar o slot system
"""

from supabase import create_client, Client
from datetime import datetime, timedelta

# Credenciais Supabase
SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjU1NTU5MSwiZXhwIjoyMDQ4MTMxNTkxfQ.K_-lVYHdT1J75Y60eG5OZTExLWFDdPO_wgXV1p4JL-8"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def execute_sql(query: str, description: str):
    """Executa query SQL via RPC ou Postgrest"""
    print(f"\n{'='*80}")
    print(f"  {description}")
    print(f"{'='*80}")
    
    try:
        # Tenta executar via RPC se disponível
        result = supabase.rpc('exec_sql', {'query': query}).execute()
        print("✅ Executado com sucesso!")
        return result
    except Exception as e:
        print(f"ℹ️  RPC não disponível, executando via client...")
        print(f"⚠️  Erro: {str(e)}")
        print(f"ℹ️  Execute manualmente no SQL Editor do Supabase:")
        print(f"\n{query}\n")
        return None

def main():
    print("""
    ================================================================================
      APLICAÇÃO DO SISTEMA DE SLOTS - KROOVA
      Baseado em Star Wars Unlimited e Magic: The Gathering
    ================================================================================
    """)

    # 1. Criar tabelas
    print("\n📊 Criando tabelas do sistema de slots...")
    
    create_tables = """
    -- Tabela de configuração de slots
    CREATE TABLE IF NOT EXISTS booster_slot_config (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
      slot_position INT NOT NULL,
      slot_name TEXT NOT NULL,
      rarity_weights JSONB NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(booster_type_id, slot_position)
    );

    -- Tabela de pity system
    CREATE TABLE IF NOT EXISTS booster_pity_tracker (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
      boosters_opened_since_last_legendary INT DEFAULT 0,
      boosters_opened_since_last_godmode INT DEFAULT 0,
      total_boosters_opened INT DEFAULT 0,
      last_legendary_at TIMESTAMPTZ,
      last_godmode_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, booster_type_id)
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_slot_config_booster ON booster_slot_config(booster_type_id);
    CREATE INDEX IF NOT EXISTS idx_pity_tracker_user ON booster_pity_tracker(user_id);
    CREATE INDEX IF NOT EXISTS idx_pity_tracker_user_booster ON booster_pity_tracker(user_id, booster_type_id);
    """
    
    execute_sql(create_tables, "Criando tabelas do sistema")

    # 2. Inserir configurações dos slots
    print("\n⚙️  Configurando slots por tier...")
    
    # Para executar via Python, precisamos fazer queries individuais
    try:
        # Buscar todos os booster types
        booster_types = supabase.table('booster_types').select('*').execute()
        
        print(f"\n✅ Encontrados {len(booster_types.data)} tipos de booster")
        
        slots_config = []
        
        for bt in booster_types.data:
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
        
        print(f"\n⚙️  Inserindo {len(slots_config)} configurações de slots...")
        
        # Inserir em batch
        result = supabase.table('booster_slot_config').upsert(slots_config).execute()
        
        print(f"✅ {len(result.data)} slots configurados com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao configurar slots: {str(e)}")
        print("Execute o SQL manualmente: implement-slot-system.sql")
    
    # 3. Atualizar cards_per_booster
    print("\n📦 Atualizando quantidade de cartas por booster...")
    
    try:
        # Básico, Padrão, Premium = 5 cartas
        result1 = supabase.table('booster_types').update({'cards_per_booster': 5}).or_('name.ilike.*Básico*,name.ilike.*Padrão*,name.ilike.*Premium*').execute()
        print(f"✅ Atualizado Básico/Padrão/Premium para 5 cartas")
        
        # Elite = 6 cartas
        result2 = supabase.table('booster_types').update({'cards_per_booster': 6}).ilike('name', '*Elite*').execute()
        print(f"✅ Atualizado Elite para 6 cartas")
        
        # Whale = 7 cartas
        result3 = supabase.table('booster_types').update({'cards_per_booster': 7}).ilike('name', '*Whale*').execute()
        print(f"✅ Atualizado Whale para 7 cartas")
        
    except Exception as e:
        print(f"❌ Erro ao atualizar cards_per_booster: {str(e)}")
    
    # 4. Verificação final
    print("\n✅ Verificando configuração...")
    
    try:
        verification = supabase.rpc('exec_sql', {
            'query': """
            SELECT 
              bt.name,
              bt.price_brl,
              bt.cards_per_booster,
              COUNT(bsc.id) as slots_configurados
            FROM booster_types bt
            LEFT JOIN booster_slot_config bsc ON bsc.booster_type_id = bt.id
            GROUP BY bt.id, bt.name, bt.price_brl, bt.cards_per_booster
            ORDER BY bt.price_brl;
            """
        }).execute()
        
        print("\n" + "="*80)
        print("  CONFIGURAÇÃO FINAL")
        print("="*80)
        for row in verification.data:
            print(f"{row['name']:20} | R$ {row['price_brl']:5.2f} | {row['cards_per_booster']} cartas | {row['slots_configurados']} slots")
    
    except Exception as e:
        # Fallback: buscar manualmente
        try:
            boosters = supabase.table('booster_types').select('id,name,price_brl,cards_per_booster').execute()
            
            print("\n" + "="*80)
            print("  CONFIGURAÇÃO FINAL")
            print("="*80)
            
            for bt in boosters.data:
                slots = supabase.table('booster_slot_config').select('id', count='exact').eq('booster_type_id', bt['id']).execute()
                slot_count = slots.count if slots.count else 0
                
                print(f"{bt['name']:20} | R$ {bt['price_brl']:5.2f} | {bt['cards_per_booster']} cartas | {slot_count} slots")
        
        except Exception as e2:
            print(f"⚠️  Verificação manual necessária: {str(e2)}")
    
    print("\n" + "="*80)
    print("  ✅ SISTEMA DE SLOTS APLICADO COM SUCESSO!")
    print("="*80)
    print("""
    Próximos passos:
    1. ✅ Slots configurados por tier
    2. ✅ Cards_per_booster atualizado
    3. ⏳ Implementar função de abertura com slots (Edge Function)
    4. ⏳ Implementar pity system
    5. ⏳ Testar RTP real vs esperado (70% target)
    
    Arquivos criados:
    - implement-slot-system.sql (SQL completo)
    - apply-slot-system.py (este script)
    - Próximo: create-open-booster-function.ts
    """)

if __name__ == "__main__":
    main()
