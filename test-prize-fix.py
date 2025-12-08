"""
Teste para validar fix do DECIMAL(10,4) - prize_amount_brl
Antes: DECIMAL(10,2) truncava 0.001 -> 0.00
Depois: DECIMAL(10,4) preserva 0.001 -> 0.0010
"""

import requests

# Configuração
SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.i1bcSAGL_J-vxc6gxwXZZxfn7GJl8puL5eYwe9UkZAs"
FRONTEND_URL = "https://frontend-eh8zlw6jq-razzachans-projects.vercel.app"  # Latest with DECIMAL(10,4) fix

EMAIL = "akroma.julio@gmail.com"
PASSWORD = "Akroma!t8g86v8t!3159"

def login():
    """Fazer login e retornar access_token"""
    print("[LOGIN] Autenticando...")
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        },
        json={"email": EMAIL, "password": PASSWORD}
    )
    
    if response.status_code != 200:
        print(f"[ERRO] Login falhou: {response.status_code}")
        print(f"Response: {response.text[:200]}")
        raise Exception("Login failed")
    
    return response.json()["access_token"]

def get_boosters(token):
    response = requests.get(
        f"{FRONTEND_URL}/api/v1/boosters/available",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200:
        print(f"[ERRO] Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Body: {response.text[:500]}")
        raise Exception(f"Failed to get boosters: {response.status_code}")
    
    return response.json()

def buy_booster(token, booster_id):
    response = requests.post(
        f"{FRONTEND_URL}/api/v1/boosters/purchase",
        headers={"Authorization": f"Bearer {token}"},
        json={"booster_type_id": booster_id, "quantity": 1}
    )
    return response.json()

def open_booster(token, opening_id):
    response = requests.post(
        f"{FRONTEND_URL}/api/v1/boosters/open",
        headers={"Authorization": f"Bearer {token}"},
        json={"opening_id": opening_id}
    )
    return response.json()

def main():
    print("=" * 70)
    print("TESTE: Validacao DECIMAL(10,4) - prize_amount_brl")
    print("=" * 70)
    
    token = login()
    print("[OK] Login realizado")
    
    # Get boosters
    boosters = get_boosters(token)
    basico = next((b for b in boosters if 'Basico' in b['name']), None)
    whale = next((b for b in boosters if 'Whale' in b['name']), None)
    
    print(f"\n[BASICO] Price: R$ {basico['price_brl']:.2f}")
    print(f"Esperado: R$ 0.0010 por carta (0.50 * 0.01 / 5)")
    
    # Test Basico
    purchase = buy_booster(token, basico['id'])
    opening_id = purchase.get('opening_id') or purchase['boosters'][0]['id']
    
    result = open_booster(token, opening_id)
    cards = result.get('cards', [])
    
    print(f"\n[RESULTADO]")
    print(f"Cartas recebidas: {len(cards)}")
    
    all_correct = True
    for i, card in enumerate(cards, 1):
        prize = float(card.get('prize_amount_brl', 0))
        expected = 0.001  # Basico: 0.50 * 0.01 / 5
        
        status = "OK" if abs(prize - expected) < 0.0001 else "ERRO"
        if status == "ERRO":
            all_correct = False
            
        print(f"  Carta {i}: R$ {prize:.4f} | Esperado: R$ {expected:.4f} | {status}")
    
    print(f"\n{'='*70}")
    if all_correct:
        print("[SUCESSO] Todas as cartas tem cashback correto!")
        print("DECIMAL(10,4) esta funcionando!")
    else:
        print("[FALHA] Cashback ainda com valores errados")
        print("Verificar se migration foi executada no Supabase")
    print(f"{'='*70}")

if __name__ == "__main__":
    main()
