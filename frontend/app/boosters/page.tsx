'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import { PityBar } from '@/components/PityBar';
import { OpeningSession } from '@/components/OpeningSession';
import { VaultMilestonesPanel } from '@/components/VaultMilestonesPanel';
import { cardAudio, triggerHaptic } from '@/lib/cardAudio';
import { PackOpeningAnimation } from '@/components/PackOpeningAnimation';
import { CardsFlightAnimation } from '@/components/CardsFlightAnimation';

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

  useEffect(() => {
    loadData();
    
    // 🎵 ADAPTIVE AMBIENT: Start at 'active' level for boosters page
    cardAudio.startAmbient('active');
    
    // Cleanup: stop ambient when leaving page
    return () => {
      cardAudio.stopAmbient();
    };
  }, []);

  async function loadData() {
    try {
      const [boostersRes, walletRes] = await Promise.all([
        api.get('/boosters'),
        api.get('/wallet')
      ]);

      setBoosters(unwrap(boostersRes.data));
      setBalance(unwrap(walletRes.data).balance_brl);

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
      const data = unwrap<{ opening_id: string; new_balance: number; booster_type: any }>(res.data);
      console.log('✅ Purchase successful, data:', data);
      // Recarrega saldo após compra
      await loadData();
      // Abre automaticamente o booster
      if (data?.opening_id) {
        await handleOpen(data.opening_id);
      }
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      const errorMsg = error.response?.data?.error?.message || 'Erro ao comprar booster';
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

    // 🎵 ADAPTIVE AUDIO: Stop ambient before pack explosion
    cardAudio.stopAmbient();

    try {
      const res = await api.post('/boosters/open', { opening_id: openingId });
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
          <h1 className="text-4xl font-bold mb-8">Boosters</h1>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Boosters</h1>
          <div className="text-2xl">
            💰 <span className="text-green-400">R$ {balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Pity Bar */}
        <div className="mb-8">
          <PityBar current={pityCount} max={pityMax} edition="ED01" />
        </div>

        {/* Vault Milestones (placeholder data) */}
        <div className="mb-8">
          <VaultMilestonesPanel
            milestones={[
              { id: 'v25', name: 'Vault 25', max: 25, progress: Math.min(25, openedCount), reward: '1 carta bônus' },
              { id: 'v50', name: 'Vault 50', max: 50, progress: Math.min(50, openedCount), reward: '2 cartas bônus' },
              { id: 'v75', name: 'Vault 75', max: 75, progress: Math.min(75, openedCount), reward: 'Skin Neon' },
              { id: 'v100', name: 'Vault 100', max: 100, progress: Math.min(100, openedCount), reward: 'Carta exclusiva' },
            ]}
          />
        </div>

        {/* Lucky Streak Banner */}
        {streakActive && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-pink-700 to-purple-700 border border-pink-400">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="font-bold">Lucky Streak ativo!</div>
                <div className="text-sm text-pink-200">+50% de chance de raridade pelos próximos 30min.</div>
              </div>
            </div>
          </div>
        )}

        {/* Checkpoint Modal */}
        {showCheckpoint && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-[560px]">
              <h3 className="text-2xl font-bold mb-2">🎉 Checkpoint alcançado!</h3>
              <p className="text-sm text-gray-400 mb-4">Você abriu {openedCount} boosters. Melhores cartas:</p>
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

              <button
                onClick={() => {
                  console.log('🖱️ Button clicked!', { boosterId: booster.id, quantity: quantityByBooster[booster.id] || 1 });
                  handlePurchase(booster.id, quantityByBooster[booster.id] || 1);
                }}
                disabled={purchasing === booster.id || opening !== null || balance < booster.price_brl}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded"
                style={{
                  transition: 'transform 0.15s ease-out, opacity 0.2s ease-out',
                  willChange: 'transform',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(-2px) translateZ(0)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) translateZ(0)';
                }}
              >
                {purchasing === booster.id
                  ? 'Comprando...'
                  : balance < booster.price_brl
                  ? 'Saldo Insuficiente'
                  : `Comprar - R$ ${booster.price_brl.toFixed(2)}`}
              </button>
            </div>
          ))}
        </div>

        {/* Animação de Abertura */}
        {opening && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">📦</div>
              <p className="text-2xl">Abrindo booster...</p>
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
          />
        )}

        {/* Cartas Reveladas (OpeningSession) */}
        {animationStage === 'reveal' && showCards && revealedCards.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="max-w-6xl w-full my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">✨ Suas Novas Cartas! ✨</h2>
                <div className="flex items-center gap-2 text-sm">
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
                  >{flipMode === 'interactive' ? 'Interativo' : 'Automático'}</button>
                </div>
              </div>
              <OpeningSession
                cards={revealedCards.map((c) => ({
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
              <div className="text-center space-x-4 pb-8 mt-6">
                <button
                  onClick={() => {
                    setShowCards(false);
                    setAnimationStage('none');
                    // 🎵 Return to active ambient when closing reveal
                    cardAudio.setAmbientIntensity('active');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg"
                  style={{
                    transition: 'transform 0.15s ease-out',
                    willChange: 'transform',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateZ(0)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateZ(0)';
                  }}
                >
                  Fechar
                </button>
                <button
                  onClick={() => router.push('/inventory')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
                  style={{
                    transition: 'transform 0.15s ease-out',
                    willChange: 'transform',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateZ(0)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateZ(0)';
                  }}
                >
                  Ver Inventário
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
