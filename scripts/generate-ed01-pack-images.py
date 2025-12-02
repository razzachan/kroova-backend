"""
Script para gerar imagens dos Booster Packs BETA e GAMMA da ED01
usando pack-front-ed01.png (ALPHA) como referência de estilo.

Edição: COLAPSO DA INTERFACE - Culto ao Algoritmo Vivo

ALPHA: Memes Clássicos (vermelho #FF6B6B) - REFERÊNCIA
BETA: Viralidade Explosiva (ciano #4ECDC4)
GAMMA: Cultura Digital (verde água #95E1D3)
"""

import os
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

from google import genai
from google.genai import types

# Configuração
MODEL_ID = "imagen-4.0-ultra-generate-001"
OUTPUT_DIR = "frontend/public/assets/booster-packs"

# Referência ALPHA
ALPHA_IMAGE_PATH = "frontend/public/pack-front-ed01.png"

# Packs da ED01 - Colapso da Interface
PACKS = {
    "alpha": {
        "name": "ALPHA PACK",
        "theme": "Memes Clássicos",
        "color": "#FF6B6B",  # Vermelho/rosa
        "description": "Memes eternos e referências culturais atemporais",
        "archetypes": "echo e totem",
        "mood": "nostálgico, icônico, eterno, viral clássico",
        "symbols": "símbolos de memes antigos, referências vintage, ícones virais clássicos"
    },
    "beta": {
        "name": "BETA PACK",
        "theme": "Viralidade Explosiva",
        "color": "#4ECDC4",  # Ciano/turquesa vibrante
        "description": "Tendências virais e humor de alta energia",
        "archetypes": "wave e pulse",
        "mood": "explosivo, frenético, viral, alta energia, caótico",
        "symbols": "ondas, pulsos, gráficos virais, setas ascendentes, explosões de likes"
    },
    "gamma": {
        "name": "GAMMA PACK",
        "theme": "Cultura Digital",
        "color": "#95E1D3",  # Verde água suave
        "description": "Cultura online e meta-humor",
        "archetypes": "signal e vibe",
        "mood": "cerebral, meta, irônico, cult, underground",
        "symbols": "sinais digitais, ondas de rádio, antenas, glitches estéticos, ASCII art"
    }
}


def generate_pack_image(pack_key: str, config: dict):
    """Gera imagem do booster pack usando Imagen 4 Ultra com referência."""
    
    client = genai.Client(api_key=GOOGLE_API_KEY)
    
    # Prompt para replicar EXATAMENTE o booster pack físico ALPHA
    prompt = f"""Professional product photograph of a sealed trading card booster pack. EXACT replica of reference pack structure.

PHYSICAL BOOSTER PACK STRUCTURE (must match reference exactly):

TOP SECTION:
- Holographic rainbow foil border strip at very top
- Black background bar with "KROOVA" logo in white bold letters, centered
- Subtitle text "COLAPSO DA INTERFACE" in smaller white text
- Tagline below in even smaller text

MAIN CENTRAL AREA:
- Large featured artwork: {config['description']}
- Art style: Cyberpunk digital portrait with glitch effects, neon wireframe overlay
- Main color theme: {config['color']} dominant (replace the pink/purple tones from reference)
- Neon geometric frame around the central art (matching color: {config['color']})
- Background: Dark with digital matrix code, circuit patterns
- Glitch/scan line effects across the image

BOTTOM SECTION:
- Left side: Circular badge with "ED01" and pack tier text
- Center-bottom: Large "{config['name']}" text (replace "ALPHA PACK" position)
- Right side: Barcode and QR code graphics
- Holographic rainbow foil border strip at very bottom

VISUAL ELEMENTS:
- Symbols integrated into design: {config['symbols']}
- Overall mood: {config['mood']}
- Foil package texture with light reflections
- Realistic sealed booster pack appearance
- Professional product photography lighting

TECHNICAL SPECS:
- Portrait orientation (same as reference)
- Trading card booster pack format
- Photorealistic quality
- Central art should reflect: "{config['theme']}" theme

CRITICAL: Keep EXACT same layout structure, text placement, badge positions, and border design as reference. Only change: main color from pink/magenta to {config['color']}, and central artwork theme to match "{config['theme']}"."""

    print(f"\n{'='*60}")
    print(f"🎨 Gerando: {config['name']}")
    print(f"   Tema: {config['theme']}")
    print(f"   Cor: {config['color']}")
    print(f"{'='*60}")
    print(f"\n📝 Prompt:\n{prompt}\n")
    
    try:
        # Gera imagem
        response = client.models.generate_images(
            model=MODEL_ID,
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="3:4",  # Proporção de carta de baralho
                person_generation="allow_adult",
                output_mime_type="image/png"
            )
        )
        
        # Salva imagem
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        output_path = os.path.join(OUTPUT_DIR, f"pack-front-ed01-{pack_key}.png")
        
        if response.generated_images:
            image_data = response.generated_images[0].image.image_bytes
            
            with open(output_path, 'wb') as f:
                f.write(image_data)
            
            file_size_kb = len(image_data) / 1024
            print(f"✅ Salvo: {output_path}")
            print(f"   Tamanho: {file_size_kb:.1f} KB")
            print(f"   Resolução: 1024x1365 (3:4 aspect ratio)")
            
            return True
        else:
            print("❌ Nenhuma imagem gerada na resposta")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao gerar {pack_key}: {e}")
        return False


