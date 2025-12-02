#!/usr/bin/env python3
"""
Gera ícones PNG para os 5 estágios do Cristal de Pity usando Imagen 4 Ultra
Estágios: DORMANT → AWAKENING → CHARGED → COSMIC → DIVINE
"""

import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

try:
    from google import genai
    from google.genai import types
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("   Install with: pip install google-genai")
    sys.exit(1)

# Configuração Imagen 4 Ultra
IMAGEN_CONFIG = {
    'model': 'imagen-4.0-ultra-generate-001',
    'number_of_images': 1,
    'aspect_ratio': '1:1',  # Square icon
    'image_size': '1K',  # 1024x1024
}

# Prompts para cada estágio
CRYSTAL_STAGES = {
    'dormant': {
        'emoji': '💤',
        'prompt': """3D rendered mystical crystal gemstone icon, hexagonal shape, DORMANT STATE, 
dark gray color with subtle silver veins, minimal glow, sleeping energy, 
matte finish, subtle grain texture, floating on black background, 
studio lighting, centered composition, isometric view, game asset style, 
ultra high quality render, PNG transparent background"""
    },
    'awakening': {
        'emoji': '🌱',
        'prompt': """3D rendered mystical crystal gemstone icon, hexagonal shape, AWAKENING STATE,
green emerald color with glowing veins, soft pulsing energy beginning to awaken,
semi-glossy finish, light particles starting to orbit around it,
floating on black background, studio lighting, centered composition, isometric view,
game asset style, ultra high quality render, PNG transparent background"""
    },
    'charged': {
        'emoji': '⚡',
        'prompt': """3D rendered mystical crystal gemstone icon, hexagonal shape, CHARGED STATE,
electric blue cyan color with crackling energy veins, bright glow, 
charged lightning aura, glossy reflective finish, energy particles actively orbiting,
floating on black background, studio lighting, centered composition, isometric view,
game asset style, ultra high quality render, PNG transparent background"""
    },
    'cosmic': {
        'emoji': '🌌',
        'prompt': """3D rendered mystical crystal gemstone icon, hexagonal shape, COSMIC STATE,
deep purple and pink nebula colors swirling inside, intense cosmic glow,
stars and galaxies visible within the crystal, highly reflective finish,
dramatic particle orbit with trail effects, floating on black background,
studio lighting, centered composition, isometric view, game asset style,
ultra high quality render, PNG transparent background"""
    },
    'divine': {
        'emoji': '✨',
        'prompt': """3D rendered mystical crystal gemstone icon, hexagonal shape, DIVINE STATE,
radiant golden yellow with orange and red flames, blinding holy glow,
divine light rays emanating from all sides, prismatic rainbow reflections,
maximum energy explosion particles with fire trails, floating on black background,
studio lighting, centered composition, isometric view, game asset style,
ultra high quality render, PNG transparent background"""
    }
}

OUTPUT_DIR = Path('frontend/public/assets/pity-crystal')


def generate_crystal_icon(stage: str, config: dict) -> bool:
    """Gera um ícone de crystal usando Imagen 4"""
    
    client = genai.Client(api_key=GOOGLE_API_KEY)
    output_path = OUTPUT_DIR / f'crystal-{stage}.png'
    
    print(f"\n{config['emoji']} Gerando {stage.upper()}...")
    print(f"   Prompt: {config['prompt'][:80]}...")
    
    try:
        response = client.models.generate_images(
            model=IMAGEN_CONFIG['model'],
            prompt=config['prompt'],
            config=types.GenerateImagesConfig(
                number_of_images=IMAGEN_CONFIG['number_of_images'],
                aspect_ratio=IMAGEN_CONFIG['aspect_ratio'],
                person_generation='allow_adult',
            )
        )
        
        if not response.generated_images:
            print(f"   ❌ Nenhuma imagem gerada")
            return False
        
        # Salva PNG (image já é PIL.Image)
        image = response.generated_images[0].image
        image.save(output_path)
        
        file_size = output_path.stat().st_size / 1024  # KB
        print(f"   ✅ Salvo: {output_path} ({file_size:.1f} KB)")
        
        # Rate limiting (1 request per 5 seconds para não estourar quota)
        time.sleep(5)
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False


def main():
    """Gera todos os 5 ícones"""
    
    # Cria diretório de output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("🔮 KROOVA PITY CRYSTAL ICON GENERATOR")
    print("=" * 60)
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"🎨 Model: {IMAGEN_CONFIG['model']}")
    print(f"📐 Size: 1024x1024 ({IMAGEN_CONFIG['aspect_ratio']})")
    print(f"🎯 Stages: {len(CRYSTAL_STAGES)}")
    
    # Gera cada estágio
    results = {}
    for stage, config in CRYSTAL_STAGES.items():
        results[stage] = generate_crystal_icon(stage, config)
    
    # Resumo final
    print("\n" + "=" * 60)
    print("📊 RESUMO DA GERAÇÃO")
    print("=" * 60)
    
    success_count = sum(results.values())
    total_count = len(results)
    
    for stage, success in results.items():
        status = "✅" if success else "❌"
        emoji = CRYSTAL_STAGES[stage]['emoji']
        print(f"{status} {emoji} {stage.upper()}")
    
    print(f"\n🎯 Sucesso: {success_count}/{total_count}")
    
    if success_count == total_count:
        print("\n✨ TODOS OS ÍCONES GERADOS COM SUCESSO!")
        print(f"📁 Localização: {OUTPUT_DIR.absolute()}")
        print("\n💡 Próximo passo: Importar no CristalPity.tsx")
        print("   import dormantIcon from '@/public/assets/pity-crystal/crystal-dormant.png'")
    else:
        print(f"\n⚠️ {total_count - success_count} ícone(s) falharam")
        sys.exit(1)


if __name__ == '__main__':
    main()
