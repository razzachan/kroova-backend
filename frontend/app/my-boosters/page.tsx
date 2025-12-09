'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import { cardAudio } from '@/lib/cardAudio';
import GlitchButton from '@/components/UI/GlitchButton';
import TextGlitch from '@/components/Effects/TextGlitch';
import BoosterCard3D from '@/components/UI/BoosterCard3D';
import { PackOpeningAnimation } from '@/components/PackOpeningAnimation';
import { CardsFlightAnimation } from '@/components/CardsFlightAnimation';
import { OpeningSession } from '@/components/OpeningSession';

const PACK_IMAGES: Record<string, string> = {
  'ED01_ALPHA': '/assets/booster-packs/pack-front-ed01-alpha.png',
  'ED01_BETA': '/assets/booster-packs/pack-front-ed01-beta.png',
  'ED01_GAMMA': '/assets/booster-packs/pack-front-ed01-gamma.png',
};

const TIER_INFO: Record<string, { name: string; badge: string; color: string; textColor: string }> = {
  'ED01_ALPHA': { name: 'ALPHA', badge: '🏆', color: 'from-yellow-500 to-yellow-700', textColor: 'text-yellow-400' },
  'ED01_BETA': { name: 'BETA', badge: '⚡', color: 'from-gray-400 to-gray-600', textColor: 'text-gray-300' },
  'ED01_GAMMA': { name: 'GAMMA', badge: '💎', color: 'from-orange-600 to-orange-800', textColor: 'text-orange-400' },
};

interface SealedPack {
  id: string;
  booster_type_id: string;
  purchased_at: string;
  booster_packs?: {
    pack_name: string;
    edition_id: string;
    price_brl: number;
  };
}

