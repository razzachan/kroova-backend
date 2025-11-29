#!/usr/bin/env python3
"""
Gera backgrounds para animações de abertura de boosters
Usa Google Imagen (imagen-3.0-generate-001) para criar imagens temáticas cyberpunk/digital corruption
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    print("❌ GOOGLE_API_KEY not set in .env")
    sys.exit(1)

try:
    from google import genai
    from PIL import Image
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("Run: pip install google-genai pillow")
    sys.exit(1)

client = genai.Client(api_key=GOOGLE_API_KEY)

# Configurações
OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "backgrounds"

# Criar diretório se não existir
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Prompts para cada background
BACKGROUNDS = {
    "pack-opening-bg.png": """
A dark cyberpunk digital void background. Abstract corrupted data streams flowing vertically, 
glitch effects, digital artifacts, deep purple and cyan neon accents on black void. 
Geometric fragmented patterns suggesting broken reality. Ominous atmospheric digital corruption. 
No characters, no text. Ultra wide cinematic ratio. Dark moody lighting with subtle electric glow.
Style: Digital art, abstract, cyberpunk, glitch art, cinematic.
""",
    
    "cards-reveal-bg.png": """
Dark mystical digital realm background. Deep space with subtle purple nebula clouds, 
floating geometric fragments, ethereal cyan and magenta light particles dispersing. 
Abstract corrupted data streams creating depth. Ominous void with subtle volumetric god rays.
No characters, no text. Cinematic wide format. Atmospheric and mysterious.
Style: Digital art, abstract, mystical, dark fantasy meets cyberpunk.
""",
    
    "portal-burst.png": """
Explosive digital energy burst radiating from center. Shattered geometric fragments flying outward,
glowing cyan and magenta shards, electric purple lightning arcs, corrupted data particles scattering.
Intense light explosion effect with dark edges. Represents dimensional tear, unstable portal breach.
No characters, no text. Dynamic radial composition. High energy, dramatic lighting.
Style: Digital art, abstract, explosion effect, cyberpunk energy, motion blur.
"""
}

def generate_image(prompt: str, filename: str):
    """Gera imagem usando Google Imagen"""
    
    print(f"\n🎨 Gerando: {filename}")
    print(f"📝 Prompt: {prompt[:100]}...")
    
    try:
        response = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=prompt,
            config={
                'number_of_images': 1,
                'aspect_ratio': '16:9',  # Wide format for backgrounds
                'person_generation': 'dont_allow'
            }
        )
        
        if not response.generated_images:
            print(f"❌ Nenhuma imagem gerada para {filename}")
            return False
        
        generated_image = response.generated_images[0]
        pil_image = generated_image.image._pil_image
        
        output_path = OUTPUT_DIR / filename
        pil_image.save(output_path, 'PNG')
        
        print(f"✅ Salvo em: {output_path}")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao gerar {filename}: {e}")
        return False

def main():
    print("=" * 60)
    print("🎨 KROOVA - Gerador de Backgrounds de Booster")
    print("=" * 60)
    
    success_count = 0
    
    for filename, prompt in BACKGROUNDS.items():
        if generate_image(prompt, filename):
            success_count += 1
    
    print("\n" + "=" * 60)
    print(f"✨ Concluído: {success_count}/{len(BACKGROUNDS)} backgrounds gerados")
    print("=" * 60)

if __name__ == "__main__":
    main()
