-- Seed basic booster types and example cards
INSERT INTO booster_types (name, price_brl, price_crypto, rarity_distribution)
VALUES
  ('Starter Pack', 9.90, 0.00000000, '{"trash":60,"meme":25,"viral":10,"legendary":4,"godmode":1}'),
  ('Viral Surge', 19.90, 0.00000000, '{"trash":50,"meme":28,"viral":14,"legendary":6,"godmode":2}');

-- Example base cards (edition ED01)
INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata)
VALUES
  ('crd_' || substring(md5(random()::text),1,6), 'Pixel Glitch', 'Fragmento instável de meme em formação', 'trash', 'anomaly', 0.50, 0.00000000, 'ED01', 'https://example.com/pixel_glitch.png', '{}'::jsonb),
  ('crd_' || substring(md5(random()::text),1,6), 'Meme Totem', 'Símbolo de viralidade latente', 'meme', 'totem', 1.20, 0.00000000, 'ED01', 'https://example.com/meme_totem.png', '{}'::jsonb),
  ('crd_' || substring(md5(random()::text),1,6), 'Trend Catalyst', 'Acelera tendências emergentes', 'viral', 'catalyst', 4.00, 0.00000000, 'ED01', 'https://example.com/trend_catalyst.png', '{}'::jsonb),
  ('crd_' || substring(md5(random()::text),1,6), 'Crown Signal', 'Ecoa autoridade digital', 'legendary', 'emitter', 15.00, 0.00000000, 'ED01', 'https://example.com/crown_signal.png', '{}'::jsonb),
  ('crd_' || substring(md5(random()::text),1,6), 'Godmode Pulse', 'Origem de dominância memética absoluta', 'godmode', 'origin', 60.00, 0.00000000, 'ED01', 'https://example.com/godmode_pulse.png', '{}'::jsonb);
