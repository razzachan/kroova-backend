"""
Gera 250 cards para ED01 com distribuição realista de raridades
Distribuição: trash(60%), meme(25%), viral(10%), legendary(4%), epica(1%)
"""

import random
import hashlib

# Configuração de raridades (total 250)
RARITY_CONFIG = {
    'trash': {'count': 150, 'base_liquidity': 0.01, 'archetypes': ['anomaly', 'glitch', 'fragment', 'noise']},
    'meme': {'count': 62, 'base_liquidity': 0.05, 'archetypes': ['totem', 'echo', 'signal', 'wave']},
    'viral': {'count': 25, 'base_liquidity': 0.20, 'archetypes': ['catalyst', 'surge', 'pulse', 'boom']},
    'legendary': {'count': 10, 'base_liquidity': 1.00, 'archetypes': ['emitter', 'crown', 'beacon', 'nexus']},
    'epica': {'count': 3, 'base_liquidity': 2.00, 'archetypes': ['origin', 'godmode', 'apex', 'prime']}
}

# Nomes temáticos para cada raridade
CARD_NAMES = {
    'trash': [
        'Pixel Drift', 'Static Noise', 'Data Leak', 'Buffer Glitch', 'Cache Miss',
        'Null Signal', 'Dead Pixel', 'Bit Rot', 'Link Decay', 'Feed Dust',
        'Broken Thread', 'Lost Frame', 'Stale Meme', 'Ghost Reply', 'Empty Tag',
        'Void Post', 'Blank Space', 'Raw Data', 'Spam Echo', 'Junk Mail',
        'Error 404', 'Timeout Lag', 'Dropped Packet', 'Frozen Feed', 'Crashed Tab',
        'Orphan File', 'Temp Cache', 'Old Link', 'Weak Signal', 'Low Battery',
        'Dim Screen', 'Faded Text', 'Blur Filter', 'Soft Focus', 'Gray Scale',
        'Mono Tone', 'Plain Format', 'Basic Template', 'Default Mode', 'Safe Boot'
    ],
    'meme': [
        'Doge Echo', 'Pepe Wave', 'Chad Signal', 'Wojak Pulse', 'Stonks Surge',
        'NPC Pattern', 'Zoomer Vibe', 'Boomer Take', 'Sigma Grind', 'Beta Move',
        'Alpha Flex', 'Gigachad Aura', 'Copium Cloud', 'Hopium Dose', 'Ratio Call',
        'Based Count', 'Cringe Alert', 'Mid Take', 'W Moment', 'L Energy',
        'Bussin Freq', 'No Cap Zone', 'Sheesh Wave', 'Slay Mode', 'Rizz Factor'
    ],
    'viral': [
        'Trend Bomb', 'Viral Storm', 'Hype Train', 'Clout Rush', 'Fame Spike',
        'Share Blast', 'Retweet Cascade', 'Like Flood', 'View Surge', 'Algorithm Hack',
        'For You Peak', 'Explore Hit', 'Trending Now', 'Viral Load', 'Hot Take',
        'Main Character', 'Plot Twist', 'Character Arc', 'Story Time', 'Tea Spill',
        'Drama Alert', 'Cancel Wave', 'Apology Tour', 'Comeback King', 'Redemption Arc'
    ],
    'legendary': [
        'Influencer Crown', 'Creator Beacon', 'Clout Nexus', 'Verified Badge', 'Blue Check',
        'Million Club', 'Viral King', 'Trend Queen', 'Culture Icon', 'Meme Lord'
    ],
    'epica': [
        'Godmode Origin', 'Infinite Reach', 'Eternal Viral'
    ]
}

