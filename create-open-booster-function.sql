-- ============================================================================
-- FUNÇÃO DE ABERTURA DE BOOSTER COM SLOT SYSTEM
-- Usa booster_slot_config para gerar cartas baseado em weighted random
-- ============================================================================

CREATE OR REPLACE FUNCTION open_booster_with_slots(
  p_user_id UUID,
  p_booster_type_id UUID
)
RETURNS TABLE (
  card_id UUID,
  card_name TEXT,
  rarity TEXT,
  liquidity_brl NUMERIC,
  slot_position INT
) AS $$
DECLARE
  v_slot RECORD;
  v_selected_rarity TEXT;
  v_selected_card RECORD;
  v_cards_obtained UUID[] := ARRAY[]::UUID[];
BEGIN
  -- Para cada slot do booster
  FOR v_slot IN 
    SELECT slot_position, rarity_weights, slot_name
    FROM booster_slot_config
    WHERE booster_type_id = p_booster_type_id
    ORDER BY slot_position
  LOOP
    -- 1. Selecionar rarity usando weighted random
    v_selected_rarity := select_rarity_by_weight(v_slot.rarity_weights);
    
    -- 2. Buscar uma carta aleatória da rarity selecionada
    SELECT cb.id, cb.name, cb.rarity, cb.base_liquidity_brl
    INTO v_selected_card
    FROM cards_base cb
    WHERE cb.rarity = v_selected_rarity
    ORDER BY random()
    LIMIT 1;
    
    -- 3. Se encontrou carta, criar instância
    IF v_selected_card.id IS NOT NULL THEN
      -- Criar card_instance
      INSERT INTO cards_instances (
        base_id,
        owner_id,
        is_godmode,
        liquidity_brl,
        minted_at
      ) VALUES (
        v_selected_card.id,
        p_user_id,
        v_selected_rarity = 'godmode',
        v_selected_card.base_liquidity_brl,
        NOW()
      );
      
      -- Adicionar ao array de cards obtidos
      v_cards_obtained := array_append(v_cards_obtained, v_selected_card.id);
      
      -- Retornar informação da carta
      card_id := v_selected_card.id;
      card_name := v_selected_card.name;
      rarity := v_selected_card.rarity;
      liquidity_brl := v_selected_card.base_liquidity_brl;
      slot_position := v_slot.slot_position;
      
      RETURN NEXT;
    END IF;
  END LOOP;
  
  -- 4. Registrar abertura no histórico
  INSERT INTO booster_openings (
    user_id,
    booster_type_id,
    cards_obtained,
    opened_at,
    source
  ) VALUES (
    p_user_id,
    p_booster_type_id,
    v_cards_obtained,
    NOW(),
    'slot_system'
  );
  
  -- 5. Atualizar pity tracker (se dropou legendary/godmode, resetar contador)
  INSERT INTO booster_pity_tracker (
    user_id,
    booster_type_id,
    boosters_opened_since_last_legendary,
    boosters_opened_since_last_godmode,
    total_boosters_opened,
    updated_at
  ) VALUES (
    p_user_id,
    p_booster_type_id,
    CASE WHEN EXISTS(
      SELECT 1 FROM unnest(v_cards_obtained) AS card_id
      JOIN cards_base cb ON cb.id = card_id
      WHERE cb.rarity = 'legendary'
    ) THEN 0 ELSE 1 END,
    CASE WHEN EXISTS(
      SELECT 1 FROM unnest(v_cards_obtained) AS card_id
      JOIN cards_base cb ON cb.id = card_id
      WHERE cb.rarity = 'godmode'
    ) THEN 0 ELSE 1 END,
    1,
    NOW()
  )
  ON CONFLICT (user_id, booster_type_id) DO UPDATE SET
    boosters_opened_since_last_legendary = CASE 
      WHEN EXISTS(
        SELECT 1 FROM unnest(v_cards_obtained) AS card_id
        JOIN cards_base cb ON cb.id = card_id
        WHERE cb.rarity = 'legendary'
      ) THEN 0 
      ELSE booster_pity_tracker.boosters_opened_since_last_legendary + 1
    END,
    boosters_opened_since_last_godmode = CASE 
      WHEN EXISTS(
        SELECT 1 FROM unnest(v_cards_obtained) AS card_id
        JOIN cards_base cb ON cb.id = card_id
        WHERE cb.rarity = 'godmode'
      ) THEN 0 
      ELSE booster_pity_tracker.boosters_opened_since_last_godmode + 1
    END,
    total_boosters_opened = booster_pity_tracker.total_boosters_opened + 1,
    last_legendary_at = CASE 
      WHEN EXISTS(
        SELECT 1 FROM unnest(v_cards_obtained) AS card_id
        JOIN cards_base cb ON cb.id = card_id
        WHERE cb.rarity = 'legendary'
      ) THEN NOW() 
      ELSE booster_pity_tracker.last_legendary_at
    END,
    last_godmode_at = CASE 
      WHEN EXISTS(
        SELECT 1 FROM unnest(v_cards_obtained) AS card_id
        JOIN cards_base cb ON cb.id = card_id
        WHERE cb.rarity = 'godmode'
      ) THEN NOW() 
      ELSE booster_pity_tracker.last_godmode_at
    END,
    updated_at = NOW();
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TESTE DA FUNÇÃO
-- ============================================================================

-- Exemplo de uso (substitua pelos IDs reais):
-- SELECT * FROM open_booster_with_slots(
--   'USER_ID_AQUI'::uuid,
--   'BOOSTER_TYPE_ID_AQUI'::uuid
-- );

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

-- Esta função:
-- 1. ✅ Usa booster_slot_config para weighted random
-- 2. ✅ Cria cards_instances para cada carta dropada
-- 3. ✅ Registra em booster_openings com cards_obtained
-- 4. ✅ Atualiza pity tracker automaticamente
-- 5. ✅ Retorna lista de cartas obtidas com detalhes

-- Para integrar no frontend:
-- - Chamar esta função via Supabase RPC
-- - Exibir animação de abertura com as cartas retornadas
-- - Mostrar rarity, nome e valor de cada carta
-- - Atualizar inventário do usuário

-- ============================================================================
