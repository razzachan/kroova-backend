#!/usr/bin/env python3
"""Gera APENAS o ícone DIVINE que faltou"""
import os
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from google import genai
from google.genai import types

client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))

prompt = """3D rendered mystical crystal gemstone icon, hexagonal shape, DIVINE STATE,
radiant golden yellow with orange and red flames, blinding holy glow,
divine light rays emanating from all sides, prismatic rainbow reflections,
maximum energy explosion particles with fire trails, floating on black background,
studio lighting, centered composition, isometric view, game asset style,
ultra high quality render, PNG transparent background"""

print("✨ Gerando DIVINE...")

response = client.models.generate_images(
    model='imagen-4.0-ultra-generate-001',
    prompt=prompt,
    config=types.GenerateImagesConfig(
        number_of_images=1,
        aspect_ratio='1:1',
        person_generation='allow_adult',
    )
)

output_path = Path('frontend/public/assets/pity-crystal/crystal-divine.png')
image = response.generated_images[0].image
image.save(output_path)

file_size = output_path.stat().st_size / 1024
print(f"✅ Salvo: {output_path} ({file_size:.1f} KB)")
