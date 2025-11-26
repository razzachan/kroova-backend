Layout oficial das cartas Kroova (estrutura visual, hierarquia e atributos jogáveis)

1. Visão Geral

As cartas Kroova são entidades digitais que misturam:

narrativa (lore)

economia simbólica

métricas de influência

Este documento define como cada carta deve ser desenhada, de forma que:

funcione como colecionável físico/digital

seja legível em app, web e impressão

mantenha consistência de marca entre todas as edições

2. Especificações Técnicas da Carta

Resolução base: 1080 × 1560 px (proporção 9:13)

Margem interna: 30 px em todas as bordas

Margem superior/inferior estendida: 40 px

Safe zone (texto crítico): tudo que for importante deve ficar a pelo menos 60 px das bordas

Bleed (impressão física): 3 mm extras além da arte, se for para print

3. Estrutura Geral da Carta

De cima para baixo, a carta é organizada em:

Barra superior de atributos jogáveis

Área central da arte da entidade

Bloco de título + arquétipo

Bloco opcional de texto / lore

Bloco de Impacto Econômico (valor em R$)

Rodapé com hash / código único

Além disso, duas camadas especiais podem existir:

Selo de raridade visual

Frame Godmode (layout alternativo, sem texto)

4. Atributos Jogáveis (Numéricos)

A Kroova trabalha com 3 atributos jogáveis principais, todos visíveis na frente da carta:

Raridade (numérica)

Impacto Econômico

Influência Social

4.1. Raridade (numérica)

Representa a escassez e o peso simbólico da carta.

Vai de 0 a 100 (ou escala equivalente definida por edição).

Não é só “trash / meme / viral / legendary”: é um score quantitativo.

Visualmente, aparece como um badge numérico.

Posição:

Canto superior direito da carta.

Forma sugerida:

Círculo ou pill com borda clara.

Fundo colorido baseado na família de raridade (trash, meme, viral, legendary etc.).

Número grande no centro (tipografia ui_value).

4.2. Impacto Econômico (R$)

Representa a liquidez base da carta no sistema.

É o valor que a Kroova garante ao usuário na reciclagem normal ou em casos especiais (jackpots).

Pode ser um valor baixo (centavos) ou extremamente alto (ex.: R$ 100, R$ 500, R$ 1.000).

Posição:

Canto inferior direito, com destaque visual.

Apresentação:

Sempre no formato: R$ 0,50, R$ 12,00, R$ 500,00 etc.

Usa a paleta value do branding, por ser um número de “valor jogável”.

Tipografia: ui_value (72 / Bold), adaptada ao espaço.

4.3. Influência Social

Representa o quanto aquela carta é relevante dentro da própria Kroova.

É dinâmico: o valor cresce (ou pode mudar) de acordo com:

curtidas na carta

seguidores/“watchers” da carta

volume de trocas / listagens

engajamento em campanhas no app

Posição:

Canto superior esquerdo, espelhando a raridade.

Apresentação:

Badge numérico, similar à raridade, mas com cor e ícone distintos.

Pode usar um ícone sugerindo rede/social (ex.: pontos conectados).

Tipografia: ui_value simplificada para número.

5. Barra Superior de Atributos

A barra superior é composta por:

Esquerda: Influência Social (número)

Direita: Raridade (número)

Essa barra:

NÃO deve ser uma faixa sólida.

São dois badges independentes, flutuando sobre a arte ou apoiados na moldura.

Espaço central permanece livre para o respiro da arte.

Visual:

Influência Social → cores baseadas em secondary

Raridade → cores baseadas em value + variações por tier (trash, meme, viral, legendary etc.)

6. Área Central da Arte

Ocupa aproximadamente 60–65% da altura da carta.

A arte deve ser pensada como “key art cinematográfica”, não apenas um desenho aleatório.

A composição ideal é:

Plano médio (meio corpo) ou plano americano

Personagem centralizado

Espaço reservado para as bordas do frame e possíveis efeitos de skin (neon, glitch, holo, dark)

Regras:

A arte não depende do texto para ser compreendida.

Não sobrecarregar a parte superior, pois ali vivem os badges de Influência e Raridade.

Deixar o canto inferior direito com contraste suficiente para o bloco de Impacto Econômico.

7. Nome da Entidade e Arquétipo

Logo abaixo da arte, há um bloco de título:

7.1. Nome da Entidade

Tipografia: name (título principal da entidade).

