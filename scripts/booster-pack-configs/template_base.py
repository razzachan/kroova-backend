"""
Template base para geração de booster packs Kroouva
Elementos visuais constantes em TODAS as edições
"""

# Cores da marca (NUNCA mudam)
BRAND_COLORS = {
    'primary': '#FF006D',      # Neon Magenta
    'secondary': '#00F0FF',    # Cyber Cyan
    'value': '#FFC700',        # Royal Amber
}

# Especificações técnicas (NUNCA mudam)
IMAGE_SPECS = {
    'aspect_ratio': '3:4',
    'width': 1792,
    'height': 2560,
    'safety_filter': 'block_low_and_above',
    'model': 'imagen-4.0-generate-001',
}

# Template de prompt base
BASE_PROMPT_TEMPLATE = """
Ultra-realistic product photography of a sealed trading card booster pack 
for "KROUVA: {edition_name}" edition. 
ISOLATED PRODUCT SHOT with NO BACKGROUND - the booster pack should be 
the ONLY element in the frame, floating in empty white/transparent space.

PRODUCT DESIGN:
- Premium holographic foil packaging with intense iridescent rainbow shimmer
- The metallic foil reflects light in multiple colors (pink, cyan, gold, purple)
- Front features: {central_art}
- Geometric sacred patterns (Metatron's cube, platonic solids) mixed with circuit board traces
- Neon magenta ({primary_color}) and cyber cyan ({secondary_color}) glowing accent lines
- {color_accent} as complementary gradient
- Royal amber ({value_color}) "KROUVA" logo at top with subtle glitch/chromatic aberration
- Edition name "{edition_name}" in futuristic bold font (cyberpunk style)
- Subtitle in smaller text: "{tagline}"
- Holographic circular seal showing "{edition_id}" and "{cards_per_pack} CARTAS"
- Small warning text near bottom: "{warning_text}"

LIGHTING & EFFECTS:
- Dramatic rim lighting from behind (magenta on one side, cyan on the other)
- Soft key light from front to show holographic details
- Light caustics and rainbow refractions across the surface
- Subtle digital particles/glitches floating around edges
- Chromatic aberration on the extreme edges of the pack
- Glow effect around the brightest elements

COMPOSITION:
- Pack centered, slight 3/4 angle showing depth
- Visible thickness of the sealed pack
- Sharp focus on center, slight depth of field on edges
- Professional product photography aesthetic
- Cinematic color grading with high contrast

MATERIALS & TEXTURE:
- Metallic holographic foil (primary surface)
- Glossy laminated overlay
- Embossed/debossed details on logo
- Visible foil texture with microscopic prisms

BRANDING ELEMENTS:
- Small icons near bottom: {icon_elements}
- QR code or serial number (subtle, bottom corner)
- "OFFICIAL TRADING CARDS" micro-text
- Krouva logo watermark (very subtle)

STYLE REFERENCES:
- High-end trading card pack (Pokémon, Magic premium products)
- Cyberpunk 2077 UI aesthetic
- Holographic concert tickets/festival wristbands
- Premium tech product packaging (Apple, Sony)

TECHNICAL REQUIREMENTS:
- 8K quality, ultra-sharp details
- HDR lighting
- Photorealistic materials
- No background, no shadows on ground
- Suitable for e-commerce/digital storefront display

CRITICAL: The booster pack should be the ONLY element in the image. 
No dark backgrounds, no surfaces, no context - just the pack floating in space 
with its own lighting and glow effects creating the atmosphere.

CYBERPUNK ATMOSPHERE:
- Theme: {theme}
- Neon glow emanating from the pack edges
- Subtle digital artifacts/glitches in the air around pack
- Color palette leans heavily toward magenta/cyan/amber neon
"""

def get_base_prompt(edition_config):
    """
    Gera o prompt completo combinando template base + config da edição
    
    Args:
        edition_config (dict): Config específica da edição com chaves:
            - edition_id: str (ex: "ED01")
            - edition_name: str
            - tagline: str
            - theme: str
            - central_art: str
            - color_accent: str
            - icon_bottom: str
            - warning: str
            - cards_per_pack: int
    
    Returns:
        str: Prompt completo formatado
    """
    return BASE_PROMPT_TEMPLATE.format(
        edition_name=edition_config['edition_name'],
        edition_id=edition_config['edition_id'],
        tagline=edition_config['tagline'],
        theme=edition_config['theme'],
        central_art=edition_config['central_art'],
        color_accent=edition_config['color_accent'],
        icon_elements=edition_config['icon_bottom'],
        warning_text=edition_config['warning'],
        cards_per_pack=edition_config['cards_per_pack'],
        primary_color=BRAND_COLORS['primary'],
        secondary_color=BRAND_COLORS['secondary'],
        value_color=BRAND_COLORS['value'],
    )

# Validação de config
REQUIRED_KEYS = [
    'edition_id',
    'edition_name', 
    'tagline',
    'theme',
    'central_art',
    'color_accent',
    'icon_bottom',
    'warning',
    'cards_per_pack',
]

def validate_config(config):
    """Valida se config tem todas as chaves necessárias"""
    missing = [key for key in REQUIRED_KEYS if key not in config]
    if missing:
        raise ValueError(f"Config inválida. Faltam as chaves: {missing}")
    return True
