import sys
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Add scripts to path
sys.path.insert(0, os.path.join(os.getcwd(), 'scripts'))

# Import after adding to path
from generate_card_images_gemini import get_all_cards_from_db

cards = get_all_cards_from_db()

print('\nPrimeiras 5 cartas (testando encoding UTF-8):')
print('=' * 70)
for c in cards[:5]:
    print(f"{c['display_id']:15} | {c['name']:20} | {c['archetype']}")
print('=' * 70)
