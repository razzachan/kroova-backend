import os
from supabase import create_client

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(url, key)

# Buscar cartas do usuário
result = supabase.table('cards_instances').select(
    'id, prize_amount_brl, prize_redeemed'
).eq('user_id', '42e41c9f-d474-4574-a893-b30cc0bac97a').limit(10).execute()

print('\n=== CARTAS DO INVENTÁRIO ===')
total_disponivel = 0
total_resgatado = 0

for card in result.data:
    cashback = float(card['prize_amount_brl'] or 0)
    status = 'RESGATADO' if card['prize_redeemed'] else 'DISPONIVEL'
    emoji = '✅' if card['prize_redeemed'] else '💰'
    
    print(f"{emoji} ID: {card['id'][:8]}... | R$ {cashback:.4f} | {status}")
    
    if card['prize_redeemed']:
        total_resgatado += cashback
    else:
        total_disponivel += cashback

print(f'\n📊 TOTAIS:')
print(f'💰 Disponível: R$ {total_disponivel:.4f}')
print(f'✅ Resgatado: R$ {total_resgatado:.4f}')
print(f'💵 Total: R$ {total_disponivel + total_resgatado:.4f}')
