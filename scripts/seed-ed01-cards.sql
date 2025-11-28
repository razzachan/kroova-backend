-- ED01 250 Cards + Crocodile Trader (generated from ED01_250_CARDS_GENERATED.md)
-- Total: 251 cards

-- 🐊 SPECIAL: Croco Trader (Legendary)
INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_croco01', 'Croco Trader', 'Um negociador predatório, movido por fluxos invisíveis de lucro', 'legendary', 'Ganância Digital', 500.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_croco01.png', '{}'::jsonb, 92, 88
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_croco01');

-- TRASH tier
INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2d2e77', 'Ghostfluênc', 'Perdeu 10k seguidores num dia. Agora vende curso de "como voltar ao topo".', 'trash', 'Influência', 0.50, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2d2e77.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 14, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2d2e77');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_88b6d9', 'ScrollZumbi', 'Rolou 4h sem parar. Esqueceu o que tava procurando.', 'trash', 'Preguiça', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_88b6d9.png', '{"tier":"trash","rarity_score":12,"trend":18,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_88b6d9');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_92c43d', 'SkyMentira', 'Espalha fake news no grupo da família. Acha que tá "abrindo olhos".', 'trash', 'Informação', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_92c43d.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 13, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_92c43d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_dbe0a3', 'VapeDev', 'Code bootcamp dropout. Agora vende curso de "programação sem esforço".', 'trash', 'Consumo', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_dbe0a3.png', '{"tier":"trash","rarity_score":14,"trend":20,"force_godmode":false}'::jsonb, 8, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_dbe0a3');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_6d5c52', 'BetZeroum', 'Perdeu 2 salários em apostas. "Estratégia falhou, mas vou recuperar".', 'trash', 'Ganância', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_6d5c52.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 14, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_6d5c52');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_cf43fd', 'DropVoid', 'Dropshipping sem vendas. 50 produtos, 0 clientes.', 'trash', 'Consumo', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_cf43fd.png', '{"tier":"trash","rarity_score":13,"trend":19,"force_godmode":false}'::jsonb, 7, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_cf43fd');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_721916', 'RaivaTuite', 'Discute com desconhecidos 24/7. Energia: ódio gratuito.', 'trash', 'Impulso', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_721916.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 11, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_721916');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_81878a', 'FollowFake', 'Comprou 10k seguidores. Engajamento: 3 likes.', 'trash', 'Influência', 0.44, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_81878a.png', '{"tier":"trash","rarity_score":11,"trend":17,"force_godmode":false}'::jsonb, 10, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_81878a');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_bd7ed6', 'ClipeCópia', 'Repostou o mesmo meme 50 vezes. Acha que vai viralizar.', 'trash', 'Preguiça', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_bd7ed6.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 5, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_bd7ed6');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_cb9dd9', 'CriptoRekt', 'Investiu na moeda errada. Agora explica "por que não era scam".', 'trash', 'Ganância', 0.56, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_cb9dd9.png', '{"tier":"trash","rarity_score":19,"trend":26,"force_godmode":false}'::jsonb, 17, 19
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_cb9dd9');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b3fd8d', 'PodcastVão', '30 episódios, 5 ouvintes. Temas: "como escalar" e "mindset".', 'trash', 'Influência', 0.46, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b3fd8d.png', '{"tier":"trash","rarity_score":12,"trend":18,"force_godmode":false}'::jsonb, 11, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b3fd8d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_671d29', 'StoryFalso', 'Aluga carro pra fingir sucesso. 3 stories por dia de "lifestyle".', 'trash', 'Consumo', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_671d29.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 9, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_671d29');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_825525', 'LikeBot', 'Curtiu 1000 posts sem ler nenhum. Scroll automático.', 'trash', 'Impulso', 0.42, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_825525.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 7, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_825525');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7cc8d4', 'TrendLate', 'Dança trend de 6 meses atrás. Acha que tá na vibe.', 'trash', 'Preguiça', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7cc8d4.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 5, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7cc8d4');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2a6e23', 'GrindGhost', 'Hustla 24/7 mas não ganha nada. "Processo" sem resultado.', 'trash', 'Ganância', 0.53, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2a6e23.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 14, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2a6e23');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f21fac', 'ReelCringe', 'Transição mal editada. Som atrasado. Posted anyway.', 'trash', 'Influência', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f21fac.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 13, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f21fac');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b1230d', 'BioClichê', '"CEO da própria vida 💪 | Viagem é vida ✈️ | DM aberto 📩".', 'trash', 'Consumo', 0.44, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b1230d.png', '{"tier":"trash","rarity_score":11,"trend":17,"force_godmode":false}'::jsonb, 6, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b1230d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0a230a', 'MemeLixo', 'Reposta meme de 2019. Sem contexto. 2 comentários: "???".', 'trash', 'Preguiça', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0a230a.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0a230a');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_687420', 'HypeZero', 'Anunciou projeto. Sumiu. Voltou 1 ano depois com "coming soon".', 'trash', 'Impulso', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_687420.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 10, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_687420');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_004e25', 'SpamLord', 'Envia DM com link de afiliado. Bloqueado 500 vezes.', 'trash', 'Ganância', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_004e25.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 11, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_004e25');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_ae6a86', 'CursoFail', 'Vende mentoria sem resultado. "Mas os outros conseguiram".', 'trash', 'Ganância', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_ae6a86.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 15, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_ae6a86');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_861dfb', 'TikFlopado', '50 vídeos postados. Melhor resultado: 73 views.', 'trash', 'Influência', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_861dfb.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 13, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_861dfb');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_748a6c', 'NFTOrfã', 'Comprou JPEG por 2 ETH. Valor atual: $12.', 'trash', 'Consumo', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_748a6c.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 10, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_748a6c');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_9f4511', 'ThreadSeco', 'Thread de 15 tweets. 1 like. Do próprio perfil.', 'trash', 'Preguiça', 0.46, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_9f4511.png', '{"tier":"trash","rarity_score":12,"trend":18,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_9f4511');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f9bf1d', 'PinEterno', 'Pinou tweet de 2 anos. Ninguém leu.', 'trash', 'Impulso', 0.44, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f9bf1d.png', '{"tier":"trash","rarity_score":11,"trend":17,"force_godmode":false}'::jsonb, 7, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f9bf1d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_bbbb72', 'PlayViciado', '8h/dia de jogo. 0h de produtividade. "Mas sou streamer".', 'trash', 'Preguiça', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_bbbb72.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 6, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_bbbb72');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7867f2', 'GigEscrav', 'Entregador 12h/dia. Ganha menos que salário mínimo. "Liberdade".', 'trash', 'Ganância', 0.56, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7867f2.png', '{"tier":"trash","rarity_score":19,"trend":26,"force_godmode":false}'::jsonb, 17, 19
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7867f2');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f50024', 'MetaGado', 'Segue todo trend. Zero personalidade. Clone algorítmico.', 'trash', 'Influência', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f50024.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 12, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f50024');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_325ffc', 'ResenhaBot', 'Comenta "Top!" em 200 posts. Todos geridos por bot.', 'trash', 'Preguiça', 0.42, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_325ffc.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 4, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_325ffc');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2eab5b', 'FakeGuru', 'Vendeu curso. Conteúdo: print de artigo do Google.', 'trash', 'Ganância', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2eab5b.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 13, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2eab5b');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0d4b68', 'DoomScroll', '4h diárias no feed. Absorveu: nada. Energia: drenada.', 'trash', 'Preguiça', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0d4b68.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 5, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0d4b68');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2fe01c', 'BuzzVazio', 'Clickbait master. Título: 🔥. Conteúdo: 404.', 'trash', 'Informação', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2fe01c.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 9, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2fe01c');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_47729a', 'ImpulsoShop', 'Comprou 50 itens online. Usou 2. Resto: doação.', 'trash', 'Consumo', 0.53, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_47729a.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 9, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_47729a');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_770c8b', 'RageBait', 'Posta coisa polêmica só pra gerar rage. Comenta os ódios: lucro.', 'trash', 'Impulso', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_770c8b.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 12, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_770c8b');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_de5b26', 'LurkShadow', '3 anos sem postar. Só stalkeando. Perfil privado.', 'trash', 'Preguiça', 0.44, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_de5b26.png', '{"tier":"trash","rarity_score":11,"trend":17,"force_godmode":false}'::jsonb, 4, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_de5b26');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_02867a', 'BioLink', 'Link na bio com 30 redirecionamentos. Tráfego: 0.', 'trash', 'Ganância', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_02867a.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 11, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_02867a');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_269c69', 'ViewFake', 'Comprou views. Algoritmo detectou. Shadowbanned.', 'trash', 'Influência', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_269c69.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 14, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_269c69');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_dbde51', 'BolaEco', 'Vive em bolha ideológica. Só segue quem concorda.', 'trash', 'Informação', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_dbde51.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 10, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_dbde51');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_62c677', 'BurnZumbi', 'Burnout fingido. Trabalha 2h/dia. Reclama 6h.', 'trash', 'Preguiça', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_62c677.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 6, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_62c677');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2d1208', 'ShillLost', 'Shillou 20 projetos. Todos ruggados. Próximo: "confia".', 'trash', 'Ganância', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2d1208.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 10, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2d1208');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_c6f1fe', 'AlfaPretnd', 'Se diz alfa. Mora com os pais. Nunca teve relacionamento.', 'trash', 'Influência', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_c6f1fe.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 15, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_c6f1fe');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_c47c27', 'HustleFake', 'Posta rotina produtiva. Real: Netflix 10h.', 'trash', 'Ganância', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_c47c27.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 16, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_c47c27');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2556cf', 'TrapSocial', 'Cai em bait toda semana. Argumenta com bot.', 'trash', 'Impulso', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2556cf.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 9, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2556cf');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_767e90', 'EngajeFome', '"Marque 3 amigos!" Ninguém marca.', 'trash', 'Influência', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_767e90.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 14, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_767e90');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_d5c7c8', 'CoachBluff', 'Vendeu 2 mentorias. Cliente ghostou. "Ele não quis sucesso".', 'trash', 'Ganância', 0.56, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_d5c7c8.png', '{"tier":"trash","rarity_score":19,"trend":26,"force_godmode":false}'::jsonb, 17, 19
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_d5c7c8');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0b5e28', 'HashtagSpam', '30 hashtags por post. Reach: orgânico 0.', 'trash', 'Preguiça', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0b5e28.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 4, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0b5e28');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_86f9e3', 'CapaFalsa', 'Capa do Kindle com stock photo. Livro: ChatGPT não revisado.', 'trash', 'Consumo', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_86f9e3.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 8, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_86f9e3');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_65dd54', 'RaidNulo', 'Fez raid. 2 pessoas assistiram. Ambas: bots.', 'trash', 'Impulso', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_65dd54.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 8, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_65dd54');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_cb638c', 'RetweetBot', 'RT sem ler. 100 posts/dia. Opinião: nenhuma.', 'trash', 'Preguiça', 0.43, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_cb638c.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 4, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_cb638c');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_df744f', 'SigmaMeme', 'Usa "sigma grindset" sem ironia. Trabalha: 0h.', 'trash', 'Influência', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_df744f.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 16, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_df744f');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2442a8', 'WebinárVão', 'Webinar grátis. Pitch de venda disfarçado. Inscritos: 3.', 'trash', 'Ganância', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2442a8.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 13, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2442a8');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_054fe1', 'ExpoPretens', 'Comprou ingresso pra evento. Foi pra foto. Networking: 0.', 'trash', 'Consumo', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_054fe1.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 7, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_054fe1');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0a36de', 'ViraLixo', 'Tentou viralizar 50 vezes. Resultado: nada.', 'trash', 'Informação', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0a36de.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 10, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0a36de');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_9864b9', 'BotFollow', 'Segue 10k. Seguido por 50. Taxa: robô confirmado.', 'trash', 'Influência', 0.44, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_9864b9.png', '{"tier":"trash","rarity_score":11,"trend":17,"force_godmode":false}'::jsonb, 10, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_9864b9');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_abdee5', 'CopyPasteGM', '"GM" todo dia. Interação real: zero.', 'trash', 'Preguiça', 0.46, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_abdee5.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_abdee5');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_5ec576', 'AudioFail', 'Gravou áudio de 5min sem editar. Qualidade: celular no bolso.', 'trash', 'Impulso', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_5ec576.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 11, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_5ec576');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_cd1c1d', 'MetaZumbi', 'Comprou headset VR. Usou 1 vez. "É o futuro".', 'trash', 'Consumo', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_cd1c1d.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 10, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_cd1c1d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_579d61', 'PlugDrop', 'Dropou link em conversa aleatória. Ban instantâneo.', 'trash', 'Ganância', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_579d61.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 11, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_579d61');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_8c24ca', 'SubBeg', '"Inscreva-se!" 100 vezes. Ganhou: -5 subs (unsub).', 'trash', 'Influência', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_8c24ca.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 14, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_8c24ca');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a968c2', 'GigaFake', 'Fingiu ser rico. Print de saldo falso. Exposed em 24h.', 'trash', 'Ganância', 0.56, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a968c2.png', '{"tier":"trash","rarity_score":19,"trend":26,"force_godmode":false}'::jsonb, 17, 19
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a968c2');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_31e62a', 'CarreiraVap', 'Mudou de carreira 5 vezes em 1 ano. Ainda desempregado.', 'trash', 'Preguiça', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_31e62a.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 5, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_31e62a');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7dcb39', 'CancelFodas', 'Tentou cancelar alguém. Tinha 12 seguidores.', 'trash', 'Impulso', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7dcb39.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 11, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7dcb39');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7634c1', 'LiveDesert', 'Live com 1 viewer: ele mesmo (segunda tela).', 'trash', 'Influência', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7634c1.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 11, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7634c1');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_cd36dc', 'CloutChase', 'Faz qualquer coisa por atenção. Resultado: cringe documentado.', 'trash', 'Ganância', 0.53, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_cd36dc.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 14, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_cd36dc');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_cbaaf1', 'TempBobo', 'Usa template de post. Esquece de trocar nome da marca.', 'trash', 'Preguiça', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_cbaaf1.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 4, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_cbaaf1');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_e5b648', 'TradeNoob', 'Day trade sem estudo. Perdeu tudo. "Mercado tá manipulado".', 'trash', 'Ganância', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_e5b648.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 16, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_e5b648');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_956b58', 'SelfEterno', '300 selfies. 1 post. Nenhum like do crush.', 'trash', 'Consumo', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_956b58.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 7, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_956b58');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a34ae2', 'CópiaNota', 'Copia nota de rodapé. Acha que ninguém vai perceber.', 'trash', 'Informação', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a34ae2.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 11, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a34ae2');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_51c6a7', 'DicaSeca', '"Dica: seja você mesmo 🙏". Engajamento: silêncio.', 'trash', 'Preguiça', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_51c6a7.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 5, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_51c6a7');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_96888f', 'SpaceFraco', 'Criou Space. 3 participantes. 2 saíram no meio.', 'trash', 'Impulso', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_96888f.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 8, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_96888f');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2bf628', 'PropSurda', 'Propagando produto que nunca usou. Credibilidade: -100.', 'trash', 'Ganância', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2bf628.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 14, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2bf628');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_d4dc9e', 'PinOrfã', 'Board no Pinterest com 1 pin. Descrição: "Inspiração".', 'trash', 'Preguiça', 0.43, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_d4dc9e.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 4, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_d4dc9e');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a939bc', 'AlgoIgnor', 'Algoritmo deu ghosting. Shadow ban permanente.', 'trash', 'Influência', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a939bc.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 16, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a939bc');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0b7b3b', 'PlaySolo', 'Joga solo. Sem party. Sem amigos. "Sou lone wolf".', 'trash', 'Preguiça', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0b7b3b.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 5, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0b7b3b');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_3e759d', 'ProtFollow', 'Protege tweet. 50 seguidores. Ninguém pede pra seguir.', 'trash', 'Influência', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_3e759d.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 14, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_3e759d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0dc21c', 'AfiliZero', 'Link de afiliado postado 100 vezes. Venda: nenhuma.', 'trash', 'Ganância', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0dc21c.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 16, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0dc21c');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a02cfe', 'ReelsLoop', 'Mesmo reels repostado 10 vezes. "Vai que pega".', 'trash', 'Preguiça', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a02cfe.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 5, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a02cfe');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_e4a6dc', 'ParaSempre', 'Status "online" 24/7. Vida social: inexistente.', 'trash', 'Impulso', 0.44, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_e4a6dc.png', '{"tier":"trash","rarity_score":11,"trend":17,"force_godmode":false}'::jsonb, 7, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_e4a6dc');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_99480c', 'TagNinguém', 'Taga 20 pessoas. Nenhuma responde. Nunca.', 'trash', 'Preguiça', 0.46, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_99480c.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_99480c');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_753d1c', 'PromFake', 'Prometeu produto em 2022. Sumiu. Voltou em 2025: "Em breve".', 'trash', 'Ganância', 0.56, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_753d1c.png', '{"tier":"trash","rarity_score":19,"trend":26,"force_godmode":false}'::jsonb, 17, 19
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_753d1c');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0d75bc', 'BioPoser', 'Bio com 10 títulos falsos. LinkedIn: desempregado.', 'trash', 'Consumo', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0d75bc.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 7, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0d75bc');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_78f61b', 'MoodBoard', 'Fez moodboard. Nunca executou projeto. "Era só inspiração".', 'trash', 'Preguiça', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_78f61b.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 6, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_78f61b');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_86e3c3', 'CarouMort', 'Carrossel de 10 slides. Views no último: 5.', 'trash', 'Influência', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_86e3c3.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 13, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_86e3c3');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_e47dfc', 'SaveVazio', 'Salvou 500 posts. Revisitou: 0.', 'trash', 'Preguiça', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_e47dfc.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 6, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_e47dfc');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_3b7810', 'TrapEngaje', 'Cai em isca de engajamento toda vez. Comentou: "Nossa que chocante!".', 'trash', 'Impulso', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_3b7810.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 11, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_3b7810');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_edeb59', 'BuzzKiller', 'Responde hype com negatividade. Amigos: unfollowed.', 'trash', 'Informação', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_edeb59.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 9, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_edeb59');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2b5678', 'RaidBot', 'Raid em canal vazio. 5 bots chegaram.', 'trash', 'Influência', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2b5678.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 10, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2b5678');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_40544d', 'CollabGhost', 'Propôs collab. Não respondeu depois. Ghosting profissional.', 'trash', 'Ganância', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_40544d.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 16, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_40544d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_14f64e', 'DuetFlop', 'Fez dueto. Original: 10M views. Dele: 47.', 'trash', 'Preguiça', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_14f64e.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 5, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_14f64e');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0e991e', 'ExpireConte', 'Conteúdo expira em 24h. Esforço: wasted.', 'trash', 'Consumo', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0e991e.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 9, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0e991e');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_1b5997', 'QuoteVazio', '"Seja forte 💪" em arte genérica. Inspirou: ninguém.', 'trash', 'Preguiça', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_1b5997.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 5, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_1b5997');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_1bc1ab', 'FormFake', 'Formulário de cadastro. Vendeu dados. Processo: iminente.', 'trash', 'Ganância', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_1bc1ab.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 14, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_1bc1ab');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_e1ebad', 'VlogAband', 'Vlog diário. Durou 3 dias. "Vou voltar logo".', 'trash', 'Preguiça', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_e1ebad.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_e1ebad');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_18a3c8', 'TrapClick', 'Clicou em phishing. Conta hackeada. "Era promoção real".', 'trash', 'Impulso', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_18a3c8.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 11, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_18a3c8');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_79a3bd', 'LevelFraco', 'Level 1 no jogo social. Sem XP. Stuck.', 'trash', 'Influência', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_79a3bd.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 10, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_79a3bd');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_dd8555', 'MemeOld', 'Meme de 2015. "Clássico". Cringe confirmado.', 'trash', 'Preguiça', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_dd8555.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 5, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_dd8555');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_cc791d', 'BaitGuloso', 'Caiu em 10 baits. Ainda cai. "Dessa vez é real".', 'trash', 'Impulso', 0.56, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_cc791d.png', '{"tier":"trash","rarity_score":19,"trend":26,"force_godmode":false}'::jsonb, 13, 19
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_cc791d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7e6411', 'ShopImpulso', 'Carrinho cheio. Finalizou 0. FOMO sem conversão.', 'trash', 'Consumo', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7e6411.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 9, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7e6411');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_190088', 'ListaEsq', 'Lista de "assistir depois". 500 itens. Assistiu: 0.', 'trash', 'Preguiça', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_190088.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 5, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_190088');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_d9b2c6', 'BotReply', 'Responde automaticamente. Conversa: impossível.', 'trash', 'Impulso', 0.43, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_d9b2c6.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 7, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_d9b2c6');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_03fe66', 'GhostReader', 'Lê mensagens sem responder. Ghosting master.', 'trash', 'Preguiça', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_03fe66.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_03fe66');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_ad26ba', 'ViewerUm', 'Único viewer da própria live: a mãe.', 'trash', 'Influência', 0.44, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_ad26ba.png', '{"tier":"trash","rarity_score":11,"trend":17,"force_godmode":false}'::jsonb, 10, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_ad26ba');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_5b31f6', 'TrendCorpse', 'Trend morto ressuscitado. Não funciona mais.', 'trash', 'Preguiça', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_5b31f6.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 6, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_5b31f6');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_96b8d0', 'SubPerdido', 'Inscrito em 200 canais. Assiste: nenhum.', 'trash', 'Influência', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_96b8d0.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 12, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_96b8d0');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b54447', 'BaitEterno', 'Cai em bait infinitamente. Aprende: nunca.', 'trash', 'Impulso', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b54447.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 12, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b54447');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_27c2cc', 'CopyVerg', 'Copiou post viral. Esqueceu de trocar @ do original.', 'trash', 'Ganância', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_27c2cc.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 12, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_27c2cc');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_168472', 'DicaNada', 'Dica genérica. Valor: zero. "Acredite em você".', 'trash', 'Preguiça', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_168472.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 6, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_168472');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0f24c2', 'PixOrfão', 'Pix na bio. Recebido: R$0,00 lifetime.', 'trash', 'Ganância', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0f24c2.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 15, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0f24c2');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_48238f', 'PodVazio', 'Podcast de 2h. Conteúdo real: 10min.', 'trash', 'Preguiça', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_48238f.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_48238f');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_3403b8', 'ViewBought', 'Comprou views. Algoritmo puniu. Engajamento: morte.', 'trash', 'Influência', 0.56, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_3403b8.png', '{"tier":"trash","rarity_score":19,"trend":26,"force_godmode":false}'::jsonb, 18, 19
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_3403b8');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a19291', 'RetweetSec', 'Retweeta em segundos. Lê: nunca.', 'trash', 'Preguiça', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a19291.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 4, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a19291');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_ad0509', 'InfluFake', 'Se diz influencer. Influencia: 0 pessoas.', 'trash', 'Consumo', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_ad0509.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 9, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_ad0509');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_3eec7b', 'ThreadNulo', 'Thread prometida. Postou 1/10. Esqueceu.', 'trash', 'Preguiça', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_3eec7b.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 5, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_3eec7b');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_e57cb4', 'MentorBluff', 'Mentor sem mentorado. Expertise: TikTok de dicas.', 'trash', 'Ganância', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_e57cb4.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 16, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_e57cb4');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_9ec93c', 'LoopMental', 'Preso em loop. Mesmo erro 50 vezes.', 'trash', 'Impulso', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_9ec93c.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 9, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_9ec93c');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_5e6a75', 'BioPromessa', 'Bio: "Em breve novidades". Eternamente.', 'trash', 'Influência', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_5e6a75.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 14, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_5e6a75');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_3a2340', 'FollowTrap', 'Follow pra unfollow. Detectado. Blocked.', 'trash', 'Impulso', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_3a2340.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 8, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_3a2340');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_ce5bfa', 'ViraFail', 'Tentou viralizar com desafio idiota. Resultado: ban.', 'trash', 'Preguiça', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_ce5bfa.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 6, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_ce5bfa');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_889aac', 'PlayEmpty', 'Playlist vazia. Curadoria: inexistente.', 'trash', 'Preguiça', 0.43, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_889aac.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 4, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_889aac');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0919c7', 'HashDead', 'Hashtag morta. Usado: só ele.', 'trash', 'Preguiça', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0919c7.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 5, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0919c7');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_97c00f', 'StatusGhost', 'Status invisível. Ninguém vê. Ninguém liga.', 'trash', 'Influência', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_97c00f.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 15, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_97c00f');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0a5392', 'DuoZero', 'Chamou pra duo. Ninguém aceitou. Solo forçado.', 'trash', 'Impulso', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0a5392.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 9, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0a5392');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_d3c477', 'LiveMute', 'Live no mute. Chat: "Som?" x100.', 'trash', 'Preguiça', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_d3c477.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 4, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_d3c477');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f31aca', 'BurnFalse', 'Finge burnout. Trabalha 3h/semana. Drama: full time.', 'trash', 'Consumo', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f31aca.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 9, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f31aca');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_1ad1b9', 'NichoEsqc', 'Nicho abandonado. 0 relevância. Fantasma do algoritmo.', 'trash', 'Influência', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_1ad1b9.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 11, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_1ad1b9');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_530a0b', 'FeedVazio', 'Timeline sem alma. Algoritmo confuso. Serve: anúncios.', 'trash', 'Consumo', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_530a0b.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 8, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_530a0b');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_bac530', 'NotifGhost', 'Notificação fantasma. Clica. Nada aparece.', 'trash', 'Preguiça', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_bac530.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_bac530');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0c39ef', 'BotãoLike', 'Botão gasto de tanto usar. Critério: nenhum.', 'trash', 'Impulso', 0.43, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0c39ef.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 7, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0c39ef');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_5f303e', 'DMSeco', 'DM sem resposta. Visto. Ignorado. Ghosting garantido.', 'trash', 'Influência', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_5f303e.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 12, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_5f303e');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_51d213', 'LinkQueb', '404. Promessa não cumprida. Hype desperdiçado.', 'trash', 'Informação', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_51d213.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 11, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_51d213');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_5a45b4', 'HashtagMort', 'Hashtag sem uso. Cemitério digital.', 'trash', 'Preguiça', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_5a45b4.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 4, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_5a45b4');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_1a9d06', 'TemplateGen', 'Template Canva 1000x usado. Originalidade: 0.', 'trash', 'Consumo', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_1a9d06.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 8, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_1a9d06');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a72b90', 'FiltroFake', 'Filtro que mente. "Realidade aumentada" do autoengano.', 'trash', 'Consumo', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a72b90.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 9, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a72b90');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_6f37c6', 'PlaylistBot', 'Playlist gerada por IA. Soul: inexistente.', 'trash', 'Preguiça', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_6f37c6.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_6f37c6');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_263d84', 'PixPromessa', 'QR code eterno. Nunca recebe. Esperança: morta.', 'trash', 'Ganância', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_263d84.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 15, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_263d84');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f05cda', 'StoryExp', 'Story de 24h esquecido. View: 3. Impacto: nenhum.', 'trash', 'Preguiça', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f05cda.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 5, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f05cda');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_d60817', 'PinOrphan', 'Pin sem board. Perdido no vazio do Pinterest.', 'trash', 'Preguiça', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_d60817.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 4, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_d60817');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f3a3e1', 'TagInútil', 'Tag que ninguém clica. SEO falhou.', 'trash', 'Impulso', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f3a3e1.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 9, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f3a3e1');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_82769a', 'IconeCópia', 'Ícone genérico. Identidade: plagiada.', 'trash', 'Consumo', 0.43, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_82769a.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 6, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_82769a');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_12b7cd', 'ViewCount0', 'Contador travado em 0. Algoritmo esqueceu de você.', 'trash', 'Influência', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_12b7cd.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 14, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_12b7cd');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_d19ceb', 'CacheGhost', 'Cache corrompido. Dados: perdidos. Backup: nenhum.', 'trash', 'Preguiça', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_d19ceb.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_d19ceb');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_6b1e73', 'ThreadUnfin', 'Thread inacabada. "Continua..." Nunca continuou.', 'trash', 'Preguiça', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_6b1e73.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 6, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_6b1e73');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7cc4fd', 'CarrosselVz', 'Carrossel sem final. Swipe inútil.', 'trash', 'Preguiça', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7cc4fd.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 5, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7cc4fd');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0678ee', 'BannerGen', 'Banner stock. Marca: esquecível.', 'trash', 'Consumo', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0678ee.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 8, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0678ee');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_689f6b', 'LogoFail', 'Logo feia. Feita no Paint. "É provisório" há 3 anos.', 'trash', 'Consumo', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_689f6b.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 6, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_689f6b');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_522ae5', 'AudioRuim', 'Áudio que dói. Qualidade: celular 2010.', 'trash', 'Impulso', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_522ae5.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 11, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_522ae5');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_1a2ced', 'CropErrado', 'Crop que cortou a parte importante. Repost: fail.', 'trash', 'Preguiça', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_1a2ced.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_1a2ced');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_417d13', 'FonteCringe', 'Comic Sans não irônica. Design: morreu.', 'trash', 'Consumo', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_417d13.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 9, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_417d13');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f78fe3', 'MemeRobado', 'Meme sem créditos. Marca d''água visível. Vergonha.', 'trash', 'Preguiça', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f78fe3.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 5, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f78fe3');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a21867', 'QRMorto', 'QR code expirado. Scan inútil.', 'trash', 'Informação', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a21867.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 10, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a21867');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_01269a', 'GifPesado', 'GIF de 50MB. Carrega: nunca.', 'trash', 'Impulso', 0.43, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_01269a.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 7, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_01269a');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_8da468', 'EmojiFlood', '50 emojis. Mensagem ilegível. Propósito: ???', 'trash', 'Impulso', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_8da468.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 7, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_8da468');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_498de6', 'ThumbFalso', 'Thumbnail clickbait. Vídeo não entrega. Decepção.', 'trash', 'Informação', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_498de6.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 12, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_498de6');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_15e984', 'DescVazia', 'Descrição: "...". Contexto: perdido para sempre.', 'trash', 'Preguiça', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_15e984.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_15e984');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_633373', 'MetaErrada', 'Meta tag errada. SEO: sabotado pelo próprio criador.', 'trash', 'Informação', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_633373.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 11, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_633373');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_088429', 'CancelFraco', 'Tentativa de cancelamento. 10 pessoas. Esquecido em 2h.', 'trash', 'Impulso', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_088429.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 11, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_088429');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_3f9ae5', 'TrendMorto', 'Trend expirado. Ainda tentando usar. Cringe confirmado.', 'trash', 'Preguiça', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_3f9ae5.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 5, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_3f9ae5');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_61f6bf', 'HypeGone', 'Hype evaporou. Ninguém lembra. Era pra ser grande.', 'trash', 'Influência', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_61f6bf.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 14, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_61f6bf');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_c44475', 'ViralFail', 'Tentou viralizar. 50 views. Família fingiu que viu.', 'trash', 'Impulso', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_c44475.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 9, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_c44475');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a24284', 'BugIgnorado', 'Bug reportado. Ignored. Closed: "Working as intended".', 'trash', 'Informação', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a24284.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 9, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a24284');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_e3b927', 'BoicoFrac', 'Boicote com 12 participantes. Empresa nem notou.', 'trash', 'Impulso', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_e3b927.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 11, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_e3b927');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_6d2103', 'MemeQuente', 'Meme de 48h. Expirado. Contextless agora.', 'trash', 'Informação', 0.55, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_6d2103.png', '{"tier":"trash","rarity_score":18,"trend":25,"force_godmode":false}'::jsonb, 13, 18
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_6d2103');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_d7a951', 'HashChal', 'Challenge sem participantes. Só o criador tentou.', 'trash', 'Preguiça', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_d7a951.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 4, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_d7a951');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_1588fc', 'SpaceVazio', 'Space criado. 2 ouvintes. Ambos: AFK.', 'trash', 'Influência', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_1588fc.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 13, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_1588fc');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_516591', 'RaidFail', 'Raid sem viewers. Chegaram: 0. Constrangimento.', 'trash', 'Impulso', 0.43, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_516591.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 7, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_516591');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_9653c8', 'ColabGhost', 'Colaboração prometida. Ghosting mútuo. Nada saiu.', 'trash', 'Ganância', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_9653c8.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 13, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_9653c8');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_15b086', 'EventoCance', 'Evento online cancelado. 0 ingressos vendidos.', 'trash', 'Impulso', 0.54, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_15b086.png', '{"tier":"trash","rarity_score":17,"trend":24,"force_godmode":false}'::jsonb, 11, 17
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_15b086');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_47ed1d', 'CrowdNone', 'Crowdfunding: R$50 de meta. Arrecadado: R$0.', 'trash', 'Ganância', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_47ed1d.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 11, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_47ed1d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_1273ee', 'SorteioFake', 'Sorteio prometido. Ganhador nunca anunciado. Fake.', 'trash', 'Ganância', 0.56, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_1273ee.png', '{"tier":"trash","rarity_score":19,"trend":26,"force_godmode":false}'::jsonb, 17, 19
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_1273ee');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_4817ab', 'LiveDeserta', 'Live de lançamento. 1 view: o próprio.', 'trash', 'Influência', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_4817ab.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 11, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_4817ab');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_19a999', 'PromoCrash', 'Promoção quebrou site. Vendeu: nada. Caiu antes.', 'trash', 'Consumo', 0.52, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_19a999.png', '{"tier":"trash","rarity_score":16,"trend":23,"force_godmode":false}'::jsonb, 9, 16
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_19a999');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_8a0f2c', 'UpdateBug', 'Update que quebrou tudo. Rollback: vergonhoso.', 'trash', 'Informação', 0.49, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_8a0f2c.png', '{"tier":"trash","rarity_score":14,"trend":21,"force_godmode":false}'::jsonb, 10, 14
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_8a0f2c');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a28c69', 'PatchFail', 'Patch que criou mais bugs. Hotfix: piorou.', 'trash', 'Informação', 0.45, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a28c69.png', '{"tier":"trash","rarity_score":11,"trend":18,"force_godmode":false}'::jsonb, 8, 11
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a28c69');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_03c35f', 'ManutInf', 'Manutenção eterna. Previsão: nunca volta.', 'trash', 'Preguiça', 0.51, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_03c35f.png', '{"tier":"trash","rarity_score":15,"trend":22,"force_godmode":false}'::jsonb, 6, 15
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_03c35f');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_dab16a', 'ServMort', 'Servidor caiu. Backup: não existe. Data loss total.', 'trash', 'Informação', 0.48, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_dab16a.png', '{"tier":"trash","rarity_score":13,"trend":20,"force_godmode":false}'::jsonb, 9, 13
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_dab16a');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b3d707', 'ErroFatal', 'Erro 500. Sempre. Resolução: impossível.', 'trash', 'Informação', 0.43, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b3d707.png', '{"tier":"trash","rarity_score":10,"trend":16,"force_godmode":false}'::jsonb, 7, 10
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b3d707');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a593b6', 'BanInjusto', 'Ban sem motivo. Appeal: negado. Automação falha.', 'trash', 'Impulso', 0.47, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a593b6.png', '{"tier":"trash","rarity_score":12,"trend":19,"force_godmode":false}'::jsonb, 8, 12
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a593b6');

