-- Seed initial booster types and example cards (idempotent)
-- Booster Types
INSERT INTO booster_types (name, edition_id, price_brl, price_crypto, rarity_distribution, cards_per_booster)
SELECT 'Starter Pack', 'ED01', 9.90, 0.00000000, '{"trash":60,"meme":25,"viral":10,"legendary":4,"godmode":1}'::jsonb, 5
WHERE NOT EXISTS (SELECT 1 FROM booster_types WHERE name='Starter Pack');

INSERT INTO booster_types (name, edition_id, price_brl, price_crypto, rarity_distribution, cards_per_booster)
SELECT 'Viral Surge', 'ED01', 19.90, 0.00000000, '{"trash":50,"meme":28,"viral":14,"legendary":6,"godmode":2}'::jsonb, 5
WHERE NOT EXISTS (SELECT 1 FROM booster_types WHERE name='Viral Surge');

-- Base Cards (ED01)
INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata)
SELECT 'crd_' || substring(md5(random()::text),1,6), 'Pixel Glitch', 'Fragmento instável de meme em formação', 'trash', 'anomaly', 0.50, 0.00000000, 'ED01', 'https://example.com/pixel_glitch.png', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE name='Pixel Glitch');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata)
SELECT 'crd_' || substring(md5(random()::text),1,6), 'Meme Totem', 'Símbolo de viralidade latente', 'meme', 'totem', 1.20, 0.00000000, 'ED01', 'https://example.com/meme_totem.png', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE name='Meme Totem');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata)
SELECT 'crd_' || substring(md5(random()::text),1,6), 'Trend Catalyst', 'Acelera tendências emergentes', 'viral', 'catalyst', 4.00, 0.00000000, 'ED01', 'https://example.com/trend_catalyst.png', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE name='Trend Catalyst');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata)
SELECT 'crd_' || substring(md5(random()::text),1,6), 'Crown Signal', 'Ecoa autoridade digital', 'legendary', 'emitter', 15.00, 0.00000000, 'ED01', 'https://example.com/crown_signal.png', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE name='Crown Signal');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata)
SELECT 'crd_' || substring(md5(random()::text),1,6), 'Godmode Pulse', 'Origem de dominância memética absoluta', 'godmode', 'origin', 60.00, 0.00000000, 'ED01', 'https://example.com/godmode_pulse.png', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE name='Godmode Pulse');
