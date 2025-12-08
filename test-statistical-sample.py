"""
Script para coletar AMOSTRAGEM ESTATÍSTICA de múltiplos boosters
Abre 5 boosters de cada tier e calcula média/desvio padrão
"""
import os
import requests
import statistics
import time
from datetime import datetime

BASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://mmcytphoeyxeylvaqjgr.supabase.co')
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.i1bcSAGL_J-vxc6gxwXZZxfn7GJl8puL5eYwe9UkZAs'
API_URL = 'https://frontend-d5gx6mtzs-razzachans-projects.vercel.app'

EMAIL = 'akroma.julio@gmail.com'
PASSWORD = 'Akroma!t8g86v8t!3159'

SAMPLES_PER_TIER = 5  # 5 amostras por tier para evitar timeout

def login():
    """Faz login e retorna o token"""
    response = requests.post(
        f'{BASE_URL}/auth/v1/token?grant_type=password',
        headers={
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
        },
        json={'email': EMAIL, 'password': PASSWORD}
    )
    
    if response.status_code != 200:
        print(f"❌ Erro no login: {response.status_code}")
        print(response.text)
        return None
    
    data = response.json()
    return data.get('access_token')

def get_boosters(token):
    """Busca todos os boosters disponíveis"""
    response = requests.get(
        f'{API_URL}/api/v1/boosters',
        headers={'Authorization': f'Bearer {token}'}
    )
    data = response.json()
    # API retorna {ok: true, data: [...]}
    return data.get('data', [])

def buy_booster(token, booster_id):
    """Compra um booster"""
    response = requests.post(
        f'{API_URL}/api/v1/boosters/purchase',
        json={'booster_type_id': booster_id, 'quantity': 1},
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    )
    
    if response.status_code != 200:
        print(f"  ❌ Erro na compra: {response.status_code}")
        print(f"  Resposta: {response.text[:200]}")
        return {}
    
    try:
        return response.json()
    except:
        print(f"  ❌ Erro ao decodificar JSON da compra")
        print(f"  Resposta: {response.text[:200]}")
        return {}

def open_booster(token, opening_id):
    """Abre um booster"""
    response = requests.post(
        f'{API_URL}/api/v1/boosters/open',
        json={'opening_id': opening_id},
        headers={'Authorization': f'Bearer {token}'}
    )
    
    if response.status_code != 200:
        print(f"  ❌ Erro ao abrir: {response.status_code}")
        print(f"  Resposta: {response.text[:200]}")
        return {}
    
    try:
        return response.json()
    except:
        print(f"  ❌ Erro ao decodificar JSON da abertura")
        print(f"  Resposta: {response.text[:200]}")
        return {}

def test_tier_multiple_samples(token, tier_name, booster_id, price):
    """Testa um tier com múltiplas amostras"""
    print(f"\n{'='*60}")
    print(f"🎯 AMOSTRAGEM {tier_name} ({SAMPLES_PER_TIER} boosters)")
    print(f"{'='*60}\n")
    
    rtps = []
    total_values = []
    
    for i in range(SAMPLES_PER_TIER):
        try:
            # Comprar
            buy_result = buy_booster(token, booster_id)
            
            # Extrair opening_id da estrutura correta
            boosters = buy_result.get('data', {}).get('boosters', [])
            if not boosters or len(boosters) == 0:
                print(f"❌ Amostra {i+1}: Nenhum booster retornado na compra")
                continue
            
            opening_id = boosters[0].get('id')
            if not opening_id:
                print(f"❌ Amostra {i+1}: Falha na compra (sem opening_id)")
                continue
            
            # Abrir
            open_result = open_booster(token, opening_id)
            cards = open_result.get('data', {}).get('cards', [])
            
            if not cards:
                print(f"❌ Amostra {i+1}: Nenhuma carta retornada")
                continue
            
            # Calcular valor total
            total_value = sum(card.get('liquidity_brl', 0) for card in cards)
            rtp = (total_value / price) * 100
            
            rtps.append(rtp)
            total_values.append(total_value)
            
            print(f"  Amostra {i+1:2d}: R$ {total_value:.2f} → RTP {rtp:.1f}%")
            
            # Delay entre requisições para evitar rate limit
            time.sleep(2)
            
        except Exception as e:
            print(f"❌ Amostra {i+1}: Erro - {str(e)}")
            time.sleep(1)
            continue
    
    if not rtps:
        print(f"\n❌ Nenhuma amostra válida para {tier_name}")
        return None
    
    # Calcular estatísticas
    mean_rtp = statistics.mean(rtps)
    median_rtp = statistics.median(rtps)
    stdev_rtp = statistics.stdev(rtps) if len(rtps) > 1 else 0
    min_rtp = min(rtps)
    max_rtp = max(rtps)
    
    print(f"\n📊 ESTATÍSTICAS {tier_name}:")
    print(f"  Média RTP:   {mean_rtp:.1f}%")
    print(f"  Mediana RTP: {median_rtp:.1f}%")
    print(f"  Desvio Padrão: {stdev_rtp:.1f}%")
    print(f"  Min-Max: {min_rtp:.1f}% - {max_rtp:.1f}%")
    print(f"  Amostras válidas: {len(rtps)}/{SAMPLES_PER_TIER}")
    
    # Validação
    target_min, target_max = 62, 72
    if target_min <= mean_rtp <= target_max:
        print(f"  ✅ MÉDIA DENTRO DO ALVO ({target_min}-{target_max}%)")
        status = "VALIDADO"
    else:
        diff = mean_rtp - 67  # centro do alvo
        print(f"  ⚠️  MÉDIA FORA DO ALVO (diferença: {diff:+.1f}%)")
        status = "FORA_DO_ALVO"
    
    return {
        'tier': tier_name,
        'mean_rtp': mean_rtp,
        'median_rtp': median_rtp,
        'stdev_rtp': stdev_rtp,
        'min_rtp': min_rtp,
        'max_rtp': max_rtp,
        'samples': len(rtps),
        'status': status
    }