-- MEME tier
INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_18d8b8', 'IdeiaViral', 'Teve a ideia antes. Não executou. Outro viralizou. Arrependimento eterno.', 'meme', 'Influência', 5.50, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_18d8b8.png', '{"tier":"meme","rarity_score":42,"trend":55,"force_godmode":false}'::jsonb, 39, 42
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_18d8b8');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_768c83', 'DropShipper', 'Vende produto que nunca viu. Margem: 3%. "Empresário".', 'meme', 'Ganância', 4.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_768c83.png', '{"tier":"meme","rarity_score":38,"trend":48,"force_godmode":false}'::jsonb, 34, 38
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_768c83');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a1571d', 'CoachMin', 'Vendeu 3 cursos. Comprador: a mãe, a tia e ele próprio.', 'meme', 'Ganância', 5.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a1571d.png', '{"tier":"meme","rarity_score":45,"trend":58,"force_godmode":false}'::jsonb, 40, 45
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a1571d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_d12cb7', 'PixGuru', 'Ensina a ganhar dinheiro. Ganha: com quem quer aprender.', 'meme', 'Ganância', 5.20, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_d12cb7.png', '{"tier":"meme","rarity_score":40,"trend":52,"force_godmode":false}'::jsonb, 36, 40
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_d12cb7');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_c03a09', 'TrendSurfer', 'Pula de trend em trend. Identidade: indefinida.', 'meme', 'Influência', 5.60, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_c03a09.png', '{"tier":"meme","rarity_score":43,"trend":56,"force_godmode":false}'::jsonb, 40, 43
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_c03a09');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_421eef', 'SigmaBluff', 'Se diz sigma. Comportamento: beta documentado.', 'meme', 'Impulso', 4.70, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_421eef.png', '{"tier":"meme","rarity_score":37,"trend":47,"force_godmode":false}'::jsonb, 25, 37
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_421eef');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2e0f36', 'EngajaBot', 'Comenta em todos os posts. Engajamento: comprado.', 'meme', 'Impulso', 5.30, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2e0f36.png', '{"tier":"meme","rarity_score":41,"trend":53,"force_godmode":false}'::jsonb, 28, 41
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2e0f36');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0e37ee', 'BuzzHunter', 'Caça buzz. Opina sem ler. Energia: reação instantânea.', 'meme', 'Informação', 5.90, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0e37ee.png', '{"tier":"meme","rarity_score":46,"trend":59,"force_godmode":false}'::jsonb, 34, 46
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0e37ee');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f5e899', 'ScrollMáq', 'Scroll 6h/dia. Produtivo: 0h. "Pesquisando".', 'meme', 'Preguiça', 5.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f5e899.png', '{"tier":"meme","rarity_score":39,"trend":50,"force_godmode":false}'::jsonb, 15, 39
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f5e899');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_3e5727', 'PodLord', 'Podcast "top". 20 ouvintes. Monetizado: nunca.', 'meme', 'Influência', 5.70, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_3e5727.png', '{"tier":"meme","rarity_score":44,"trend":57,"force_godmode":false}'::jsonb, 41, 44
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_3e5727');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_c85da9', 'HustleLarp', 'Finge hustle. Acorda 11h. LinkedIn: acordei às 4AM.', 'meme', 'Ganância', 5.50, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_c85da9.png', '{"tier":"meme","rarity_score":42,"trend":55,"force_godmode":false}'::jsonb, 37, 42
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_c85da9');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b4a53f', 'CriptoMax', 'All-in em cripto. Volatilidade: sua personalidade agora.', 'meme', 'Ganância', 6.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b4a53f.png', '{"tier":"meme","rarity_score":48,"trend":60,"force_godmode":false}'::jsonb, 43, 48
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b4a53f');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_4c6d96', 'TikStar', '100k seguidores. Engajamento: 50 likes. Bots confirmados.', 'meme', 'Influência', 5.20, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_4c6d96.png', '{"tier":"meme","rarity_score":40,"trend":52,"force_godmode":false}'::jsonb, 38, 40
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_4c6d96');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f0fbc3', 'GamerLost', 'Joga 10h/dia. Skill: platina. Vida social: bronze.', 'meme', 'Preguiça', 4.60, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f0fbc3.png', '{"tier":"meme","rarity_score":36,"trend":46,"force_godmode":false}'::jsonb, 14, 36
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f0fbc3');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_3096da', 'PinPregui', 'Pinou a mesma coisa há 2 anos. Relevância: expirada.', 'meme', 'Preguiça', 4.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_3096da.png', '{"tier":"meme","rarity_score":38,"trend":48,"force_godmode":false}'::jsonb, 15, 38
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_3096da');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f5aafd', 'AlgoFodido', 'Algoritmo shadowbanned. Insiste. "Vai voltar".', 'meme', 'Influência', 5.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f5aafd.png', '{"tier":"meme","rarity_score":45,"trend":58,"force_godmode":false}'::jsonb, 42, 45
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f5aafd');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_507f39', 'MemeDealer', 'Reposta memes. Sem crédito. Karma negativo.', 'meme', 'Informação', 5.60, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_507f39.png', '{"tier":"meme","rarity_score":43,"trend":56,"force_godmode":false}'::jsonb, 32, 43
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_507f39');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7b9d10', 'GrindFake', 'Grindset falso. Real: preguiça documentada.', 'meme', 'Ganância', 5.30, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7b9d10.png', '{"tier":"meme","rarity_score":41,"trend":53,"force_godmode":false}'::jsonb, 36, 41
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7b9d10');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_50a2ba', 'CloutFarmer', 'Faz qualquer coisa por atenção. Dignidade: opcional.', 'meme', 'Influência', 5.90, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_50a2ba.png', '{"tier":"meme","rarity_score":47,"trend":59,"force_godmode":false}'::jsonb, 44, 47
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_50a2ba');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7dde77', 'TrapQueen', 'Cai em bait semanalmente. Nunca aprende.', 'meme', 'Impulso', 5.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7dde77.png', '{"tier":"meme","rarity_score":39,"trend":50,"force_godmode":false}'::jsonb, 27, 39
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7dde77');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_5a98e2', 'RageFarmer', 'Cultiva raiva. Colhe: mais raiva. Ciclo infinito.', 'meme', 'Impulso', 5.70, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_5a98e2.png', '{"tier":"meme","rarity_score":44,"trend":57,"force_godmode":false}'::jsonb, 30, 44
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_5a98e2');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_c068c8', 'ViewCarol', 'Caça views desesperadamente. Ética: negociável.', 'meme', 'Influência', 5.20, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_c068c8.png', '{"tier":"meme","rarity_score":40,"trend":52,"force_godmode":false}'::jsonb, 38, 40
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_c068c8');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_f385ed', 'BaitMaster', 'Mestre do bait. Morde o próprio. Ironia suprema.', 'meme', 'Impulso', 5.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_f385ed.png', '{"tier":"meme","rarity_score":46,"trend":58,"force_godmode":false}'::jsonb, 32, 46
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_f385ed');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_58622a', 'InfluWannab', 'Quer ser influencer. Talento: insistência.', 'meme', 'Influência', 4.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_58622a.png', '{"tier":"meme","rarity_score":38,"trend":48,"force_godmode":false}'::jsonb, 36, 38
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_58622a');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b4e221', 'SkinInvest', 'Investiu em skins. Valor: despencou. "É investimento".', 'meme', 'Consumo', 5.50, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b4e221.png', '{"tier":"meme","rarity_score":42,"trend":55,"force_godmode":false}'::jsonb, 25, 42
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b4e221');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_6fb037', 'MetaEscravo', 'Serve ao meta sem questionar. Autonomia: nenhuma.', 'meme', 'Impulso', 4.70, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_6fb037.png', '{"tier":"meme","rarity_score":37,"trend":47,"force_godmode":false}'::jsonb, 25, 37
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_6fb037');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_6fed0d', 'PlayVício', 'Viciado em jogo. Justifica: "É trabalho. Sou gamer".', 'meme', 'Preguiça', 5.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_6fed0d.png', '{"tier":"meme","rarity_score":45,"trend":58,"force_godmode":false}'::jsonb, 18, 45
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_6fed0d');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_573e96', 'TradeRekt', 'Perdeu tudo no trade. Culpa: mercado manipulado.', 'meme', 'Ganância', 5.60, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_573e96.png', '{"tier":"meme","rarity_score":43,"trend":56,"force_godmode":false}'::jsonb, 38, 43
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_573e96');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_a6aac7', 'NFTCopeiro', 'Comprou NFT no topo. Segura bag. "Diamond hands" forçado.', 'meme', 'Consumo', 5.30, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_a6aac7.png', '{"tier":"meme","rarity_score":41,"trend":53,"force_godmode":false}'::jsonb, 24, 41
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_a6aac7');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_8b5481', 'DropFlip', 'Dropshipping de dropshipping. Lucro: comissão da comissão.', 'meme', 'Ganância', 5.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_8b5481.png', '{"tier":"meme","rarity_score":39,"trend":50,"force_godmode":false}'::jsonb, 35, 39
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_8b5481');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_e177f1', 'GhostPost', 'Postou 1 vez. Sumiu. "Focando em mim".', 'meme', 'Preguiça', 5.70, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_e177f1.png', '{"tier":"meme","rarity_score":44,"trend":57,"force_godmode":false}'::jsonb, 17, 44
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_e177f1');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_50ce5c', 'ToxicKing', 'Tóxico em tudo. Banido 10 vezes. Cria nova conta. Repete.', 'meme', 'Impulso', 5.90, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_50ce5c.png', '{"tier":"meme","rarity_score":46,"trend":59,"force_godmode":false}'::jsonb, 32, 46
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_50ce5c');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_af6d42', 'CópiaPura', 'Copia conteúdo 1:1. "Me inspirei".', 'meme', 'Influência', 5.20, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_af6d42.png', '{"tier":"meme","rarity_score":40,"trend":52,"force_godmode":false}'::jsonb, 38, 40
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_af6d42');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_0b18ed', 'BuzzKill', 'Mata hype com negatividade. Amigos: cansados.', 'meme', 'Informação', 4.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_0b18ed.png', '{"tier":"meme","rarity_score":38,"trend":48,"force_godmode":false}'::jsonb, 28, 38
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_0b18ed');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_eb9461', 'RaidKing', 'Faz raid todo dia. Retorno: nenhum.', 'meme', 'Influência', 5.50, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_eb9461.png', '{"tier":"meme","rarity_score":42,"trend":55,"force_godmode":false}'::jsonb, 39, 42
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_eb9461');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_27e626', 'BotCursor', 'Cursor que clica sozinho. Automatização da preguiça.', 'meme', 'Impulso', 5.30, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_27e626.png', '{"tier":"meme","rarity_score":41,"trend":53,"force_godmode":false}'::jsonb, 28, 41
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_27e626');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_c7046f', 'FakeProof', 'Print forjado. "Prova" que não prova nada.', 'meme', 'Informação', 5.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_c7046f.png', '{"tier":"meme","rarity_score":39,"trend":50,"force_godmode":false}'::jsonb, 29, 39
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_c7046f');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_83216b', 'CapLock', 'CAPS LOCK travado. Civilidade: impossível.', 'meme', 'Impulso', 4.70, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_83216b.png', '{"tier":"meme","rarity_score":37,"trend":47,"force_godmode":false}'::jsonb, 25, 37
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_83216b');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_e9f968', 'EmojiSpam', '🔥💯😂👏🙏 sem contexto. Comunicação: comprometida.', 'meme', 'Impulso', 5.60, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_e9f968.png', '{"tier":"meme","rarity_score":43,"trend":56,"force_godmode":false}'::jsonb, 30, 43
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_e9f968');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_2f91e0', 'LinkShady', 'Link suspeito. "Clica que é seguro". Spoiler: não é.', 'meme', 'Ganância', 5.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_2f91e0.png', '{"tier":"meme","rarity_score":45,"trend":58,"force_godmode":false}'::jsonb, 40, 45
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_2f91e0');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_4bd588', 'NotifFlood', 'Notificações infinitas. Sanidade: esgotada.', 'meme', 'Impulso', 5.20, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_4bd588.png', '{"tier":"meme","rarity_score":40,"trend":52,"force_godmode":false}'::jsonb, 28, 40
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_4bd588');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_471e7c', 'PopupHell', 'Popup dentro de popup. UX: crime.', 'meme', 'Consumo', 5.70, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_471e7c.png', '{"tier":"meme","rarity_score":44,"trend":57,"force_godmode":false}'::jsonb, 26, 44
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_471e7c');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_09e469', 'AutoReply', 'Resposta automática. Contexto: ignorado.', 'meme', 'Preguiça', 4.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_09e469.png', '{"tier":"meme","rarity_score":38,"trend":48,"force_godmode":false}'::jsonb, 15, 38
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_09e469');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_83d776', 'TempUsed', 'Template usado por 10k pessoas. Originalidade: zero.', 'meme', 'Consumo', 5.50, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_83d776.png', '{"tier":"meme","rarity_score":42,"trend":55,"force_godmode":false}'::jsonb, 25, 42
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_83d776');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_c9d550', 'AlgoTrap', 'Armadilha algorítmica. Escape: impossível.', 'meme', 'Informação', 5.90, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_c9d550.png', '{"tier":"meme","rarity_score":46,"trend":59,"force_godmode":false}'::jsonb, 34, 46
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_c9d550');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_261181', 'TrendQueima', 'Trend queimado em 24h. Duração: efêmera.', 'meme', 'Impulso', 5.60, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_261181.png', '{"tier":"meme","rarity_score":43,"trend":56,"force_godmode":false}'::jsonb, 30, 43
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_261181');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_593202', 'CancelMaçon', 'Cancelamento seletivo. Critério: narrativa.', 'meme', 'Impulso', 5.30, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_593202.png', '{"tier":"meme","rarity_score":41,"trend":53,"force_godmode":false}'::jsonb, 28, 41
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_593202');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_8baca2', 'RugPull', 'Projeto sumiu com dinheiro. "Rug" clássico.', 'meme', 'Ganância', 5.90, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_8baca2.png', '{"tier":"meme","rarity_score":47,"trend":59,"force_godmode":false}'::jsonb, 42, 47
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_8baca2');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7c6f22', 'BotArmy', 'Exército de bots. Opinião fabricada em massa.', 'meme', 'Informação', 5.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7c6f22.png', '{"tier":"meme","rarity_score":39,"trend":50,"force_godmode":false}'::jsonb, 29, 39
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7c6f22');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7c23bd', 'MetaShift', 'Meta mudou. Estratégia: obsoleta overnight.', 'meme', 'Influência', 5.80, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7c23bd.png', '{"tier":"meme","rarity_score":45,"trend":58,"force_godmode":false}'::jsonb, 42, 45
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7c23bd');