Alinhamento: preferencialmente à esquerda.

Pode ocupar uma ou duas linhas (com redução de tamanho automática se for muito longo).

Cores:

texto: primary (modo da carta: default, neon, glow etc.)

sombra ou glow leve pra legibilidade.

7.2. Arquétipo

Ex.: “Ganância Digital”, “Caos Algorítmico”, “Fraude Sintética”.

Tipografia: archetype.

Fica logo abaixo do nome, em menor destaque.

Cores: secondary do modo visual.

8. Raridade Visual (Selo / Tag)

Além do número de Raridade (atributo jogável), existe a família de raridade:

trash

meme

viral

legendary

(outras famílias futuras, definidas por edição)

Essas famílias não mudam o número, mas mudam a leitura visual:

cor do badge de raridade

sutil textura no frame (granulado, glitch, brilho, etc.)

micro-ícone associado (lixo, risada, raio, coroa etc.)

Posicionamento do selo de raridade visual:

Pequeno selo / ícone próximo ao nome da entidade, do lado direito.

Não concorre com o número de raridade lá em cima — são coisas diferentes.

9. Godmode — Frame Especial

Godmode é um estado especial, NÃO um texto.

Não aparece escrito “Godmode” em lugar nenhum.

Ele é percebido por:

um frame/layout alternativo (bordas diferentes)

efeitos especiais na moldura (iridescência, prisma, fissuras de realidade)

possível distorção leve da arte (hiper-espaço, glitch profundo)

Inspiração:

Funciona como uma “Hyperspace / Serialized” do SWU ou outros TCGs.

Regras de exibição:

O frame Godmode substitui o frame normal da carta.

Todos os elementos (arte, nome, atributos) continuam nos mesmos lugares, mas:

bordas, corners, efeitos, texturas e brilhos mudam

animações (na versão digital) podem ser diferentes

O Godmode nunca ocupa espaço textual — é 100% visual.

10. Bloco de Texto / Lore (Opcional)

Entre o título/arquétipo e o bloco de Impacto Econômico, existe uma área opcional:

Pode conter:

descrição temática

citações da entidade

trechos de narrativa da edição

Tipografia: description.

Quantidade de texto deve ser curta (2 a 3 linhas em telas menores).

Em apps, parte desse texto pode ser expandida em uma tela separada.

11. Bloco de Impacto Econômico (Inferior Direito)

Formato visual:

Caixa retangular com cantos levemente arredondados.

Fundo: cor baseada em value (por edição/modo).

Texto: R$ 0,50 / R$ 100,00 etc., tipografia ui_value.

Posição:

Canto inferior direito da carta.

Sempre acima da margem de safe zone.

Função:

Comunicar quanto a carta vale em liquidez na economia Kroova.

Em casos de cartaz/jackpot (R$ 500, R$ 1.000), pode ter animação/glow extra na versão digital.

12. Rodapé (Hash / UID)

Na borda inferior, alinhado à esquerda, fica o hash/código único da carta:

Exemplo: KRV-032-ED01#A7F9D4B2

Tipografia: hash.

Cor: text com opacidade reduzida (não chamar mais atenção que o resto).

Funciona como identificação técnica para:

sistema interno

colecionadores

validação com NFT / blockchain

13. Modos Visuais (Skins) e Cores

Os modos visuais (default, neon, glow, glitch, ghost, holo, dark) afetam:

cores do frame

cores do background

cores primárias/secondary/value

intensidade de brilho e contraste

Regras:

A estrutura do layout nunca muda — só o “tema” visual.

Texto continua legível em todos os modos.

Atributos jogáveis (Raridade, Impacto Econômico, Influência Social) usam sempre a paleta value/secondary combinada, garantindo contraste e consistência.

14. Resumo Visual (Wireframe Conceitual)
    ┌────────────────────────────────┐
    │ [Influência Social] [Raridade (score)] ← badges numéricos
    │
    │ [ARTE CINEMATOGRÁFICA]
    │
    │ [NOME DA ENTIDADE] (Selo de Raridade Visual)
    │ [Arquetipo]
    │
    │ [Texto / Lore opcional - 0–3 linhas máx.]
    │
    │ [Impacto Econômico R$]
    │ [hash / UID]
    └────────────────────────────────┘

(Frame normal ou Frame Godmode, dependendo do estado)

© Kroova Labs — Layout Oficial de Cartas — Todos os direitos reservados.

======== FIM DO ARQUIVO ========