export default function MyBoostersPage() {
  const router = useRouter();
  const [sealedPacks, setSealedPacks] = useState<SealedPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string | null>(null);
  
  // Animation states
  const [animationStage, setAnimationStage] = useState<'none' | 'pack' | 'flight' | 'reveal'>('none');
  const [showCards, setShowCards] = useState(false);
  const [revealedCards, setRevealedCards] = useState<any[]>([]);
  const [flipMode, setFlipMode] = useState<'interactive' | 'auto'>('interactive');

  useEffect(() => {
    loadSealedPacks();
  }, []);

  async function loadSealedPacks() {
    try {
      const response = await api.get('/boosters/sealed');
      const data = unwrap<{ sealed_packs: SealedPack[] }>(response);
      setSealedPacks(data.sealed_packs || []);
    } catch (error) {
      console.error('Erro ao carregar boosters:', error);
      setSealedPacks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpen(openingId: string) {
    setOpening(openingId);
    cardAudio.setAmbientIntensity('intense');
    
    try {
      // Iniciar animação do pacote
      setAnimationStage('pack');
      
      // Chamar API para abrir o booster
      const response = await api.post('/boosters/open', { opening_id: openingId });
      const data = unwrap(response);
      
      // Armazenar cartas reveladas
      setRevealedCards(data.cards || []);
      
      // Após animação do pack, iniciar voo das cartas
      // (PackOpeningAnimation chama onOpenComplete após ~2s)
      
      cardAudio.playSuccessChime();
      
      // Recarregar lista de boosters selados
      await loadSealedPacks();
      
    } catch (error: any) {
      console.error('Erro ao abrir booster:', error);
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.error?.message || 'Erro ao abrir booster');
      setOpening(null);
      setAnimationStage('none');
      cardAudio.setAmbientIntensity('active');
    }
  }
  
  function handlePackOpenComplete() {
    // Pack terminou de abrir, iniciar voo das cartas
    setAnimationStage('flight');
  }
  
  function handleCardsFlightComplete() {
    // Cartas terminaram de voar, mostrar sessão de flip
    setAnimationStage('reveal');
    setShowCards(true);
  }
  
  function handleAllCardsRevealed() {
    // Todas as cartas foram reveladas
    setOpening(null);
    setAnimationStage('none');
    setShowCards(false);
    setRevealedCards([]);
    cardAudio.setAmbientIntensity('active');
  }

  const filteredPacks = filterTier
    ? sealedPacks.filter(pack => pack.booster_type_id === filterTier)
    : sealedPacks;

  const packsByTier = sealedPacks.reduce((acc, pack) => {
    acc[pack.booster_type_id] = (acc[pack.booster_type_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-[#00F0FF]">
          <TextGlitch>CARREGANDO BOOSTERS...</TextGlitch>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <GlitchButton
            variant="secondary"
            size="sm"
            onClick={() => router.push('/boosters')}
          >
            ← Voltar
          </GlitchButton>
          <h1 className="text-4xl font-bold">
            <TextGlitch delay={100}>MEUS BOOSTERS</TextGlitch>
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/40 backdrop-blur-sm border border-[#00F0FF]/30 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total</div>
            <div className="text-3xl font-bold text-[#00F0FF]">{sealedPacks.length}</div>
          </div>
          {Object.entries(packsByTier).map(([tier, count]) => (
            <div
              key={tier}
              className="bg-black/40 backdrop-blur-sm border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-[#00F0FF]/50 transition"
              onClick={() => setFilterTier(filterTier === tier ? null : tier)}
            >
              <div className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                {TIER_INFO[tier]?.badge} {TIER_INFO[tier]?.name || tier}
              </div>
              <div className="text-3xl font-bold">{count}</div>
              {filterTier === tier && (
                <div className="text-xs text-[#00F0FF] mt-1">✓ Filtrado</div>
              )}
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <GlitchButton
            variant={filterTier === null ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterTier(null)}
          >
            Todos ({sealedPacks.length})
          </GlitchButton>
          {Object.keys(packsByTier).map(tier => (
            <GlitchButton
              key={tier}
              variant={filterTier === tier ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilterTier(filterTier === tier ? null : tier)}
            >
              {TIER_INFO[tier]?.badge} {TIER_INFO[tier]?.name} ({packsByTier[tier]})
            </GlitchButton>
          ))}
        </div>
      </div>

      {/* Grid de Boosters */}
      {filteredPacks.length === 0 ? (
        <div className="text-center py-20">
          <div className="relative inline-block mb-8">
            <div className="text-9xl mb-4 animate-pulse">📦</div>
            <div className="absolute inset-0 bg-[#00F0FF]/10 blur-3xl animate-pulse" />
          </div>
          <div className="text-3xl mb-6">
            <TextGlitch delay={200}>
              {filterTier ? 'NENHUM BOOSTER DESTE TIPO' : 'NENHUM BOOSTER FECHADO'}
            </TextGlitch>
          </div>
          <p className="text-gray-400 mb-8 text-lg">
            {filterTier 
              ? 'Tente selecionar outra categoria ou compre novos boosters' 
              : 'Compre boosters para começar sua coleção'}
          </p>
          <GlitchButton
            variant="primary"
            size="lg"
            onClick={() => router.push('/boosters')}
          >
            🛒 COMPRAR BOOSTERS
          </GlitchButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredPacks.map((pack) => (
            <div
              key={pack.id}
              className="relative group"
            >
              {/* Variant Badge (ALPHA/BETA/GAMMA) - Estilo cyberpunk igual boosters page */}
              <div className={`absolute -top-3 -right-3 z-10 px-4 py-2 rounded-md text-sm font-bold font-mono uppercase tracking-wider border-2 backdrop-blur-md shadow-lg transition-all group-hover:scale-110 ${
                pack.booster_type_id === 'ED01_ALPHA' 
                  ? 'bg-gradient-to-br from-yellow-500/30 to-yellow-700/30 border-yellow-400/60 text-yellow-300 shadow-yellow-400/50' :
                pack.booster_type_id === 'ED01_BETA' 
                  ? 'bg-gradient-to-br from-gray-500/30 to-gray-700/30 border-gray-400/60 text-gray-200 shadow-gray-400/50' :
                'bg-gradient-to-br from-orange-500/30 to-orange-700/30 border-orange-400/60 text-orange-300 shadow-orange-400/50'
              }`}
              style={{
                textShadow: '0 0 10px currentColor',
                boxShadow: `0 0 15px ${
                  pack.booster_type_id === 'ED01_ALPHA' ? 'rgba(251, 191, 36, 0.4)' :
                  pack.booster_type_id === 'ED01_BETA' ? 'rgba(156, 163, 175, 0.4)' :
                  'rgba(249, 115, 22, 0.4)'
                }`
              }}
              >
                <span className="flex items-center gap-2">
                  <span>{pack.booster_type_id === 'ED01_ALPHA' ? '🏆' : pack.booster_type_id === 'ED01_BETA' ? '⚡' : '💎'}</span>
                  {pack.booster_type_id === 'ED01_ALPHA' ? 'ALPHA' : pack.booster_type_id === 'ED01_BETA' ? 'BETA' : 'GAMMA'}
                </span>
              </div>

              {/* Booster Card */}
              <BoosterCard3D
                onClick={() => opening === pack.id ? null : handleOpen(pack.id)}
                className="w-full cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={PACK_IMAGES[pack.booster_type_id] || PACK_IMAGES['ED01_ALPHA']}
                    alt={`${pack.booster_packs?.pack_name || 'Booster'} Pack`}
                    className="w-full h-auto object-contain"
                    style={{ minHeight: '300px' }}
                  />
                  
                  {/* Opening Overlay */}
                  {opening === pack.id && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎁</div>
                        <div className="text-[#00F0FF] font-bold">
                          <TextGlitch>ABRINDO...</TextGlitch>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </BoosterCard3D>

              {/* Info */}
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-400 mb-1">
                  {pack.booster_packs?.pack_name || 'Booster Pack'}
                </div>
                {pack.booster_packs?.price_brl && (
                  <div className="text-xs text-gray-500">
                    Valor: R$ {pack.booster_packs.price_brl.toFixed(2)}
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(pack.purchased_at).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </div>
              </div>

              {/* Hover Button */}
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <GlitchButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpen(pack.id)}
                  disabled={opening === pack.id}
                  className="w-full"
                >
                  {opening === pack.id ? '⏳ Abrindo...' : '🎁 ABRIR AGORA'}
                </GlitchButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ação rápida */}
      {filteredPacks.length > 0 && (
        <div className="mt-12 text-center">
          <GlitchButton
            variant="secondary"
            size="lg"
            onClick={() => router.push('/boosters')}
          >
            + Comprar Mais Boosters
          </GlitchButton>
        </div>
      )}
      
      {/* Animações de Abertura */}
      {animationStage === 'pack' && (
        <PackOpeningAnimation
          packImageUrl="/pack-back-ed01.png"
          onOpenComplete={handlePackOpenComplete}
        />
      )}

      {animationStage === 'flight' && (
        <CardsFlightAnimation
          cardCount={revealedCards.length}
          onFlightComplete={handleCardsFlightComplete}
          packImageUrl="/pack-back-ed01.png"
        />
      )}

      {animationStage === 'reveal' && showCards && revealedCards.length > 0 && (
        <>
          {/* Background fixo para sessão de flip */}
          <div 
            className="fixed inset-0 z-[100] w-screen h-screen"
            style={{
              backgroundImage: 'url(/kroova-background.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '100vh',
              minWidth: '100vw'
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[110] flex items-center gap-4">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">✨ Suas Novas Cartas! ✨</h2>
            <div className="flex items-center gap-2 text-sm bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
              <span className="text-gray-300">Modo de flip:</span>
              <button
                onClick={() => setFlipMode(m => (m === 'interactive' ? 'auto' : 'interactive'))}
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 border border-gray-600"
                style={{
                    transition: 'transform 0.1s ease-out',
                    willChange: 'transform',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateZ(0)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateZ(0)';
                  }}
              >
                {flipMode === 'interactive' ? '👆 Clique' : '⚡ Auto'}
              </button>
            </div>
          </div>

          <OpeningSession 
            cards={revealedCards.map(c => ({
              id: c.id,
              name: c.card.name,
              rarity: c.card.rarity,
              image_url: c.card.image_url,
              liquidity_brl: c.liquidity_brl,
              is_godmode: c.is_godmode,
              skin: c.skin,
            }))} 
            mode={flipMode}
            onCheckpoint={handleAllCardsRevealed}
          />
          
          {/* Botão para voltar */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[110]">
            <GlitchButton
              variant="success"
              size="lg"
              onClick={handleAllCardsRevealed}
            >
              ✓ CONCLUIR
            </GlitchButton>
          </div>
        </>
      )}
    </div>
  );
}