def main():
    """Gera as 2 imagens de pack (BETA e GAMMA)."""
    
    print("\n" + "="*60)
    print("🎴 GERADOR DE BOOSTER PACKS - ED01: COLAPSO DA INTERFACE")
    print("="*60)
    print(f"\n📁 Output: {OUTPUT_DIR}")
    print(f"🤖 Modelo: {MODEL_ID}")
    print("\nPacks a gerar:")
    print("  - ALPHA: Memes Clássicos (#FF6B6B - vermelho/rosa)")
    print("  - BETA: Viralidade Explosiva (#4ECDC4 - ciano)")
    print("  - GAMMA: Cultura Digital (#95E1D3 - verde água)")
    print("\n" + "="*60 + "\n")
    
    success_count = 0
    
    # Gera cada pack
    for pack_key, pack_config in PACKS.items():
        success = generate_pack_image(pack_key, pack_config)
        
        if success:
            success_count += 1
        
        # Rate limiting (5s entre requests)
        if pack_key != list(PACKS.keys())[-1]:  # Não espera no último
            print(f"\n⏳ Aguardando 5s (rate limiting)...")
            time.sleep(5)
    
    # Resumo
    print("\n" + "="*60)
    print("📊 RESUMO DA GERAÇÃO")
    print("="*60)
    print(f"✅ Sucesso: {success_count}/{len(PACKS)} packs")
    print(f"📁 Local: {OUTPUT_DIR}")
    print("\nArquivos gerados:")
    
    for pack_key in PACKS.keys():
        output_path = os.path.join(OUTPUT_DIR, f"pack-front-ed01-{pack_key}.png")
        if os.path.exists(output_path):
            size_kb = os.path.getsize(output_path) / 1024
            print(f"  ✅ pack-front-ed01-{pack_key}.png ({size_kb:.1f} KB)")
        else:
            print(f"  ❌ pack-front-ed01-{pack_key}.png (não encontrado)")
    
    print("\n" + "="*60)
    print("🎨 PRÓXIMOS PASSOS:")
    print("="*60)
    print("1. Revisar as imagens geradas")
    print("2. Se necessário, remover backgrounds ou ajustar cores")
    print("3. Copiar para frontend/public/assets/booster-packs/")
    print("4. Atualizar componentes do frontend para usar as novas imagens")
    print("5. Testar exibição na página de boosters")
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    main()