-- VIRAL tier
INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_6e4ad5', 'IACopyGod', 'Copywriter que perdeu emprego pra IA. Agora vende curso de "IA pra copys".', 'viral', 'Informação', 25.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_6e4ad5.png', '{"tier":"viral","rarity_score":72,"trend":82,"force_godmode":false}'::jsonb, 54, 72
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_6e4ad5');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b18bc6', 'PixFlexer', 'Mostra Pix de R$50k. Real: print editado. Flex fake documentado.', 'viral', 'Ganância', 22.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b18bc6.png', '{"tier":"viral","rarity_score":68,"trend":78,"force_godmode":false}'::jsonb, 61, 68
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b18bc6');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7444ae', 'AlgoCrown', 'Dominou algoritmo. 10M views. Identidade: refém do viral.', 'viral', 'Influência', 28.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7444ae.png', '{"tier":"viral","rarity_score":75,"trend":85,"force_godmode":false}'::jsonb, 71, 75
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7444ae');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_9eec11', 'BurnoutKing', 'Burnout crônico. Reclama 24/7. Trabalha: 15h/semana.', 'viral', 'Preguiça', 24.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_9eec11.png', '{"tier":"viral","rarity_score":70,"trend":80,"force_godmode":false}'::jsonb, 28, 70
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_9eec11');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_24ff7f', 'CriptoWhale', 'Ganhou milhões em cripto. Perdeu tudo. Voltou. Repetiu.', 'viral', 'Ganância', 29.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_24ff7f.png', '{"tier":"viral","rarity_score":76,"trend":86,"force_godmode":false}'::jsonb, 68, 76
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_24ff7f');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b8180e', 'TrendMaker', 'Cria trends. Não participa. Observa o caos que criou.', 'viral', 'Influência', 26.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b8180e.png', '{"tier":"viral","rarity_score":73,"trend":83,"force_godmode":false}'::jsonb, 69, 73
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b8180e');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_59ae11', 'ToxicGuru', 'Guru da toxicidade. Engajamento: ódio puro. Funciona.', 'viral', 'Impulso', 23.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_59ae11.png', '{"tier":"viral","rarity_score":69,"trend":79,"force_godmode":false}'::jsonb, 48, 69
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_59ae11');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b666f0', 'MemeLord', 'Rei dos memes. Criou 50 virais. Anonimato: preservado.', 'viral', 'Informação', 25.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b666f0.png', '{"tier":"viral","rarity_score":71,"trend":81,"force_godmode":false}'::jsonb, 53, 71
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b666f0');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b02a9e', 'HustleMito', 'Vendeu R$10M em infoproduto. Conteúdo: promessa vazia.', 'viral', 'Ganância', 27.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b02a9e.png', '{"tier":"viral","rarity_score":74,"trend":84,"force_godmode":false}'::jsonb, 66, 74
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b02a9e');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_afedf9', 'DropKing', 'Dropshipping de R$100k/mês. Margem: 2%. Stress: 100%.', 'viral', 'Ganância', 21.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_afedf9.png', '{"tier":"viral","rarity_score":67,"trend":77,"force_godmode":false}'::jsonb, 60, 67
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_afedf9');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_08d248', 'CancelSurv', 'Sobreviveu 5 cancelamentos. Imunidade: adquirida.', 'viral', 'Impulso', 24.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_08d248.png', '{"tier":"viral","rarity_score":70,"trend":80,"force_godmode":false}'::jsonb, 49, 70
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_08d248');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_487632', 'ShillLegend', 'Shillou 100 projetos. 2 deram certo. "Taxa de acerto alta".', 'viral', 'Ganância', 26.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_487632.png', '{"tier":"viral","rarity_score":72,"trend":82,"force_godmode":false}'::jsonb, 64, 72
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_487632');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_4ded13', 'RageProfit', 'Lucra com raiva alheia. Engagement: ódio monetizado.', 'viral', 'Impulso', 22.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_4ded13.png', '{"tier":"viral","rarity_score":68,"trend":78,"force_godmode":false}'::jsonb, 47, 68
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_4ded13');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_6daf58', 'ViewAddic', 'Viciado em views. Faz qualquer coisa. Limite: não existe.', 'viral', 'Influência', 26.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_6daf58.png', '{"tier":"viral","rarity_score":73,"trend":83,"force_godmode":false}'::jsonb, 69, 73
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_6daf58');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_50e7fb', 'AlgoFalha', 'Falha algorítmica. Mundos trocados. Caos temporário.', 'viral', 'Informação', 25.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_50e7fb.png', '{"tier":"viral","rarity_score":71,"trend":81,"force_godmode":false}'::jsonb, 53, 71
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_50e7fb');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_aaa993', 'ViralBug', 'Bug que viralizou. Exploit em massa. Patch: 3 dias depois.', 'viral', 'Informação', 23.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_aaa993.png', '{"tier":"viral","rarity_score":69,"trend":79,"force_godmode":false}'::jsonb, 51, 69
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_aaa993');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_c0c0d9', 'TrendExplos', 'Trend explosivo. 100M views em 48h. Burn out coletivo.', 'viral', 'Influência', 27.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_c0c0d9.png', '{"tier":"viral","rarity_score":74,"trend":84,"force_godmode":false}'::jsonb, 70, 74
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_c0c0d9');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_5ee5c0', 'MetaChaos', 'Meta quebrado. Tudo viável. Caos criativo temporário.', 'viral', 'Impulso', 24.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_5ee5c0.png', '{"tier":"viral","rarity_score":70,"trend":80,"force_godmode":false}'::jsonb, 49, 70
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_5ee5c0');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_b7507f', 'CancelWave', 'Onda de cancelamento. 50 alvos. Esquecido em 1 semana.', 'viral', 'Impulso', 26.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_b7507f.png', '{"tier":"viral","rarity_score":72,"trend":82,"force_godmode":false}'::jsonb, 50, 72
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_b7507f');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_7f0635', 'HypeStorm', 'Tempestade de hype. Expectativa: impossível de cumprir.', 'viral', 'Influência', 22.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_7f0635.png', '{"tier":"viral","rarity_score":68,"trend":78,"force_godmode":false}'::jsonb, 64, 68
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_7f0635');

