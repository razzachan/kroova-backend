'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import { PityProgressDual } from '@/components/PityProgressDual';
import { CristalPity } from '@/components/CristalPity';
import { PityExplosion } from '@/components/PityExplosion';
import { OpeningSession } from '@/components/OpeningSession';
// import { VaultMilestonesPanel } from '@/components/VaultMilestonesPanel'; // Removido até implementação backend
import { cardAudio, triggerHaptic } from '@/lib/cardAudio';
import { PackOpeningAnimation } from '@/components/PackOpeningAnimation';
import { CardsFlightAnimation } from '@/components/CardsFlightAnimation';
import GlitchButton from '@/components/UI/GlitchButton';
import TextGlitch from '@/components/Effects/TextGlitch';
import HolographicCard from '@/components/UI/HolographicCard';
import BoosterCard3D from '@/components/UI/BoosterCard3D';
import { RarityGuide } from '@/components/RarityGuide';

// Mapeamento de pack_id para imagem do booster
const PACK_IMAGES: Record<string, string> = {
  'ED01_ALPHA': '/assets/booster-packs/pack-front-ed01-alpha.png',
  'ED01_BETA': '/assets/booster-packs/pack-front-ed01-beta.png',
  'ED01_GAMMA': '/assets/booster-packs/pack-front-ed01-gamma.png',
};

interface BoosterType {
  id: string; // Agora é o pack_id (ED01_ALPHA, ED01_BETA, ED01_GAMMA)
  pack_id: string; // Redundante mas mantemos para compatibilidade
  pack_name: string;
  name: string;
  price_brl: number;
  rarity_distribution: Record<string, number>;
  skin_boost?: {
    premium: number;
    ghost: number;
    holo: number;
    dark: number;
    glitch: number;
  };
  market_tier_filter?: {
    min: number;
    max: number;
  };
  cards_per_booster: number;
  edition_id: string;
  theme?: string;
  mystery_box_bonus_chance?: number; // 🎁 Campo do sistema de bônus
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
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  
  // ✨ DUAL PITY SYSTEM
  const [pityLegendary, setPityLegendary] = useState({ current: 0, max: 20 });
  const [pityGodmode, setPityGodmode] = useState({ current: 0, max: 150 });
  const [pityExplosion, setPityExplosion] = useState<'legendary' | 'godmode' | null>(null);
  
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
      const boostersRes = await api.get('/booster-packs?edition=ED01');
      const response = unwrap(boostersRes.data);
      const allBoosters = response.packs.map((pack: any) => ({
        ...pack,
        id: pack.pack_id,
        name: pack.pack_name
      }));
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
      // 🚀 OTIMIZADO: 1 request em vez de 3 (60-75% mais rápido)
      const response = await api.get('/boosters/full');
      const data = unwrap(response);

      // Boosters
      console.log('🔍 data:', data);
      const packsWithId = (data.booster_types || []).map((pack: any) => ({
        ...pack,
        name: pack.name || pack.pack_name,
        cards_per_booster: 5
      }));
      console.log('🔍 packsWithId:', packsWithId);
      console.log('🔍 Primeiro pack:', packsWithId[0]);
      setBoosters(packsWithId);

      // Wallet (+ pity counters)
      const walletData = data.wallet;
      setBalance(walletData.balance_brl);
      
      // ✨ Carrega pity counters do wallet
      setPityLegendary({
        current: walletData.pity_legendary_counter || 0,
        max: 20
      });
      setPityGodmode({
        current: walletData.pity_godmode_counter || 0,
        max: 150
      });

      // Sealed packs
      console.log('📦 [BOOSTERS] Sealed packs loaded:', data.sealed_boosters?.length || 0);
      console.log('📦 [BOOSTERS] First pack:', data.sealed_boosters?.[0]);
      setSealedPacks(data.sealed_boosters || []);

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
      
      // Sempre mostra modal de escolha (abrir agora ou guardar)
      setPurchasedBoosters(data.boosters || []);
      setShowMultipleModal(true);
      setCurrentBoosterIndex(0);
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
      const res = await api.post('/boosters/open', { opening_id: openingId });
      const data = unwrap(res.data);

      // ✨ DETECTA PITY TRIGGER
      if (data.pity_triggered && data.pity_type) {
        setPityExplosion(data.pity_type); // 'legendary' ou 'godmode'
      }

      // Start pack animation sequence
      setPendingCards(data.cards);
      setAnimationStage('pack');
      setOpening(null); // Hide loading spinner
      
