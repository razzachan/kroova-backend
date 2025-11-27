"""
Converte ED01_250_CARDS_GENERATED.md para SQL INSERT statements
Adiciona Crocodile Trader como carta especial legendary
"""

import hashlib

# Ler o arquivo markdown (path absoluto)
with open(r'c:\Kroova\ED01_250_CARDS_GENERATED.md', 'r', encoding='utf-8') as f:
    content = f.read()

cards = []
for raw_line in content.split('\n'):
    line = raw_line.strip()
    if not line or not line[0].isdigit():
        continue
    # Espera formato: "<idx>. <name>|<score>|<tier>|<archetype>|<trend>|<value>|<description>|<frame>"
    if '. ' not in line:
        continue
    idx_str, rest = line.split('. ', 1)
    parts = rest.split('|')
    if len(parts) < 8:
        continue
    nome = parts[0].strip()
    rarity_score = parts[1].strip()
    tier = parts[2].strip()
    arquetipo = parts[3].strip()
    trend = parts[4].strip()
    valor = parts[5].strip()
    frame = parts[-1].strip()
    descricao = '|'.join(parts[6:-1]).strip()
    try:
        cards.append({
            'name': nome,
            'rarity_score': int(rarity_score),
            'tier': tier,
            'archetype': arquetipo,
            'trend': int(trend),
            'value': float(valor),
            'description': descricao,
            'frame': frame
        })
    except Exception:
        continue

print(f"✅ {len(cards)} cartas encontradas no markdown")

# Mapear tier → rarity do banco (trash, meme, viral, legendary)
# Godmode NÃO é raridade: tratamos como flag de terceira camada
tier_to_db_rarity = {
    'trash': 'trash',
    'meme': 'meme',
    'viral': 'viral',
    'legendary': 'legendary',
    'godmode': 'legendary'  # mapear para legendary e sinalizar via metadata
}

# Gerar SQL
sql_lines = []
sql_lines.append("-- ED01 250 Cards + Crocodile Trader (generated from ED01_250_CARDS_GENERATED.md)")
sql_lines.append("-- Total: 251 cards")
sql_lines.append("")

# Adicionar Croco Trader como primeira carta (legendary especial)
crocodile_id = 'crd_croco01'
sql_lines.append("-- 🐊 SPECIAL: Croco Trader (Legendary)")
sql = f"""INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata)
SELECT '{crocodile_id}', 'Croco Trader', 'Reptiliano que manipula mercados como quem troca peles', 'legendary', 'Ganância Digital', 100.00, 0.00000000, 'ED01', 'https://kroova.com/cards/{crocodile_id}.png', '{{}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='{crocodile_id}');"""
sql_lines.append(sql)
sql_lines.append("")

# Adicionar as 250 cartas do markdown
for i, card in enumerate(cards, start=1):
    # Gerar display_id único
    hash_input = f"ed01_{card['name']}_{i}".encode()
    hash_hex = hashlib.md5(hash_input).hexdigest()
    display_id = f"crd_{hash_hex[:6]}"
    
    # Mapear tier → rarity
    db_rarity = tier_to_db_rarity.get(card['tier'], 'trash')
    
    # Limpar nome (max 11 chars já garantido pelo markdown)
    name = card['name'][:11]
    
    # Limpar descrição (max 130 chars já garantido)
    description = card['description'].replace("'", "''")[:130]  # escape single quotes
    
    # Mapear arquétipo para formato do banco
    archetype = card['archetype']
    
    # Base liquidity já vem do markdown
    base_liquidity = card['value']
    
    # Comentário com tier original
    if i == 1 or (i > 1 and cards[i-2]['tier'] != card['tier']):
        sql_lines.append(f"-- {card['tier'].upper()} tier")
    
    # Metadata: preserva tier e marca godmode como flag de camada extra
    is_godmode_flag = 'true' if card['tier'] == 'godmode' else 'false'
    metadata_json = f"{{\"tier\":\"{card['tier']}\",\"rarity_score\":{card['rarity_score']},\"trend\":{card['trend']},\"force_godmode\":{is_godmode_flag}}}"

    sql = f"""INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata)
SELECT '{display_id}', '{name}', '{description}', '{db_rarity}', '{archetype}', {base_liquidity:.2f}, 0.00000000, 'ED01', 'https://kroova.com/cards/{display_id}.png', '{metadata_json}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='{display_id}');"""
    
    sql_lines.append(sql)
    sql_lines.append("")

sql_lines.append(f"-- Total: {len(cards) + 1} cards (250 + Crocodile Trader)")

# Salvar SQL
output_file = 'seed-ed01-cards.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"✅ SQL gerado: {output_file}")
print(f"📊 Total: {len(cards) + 1} cards (250 do markdown + 1 Crocodile Trader)")
print(f"\n📋 Distribuição:")

# Contar por tier
from collections import Counter
tier_count = Counter([card['tier'] for card in cards])
for tier, count in sorted(tier_count.items()):
    print(f"   {tier}: {count} cards")

print(f"\n🐊 Crocodile Trader: legendary (Ganância Digital)")