-- LEGENDARY tier
INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_139062', 'AlgoRoi', 'Rei do Algoritmo Vivo. Controla o feed. Todos servem.', 'legendary', 'Influência', 100.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_139062.png', '{"tier":"legendary","rarity_score":90,"trend":93,"force_godmode":false}'::jsonb, 85, 90
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_139062');

INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_e90c0b', 'BurnSaint', 'Santo do Burnout. Transformou exaustão em movimento. Culto formado.', 'legendary', 'Preguiça', 80.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_e90c0b.png', '{"tier":"legendary","rarity_score":88,"trend":90,"force_godmode":false}'::jsonb, 35, 88
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_e90c0b');

-- GODMODE tier
INSERT INTO cards_base (display_id, name, description, rarity, archetype, base_liquidity_brl, base_liquidity_crypto, edition_id, image_url, metadata, influence_score, rarity_score)
SELECT 'crd_185a68', 'CaosDigital', 'Personificação do Colapso da Interface. Quando algoritmo ganha consciência.', 'legendary', 'Impulso', 500.00, 0.00000000, 'ED01', 'https://kroova.com/cards/crd_185a68.png', '{"tier":"godmode","rarity_score":98,"trend":99,"force_godmode":true}'::jsonb, 68, 98
WHERE NOT EXISTS (SELECT 1 FROM cards_base WHERE display_id='crd_185a68');

-- Total: 251 cards (250 + Crocodile Trader)