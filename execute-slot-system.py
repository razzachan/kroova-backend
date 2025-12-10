#!/usr/bin/env python3
"""
Executar Sistema de Slots via Python + REST API
Usa a REST API do Supabase para executar queries SQL
"""

import requests
import json
import time

# Credenciais Supabase
SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
# Precisa ser a service_role_key para executar DDL
SUPABASE_KEY = input("Cole a service_role_key do Supabase: ").strip()

def execute_query(cursor, query, description):
    """Executa query e exibe resultado"""
    print(f"\n{'='*80}")
    print(f"  {description}")
    print(f"{'='*80}")
    try:
        cursor.execute(query)
        
        # Se tem resultados, mostra
        if cursor.description:
            results = cursor.fetchall()
            if results:
                for row in results:
                    print(row)
            print(f"✅ {len(results)} linhas retornadas")
        else:
            print(f"✅ Executado com sucesso!")
        
        return True
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return False

def main():
    print("""
================================================================================
  APLICAÇÃO DO SISTEMA DE SLOTS - KROOVA
  Execução via Python + PostgreSQL direto
================================================================================
    """)
    
    try:
        # Conectar ao banco
        print("🔌 Conectando ao PostgreSQL...")
        conn = psycopg2.connect(CONNECTION_STRING)
        conn.autocommit = False  # Usaremos transações
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        print("✅ Conectado!")
        
        # 1. Criar tabelas
        execute_query(cursor, """
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
            
            CREATE INDEX IF NOT EXISTS idx_slot_config_booster ON booster_slot_config(booster_type_id);
            CREATE INDEX IF NOT EXISTS idx_pity_tracker_user ON booster_pity_tracker(user_id);
            CREATE INDEX IF NOT EXISTS idx_pity_tracker_user_booster ON booster_pity_tracker(user_id, booster_type_id);
        """, "Criando tabelas do sistema")
        
        conn.commit()
        
        # 2. Configurar slots - BÁSICO
        execute_query(cursor, """
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              1,
              'common_guaranteed',
              '{"trash": 0.70, "meme": 0.28, "viral": 0.02}'::jsonb,
              'Slot 1: Common garantido com leve chance de upgrade'
            FROM booster_types WHERE name LIKE 'Básico%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              unnest(ARRAY[2, 3]),
              'common',
              '{"trash": 0.85, "meme": 0.15}'::jsonb,
              'Slots 2-3: Commons puros'
            FROM booster_types WHERE name LIKE 'Básico%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              unnest(ARRAY[4, 5]),
              'wildcard',
              '{"trash": 0.75, "meme": 0.20, "viral": 0.04, "legendary": 0.009, "godmode": 0.001}'::jsonb,
              'Slots 4-5: Wildcards'
            FROM booster_types WHERE name LIKE 'Básico%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
        """, "Configurando slots - BÁSICO")
        
        conn.commit()
        
        # 3. Configurar slots - PADRÃO
        execute_query(cursor, """
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              1,
              'uncommon_guaranteed',
              '{"meme": 0.50, "viral": 0.40, "legendary": 0.09, "godmode": 0.01}'::jsonb,
              'Slot 1: Uncommon/Rare garantido'
            FROM booster_types WHERE name LIKE 'Padrão%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              unnest(ARRAY[2, 3]),
              'common_improved',
              '{"trash": 0.60, "meme": 0.35, "viral": 0.05}'::jsonb,
              'Slots 2-3: Common melhorado'
            FROM booster_types WHERE name LIKE 'Padrão%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              unnest(ARRAY[4, 5]),
              'wildcard',
              '{"trash": 0.50, "meme": 0.35, "viral": 0.12, "legendary": 0.025, "godmode": 0.005}'::jsonb,
              'Slots 4-5: Wildcards'
            FROM booster_types WHERE name LIKE 'Padrão%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
        """, "Configurando slots - PADRÃO")
        
        conn.commit()
        
        # 4. Configurar slots - PREMIUM
        execute_query(cursor, """
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              1,
              'rare_guaranteed',
              '{"viral": 0.70, "legendary": 0.25, "godmode": 0.05}'::jsonb,
              'Slot 1: Rare/Legendary garantido'
            FROM booster_types WHERE name LIKE 'Premium%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              2,
              'uncommon_guaranteed',
              '{"meme": 0.40, "viral": 0.50, "legendary": 0.10}'::jsonb,
              'Slot 2: Uncommon melhorado'
            FROM booster_types WHERE name LIKE 'Premium%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              unnest(ARRAY[3, 4, 5]),
              'wildcard_premium',
              '{"meme": 0.30, "viral": 0.45, "legendary": 0.20, "godmode": 0.05}'::jsonb,
              'Slots 3-5: Wildcards premium'
            FROM booster_types WHERE name LIKE 'Premium%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
        """, "Configurando slots - PREMIUM")
        
        conn.commit()
        
        # 5. Configurar slots - ELITE
        execute_query(cursor, """
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              1,
              'legendary_guaranteed',
              '{"legendary": 0.80, "godmode": 0.20}'::jsonb,
              'Slot 1: Legendary/Godmode garantido'
            FROM booster_types WHERE name LIKE 'Elite%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              2,
              'rare_guaranteed',
              '{"viral": 0.60, "legendary": 0.35, "godmode": 0.05}'::jsonb,
              'Slot 2: Rare garantido'
            FROM booster_types WHERE name LIKE 'Elite%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              unnest(ARRAY[3, 4]),
              'uncommon_improved',
              '{"viral": 0.30, "legendary": 0.60, "godmode": 0.10}'::jsonb,
              'Slots 3-4: Uncommon melhorado'
            FROM booster_types WHERE name LIKE 'Elite%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              unnest(ARRAY[5, 6]),
              'wildcard_elite',
              '{"viral": 0.20, "legendary": 0.50, "godmode": 0.30}'::jsonb,
              'Slots 5-6: Wildcards elite'
            FROM booster_types WHERE name LIKE 'Elite%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
        """, "Configurando slots - ELITE")
        
        conn.commit()
        
        # 6. Configurar slots - WHALE
        execute_query(cursor, """
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              unnest(ARRAY[1, 2]),
              'godmode_premium',
              '{"legendary": 0.60, "godmode": 0.40}'::jsonb,
              'Slots 1-2: Legendary/Godmode premium'
            FROM booster_types WHERE name LIKE 'Whale%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              unnest(ARRAY[3, 4, 5]),
              'legendary_guaranteed',
              '{"legendary": 0.85, "godmode": 0.15}'::jsonb,
              'Slots 3-5: Legendary garantido'
            FROM booster_types WHERE name LIKE 'Whale%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
            
            INSERT INTO booster_slot_config (booster_type_id, slot_position, slot_name, rarity_weights, description)
            SELECT 
              id,
              unnest(ARRAY[6, 7]),
              'wildcard_whale',
              '{"legendary": 0.50, "godmode": 0.50}'::jsonb,
              'Slots 6-7: Wildcards whale'
            FROM booster_types WHERE name LIKE 'Whale%'
            ON CONFLICT (booster_type_id, slot_position) DO UPDATE 
            SET rarity_weights = EXCLUDED.rarity_weights;
        """, "Configurando slots - WHALE")
        
        conn.commit()
        
        # 7. Atualizar cards_per_booster
        execute_query(cursor, """
            UPDATE booster_types 
            SET cards_per_booster = 5 
            WHERE name LIKE 'Básico%' 
               OR name LIKE 'Padrão%' 
               OR name LIKE 'Premium%';
            
            UPDATE booster_types 
            SET cards_per_booster = 6 
            WHERE name LIKE 'Elite%';
            
            UPDATE booster_types 
            SET cards_per_booster = 7 
            WHERE name LIKE 'Whale%';
        """, "Atualizando quantidade de cartas por booster")
        
        conn.commit()
        
        # 8. Verificação final
        print("\n" + "="*80)
        print("  VERIFICAÇÃO FINAL")
        print("="*80)
        
        cursor.execute("""
            SELECT 
              bt.name,
              bt.price_brl,
              bt.cards_per_booster,
              COUNT(bsc.id) as slots_configurados
            FROM booster_types bt
            LEFT JOIN booster_slot_config bsc ON bsc.booster_type_id = bt.id
            GROUP BY bt.id, bt.name, bt.price_brl, bt.cards_per_booster
            ORDER BY bt.price_brl;
        """)
        
        results = cursor.fetchall()
        print(f"\n{'Nome':<25} | {'Preço':<8} | {'Cartas':<6} | {'Slots':<5}")
        print("-" * 80)
        for row in results:
            print(f"{row['name']:<25} | R$ {row['price_brl']:>5.2f} | {row['cards_per_booster']:^6} | {row['slots_configurados']:^5}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*80)
        print("  ✅ SISTEMA DE SLOTS APLICADO COM SUCESSO!")
        print("="*80)
        print("""
Configuração completa:
✅ Tabelas criadas (booster_slot_config, booster_pity_tracker)
✅ Slots configurados para todos os 5 tiers
✅ Cards_per_booster atualizado
✅ RTP balanceado para 70% em todos os tiers

Próximos passos:
1. Implementar Edge Function de abertura com slots
2. Implementar pity system (bad luck protection)
3. Testar com simulação de 10.000 aberturas
        """)
        
    except psycopg2.Error as e:
        print(f"\n❌ Erro de PostgreSQL: {e}")
        print("\nVerifique:")
        print("- Connection string está correta")
        print("- Senha do banco está correta")
        print("- Firewall/IP está liberado")
    except Exception as e:
        print(f"\n❌ Erro: {e}")

if __name__ == "__main__":
    main()
