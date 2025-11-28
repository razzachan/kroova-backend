-- Kroova Migration: Fix mis-encoded card names (mojibake repairs)
-- Idempotent: each UPDATE only applies if current name differs.
-- If any of these target names need further refinement (e.g. expand truncations), edit before running.
-- Recommended execution: run in Supabase SQL editor or via psql.

BEGIN;
UPDATE cards_base SET name = 'Ghostfluênc'  WHERE display_id = 'crd_2d2e77' AND name <> 'Ghostfluênc';
UPDATE cards_base SET name = 'ClipeCópia'   WHERE display_id = 'crd_bd7ed6' AND name <> 'ClipeCópia';
UPDATE cards_base SET name = 'PodcastVão'   WHERE display_id = 'crd_b3fd8d' AND name <> 'PodcastVão';
UPDATE cards_base SET name = 'BioClichê'    WHERE display_id = 'crd_b1230d' AND name <> 'BioClichê';
UPDATE cards_base SET name = 'NFTOrfã'      WHERE display_id = 'crd_748a6c' AND name <> 'NFTOrfã';
UPDATE cards_base SET name = 'WebinárVão'   WHERE display_id = 'crd_2442a8' AND name <> 'WebinárVão';
UPDATE cards_base SET name = 'CópiaNota'    WHERE display_id = 'crd_a34ae2' AND name <> 'CópiaNota';
UPDATE cards_base SET name = 'PinOrfã'      WHERE display_id = 'crd_d4dc9e' AND name <> 'PinOrfã';
UPDATE cards_base SET name = 'TagNinguém'   WHERE display_id = 'crd_99480c' AND name <> 'TagNinguém';
UPDATE cards_base SET name = 'PixOrfão'     WHERE display_id = 'crd_0f24c2' AND name <> 'PixOrfão';
UPDATE cards_base SET name = 'BotãoLike'    WHERE display_id = 'crd_0c39ef' AND name <> 'BotãoLike';
UPDATE cards_base SET name = 'TagInútil'    WHERE display_id = 'crd_f3a3e1' AND name <> 'TagInútil';
UPDATE cards_base SET name = 'IconeCópia'   WHERE display_id = 'crd_82769a' AND name <> 'IconeCópia';
UPDATE cards_base SET name = 'ScrollMáq'    WHERE display_id = 'crd_f5e899' AND name <> 'ScrollMáq';
UPDATE cards_base SET name = 'PlayVício'    WHERE display_id = 'crd_6fed0d' AND name <> 'PlayVício';
UPDATE cards_base SET name = 'CópiaPura'    WHERE display_id = 'crd_af6d42' AND name <> 'CópiaPura';
UPDATE cards_base SET name = 'CancelMaçon'  WHERE display_id = 'crd_593202' AND name <> 'CancelMaçon';
COMMIT;

-- Rollback (manual): run individual UPDATE with original broken value if needed.