# Descrições por raridade
DESCRIPTIONS = {
    'trash': [
        'Fragmento digital em decomposição',
        'Resto de meme esquecido',
        'Dado corrompido sem valor',
        'Sinal fraco sem destino',
        'Ruído de fundo insignificante',
        'Pixel perdido no vazio',
        'Echo de post deletado',
        'Rastro de trend morta',
        'Sombra de viral falho',
        'Relíquia de internet antiga'
    ],
    'meme': [
        'Símbolo de viralidade latente',
        'Padrão memético emergente',
        'Referência cultural potente',
        'Template em ascensão',
        'Format com futuro',
        'Meme de nicho promissor',
        'Piada interna poderosa',
        'Referência crossover',
        'Meta commentary ativo',
        'Ironia de segunda camada'
    ],
    'viral': [
        'Acelera tendências emergentes',
        'Catalisador de viralização',
        'Explosão de engajamento',
        'Algoritmo favorável',
        'Timing perfeito',
        'Conteúdo algoritmicamente otimizado',
        'Peak de relevância',
        'Momentum imparável',
        'Reach exponencial',
        'Viralidade garantida'
    ],
    'legendary': [
        'Ecoa autoridade digital',
        'Símbolo de status supremo',
        'Marca de criador lendário',
        'Aura de influência máxima',
        'Presença digital dominante',
        'Legacy de internet',
        'Crown de clout absoluto',
        'Beacon de tendências',
        'Nexus cultural',
        'Ícone geracional'
    ],
    'epica': [
        'Origem de dominância memética absoluta',
        'Fonte primordial de viralidade infinita',
        'Transcendência digital eterna'
    ]
}

def generate_display_id(index):
    """Gera display_id único baseado no índice"""
    hash_input = f"ed01_card_{index}".encode()
    hash_hex = hashlib.md5(hash_input).hexdigest()
    return f"crd_{hash_hex[:6]}"

def get_card_name(rarity, index_in_rarity):
    """Retorna nome único para a raridade"""
    base_names = CARD_NAMES[rarity]
    if index_in_rarity < len(base_names):
        return base_names[index_in_rarity]
    else:
        # Gera nomes numerados se acabar a lista
        archetype = random.choice(RARITY_CONFIG[rarity]['archetypes'])
        return f"{archetype.capitalize()} #{index_in_rarity + 1}"

def get_description(rarity, index_in_rarity):
    """Retorna descrição baseada na raridade"""
    descriptions = DESCRIPTIONS[rarity]
    return descriptions[index_in_rarity % len(descriptions)]

def get_archetype(rarity):
    """Retorna archetype aleatório para a raridade"""
    return random.choice(RARITY_CONFIG[rarity]['archetypes'])

def generate_sql():
    """Gera SQL completo para 250 cards"""
    sql_lines = []
    sql_lines.append("-- Generated ED01 Cards (250 total)")
    sql_lines.append("-- Distribuição: trash(150), meme(62), viral(25), legendary(10), epica(3)")
    sql_lines.append("")
    
    global_index = 0
    
    for rarity, config in RARITY_CONFIG.items():
        count = config['count']
        base_liquidity = config['base_liquidity']
        
        sql_lines.append(f"-- {rarity.upper()} Cards ({count})")
        
        for i in range(count):
            display_id = generate_display_id(global_index)
            name = get_card_name(rarity, i)
            description = get_description(rarity, i)
            archetype = get_archetype(rarity)
            
            # Nota: usar 'epica' no DB mesmo que seja 'godmode' na lógica
            # O backend converte godmode -> epica no SELECT
            db_rarity = 'epica' if rarity == 'epica' else rarity
            
            sql = f"""INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata)
SELECT '{display_id}', '{name}', '{description}', '{db_rarity}', '{archetype}', {base_liquidity:.2f}, 0.00000000, 'ED01', 'https://kroova.com/cards/{display_id}.png', '{{}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='{display_id}');"""
            
            sql_lines.append(sql)
            sql_lines.append("")
            
            global_index += 1
    
    sql_lines.append(f"-- Total: {global_index} cards generated")
    
    return '\n'.join(sql_lines)

if __name__ == '__main__':
    sql = generate_sql()
    
    # Salvar em arquivo
    output_file = 'seed-ed01-cards.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f"✅ Gerados 250 cards em {output_file}")
    print(f"📊 Distribuição:")
    for rarity, config in RARITY_CONFIG.items():
        print(f"   {rarity}: {config['count']} cards (R$ {config['base_liquidity']:.2f} base)")
    print(f"\n📝 Execute no Supabase SQL Editor:")
    print(f"   {output_file}")
