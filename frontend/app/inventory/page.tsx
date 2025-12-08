'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import GlitchButton from '@/components/UI/GlitchButton';
import DataStreamInput from '@/components/UI/DataStreamInput';
import TextGlitch from '@/components/Effects/TextGlitch';
import HolographicCard from '@/components/UI/HolographicCard';
import { cardAudio } from '@/lib/cardAudio';
import RecycleBulk from '@/components/RecycleBulk';

interface CardBase {
  id: string;
  name: string;
  rarity: string;
  display_id: string;
  image_url?: string;
  description?: string;
}

interface CardInstance {
  id: string;
  base_id: string;
  owner_id: string;
  skin: string;
  is_godmode: boolean;
  liquidity_brl: number;
  minted_at: string;
  cards_base?: CardBase;
  prize_amount_brl?: number;       // ✅ Cashback resgatável
  prize_redeemed?: boolean;         // ✅ Se já foi resgatado
  prize_redeemed_at?: string;       // ✅ Data do resgate
}

export default function InventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [inventory, setInventory] = useState<CardInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellingCard, setSellingCard] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState<string>('');
  const [showRecycleBulk, setShowRecycleBulk] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [listedCards, setListedCards] = useState<string[]>([]);
  const [showListedFilter, setShowListedFilter] = useState<'all' | 'owned' | 'listed'>('owned');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [displayCount, setDisplayCount] = useState(20); // Lazy loading: show 20 at a time
  
  // NOVO: Estados para venda ao sistema
  const [showSellConfirmModal, setShowSellConfirmModal] = useState(false);
  const [sellingSystems, setSellingSystems] = useState(false);
  const [sellMode, setSellMode] = useState<'quick' | 'advanced' | 'manual'>('quick'); // Modo de venda
  const [sellSuccessData, setSellSuccessData] = useState<{ cards_sold: number, total_value: number, new_balance: number } | null>(null);
  
  // Quick Actions
  const [quickAction, setQuickAction] = useState<'trash' | 'trash_meme' | 'under_1' | 'under_5' | 'duplicates'>('trash');
  
  // Advanced Filters
  const [selectedRarities, setSelectedRarities] = useState<string[]>(['trash']);
  const [maxValue, setMaxValue] = useState<number>(1.0);
  const [keepCopies, setKeepCopies] = useState<number>(1);
  
  // Manual Selection
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  
  // Modal de Valor do Inventário
  const [showValueModal, setShowValueModal] = useState(false);
  const [recyclesToday, setRecyclesToday] = useState(0);
  const MAX_RECYCLES = 3;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      // Check if user scrolled near bottom (within 500px)
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setDisplayCount(prev => prev + 20); // Load 20 more cards
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(20);
  }, [showListedFilter, rarityFilter, searchFilter]);

  const loadInventory = async () => {
    try {
      // Buscar tudo de uma vez via endpoint otimizado
      const response = await api.get('/inventory/full');
      const data = unwrap<{
        cards: CardInstance[];
        listed_card_ids: string[];
        recycles_today: number;
        total_cards: number;
        total_listed: number;
      }>(response);
      
      console.log('[inventory] Total de cartas recebidas:', data.total_cards);
      console.log('[inventory] Cartas listadas:', data.total_listed);
      console.log('[inventory] Reciclagens hoje:', data.recycles_today);
      
      setInventory(data.cards || []);
      setListedCards(data.listed_card_ids || []);
      setRecyclesToday(data.recycles_today || 0);
      
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
      // Fallback: tentar endpoint antigo
      try {
        const invResponse = await api.get('/inventory');
        const data = unwrap<{ cards: CardInstance[] }>(invResponse);
        setInventory(data.cards || []);
      } catch (fallbackError) {
        console.error('Fallback também falhou:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Funções de compatibilidade
  const getTrashCards = () => {
    return inventory.filter(c => 
      !listedCards.includes(c.id) && 
      c.cards_base?.rarity === 'trash'
    );
  };
  
  const getTrashAndMemeCards = () => {
    return inventory.filter(c => 
      !listedCards.includes(c.id) && 
      (c.cards_base?.rarity === 'trash' || c.cards_base?.rarity === 'meme')
    );
  };

  // Sistema inteligente de filtros
  const getCardsByQuickAction = (action: string) => {
    const availableCards = inventory.filter(c => !listedCards.includes(c.id));
    
    switch(action) {
      case 'trash':
        return availableCards.filter(c => c.cards_base?.rarity === 'trash');
      case 'trash_meme':
        return availableCards.filter(c => 
          c.cards_base?.rarity === 'trash' || c.cards_base?.rarity === 'meme'
        );
      case 'under_1':
        return availableCards.filter(c => (c.liquidity_brl || 0) < 1.0);
      case 'under_5':
        return availableCards.filter(c => (c.liquidity_brl || 0) < 5.0);
      case 'duplicates':
        return getDuplicateCards(availableCards, keepCopies);
      default:
        return [];
    }
  };

  const getDuplicateCards = (cards: CardInstance[], keepAmount: number) => {
    const cardsByBase = cards.reduce((acc, card) => {
      const baseId = card.base_id;
      if (!acc[baseId]) acc[baseId] = [];
      acc[baseId].push(card);
      return acc;
    }, {} as Record<string, CardInstance[]>);
    
    const duplicates: CardInstance[] = [];
    Object.values(cardsByBase).forEach(group => {
      if (group.length > keepAmount) {
        // Ordenar por liquidez (vender as de menor valor primeiro)
        const sorted = [...group].sort((a, b) => (a.liquidity_brl || 0) - (b.liquidity_brl || 0));
        duplicates.push(...sorted.slice(0, sorted.length - keepAmount));
      }
    });
    
    return duplicates;
  };

  const getCardsByAdvancedFilters = () => {
    return inventory.filter(c => {
      if (listedCards.includes(c.id)) return false;
      
      // Filtro de raridade
      const rarityMatch = selectedRarities.length === 0 || 
        selectedRarities.includes(c.cards_base?.rarity || '');
      
      // Filtro de valor máximo
      const valueMatch = (c.liquidity_brl || 0) <= maxValue;
      
      return rarityMatch && valueMatch;
    });
  };

  const getCardsToSell = () => {
    if (sellMode === 'quick') {
      return getCardsByQuickAction(quickAction);
    } else if (sellMode === 'advanced') {
      return getCardsByAdvancedFilters();
    } else { // manual
      return inventory.filter(c => selectedCards.has(c.id));
    }
  };

  const calculateSellValue = () => {
    return getCardsToSell().reduce((sum, card) => sum + (card.liquidity_brl || 0), 0);
  };
  
  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedCards(newSelection);
  };
  
  const selectAllFiltered = () => {
    const filteredCards = inventory.filter(card => {
      const isListed = listedCards.includes(card.id);
      if (isListed) return false; // Não selecionar cartas já listadas
      if (showListedFilter === 'owned' && isListed) return false;
      if (showListedFilter === 'listed' && !isListed) return false;
      if (rarityFilter !== 'all' && card.cards_base?.rarity !== rarityFilter) return false;
      if (searchFilter) {
        const searchLower = searchFilter.toLowerCase();
        const name = card.cards_base?.name?.toLowerCase() || '';
        const displayId = card.cards_base?.display_id?.toLowerCase() || '';
        if (!name.includes(searchLower) && !displayId.includes(searchLower)) return false;
      }
      return true;
    });
    setSelectedCards(new Set(filteredCards.map(c => c.id)));
  };
  
  const clearSelection = () => {
    setSelectedCards(new Set());
  };
  
  const toggleRarity = (rarity: string) => {
    setSelectedRarities(prev => 
      prev.includes(rarity) 
        ? prev.filter(r => r !== rarity)
        : [...prev, rarity]
    );
  };

  const handleSellToSystem = async () => {
    const cardsToSell = getCardsToSell();
    console.log('[handleSellToSystem] Iniciando venda...', {
      mode: sellMode,
      quickAction: quickAction,
      selectedRarities: selectedRarities,
      maxValue: maxValue,
      selectedCards: Array.from(selectedCards),
      cardsToSellCount: cardsToSell.length,
      cardsToSellIds: cardsToSell.map(c => c.id)
    });
    
    if (cardsToSell.length === 0) {
      alert('⚠️ Nenhuma carta disponível para venda!');
      return;
    }
    
    setSellingSystems(true);
    try {
      console.log('[handleSellToSystem] Enviando requisição para API...');
      const response = await api.post('/cards/sell-to-system', {
        card_instance_ids: cardsToSell.map(c => c.id)
      });
      
      console.log('[handleSellToSystem] Resposta da API:', response);
      
      const data = unwrap<{ cards_sold: number, total_value: number, new_balance: number }>(response);
      
      console.log('[handleSellToSystem] Dados após unwrap:', data);
      
      // 🔍 DEBUG: Mostrar informações de debug se disponíveis
      if (response.data.debug) {
        console.log('🔍 [DEBUG] Balance Calculation:', response.data.debug.balance_calculation);
        console.log('🔍 [DEBUG] Verification:', response.data.debug.verification);
        if (response.data.debug.update_error) {
          console.error('❌ [DEBUG] Update Error:', response.data.debug.update_error);
        }
      }
      
      cardAudio.playSuccessChime();
      setSellSuccessData(data);
      setShowSellConfirmModal(false);
      await loadInventory();
    } catch (error: any) {
      console.error('[handleSellToSystem] Erro na venda:', error);
      console.error('[handleSellToSystem] Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.error?.message || 'Erro ao vender cartas');
    } finally {
      setSellingSystems(false);
    }
  };

  const calculateInventoryValue = () => {
    const ownedCards = inventory.filter(c => !listedCards.includes(c.id));
    const total = ownedCards.reduce((sum, card) => sum + (card.liquidity_brl || 0), 0);
    
    const byRarity = ownedCards.reduce((acc, card) => {
      const rarity = card.cards_base?.rarity || 'unknown';
      if (!acc[rarity]) {
        acc[rarity] = { count: 0, value: 0 };
      }
      acc[rarity].count++;
      acc[rarity].value += card.liquidity_brl || 0;
      return acc;
    }, {} as Record<string, { count: number, value: number }>);
    
    return { total, byRarity, cardCount: ownedCards.length };
  };

  const handleSell = async (cardInstanceId: string) => {
    const price = parseFloat(salePrice);
    if (!price || price <= 0) {
      cardAudio.playErrorBuzz();
      alert('Digite um preço válido');
      return;
    }

    try {
      await api.post('/market/listings', {
        card_instance_id: cardInstanceId,
        price_brl: price
      });

      cardAudio.playSuccessChime();
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
      setSellingCard(null);
      setSalePrice('');
      await loadInventory();
    } catch (error: any) {
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.error || 'Erro ao criar anúncio');
    }
  };
  
  // 💰 FUNÇÃO PARA RESGATAR CASHBACK
  const handleRedeemCashback = async (cardInstanceId: string) => {
    try {
      const response = await api.post('/cards/redeem-prize', {
        card_instance_id: cardInstanceId
      });
      
      const data = unwrap<{ 
        cashback_amount: number; 
        new_balance: number;
        card_name: string;
      }>(response);
      
      cardAudio.playSuccessChime();
      
      // Notificação de sucesso
      const toast = document.createElement('div');
      toast.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in';
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">💰</span>
          <div>
            <div class="font-bold">Cashback Resgatado!</div>
            <div class="text-sm">R$ ${data.cashback_amount.toFixed(4)} → Wallet</div>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
      
      // Recarregar inventário
      await loadInventory();
      
      // Disparar evento para atualizar saldo no header (se houver)
      window.dispatchEvent(new Event('walletUpdated'));
      
    } catch (error: any) {
      console.error('Erro ao resgatar cashback:', error);
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.error || 'Erro ao resgatar cashback');
    }
  };

  const handleCancelListing = async (cardInstanceId: string) => {
    if (!confirm('Cancelar venda desta carta?')) return;

    try {
      // Buscar o listing_id desta carta
      const response = await api.get('/market/my-listings?status=active');
      const listings = response.data?.data?.listings || [];
      const listing = listings.find((l: any) => 
        (l.card?.instance_id || l.card_instance_id) === cardInstanceId
      );

      if (!listing) {
        alert('Anúncio não encontrado');
        return;
      }

      await api.delete(`/market/listings/${listing.id}`);
      cardAudio.playSuccessChime();
      alert('Venda cancelada com sucesso!');
      loadInventory();
    } catch (error: any) {
      cardAudio.playErrorBuzz();
      alert(error.response?.data?.message || 'Erro ao cancelar venda');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-black/40 backdrop-blur-md border-b border-[#FF006D]/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/logo_icon_transparent.png" alt="KROUVA" className="w-10 h-10 rounded-lg object-contain" style={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 40px rgba(255, 0, 109, 0.4)', border: '2px solid rgba(0, 240, 255, 0.3)' }} />
            <span className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.1em' }}>KROUVA</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-gray-300 hover:text-[#FF006D] transition">Dashboard</a>
            <a href="/marketplace" className="text-gray-300 hover:text-[#FF006D] transition">Marketplace</a>
            <a href="/boosters" className="text-gray-300 hover:text-[#FF006D] transition">Boosters</a>
            <a href="/mystery-box" className="text-gray-300 hover:text-cyan-400 transition">🎰 Mystery Box</a>
            <a href="/inventory" className="text-[#FF006D] font-semibold">Inventário</a>
            <a href="/wallet" className="text-gray-300 hover:text-[#FF006D] transition">Wallet</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">
            <TextGlitch delay={300}>🃏 VAULT</TextGlitch>
          </h1>
          
          {/* Total Inventory Value Badge */}
          {inventory.length > 0 && (
            <button
              onClick={() => setShowValueModal(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/40 rounded-lg px-6 py-3 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
            >
              <div className="relative z-10">
                <div className="text-green-400 text-xs font-bold uppercase tracking-wider mb-1">
                  💰 Valor do Inventário
                </div>
                <div className="text-2xl font-bold text-green-300">
                  R$ {calculateInventoryValue().total.toFixed(2)}
                </div>
                <div className="text-xs text-green-400/70 mt-1">
                  {calculateInventoryValue().cardCount} cartas disponíveis • Clique para detalhes
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          
          {/* Filter Buttons */}
          {inventory.length > 0 && (
            <div className="flex gap-3">
              <GlitchButton
                onClick={() => setShowListedFilter('owned')}
                variant={showListedFilter === 'owned' ? 'primary' : 'secondary'}
                size="md"
              >
                💎 Disponíveis ({inventory.filter(c => !listedCards.includes(c.id)).length})
              </GlitchButton>
              <GlitchButton
                onClick={() => setShowListedFilter('listed')}
                variant={showListedFilter === 'listed' ? 'primary' : 'secondary'}
                size="md"
              >
                🏪 No Marketplace ({listedCards.length})
              </GlitchButton>
              <GlitchButton
                onClick={() => setShowListedFilter('all')}
                variant={showListedFilter === 'all' ? 'primary' : 'secondary'}
                size="md"
              >
                📊 Todas ({inventory.length})
              </GlitchButton>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {inventory.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border-2 border-gray-800 rounded-lg p-6 mb-6 relative overflow-hidden">
            {/* Efeito de fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/5 to-[#FF006D]/5 animate-pulse" />
            
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-[#00F0FF] text-sm font-bold mb-2 uppercase tracking-wider">
                  🔍 Buscar Carta
                </label>
                <DataStreamInput
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Digite o nome..."
                  variant="cyan"
                />
              </div>

              {/* Rarity Filter */}
              <div>
                <label className="block text-[#FF006D] text-sm font-bold mb-2 uppercase tracking-wider">
                  ✨ Raridade
                </label>
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="w-full bg-black/70 border-2 border-[#FF006D]/50 rounded-lg px-4 py-3 text-white font-semibold focus:border-[#FF006D] focus:outline-none focus:ring-2 focus:ring-[#FF006D]/30 transition-all cursor-pointer hover:border-[#FF006D]"
                >
                  <option value="all">Todas as Raridades</option>
                  <option value="legendary">👑 Legendary</option>
                  <option value="viral">⚡ Viral</option>
                  <option value="meme">😂 Meme</option>
                  <option value="trash">🗑️ Trash</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <GlitchButton
                  onClick={() => {
                    setRarityFilter('all');
                    setSearchFilter('');
                  }}
                  variant="danger"
                  size="md"
                  className="w-full"
                >
                  LIMPAR FILTROS
                </GlitchButton>
              </div>
            </div>
            
            {/* Results count */}
            {(rarityFilter !== 'all' || searchFilter) && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-gray-400 text-sm">
                  Mostrando <span className="text-[#00F0FF] font-bold">
                    {inventory.filter(card => {
                      const isListed = listedCards.includes(card.id);
                      if (showListedFilter === 'owned' && isListed) return false;
                      if (showListedFilter === 'listed' && !isListed) return false;
                      if (rarityFilter !== 'all' && card.cards_base?.rarity !== rarityFilter) return false;
                      if (searchFilter) {
                        const searchLower = searchFilter.toLowerCase();
                        const name = card.cards_base?.name?.toLowerCase() || '';
                        const displayId = card.cards_base?.display_id?.toLowerCase() || '';
                        if (!name.includes(searchLower) && !displayId.includes(searchLower)) return false;
                      }
                      return true;
                    }).length}
                  </span> de <span className="text-white font-bold">{inventory.length}</span> cartas
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recycle Bulk Button */}
        {inventory.length >= 25 && (
          <div className="mb-6">
            <GlitchButton
              onClick={() => setShowRecycleBulk(!showRecycleBulk)}
              variant="success"
              size="lg"
              className="w-full flex items-center justify-between"
            >
              <span>♻️ RECICLAR 25 CARTAS E GANHAR 1 BOOSTER</span>
              <span className="text-2xl">{showRecycleBulk ? '▼' : '▶'}</span>
            </GlitchButton>
          </div>
        )}

        {/* Recycle Bulk Component */}
        {showRecycleBulk && inventory.length >= 25 && (
          <div className="mb-8">
            <RecycleBulk 
              cards={inventory.map(c => ({
                id: c.id,
                card: c.cards_base ? {
                  name: c.cards_base.name,
                  rarity: c.cards_base.rarity,
                  image_url: c.cards_base.image_url || '/placeholder-card.png'
                } : undefined
              }))}
              onSuccess={loadInventory}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-12">Carregando cartas...</div>
        ) : inventory.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-md border-2 border-[#FF006D]/30 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">Você ainda não tem cartas</p>
            <p className="text-gray-500 mb-6">Compre pacotes de cartas para começar sua coleção!</p>
            <GlitchButton
              onClick={() => window.location.href = '/boosters'}
              variant="primary"
              size="lg"
            >
              COMPRAR PACOTES
            </GlitchButton>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventory
              .filter(card => {
                // Filtro de status (owned/listed/all)
                const isListed = listedCards.includes(card.id);
                if (showListedFilter === 'owned' && isListed) return false;
                if (showListedFilter === 'listed' && !isListed) return false;
                
                // Filtro de raridade
                if (rarityFilter !== 'all' && card.cards_base?.rarity !== rarityFilter) return false;
                
                // Filtro de pesquisa
                if (searchFilter) {
                  const searchLower = searchFilter.toLowerCase();
                  const name = card.cards_base?.name?.toLowerCase() || '';
                  const displayId = card.cards_base?.display_id?.toLowerCase() || '';
                  if (!name.includes(searchLower) && !displayId.includes(searchLower)) return false;
                }
                
                return true;
              })
              .slice(0, displayCount) // Lazy loading: show only displayCount cards
              .map((card) => {
              const baseCard = card.cards_base;
              
              // Mapear raridades do banco para o HolographicCard
              const mapRarity = (dbRarity: string): 'common' | 'rare' | 'epic' | 'legendary' | 'godmode' => {
                const mapping: Record<string, 'common' | 'rare' | 'epic' | 'legendary' | 'godmode'> = {
                  'trash': 'common',
                  'meme': 'rare',
                  'viral': 'epic',
                  'legendary': 'legendary',
                  'epica': 'legendary'
                };
                return mapping[dbRarity?.toLowerCase()] || 'common';
              };
              
              const rarityColors: Record<string, string> = {
                trash: 'text-gray-400',
                meme: 'text-blue-400',
                viral: 'text-purple-400',
                legendary: 'text-yellow-400',
                epica: 'text-red-400',
                godmode: 'text-pink-400'
              };
              
              return (
                <HolographicCard 
                  key={card.id} 
                  rarity={card.is_godmode ? 'godmode' : mapRarity(baseCard?.rarity || 'trash')}
                  className="p-4 relative"
                >
                  {/* Card Image */}
                  <div className="aspect-[2/3] bg-gray-700/50 rounded-lg mb-4 overflow-hidden relative">
                    {baseCard?.image_url ? (
                      <img 
                        src={baseCard.image_url} 
                        alt={baseCard.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🎴</span>
                      </div>
                    )}
                    {card.is_godmode && (
                      <div className="absolute top-2 right-2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold">
                        ✨ GODMODE
                      </div>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="space-y-2">
                    <h3 className="text-white font-bold truncate">{baseCard?.name || 'Carta'}</h3>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-semibold capitalize ${rarityColors[baseCard?.rarity || 'trash']}`}>
                        {baseCard?.rarity || 'common'}
                      </span>
                      <span className="text-gray-400 text-xs">{card.skin}</span>
                    </div>

                    <div className="text-xs text-gray-400">
                      <div>ID: {baseCard?.display_id}</div>
                      
                      {/* 💰 CASHBACK BADGE */}
                      {!card.prize_redeemed && card.prize_amount_brl && card.prize_amount_brl > 0 && (
                        <div className="mt-2 bg-green-500/20 border border-green-500 rounded px-2 py-1 text-green-400 font-bold text-xs flex items-center gap-1">
                          <span>💰</span>
                          <span>Cashback: R$ {card.prize_amount_brl.toFixed(4)}</span>
                        </div>
                      )}
                      
                      {/* ✅ CASHBACK RESGATADO */}
                      {card.prize_redeemed && card.prize_amount_brl && card.prize_amount_brl > 0 && (
                        <div className="mt-2 bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-gray-500 text-xs flex items-center gap-1">
                          <span>✅</span>
                          <span>Cashback resgatado</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 💰 BOTÃO DE RESGATAR CASHBACK */}
                    {!card.prize_redeemed && card.prize_amount_brl && card.prize_amount_brl > 0 && !sellingCard && !listedCards.includes(card.id) && (
                      <GlitchButton
                        onClick={() => handleRedeemCashback(card.id)}
                        variant="success"
                        size="sm"
                        className="w-full mt-2"
                      >
                        💰 RESGATAR R$ {card.prize_amount_brl.toFixed(4)}
                      </GlitchButton>
                    )}
                    
                    {sellingCard === card.id ? (
                      <div className="space-y-3 mt-4">
                        <DataStreamInput
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          label="Preço (R$)"
                          variant="amber"
                          min="0.01"
                          step="0.01"
                        />
                        <div className="flex gap-2">
                          <GlitchButton
                            onClick={() => handleSell(card.id)}
                            variant="success"
                            size="sm"
                            className="flex-1"
                          >
                            CONFIRMAR
                          </GlitchButton>
                          <GlitchButton
                            onClick={() => {
                              setSellingCard(null);
                              setSalePrice('');
                            }}
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                          >
                            CANCELAR
                          </GlitchButton>
                        </div>
                      </div>
                    ) : listedCards.includes(card.id) ? (
                      <div className="mt-4 space-y-2">
                        <div className="bg-[#FF006D]/20 border border-[#FF006D] rounded-lg p-2 text-center">
                          <p className="text-[#FF006D] text-sm font-bold">🏪 NO MARKETPLACE</p>
                        </div>
                        <GlitchButton
                          onClick={() => handleCancelListing(card.id)}
                          variant="danger"
                          size="md"
                          className="w-full"
                        >
                          ❌ CANCELAR VENDA
                        </GlitchButton>
                      </div>
                    ) : (
                      <GlitchButton
                        onClick={() => setSellingCard(card.id)}
                        variant="success"
                        size="md"
                        className="w-full mt-4"
                      >
                        💰 VENDER
                      </GlitchButton>
                    )}
                  </div>
                </HolographicCard>
              );
            })}
          </div>

          {/* Lazy Loading Indicator */}
          {(() => {
            const filteredCards = inventory.filter(card => {
              const isListed = listedCards.includes(card.id);
              if (showListedFilter === 'owned' && isListed) return false;
              if (showListedFilter === 'listed' && !isListed) return false;
              if (rarityFilter !== 'all' && card.cards_base?.rarity !== rarityFilter) return false;
              if (searchFilter) {
                const searchLower = searchFilter.toLowerCase();
                const name = card.cards_base?.name?.toLowerCase() || '';
                const displayId = card.cards_base?.display_id?.toLowerCase() || '';
                if (!name.includes(searchLower) && !displayId.includes(searchLower)) return false;
              }
              return true;
            });
            
            if (filteredCards.length > displayCount) {
              return (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">
                    Mostrando {displayCount} de {filteredCards.length} cartas
                  </p>
                  <p className="text-xs mt-2 animate-pulse">
                    ↓ Role para baixo para carregar mais
                  </p>
                </div>
              );
            }
            return null;
          })()}
          </>
        )}
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-[#00F0FF] rounded-lg p-8 max-w-md mx-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-[#FF006D]/10 animate-pulse"></div>
            <div className="relative z-10 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-[#00F0FF] mb-2">
                <TextGlitch delay={0}>LISTADO!</TextGlitch>
              </h2>
              <p className="text-gray-300">
                Sua carta foi listada no marketplace com sucesso!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Valor do Inventário */}
      {showValueModal && (() => {
        const { total, byRarity, cardCount } = calculateInventoryValue();
        const rarityOrder = ['godmode', 'legendary', 'viral', 'meme', 'trash'];
        const rarityColors: Record<string, string> = {
          godmode: 'from-purple-600 to-pink-600',
          legendary: 'from-yellow-600 to-orange-600',
          viral: 'from-cyan-600 to-blue-600',
          meme: 'from-green-600 to-emerald-600',
          trash: 'from-gray-600 to-gray-700'
        };
        const rarityIcons: Record<string, string> = {
          godmode: '👑',
          legendary: '⚡',
          viral: '🔥',
          meme: '😂',
          trash: '🗑️'
        };
        
        const sortedRarities = Object.entries(byRarity)
          .sort(([a], [b]) => rarityOrder.indexOf(a) - rarityOrder.indexOf(b));
        
        const maxValue = Math.max(...Object.values(byRarity).map(r => r.value));
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-green-500/50 rounded-lg p-8 max-w-3xl w-full mx-4 relative overflow-hidden">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 animate-pulse"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500"></div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-green-400 mb-2">
                      <TextGlitch delay={100}>💰 Valor do Inventário</TextGlitch>
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Análise detalhada da liquidez das suas cartas
                    </p>
                  </div>
                  <button
                    onClick={() => setShowValueModal(false)}
                    className="text-gray-400 hover:text-white transition text-3xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Total Value Card */}
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-lg p-6 mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-green-400 text-sm font-bold uppercase tracking-wider mb-2">
                      Valor Total Garantido
                    </div>
                    <div className="text-5xl font-bold text-green-300 mb-3">
                      R$ {total.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>📊 {cardCount} cartas</span>
                      <span>•</span>
                      <span>💵 Média: R$ {cardCount > 0 ? (total / cardCount).toFixed(2) : '0.00'} por carta</span>
                    </div>
                  </div>
                </div>

                {/* Breakdown by Rarity */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>📈</span>
                    Breakdown por Raridade
                  </h3>
                  
                  <div className="space-y-4">
                    {sortedRarities.map(([rarity, data]) => {
                      const percentage = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
                      const avgValue = data.count > 0 ? data.value / data.count : 0;
                      
                      return (
                        <div key={rarity} className="bg-black/40 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{rarityIcons[rarity] || '❓'}</span>
                              <div>
                                <div className="font-bold text-white capitalize">{rarity}</div>
                                <div className="text-xs text-gray-500">{data.count} cartas</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-400">R$ {data.value.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">Média: R$ {avgValue.toFixed(2)}</div>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${rarityColors[rarity] || 'from-gray-500 to-gray-600'} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Suggestions */}
                {(() => {
                  const trashData = byRarity['trash'];
                  const memeData = byRarity['meme'];
                  const recyclesLeft = MAX_RECYCLES - recyclesToday;
                  
                  // Sugestão de reciclagem (se tiver 25+ cartas de baixo valor E ainda puder reciclar hoje)
                  if (trashData && trashData.count >= 25 && recyclesLeft > 0) {
                    const maxRecycleCards = recyclesLeft * 25;
                    const canRecycleCards = Math.min(trashData.count, maxRecycleCards);
                    const possibleRecycles = Math.floor(canRecycleCards / 25);
                    
                    return (
                      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">♻️</span>
                          <div className="flex-1">
                            <div className="font-bold text-purple-400 mb-1">
                              Oportunidade de Reciclagem
                            </div>
                            <p className="text-sm text-gray-300 mb-2">
                              Você tem <span className="text-white font-bold">{trashData.count} cartas Trash</span>. 
                              Pode fazer <span className="text-purple-400 font-bold">{possibleRecycles}x reciclagens</span> hoje
                              {recyclesLeft < MAX_RECYCLES && <> (<span className="text-yellow-400">{recyclesToday}/{MAX_RECYCLES} já realizadas</span>)</>}
                              {recyclesLeft === MAX_RECYCLES && <> (<span className="text-green-400">limite diário completo</span>)</>}!
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-purple-500/20 px-2 py-1 rounded text-purple-300">
                                {possibleRecycles * 25} cartas → {possibleRecycles} booster{possibleRecycles > 1 ? 's' : ''} grátis
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Sugestão de venda (se tiver muitas cartas de baixo valor mas já reciclou hoje)
                  if ((trashData && trashData.count >= 10) || (memeData && memeData.count >= 15)) {
                    const totalLowValue = (trashData?.count || 0) + (memeData?.count || 0);
                    const totalLowValueBrl = (trashData?.value || 0) + (memeData?.value || 0);
                    
                    return (
                      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">💡</span>
                          <div className="flex-1">
                            <div className="font-bold text-green-400 mb-1">
                              Liquidez Disponível
                            </div>
                            <p className="text-sm text-gray-300 mb-2">
                              Você tem <span className="text-white font-bold">{totalLowValue} cartas de baixo valor</span> (Trash + Meme) 
                              valendo <span className="text-green-400 font-bold">R$ {totalLowValueBrl.toFixed(2)}</span>.
                            </p>
                            <p className="text-sm text-gray-400">
                              {recyclesLeft === 0 ? (
                                <>Você já usou todas as reciclagens hoje. <span className="text-green-300">Venda ao sistema para liquidez imediata!</span></>
                              ) : (
                                <>Venda ao sistema para liberar espaço e ganhar liquidez instantânea.</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                })()}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <GlitchButton
                    onClick={() => setShowValueModal(false)}
                    variant="secondary"
                    size="lg"
                  >
                    Fechar
                  </GlitchButton>
                  <GlitchButton
                    onClick={() => {
                      setShowValueModal(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    variant="primary"
                    size="lg"
                  >
                    💰 Vender Cartas
                  </GlitchButton>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de Sucesso da Venda */}
      {sellSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-[#00F0FF] rounded-lg p-8 max-w-md mx-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-[#FF006D]/10 animate-pulse"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00F0FF] via-[#FF006D] to-[#00F0FF]"></div>
            
            <div className="relative z-10 text-center">
              <div className="text-6xl mb-4 animate-bounce">💰</div>
              <h2 className="text-3xl font-bold text-[#00F0FF] mb-3">
                <TextGlitch delay={0}>VENDA CONCLUÍDA!</TextGlitch>
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Cartas vendidas</div>
                  <div className="text-white font-bold text-2xl">{sellSuccessData.cards_sold}x</div>
                </div>
                
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4">
                  <div className="text-green-400 text-sm mb-1">Valor recebido</div>
                  <div className="text-green-300 font-bold text-3xl font-mono">
                    R$ {sellSuccessData.total_value.toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Novo saldo</div>
                  <div className="text-[#FFC700] font-bold text-2xl font-mono">
                    R$ {sellSuccessData.new_balance.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <GlitchButton
                onClick={() => {
                  console.log('🔄 [RELOAD] Fechando modal e recarregando página...');
                  setSellSuccessData(null);
                  // Dispara evento para atualizar saldo no dashboard
                  window.dispatchEvent(new CustomEvent('balance-updated', { 
                    detail: { new_balance: sellSuccessData.new_balance } 
                  }));
                  console.log('🔄 [RELOAD] Executando window.location.reload()...');
                  // Recarrega a página para garantir sincronização completa
                  window.location.reload();
                }}
                variant="success"
                size="lg"
                className="w-full"
              >
                ✓ FECHAR
              </GlitchButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