def main():
    print("="*60)
    print("📊 AMOSTRAGEM ESTATÍSTICA - KROOVA TCG")
    print(f"   {SAMPLES_PER_TIER} boosters por tier")
    print("="*60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Login
    print("🔐 Fazendo login...")
    token = login()
    print("✅ Login realizado!\n")
    
    # Buscar boosters
    print("📦 Buscando boosters...")
    boosters = get_boosters(token)
    print(f"✅ Encontrados {len(boosters)} boosters\n")
    
    # Mapear tiers
    tier_map = {}
    for booster in boosters:
        name = booster['name']
        if 'Básico' in name and 'Alpha' in name:
            tier_map['Básico'] = (booster['id'], booster['price_brl'])
        elif 'Padrão' in name and 'Alpha' in name:
            tier_map['Padrão'] = (booster['id'], booster['price_brl'])
        elif 'Premium' in name and 'Alpha' in name:
            tier_map['Premium'] = (booster['id'], booster['price_brl'])
        elif 'Elite' in name and 'Alpha' in name:
            tier_map['Elite'] = (booster['id'], booster['price_brl'])
        elif 'Whale' in name and 'Alpha' in name:
            tier_map['Whale'] = (booster['id'], booster['price_brl'])
    
    # Testar cada tier
    results = []
    for tier_name in ['Básico', 'Padrão', 'Premium', 'Elite', 'Whale']:
        if tier_name in tier_map:
            booster_id, price = tier_map[tier_name]
            result = test_tier_multiple_samples(token, tier_name, booster_id, price)
            if result:
                results.append(result)
    
    # Resumo final
    print("\n" + "="*60)
    print("📋 RESUMO FINAL DA AMOSTRAGEM")
    print("="*60 + "\n")
    
    print(f"{'Tier':<10} {'Média RTP':<12} {'Mediana':<10} {'Desvio':<10} {'Status':<15}")
    print("-" * 60)
    
    validated = 0
    for r in results:
        status_icon = "✅" if r['status'] == "VALIDADO" else "❌"
        print(f"{r['tier']:<10} {r['mean_rtp']:>6.1f}% ({r['median_rtp']:>5.1f}%)  ±{r['stdev_rtp']:>5.1f}%  {status_icon} {r['status']}")
        if r['status'] == "VALIDADO":
            validated += 1
    
    print(f"\n✅ Tiers validados: {validated}/{len(results)}")
    print(f"📊 Total de aberturas: {SAMPLES_PER_TIER * len(results)}")
    
    # Recomendações
    print("\n💡 RECOMENDAÇÕES BASEADAS NA AMOSTRAGEM:")
    for r in results:
        if r['status'] != "VALIDADO":
            diff = r['mean_rtp'] - 67
            if diff > 0:
                multiplier = 67 / r['mean_rtp']
                print(f"  {r['tier']}: Média {r['mean_rtp']:.1f}% → multiplicar value_adjustment por {multiplier:.2f}")
            else:
                multiplier = r['mean_rtp'] / 67
                print(f"  {r['tier']}: Média {r['mean_rtp']:.1f}% → multiplicar value_adjustment por {multiplier:.2f}")

if __name__ == '__main__':
    main()