      // 🎁 MYSTERY BOX BONUS - Show notification if received
      if (data.bonus_mystery_box) {
        const bonusToast = document.createElement('div');
        bonusToast.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999]';
        bonusToast.innerHTML = `
          <div class="bg-gradient-to-br from-amber-900 via-orange-900 to-amber-900 border-4 border-amber-400 rounded-2xl px-12 py-8 shadow-2xl shadow-amber-500/50 backdrop-blur-sm animate-bounce">
            <div class="text-center">
              <div class="text-6xl mb-4">🎁</div>
              <div class="text-3xl font-black text-amber-300 mb-2 font-mono tracking-wider">BONUS SURPRISE!</div>
              <div class="text-xl text-amber-200 font-bold">${data.bonus_mystery_box.name}</div>
              <div class="text-sm text-amber-400 mt-2">Ganhou uma Mystery Box grátis!</div>
            </div>
          </div>
        `;
        document.body.appendChild(bonusToast);
        
        // Remove após 4 segundos
        setTimeout(() => {
          bonusToast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
          setTimeout(() => document.body.removeChild(bonusToast), 500);
        }, 4000);
      }
      
      // Recarrega wallet para atualizar counters (após backend resetar)
      await loadData();
      
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
    const count = purchasedBoosters.length;
    setPurchasedBoosters([]);
    
    // Mostra toast estilizado com o mesmo estilo dos botões
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-[80]';
    toast.innerHTML = `
      <div class="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-2 border-[#00F0FF] rounded-xl px-8 py-4 shadow-2xl shadow-[#00F0FF]/30 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <span class="text-2xl">💼</span>
          <div>
            <p class="text-white font-bold text-lg tracking-wider" style="font-family: var(--font-geist-mono), monospace;">
              ${count} BOOSTER${count > 1 ? 'S' : ''} GUARDADO${count > 1 ? 'S' : ''}
            </p>
            <p class="text-[#00F0FF] text-sm">Disponível no seu inventário</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease-out';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
    
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
    <div 
      className="min-h-screen relative bg-cover bg-center bg-fixed" 
      style={{
        backgroundImage: 'url(/kroova-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay escuro para melhor legibilidade */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      
      {/* Educational Rarity Guide */}
      <RarityGuide autoShow={true} />
      
      <nav className="bg-black/40 backdrop-blur-md border-b border-[#FFC700]/30 relative z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/logo_icon_transparent.png" alt="KROUVA" className="w-10 h-10 rounded-lg object-contain" style={{ boxShadow: '0 0 20px rgba(255, 199, 0, 0.6), 0 0 40px rgba(0, 240, 255, 0.4)', border: '2px solid rgba(255, 199, 0, 0.3)' }} />
            <span className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.1em' }}>KROUVA</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-gray-300 hover:text-[#FFC700] transition">Dashboard</a>
            <a href="/marketplace" className="text-gray-300 hover:text-[#FFC700] transition">Marketplace</a>
            <a href="/boosters" className="text-[#FFC700] font-semibold">Boosters</a>
            <a href="/mystery-box" className="text-gray-300 hover:text-cyan-400 transition">🎰 Mystery Box</a>
            <a href="/inventory" className="text-gray-300 hover:text-[#FFC700] transition">Inventário</a>
            <a href="/wallet" className="text-gray-300 hover:text-[#FFC700] transition">Wallet</a>
          </div>
        </div>
      </nav>

      <div className="text-white p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            <TextGlitch delay={300}>DIGITAL BAZAAR</TextGlitch>
          </h1>
          <div className="text-2xl font-mono">
            💰 <span className="text-[#00F0FF]">R$ {balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Dual Pity System */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crystal evolutivo */}
          <div className="flex items-center justify-center">
            <CristalPity 
              averageProgress={(pityLegendary.current / pityLegendary.max * 100 + pityGodmode.current / pityGodmode.max * 100) / 2} 
            />
          </div>
          
          {/* Dual progress bars */}
          <div className="lg:col-span-2">
            <PityProgressDual 
              legendary={pityLegendary}
              godmode={pityGodmode}
            />
          </div>
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
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[90]">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-[560px]">
              <h3 className="text-2xl font-bold mb-2">🎉 Checkpoint alcançado!</h3>
              <p className="text-sm text-gray-400 mb-4">Você abriu {openedCount} pacotes. Melhores cartas:</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {checkpointTop.map((c, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg p-2">
                    <img src={c.card?.image_url || (c as any).image_url} alt={c.card?.name || (c as any).name} className="rounded object-contain mix-blend-lighten" />
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
                🎁 <TextGlitch delay={200}>BOOSTERS FECHADOS</TextGlitch> ({sealedPacks.length})
              </h2>
              <GlitchButton
                variant="secondary"
                size="sm"
                onClick={() => router.push('/my-boosters')}
              >
                Ver Todos →
              </GlitchButton>
            </div>
            {/* Layout empilhado - boosters sobrepostos como leque (máximo 3) */}
            <div className="relative flex justify-center items-start min-h-[500px] w-full pt-16 pb-20 mb-12">
              <div className="relative w-fit">
                {sealedPacks.slice(0, 3).map((pack: any, index: number) => (
                  <div
                    key={pack.id}
                    className="absolute left-1/2"
                    style={{
                      zIndex: index,
                      transform: `translateX(calc(-50% + ${(index - 1) * 80}px)) translateY(${index * -10}px) rotate(${(index - 1) * 5}deg)`,
                      transition: 'all 0.3s ease-out',
                    }}
                  >
                    <BoosterCard3D
                      onClick={() => handleOpen(pack.id)}
                      className="w-[260px]"
                    >
                      {/* Imagem do booster pack - SEM bordas, efeito 3D puro */}
                      <img 
                        src={PACK_IMAGES[pack.booster_type_id] || PACK_IMAGES['ED01_ALPHA']} 
                        alt={`${pack.booster_types?.name || 'Booster'} Pack`} 
                        className="w-full h-auto object-contain"
                        style={{ minHeight: '380px' }}
                      />
                    </BoosterCard3D>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid de Boosters */}
        <div className="mb-12">
          {/* Seletor de Tier */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TextGlitch delay={100}>ESCOLHA SUA TIER</TextGlitch>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {[
                { price: 0.50, name: 'Básico', color: 'bg-gray-800/40' },
                { price: 1.00, name: 'Padrão', color: 'bg-green-900/40' },
                { price: 2.00, name: 'Premium', color: 'bg-blue-900/40' },
                { price: 5.00, name: 'Elite', color: 'bg-purple-900/40' },
                { price: 10.00, name: 'Whale', color: 'bg-yellow-900/40' }
              ].map((tier) => (
                <div
                  key={tier.price}
                  onClick={() => {
                    console.log('🎯 Tier selecionado:', tier.price);
                    setSelectedTier(tier.price);
                    setSelectedVariant(null);
                  }}
                  className={`relative p-4 md:p-6 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedTier === tier.price
                      ? 'border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.5)]'
                      : 'border-gray-700/50 hover:border-[#00F0FF]/50 active:border-[#00F0FF]'
                  } ${tier.color} backdrop-blur-sm group`}
                >
                  <div className="text-base md:text-xl font-bold mb-1 md:mb-2 font-mono tracking-wider">{tier.name}</div>
                  <div className={`text-lg md:text-2xl font-bold font-mono ${
                    selectedTier === tier.price ? 'text-[#00F0FF]' : 'text-gray-300'
                  }`}>
                    R$ {tier.price.toFixed(2)}
                  </div>
                  {selectedTier === tier.price && (
                    <div className="absolute -top-2 md:-top-3 -right-2 md:-right-3 w-6 h-6 md:w-8 md:h-8 bg-[#00F0FF] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.8)] animate-pulse">
                      <span className="text-black font-bold text-sm md:text-base">✓</span>
                    </div>
                  )}
                  {/* Glitch effect on hover */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 rounded-lg border border-[#FF006D]/30 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seletor de Variante */}
          {selectedTier !== null && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TextGlitch delay={200}>ESCOLHA SUA VARIANTE</TextGlitch>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(() => {
                  const filtered = boosters.filter(b => b.price_brl === selectedTier);
                  console.log('🔍 Filtrando por tier:', selectedTier);
                  console.log('🔍 Boosters filtrados:', filtered);
                  console.log('🔍 Todos boosters:', boosters.map(b => ({ id: b.id, price: b.price_brl })));
                  return filtered;
                })()
                  .map((booster) => (
                    <div
                      key={booster.id}
                      onClick={() => setSelectedVariant(booster.id)}
                      className={`cursor-pointer bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden border-2 transition-all ${
                        selectedVariant === booster.id
                          ? 'border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.6)]'
                          : 'border-gray-700/50 hover:border-[#00F0FF]/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      } group relative`}
                    >
                      {/* Badge da variante */}
                      <div className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-lg text-xs font-bold font-mono ${
                        booster.pack_id === 'ED01_ALPHA' ? 'bg-yellow-600/90' :
                        booster.pack_id === 'ED01_BETA' ? 'bg-gray-500/90' :
                        'bg-orange-600/90'
                      } shadow-lg border border-black/50`}>
                        {booster.pack_id.split('_')[1]}
                      </div>
                      
                      <div className="relative h-64 bg-gray-900/50 flex items-center justify-center overflow-hidden">
                        <img 
                          src={PACK_IMAGES[booster.pack_id] || PACK_IMAGES['ED01_ALPHA']} 
                          alt={booster.pack_name || booster.name}
                          className="h-full w-auto object-contain transform group-hover:scale-110 transition-transform duration-300"
                        />
                        {selectedVariant === booster.id && (
                          <div className="absolute top-3 right-3 w-10 h-10 bg-[#00F0FF] rounded-full flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.9)] animate-pulse">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-black/60">
                        <h3 className="text-xl font-bold mb-2 font-mono tracking-wide">{booster.pack_name || booster.name}</h3>
                        <div className="text-sm text-gray-400 mb-3">
                          <p className="mb-1 font-mono">5 cartas • {booster.edition_id}</p>
                          
                          {/* 🎁 MYSTERY BOX BONUS BADGE */}
                          {booster.mystery_box_bonus_chance && booster.mystery_box_bonus_chance > 0 && (
                            <div className="mb-2 mt-2 px-2 py-1 rounded bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50">
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                                <span>🎁</span>
                                <span>{booster.mystery_box_bonus_chance}% chance Mystery Box grátis!</span>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 font-mono">Distribuição:</p>
                          <div className="grid grid-cols-2 gap-1 text-xs mt-1 font-mono">{Object.entries(booster.rarity_distribution || {})
                              .sort(([rarityA], [rarityB]) => {
                                const order: Record<string, number> = { 'meme': 0, 'trash': 1, 'viral': 2, 'epic': 3, 'legendary': 4, 'godmode': 5 };
                                return (order[rarityA.toLowerCase()] || 999) - (order[rarityB.toLowerCase()] || 999);
                              })
                              .map(([rarity, percent]) => (
                                <div key={rarity} className="flex justify-between">
                                  <span className={getRarityColor(rarity)}>{rarity}</span>
                                  <span className="text-gray-400">{percent}%</span>
                                </div>
                              ))}
                          </div>
                          
                          {/* Skin Boost Info */}
                          {booster.skin_boost && (
                            <>
                              <p className="text-xs text-gray-500 font-mono mt-2">Skins Especiais:</p>
                              <div className="grid grid-cols-2 gap-1 text-xs mt-1 font-mono">
                                {booster.skin_boost.premium > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-blue-400">premium (1.5x)</span>
                                    <span className="text-gray-400">{booster.skin_boost.premium}%</span>
                                  </div>
                                )}
                                {booster.skin_boost.ghost > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-purple-400">ghost (3x)</span>
                                    <span className="text-gray-400">{booster.skin_boost.ghost}%</span>
                                  </div>
                                )}
                                {booster.skin_boost.holo > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-cyan-400">holo (2.5x)</span>
                                    <span className="text-gray-400">{booster.skin_boost.holo}%</span>
                                  </div>
                                )}
                                {booster.skin_boost.dark > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-red-400">dark (4x)</span>
                                    <span className="text-gray-400">{booster.skin_boost.dark}%</span>
                                  </div>
                                )}
                                {booster.skin_boost.glitch > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-pink-400">glitch (6x)</span>
                                    <span className="text-gray-400">{booster.skin_boost.glitch}%</span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Glitch effect border */}
                      {selectedVariant === booster.id && (
                        <div className="absolute inset-0 rounded-lg pointer-events-none">
                          <div className="absolute inset-0 rounded-lg border-2 border-[#FF006D]/40 animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Controles de Compra */}
          {selectedVariant && (
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border-2 border-[#00F0FF]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="text-lg font-bold text-gray-300">Quantidade:</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quantityByBooster[selectedVariant] || 1}
                    onChange={(e) => setQuantityByBooster(prev => ({ 
                      ...prev, 
                      [selectedVariant]: Math.max(1, Math.min(100, Number(e.target.value) || 1)) 
                    }))}
                    className="w-24 bg-gray-700 text-white text-center text-xl rounded px-3 py-2 border-2 border-gray-600 focus:border-[#00F0FF] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    {[5, 10, 20].map(qty => (
                      <button
                        key={qty}
                        onClick={() => setQuantityByBooster(prev => ({ ...prev, [selectedVariant]: qty }))}
                        className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded border border-gray-600 transition"
                      >
                        x{qty}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Total:</div>
                    <div className="text-2xl font-bold text-[#00F0FF]">
                      R$ {(
                        (boosters.find(b => b.id === selectedVariant)?.price_brl || 0) * 
                        (quantityByBooster[selectedVariant] || 1)
                      ).toFixed(2)}
                    </div>
                  </div>
                  
                  <GlitchButton
                    onClick={() => {
                      const booster = boosters.find(b => b.id === selectedVariant);
                      if (booster) {
                        handlePurchase(booster.id, quantityByBooster[selectedVariant] || 1);
                      }
                    }}
                    disabled={
                      purchasing === selectedVariant || 
                      opening !== null || 
                      balance < (boosters.find(b => b.id === selectedVariant)?.price_brl || 0) * (quantityByBooster[selectedVariant] || 1)
                    }
                    variant={
                      balance < (boosters.find(b => b.id === selectedVariant)?.price_brl || 0) * (quantityByBooster[selectedVariant] || 1)
                        ? 'danger' 
                        : 'primary'
                    }
                    size="lg"
                    isLoading={purchasing === selectedVariant}
                    className="px-8"
                  >
                    {purchasing === selectedVariant
                      ? 'PROCESSANDO'
                      : balance < (boosters.find(b => b.id === selectedVariant)?.price_brl || 0) * (quantityByBooster[selectedVariant] || 1)
                      ? 'SALDO INSUFICIENTE'
                      : 'COMPRAR AGORA'}
                  </GlitchButton>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Animação de Abertura */}
        {opening && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-[100]"
            style={{
              backgroundImage: 'url(/backgrounds/pack-opening-bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
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
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
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
                  <GlitchButton
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setShowMultipleModal(false);
                      handleOpen(purchasedBoosters[0].id);
                    }}
                    className="w-full"
                  >
                    🎁 ABRIR PRIMEIRO
                  </GlitchButton>
                  
                  <GlitchButton
                    variant="secondary"
                    size="lg"
                    onClick={saveForLater}
                    className="w-full"
                  >
                    💼 GUARDAR PARA DEPOIS
                  </GlitchButton>
                </div>
                
                <p className="text-gray-400 text-sm mt-4 text-center">
                  💡 Após abrir, você pode escolher abrir o próximo ou guardar os restantes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cartas Reveladas (OpeningSession) */}
        {animationStage === 'reveal' && showCards && revealedCards.length > 0 && (
          <>
            {/* Background fixo para sessão de flip */}
            <div 
              className="fixed inset-0 z-[100]"
              style={{
                backgroundImage: 'url(/kroova-background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
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
            />
            
            {/* Action Buttons After Reveal */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[110] flex gap-4">
              {/* Se tem mais boosters comprados para abrir */}
              {purchasedBoosters.length > currentBoosterIndex + 1 && (
                <GlitchButton
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setShowCards(false);
                    setAnimationStage('none');
                    openNextBooster();
                  }}
                >
                  🎁 ABRIR PRÓXIMO ({purchasedBoosters.length - currentBoosterIndex - 1} restantes)
                </GlitchButton>
              )}

              {/* Se tem boosters selados no inventário */}
              {sealedPacks.length > 0 && (
                <GlitchButton
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setShowCards(false);
                    setAnimationStage('none');
                    setPendingCards([]);
                    setPurchasedBoosters([]);
                    // Scroll para a seção de boosters selados
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  🎁 ABRIR OUTRO BOOSTER ({sealedPacks.length} disponíveis)
                </GlitchButton>
              )}
              
              <GlitchButton
                variant="success"
                size="lg"
                onClick={() => {
                  setShowCards(false);
                  setAnimationStage('none');
                  setPendingCards([]);
                  setPurchasedBoosters([]);
                }}
              >
                💰 COMPRAR MAIS
              </GlitchButton>
              
              <GlitchButton
                variant="secondary"
                size="lg"
                onClick={() => {
                  router.push('/inventory');
                }}
              >
                📦 VER INVENTÁRIO
              </GlitchButton>

              <GlitchButton
                variant="danger"
                size="md"
                onClick={() => {
                  setShowCards(false);
                  setAnimationStage('none');
                  setPendingCards([]);
                  setPurchasedBoosters([]);
                }}
              >
                ✖️ FECHAR
              </GlitchButton>
            </div>
          </>
        )}
      </div>
      </div>
      
      {/* ✨ PITY EXPLOSION OVERLAY */}
      {pityExplosion && (
        <PityExplosion 
          type={pityExplosion}
          onComplete={() => setPityExplosion(null)}
        />
      )}
    </div>
  );
}
