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

const PRICE_TO_TIER: Record<number, string> = {
  0.50: 'Básico',
  1.00: 'Padrão',
  2.00: 'Premium',
  5.00: 'Elite',
  10.00: 'Whale'
};

interface SealedPack {
  id: string;
  booster_type_id: string;
  purchased_at: string;
  price_paid_brl: number;
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
  const [pendingPrizeData, setPendingPrizeData] = useState<any>(null);

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
      
      console.log('🎁 [MY-BOOSTERS] Booster opened:', data);
      console.log('🎰 [MY-BOOSTERS] Prize from API:', data.prize);
      
      // Armazenar prêmio para mostrar depois da animação
      if (data.prize) {
        setPendingPrizeData(data.prize);
      } else {
        console.warn('⚠️ [MY-BOOSTERS] No prize data received from API');
      }
      
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
    // Todas as 5 cartas foram reveladas - AGORA mostrar prêmio com animação slot-machine!
    if (pendingPrizeData) {
      const prizeToast = document.createElement('div');
      
      // Full-screen overlay (Vegas casino style)
      prizeToast.className = 'fixed inset-0 z-[9999] flex items-center justify-center';
      prizeToast.style.cssText = `
        background: radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.95) 100%);
        backdrop-filter: blur(12px);
        animation: overlay-fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      
      const isJackpot = pendingPrizeData.is_jackpot;
      const rtpColor = pendingPrizeData.rtp_percentage >= 100 ? 'text-green-400' : 'text-purple-400';
      
      prizeToast.innerHTML = `
        <div class="relative w-[95vw] max-w-3xl" style="animation: overlay-fade-in 0.6s ease-out;">
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-yellow-500/20 rounded-3xl blur-3xl animate-pulse"></div>
          
          <div class="relative bg-gradient-to-br from-black/90 via-purple-950/70 to-black/90 backdrop-blur-2xl rounded-3xl overflow-hidden" style="
            border: 2px solid transparent;
            background-clip: padding-box;
            box-shadow: 
              0 0 0 2px #00ff41,
              0 0 30px rgba(0, 255, 65, 0.4),
              0 30px 90px rgba(0, 0, 0, 0.9),
              inset 0 2px 0 rgba(255, 255, 255, 0.1);
            animation: casino-glow 3s ease-in-out infinite;
          ">
            <div class="absolute inset-0 opacity-10 pointer-events-none" style="
              background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.3) 2px, rgba(0, 255, 65, 0.3) 4px);
              animation: scanline-move 10s linear infinite;
            "></div>
            
            <div class="relative z-10 px-12 py-20 text-center">
              <div class="inline-block mb-8 px-8 py-3 bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-2 border-yellow-400/60 rounded-full backdrop-blur-md">
                <span class="text-yellow-300 font-black text-base tracking-widest uppercase" style="text-shadow: 0 0 15px rgba(255, 215, 0, 1), 0 2px 4px rgba(0,0,0,0.8);">
                  ${isJackpot ? '👑 JACKPOT ROYALE 👑' : pendingPrizeData.rtp_percentage >= 100 ? '💎 MEGA WIN 💎' : '⭐ WINNER ⭐'}
                </span>
              </div>
              
              <h2 class="text-8xl font-black tracking-tighter mb-10" style="
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF69B4 50%, #00D9FF 75%, #B026FF 100%);
                background-size: 200% 200%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: rainbow-slide 3s ease-in-out infinite, title-glitch 4s ease-in-out infinite;
                filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.6)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.9));
              ">
                ${isJackpot ? 'JACKPOT!' : pendingPrizeData.rtp_percentage >= 100 ? 'BIG WIN!' : 'GANHOU!'}
              </h2>
              
              <!-- Counter -->
              <div id="prize-counter-mount" class="mb-10"></div>
              
              <div class="inline-flex items-center gap-4 px-8 py-4 bg-black/60 border-2 border-white/30 rounded-full backdrop-blur-md">
                <div class="w-3 h-3 rounded-full ${rtpColor} animate-pulse" style="box-shadow: 0 0 15px currentColor;"></div>
                <span class="${rtpColor} font-black text-xl tracking-wide" style="text-shadow: 0 0 15px currentColor;">
                  ${pendingPrizeData.rtp_percentage.toFixed(0)}% RTP
                </span>
              </div>
              
              <div class="mt-10 text-white/50 text-sm font-medium animate-pulse tracking-wide">
                Clique em qualquer lugar para continuar
              </div>
            </div>
            
            <div class="absolute top-6 left-6 w-16 h-16 border-l-4 border-t-4 border-cyan-400/60 rounded-tl-lg"></div>
            <div class="absolute top-6 right-6 w-16 h-16 border-r-4 border-t-4 border-cyan-400/60 rounded-tr-lg"></div>
            <div class="absolute bottom-6 left-6 w-16 h-16 border-l-4 border-b-4 border-purple-400/60 rounded-bl-lg"></div>
            <div class="absolute bottom-6 right-6 w-16 h-16 border-r-4 border-b-4 border-purple-400/60 rounded-br-lg"></div>
          </div>
        </div>
      `;
      document.body.appendChild(prizeToast);

      // Play prize soundtrack
      const prizeSoundtrack = new Audio('/sfx/prize_reveal_soundtrack.mp3');
      prizeSoundtrack.volume = 0.6;
      prizeSoundtrack.play().catch(err => console.log('Audio autoplay blocked:', err));

      // Animated counter
      setTimeout(() => {
        const mountPoint = document.getElementById('prize-counter-mount');
        if (mountPoint) {
          let currentValue = 0;
          const targetValue = pendingPrizeData.amount_brl;
          const duration = 3500;
          const startTime = Date.now();

          const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easedProgress = progress < 0.5 
              ? 4 * progress * progress * progress 
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            currentValue = easedProgress * targetValue;
            
            const isAnimating = progress < 1;
            
            let textStyle = '';
            if (isAnimating) {
              textStyle = `
                font-size: 4.5rem;
                font-weight: 900;
                background: linear-gradient(90deg, #00ff41 0%, #00d9ff 50%, #b026ff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: gradient-shift 1s linear infinite;
                text-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
                filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8));
              `;
            } else if (isJackpot) {
              textStyle = `
                font-size: 5rem;
                font-weight: 900;
                background: linear-gradient(45deg, #FFD700 0%, #FFA500 50%, #FF1493 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 
                  0 0 40px rgba(255, 215, 0, 0.8),
                  0 0 80px rgba(255, 165, 0, 0.5),
                  0 4px 16px rgba(0, 0, 0, 0.9);
                filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5));
                animation: jackpot-pulse 1.5s ease-in-out infinite;
              `;
            } else if (pendingPrizeData.rtp_percentage >= 100) {
              textStyle = `
                font-size: 4.5rem;
                font-weight: 900;
                color: #00ff41;
                text-shadow: 
                  0 0 30px rgba(0, 255, 65, 0.8),
                  0 0 60px rgba(0, 255, 65, 0.4),
                  0 4px 12px rgba(0, 0, 0, 0.8);
                filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.6));
              `;
            } else {
              textStyle = `
                font-size: 4rem;
                font-weight: 800;
                background: linear-gradient(135deg, #b026ff 0%, #00d9ff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 0 20px rgba(176, 38, 255, 0.6);
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
              `;
            }
            
            mountPoint.innerHTML = `
              <span style="${textStyle}">${currentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            `;

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              cardAudio.playSuccessChime();
            }
          };

          requestAnimationFrame(animate);
        }
      }, 100);

      // Click to dismiss
      prizeToast.addEventListener('click', () => {
        prizeToast.remove();
        setPendingPrizeData(null);
        setOpening(null);
        setAnimationStage('none');
        setShowCards(false);
        setRevealedCards([]);
        cardAudio.setAmbientIntensity('active');
      });
    }
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
                {pack.price_paid_brl && (
                  <div className="text-lg font-bold text-[#00F0FF] mb-1" style={{
                    textShadow: '0 0 10px rgba(0, 240, 255, 0.6)'
                  }}>
                    {PRICE_TO_TIER[pack.price_paid_brl] || `Tier R$ ${pack.price_paid_brl.toFixed(2)}`}
                  </div>
                )}
                <div className="text-sm text-gray-300 font-medium">
                  Valor: R$ {pack.price_paid_brl?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
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
