'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import { PityBar } from '@/components/PityBar';
import { OpeningSession } from '@/components/OpeningSession';
// import { VaultMilestonesPanel } from '@/components/VaultMilestonesPanel'; // Removido até implementação backend
import { cardAudio, triggerHaptic } from '@/lib/cardAudio';
import { PackOpeningAnimation } from '@/components/PackOpeningAnimation';
import { CardsFlightAnimation } from '@/components/CardsFlightAnimation';
import GlitchButton from '@/components/UI/GlitchButton';
import TextGlitch from '@/components/Effects/TextGlitch';
import HolographicCard from '@/components/UI/HolographicCard';

interface BoosterType {
  id: string;
  name: string;
  price_brl: number;
  rarity_distribution: Record<string, number>;
  cards_per_booster: number;
  edition_id: string;
}

interface Card {
  id: string;
  base_id: string;
  skin: string;
  is_godmode: boolean;
  liquidity_brl: number;
  card: {
    name: string;
    rarity: string;
    image_url: string;
    display_id: string;
  };
}

export default function BoostersPage() {
  const router = useRouter();
  const [boosters, setBoosters] = useState<BoosterType[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);
  const [showCards, setShowCards] = useState(false);
  const [flipMode, setFlipMode] = useState<'interactive' | 'auto'>('interactive');
  const [quantityByBooster, setQuantityByBooster] = useState<Record<string, number>>({});
  const [pityCount, setPityCount] = useState(0);
  const [pityMax, setPityMax] = useState(180);
  const [openedCount, setOpenedCount] = useState(0);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointTop, setCheckpointTop] = useState<Card[]>([]);
  const [streakActive, setStreakActive] = useState<{ until: number } | null>(null);
  const [openTimestamps, setOpenTimestamps] = useState<number[]>([]);
  
  // Pack opening animation states
  const [animationStage, setAnimationStage] = useState<'none' | 'pack' | 'flight' | 'reveal'>('none');
  const [pendingCards, setPendingCards] = useState<Card[]>([]);
  
  // Multiple boosters support
  const [purchasedBoosters, setPurchasedBoosters] = useState<any[]>([]);
  const [showMultipleModal, setShowMultipleModal] = useState(false);
  const [currentBoosterIndex, setCurrentBoosterIndex] = useState(0);
  const [sealedPacks, setSealedPacks] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    
    // Verificar se tem claim de booster grátis
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('claim') === 'free') {
      claimFreeBooster();
    }
    
    // 🎵 Ambient managed globally by GlobalAmbientManager
    // No need to start/stop here anymore
  }, []);

  async function claimFreeBooster() {
    try {
      // Verificar se já reivindicou
      const alreadyClaimed = localStorage.getItem('kroova_free_booster_claimed');
      if (alreadyClaimed) {
        alert('Você já reivindicou seu booster grátis!');
        return;
      }

      // Mostrar mensagem de loading
      const loadingToast = document.createElement('div');
      loadingToast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#FF006D] to-[#00F0FF] text-white px-8 py-4 rounded-lg font-bold z-50 animate-pulse';
      loadingToast.textContent = '🎁 REIVINDICANDO 3 PACOTES GRÁTIS...';
      document.body.appendChild(loadingToast);

      // Aguardar dados carregarem
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Pegar o booster mais barato (Básico)
      const boostersRes = await api.get('/boosters');
      const allBoosters = unwrap(boostersRes.data);
      const basicBooster = allBoosters.sort((a: BoosterType, b: BoosterType) => a.price_brl - b.price_brl)[0];

      if (!basicBooster) {
        alert('Erro ao encontrar booster básico');
        document.body.removeChild(loadingToast);
        return;
      }

      // Comprar 3 boosters grátis
      const purchaseRes = await api.post('/boosters/purchase', {
        booster_type_id: basicBooster.id,
        quantity: 3
      });

      const { booster_inventory_ids } = unwrap(purchaseRes.data);
      const boosterId = booster_inventory_ids[0];

      document.body.removeChild(loadingToast);

      // Marcar como reivindicado
      localStorage.setItem('kroova_free_booster_claimed', 'true');

      // Abrir automaticamente
      setTimeout(() => {
        handleOpen(boosterId);
      }, 500);

    } catch (error: any) {
      console.error('Erro ao reivindicar booster grátis:', error);
      alert(error.response?.data?.error || 'Erro ao reivindicar booster grátis');
    }
  }

  async function loadData() {
    try {
      const [boostersRes, walletRes] = await Promise.all([
        api.get('/boosters'),
        api.get('/wallet')
      ]);

      setBoosters(unwrap(boostersRes.data));
      setBalance(unwrap(walletRes.data).balance_brl);
      
      // Load sealed packs
      await loadSealedPacks();

      // Pity endpoint (optional): handle 404 gracefully
      try {
        const pityRes = await api.get('/boosters/pity?edition_id=ED01');
        const pityData = unwrap(pityRes.data);
        setPityCount(pityData.pity_count || 0);
        setPityMax(pityData.max || 180);
      } catch (pityErr: any) {
        console.warn('Pity endpoint not available, using defaults');
        setPityCount(0);
        setPityMax(180);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadSealedPacks() {
    try {
      // Busca boosters não abertos (opened_at = null)
      const res = await api.get('/boosters/sealed');
      const data = unwrap(res.data);
      setSealedPacks(data.sealed_packs || []);
    } catch (error: any) {
      console.warn('Sealed packs endpoint not available yet:', error);
      setSealedPacks([]);
    }
  }

  async function handlePurchase(boosterId: string, quantity: number = 1) {
    console.log('🛒 handlePurchase called:', { boosterId, quantity });
    setPurchasing(boosterId);
    
    // 🎵 ADAPTIVE AUDIO: Increase intensity during purchase
    cardAudio.setAmbientIntensity('intense');
    
    try {
      console.log('📤 Sending purchase request...');
      const res = await api.post('/boosters/purchase', {
        booster_type_id: boosterId,
        quantity: quantity,
        currency: 'brl'
      });
      console.log('📥 Purchase response:', res);
      const data = unwrap<{ boosters: any[]; total_paid: number; booster_type: any }>(res.data);
      console.log('✅ Purchase successful, data:', data);
      
      // 🔊 Play success chime
      cardAudio.playSuccessChime();
      
      // Recarrega saldo após compra
      await loadData();
      
      // Se comprou múltiplos, mostra modal de escolha
      if (quantity > 1) {
        setPurchasedBoosters(data.boosters || []);
        setShowMultipleModal(true);
        setCurrentBoosterIndex(0);
      } else {
        // Se comprou apenas 1, abre automaticamente
        const booster = data.boosters?.[0];
        if (booster?.id) {
          await handleOpen(booster.id);
        }
      }
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      const errorMsg = error.response?.data?.error?.message || 'Erro ao comprar booster';
      
      // 🔊 Play error buzz
      cardAudio.playErrorBuzz();
      
      alert(errorMsg);
      
      // 🎵 Return to active if purchase fails
      cardAudio.setAmbientIntensity('active');
    } finally {
      setPurchasing(null);
    }
  }

  async function handleOpen(openingId: string) {
    setOpening(openingId);
    setShowCards(false);

    // 🎵 KEEP INTENSE - Don't stop ambient yet! 
    // User still needs to click the pack (tension moment)

    try {
      const res = await api.post('/boosters/open', { booster_opening_id: openingId });
      const data = unwrap(res.data);

      // Start pack animation sequence
      setPendingCards(data.cards);
      setAnimationStage('pack');
      setOpening(null); // Hide loading spinner
      
    } catch (error) {
      console.error('Erro ao abrir booster:', error);
      setOpening(null);
      
      // 🎵 Restart ambient if open fails
      cardAudio.startAmbient('active');
    }
  }

  function handlePackOpenComplete() {
    // Pack exploded, now show cards flying
    setAnimationStage('flight');
  }

  async function openAllBoosters() {
    setShowMultipleModal(false);
    
    for (let i = 0; i < purchasedBoosters.length; i++) {
      setCurrentBoosterIndex(i);
      await handleOpen(purchasedBoosters[i].id);
      
      // Aguarda um pouco entre aberturas
      if (i < purchasedBoosters.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setPurchasedBoosters([]);
  }
  
  function saveForLater() {
    setShowMultipleModal(false);
    setPurchasedBoosters([]);
    alert(`✅ ${purchasedBoosters.length} booster(s) guardado(s) no seu inventário!`);
    loadData();
  }
  
  async function openNextBooster() {
    const nextIndex = currentBoosterIndex + 1;
    if (nextIndex < purchasedBoosters.length) {
      setCurrentBoosterIndex(nextIndex);
      await handleOpen(purchasedBoosters[nextIndex].id);
    } else {
      setPurchasedBoosters([]);
      setCurrentBoosterIndex(0);
    }
  }

  function handleCardsFlightComplete() {
    // Cards landed, now show reveal session
    setAnimationStage('reveal');
    setRevealedCards(pendingCards);
    setShowCards(true);
    setOpenedCount((c) => c + 1);
    
    // 🎵 ADAPTIVE AUDIO: Restart ambient at idle during card reveal
    // (card SFX will play on top)
    cardAudio.startAmbient('idle');
    
    const now = Date.now();
    // Track open timestamps for Lucky Streak (3 boosters < 2min)
    setOpenTimestamps((arr) => {
      const next = [...arr.filter((t) => now - t < 2 * 60 * 1000), now];
      if (next.length >= 3 && !streakActive) {
        setStreakActive({ until: now + 30 * 60 * 1000 }); // 30min
      }
      return next;
    });
    
    // Checkpoint a cada 10 boosters
    if ((openedCount + 1) % 10 === 0) {
      const top3 = [...pendingCards]
        .sort((a: any, b: any) => (b.liquidity_brl || 0) - (a.liquidity_brl || 0))
        .slice(0, 3);
      setCheckpointTop(top3);
      setShowCheckpoint(true);
    }

    // Recarrega pity após abrir
    loadData();
  }

  // Expire Lucky Streak when time passes
  useEffect(() => {
    if (!streakActive) return;
    const id = setInterval(() => {
      if (Date.now() > streakActive.until) {
        setStreakActive(null);
      }
    }, 10000);
    return () => clearInterval(id);
  }, [streakActive]);

  function getRarityColor(rarity: string) {
    const colors: Record<string, string> = {
      trash: 'text-gray-400',
      meme: 'text-blue-400',
      viral: 'text-purple-400',
      legendary: 'text-yellow-400',
      godmode: 'text-red-400'
    };
    return colors[rarity] || 'text-gray-400';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Pacotes de Cartas</h1>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <nav className="bg-black/40 backdrop-blur-md border-b border-[#FFC700]/30 relative z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/logo_icon.png" alt="KROUVA" className="w-10 h-10 rounded-lg" style={{ boxShadow: '0 0 20px rgba(255, 199, 0, 0.6), 0 0 40px rgba(0, 240, 255, 0.4)', border: '2px solid rgba(255, 199, 0, 0.3)' }} />
            <span className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.1em' }}>KROUVA</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-gray-300 hover:text-[#FFC700] transition">Dashboard</a>
            <a href="/marketplace" className="text-gray-300 hover:text-[#FFC700] transition">Marketplace</a>
            <a href="/boosters" className="text-[#FFC700] font-semibold">Boosters</a>
            <a href="/inventory" className="text-gray-300 hover:text-[#FFC700] transition">Inventário</a>
            <a href="/wallet" className="text-gray-300 hover:text-[#FFC700] transition">Wallet</a>
          </div>
        </div>
      </nav>

      <div className="text-white p-8">
        <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            <TextGlitch delay={300}>DIGITAL BAZAAR</TextGlitch>
          </h1>
          <div className="text-2xl font-mono">
            💰 <span className="text-[#00F0FF]">R$ {balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Pity Bar */}
        <div className="mb-8">
          <PityBar current={pityCount} max={pityMax} edition="ED01" />
        </div>

        {/* Vault Milestones - REMOVIDO temporariamente até implementação backend */}

        {/* Lucky Streak Banner - Modificado para skins apenas (custo zero) */}
        {streakActive && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-pink-700 to-purple-700 border border-pink-400">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="font-bold">Lucky Streak ativo!</div>
                <div className="text-sm text-pink-200">+50% de chance de SKINS raras pelos próximos 30min.</div>
              </div>
            </div>
          </div>
        )}

        {/* Checkpoint Modal */}
        {showCheckpoint && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-[560px]">
              <h3 className="text-2xl font-bold mb-2">🎉 Checkpoint alcançado!</h3>
              <p className="text-sm text-gray-400 mb-4">Você abriu {openedCount} pacotes. Melhores cartas:</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {checkpointTop.map((c, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg p-2">
                    <img src={c.card?.image_url || (c as any).image_url} alt={c.card?.name || (c as any).name} className="rounded" />
                    <div className="text-xs mt-1">{c.card?.name || (c as any).name}</div>
                    <div className="text-[11px] text-gray-500">R$ {(c.liquidity_brl || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-300 mb-3">💡 Pausa sugerida: evite gastos impulsivos. Veja seu progresso antes de continuar.</div>
              <div className="flex gap-2 justify-end">
                <button 
                  className="px-3 py-2 rounded bg-gray-700" 
                  onClick={() => setShowCheckpoint(false)}
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
                >Fechar</button>
                <button 
                  className="px-4 py-2 rounded bg-pink-600" 
                  onClick={() => setShowCheckpoint(false)}
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
                >Continuar abrindo</button>
              </div>
            </div>
          </div>
        )}

        {/* Sealed Packs Section */}
        {sealedPacks.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🎁 Seus Boosters Fechados ({sealedPacks.length})
              </h2>
              <button
                onClick={() => router.push('/inventory?tab=sealed')}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition"
              >
                Ver Todos →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sealedPacks.slice(0, 6).map((pack: any) => (
                <div key={pack.id} className="relative group">
                  <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg p-4 border-2 border-purple-500/50 hover:border-purple-400 transition cursor-pointer">
                    <div className="aspect-[2/3] flex items-center justify-center mb-2">
                      <div className="text-5xl">📦</div>
                    </div>
                    <p className="text-xs text-center text-gray-300 mb-2">{pack.booster_type?.name || 'Booster'}</p>
                    <button
                      onClick={() => handleOpen(pack.id)}
                      className="w-full px-3 py-2 rounded bg-gradient-to-r from-[#FF006D] to-[#00F0FF] text-white text-sm font-bold hover:scale-105 transition"
                    >
                      ABRIR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid de Boosters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {boosters.map((booster) => (
            <div
              key={booster.id}
              className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-blue-500 transition"
            >
              <h3 className="text-2xl font-bold mb-2">{booster.name}</h3>
              <p className="text-gray-400 mb-4">
                {booster.cards_per_booster} cartas • {booster.edition_id}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm text-gray-300">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quantityByBooster[booster.id] || 1}
                  onChange={(e) => setQuantityByBooster(prev => ({ ...prev, [booster.id]: Math.max(1, Math.min(100, Number(e.target.value) || 1)) }))}
                  className="w-20 bg-gray-700 text-white rounded px-2 py-1 border border-gray-600"
                />
                <button
                  onClick={() => setQuantityByBooster(prev => ({ ...prev, [booster.id]: 5 }))}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded border border-gray-600"
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
                >x5</button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Distribuição de Raridades:</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(booster.rarity_distribution).map(([rarity, percent]) => (
                    <div key={rarity} className="flex justify-between">
                      <span className={getRarityColor(rarity)}>{rarity}</span>
                      <span>{percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <GlitchButton
                onClick={() => {
                  console.log('🖱️ Button clicked!', { boosterId: booster.id, quantity: quantityByBooster[booster.id] || 1 });
                  handlePurchase(booster.id, quantityByBooster[booster.id] || 1);
                }}
                disabled={purchasing === booster.id || opening !== null || balance < booster.price_brl}
                variant={balance < booster.price_brl ? 'danger' : 'primary'}
                size="lg"
                isLoading={purchasing === booster.id}
                className="w-full"
              >
                {purchasing === booster.id
                  ? 'PROCESSANDO'
                  : balance < booster.price_brl
                  ? 'SALDO INSUFICIENTE'
                  : `COMPRAR - R$ ${booster.price_brl.toFixed(2)}`}
              </GlitchButton>
            </div>
          ))}
        </div>

        {/* Animação de Abertura */}
        {opening && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
              backgroundImage: 'url(/backgrounds/pack-opening-bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">📦</div>
              <p className="text-2xl">Abrindo pacote...</p>
            </div>
          </div>
        )}

        {/* Pack Opening Animation Sequence */}
        {animationStage === 'pack' && (
          <PackOpeningAnimation
            packImageUrl="/pack-back-ed01.png"
            onOpenComplete={handlePackOpenComplete}
          />
        )}

        {animationStage === 'flight' && (
          <CardsFlightAnimation
            cardCount={pendingCards.length}
            onFlightComplete={handleCardsFlightComplete}
            packImageUrl="/pack-back-ed01.png"
          />
        )}

        {/* Multiple Boosters Modal */}
        {showMultipleModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-2 border-[#FF006D] rounded-2xl p-8 max-w-md w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-[#00F0FF]/5 animate-pulse" />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4 text-center">
                  🎉 {purchasedBoosters.length} BOOSTERS COMPRADOS!
                </h2>
                <p className="text-gray-300 mb-6 text-center">
                  O que você deseja fazer?
                </p>
                
                <div className="space-y-4">
                  <button
                    onClick={openAllBoosters}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-[#FF006D] to-[#00F0FF] text-white font-bold uppercase tracking-wider hover:scale-105 transition"
                  >
                    🔥 ABRIR TODOS AGORA
                  </button>
                  
                  <button
                    onClick={saveForLater}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold uppercase tracking-wider hover:scale-105 transition"
                  >
                    💼 GUARDAR PARA DEPOIS
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowMultipleModal(false);
                      handleOpen(purchasedBoosters[0].id);
                    }}
                    className="w-full px-6 py-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold uppercase tracking-wider transition"
                  >
                    🎁 ABRIR APENAS 1
                  </button>
                </div>
                
                <p className="text-gray-400 text-sm mt-4 text-center">
                  💡 Boosters guardados ficam disponíveis no inventário
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cartas Reveladas (OpeningSession) */}
        {animationStage === 'reveal' && showCards && revealedCards.length > 0 && (
          <>
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-4">
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
            />
            
            {/* Action Buttons After Reveal */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[60] flex gap-4">
              {purchasedBoosters.length > currentBoosterIndex + 1 && (
                <button
                  onClick={() => {
                    setShowCards(false);
                    setAnimationStage('none');
                    openNextBooster();
                  }}
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#FF006D] to-[#00F0FF] text-white font-bold uppercase tracking-wider hover:scale-105 transition shadow-lg"
                >
                  🎁 ABRIR PRÓXIMO ({purchasedBoosters.length - currentBoosterIndex - 1} restantes)
                </button>
              )}
              
              <button
                onClick={() => {
                  setShowCards(false);
                  setAnimationStage('none');
                  setPendingCards([]);
                  setPurchasedBoosters([]);
                }}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold uppercase tracking-wider hover:scale-105 transition shadow-lg"
              >
                💰 COMPRAR MAIS
              </button>
              
              <button
                onClick={() => {
                  router.push('/inventory');
                }}
                className="px-8 py-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold uppercase tracking-wider transition shadow-lg"
              >
                📦 VER INVENTÁRIO
              </button>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
