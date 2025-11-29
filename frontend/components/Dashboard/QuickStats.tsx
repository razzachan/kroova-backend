'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import TextGlitch from '@/components/Effects/TextGlitch';

interface QuickStatsData {
  highestRarity: { name: string; rarity: string; image?: string } | null;
  lastOpened: string | null;
  ranking: number;
  inventoryValue: number;
}

const RARITY_COLORS: Record<string, string> = {
  'COMUM': '#9CA3AF',
  'RARA': '#3B82F6',
  'ÉPICA': '#A855F7',
  'LENDÁRIA': '#F59E0B',
  'MÍTICA': '#FF006D'
};

export default function QuickStats() {
  const [stats, setStats] = useState<QuickStatsData>({
    highestRarity: null,
    lastOpened: null,
    ranking: 0,
    inventoryValue: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [inventoryRes, walletRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/wallet')
      ]);

      const inv = unwrap<{ cards?: any[]; inventory?: any[] }>(inventoryRes);
      const wallet = unwrap<{ balance_brl: number }>(walletRes);
      
      const cardsArr = (inv.cards ?? inv.inventory) || [];

      // Encontrar carta de maior raridade
      const rarityOrder = ['MÍTICA', 'LENDÁRIA', 'ÉPICA', 'RARA', 'COMUM'];
      let highestCard = null;
      for (const rarity of rarityOrder) {
        const found = cardsArr.find((c: any) => c.rarity === rarity);
        if (found) {
          highestCard = {
            name: found.name || 'Carta Desconhecida',
            rarity: found.rarity,
            image: found.image_url
          };
          break;
        }
      }

      // Última abertura (mock - em produção viria do histórico)
      const lastOpened = localStorage.getItem('kroova_last_booster_open');

      // Ranking mock (em produção viria da API)
      const ranking = Math.floor(Math.random() * 5000) + 500;

      // Valor do inventário (soma das cartas)
      const totalValue = cardsArr.reduce((sum: number, card: any) => {
        return sum + (card.market_value_brl || 0);
      }, 0);

      setStats({
        highestRarity: highestCard,
        lastOpened: lastOpened,
        ranking: ranking,
        inventoryValue: totalValue
      });
    } catch (error) {
      console.error('Erro ao carregar quick stats:', error);
    }
  };

  const formatTimeAgo = (dateStr: string): string => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins}min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${diffDays}d`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Highest Rarity Card */}
      <div className="bg-black/60 backdrop-blur-md border-2 border-[#FF006D]/40 rounded-lg p-4 relative overflow-hidden group hover:border-[#FF006D]/60 transition">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF006D]/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Manifestação Mais Rara</div>
          {stats.highestRarity ? (
            <>
              <div className="text-lg font-bold text-white mb-1">{stats.highestRarity.name}</div>
              <span 
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{
                  backgroundColor: `${RARITY_COLORS[stats.highestRarity.rarity]}20`,
                  color: RARITY_COLORS[stats.highestRarity.rarity],
                  border: `1px solid ${RARITY_COLORS[stats.highestRarity.rarity]}`
                }}
              >
                {stats.highestRarity.rarity}
              </span>
            </>
          ) : (
            <div className="text-gray-500">Abra seu primeiro pacote</div>
          )}
        </div>
      </div>

      {/* Last Opened */}
      <div className="bg-black/60 backdrop-blur-md border-2 border-[#00F0FF]/40 rounded-lg p-4 relative overflow-hidden group hover:border-[#00F0FF]/60 transition">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Última Abertura</div>
          {stats.lastOpened ? (
            <div className="text-lg font-bold text-[#00F0FF]">{formatTimeAgo(stats.lastOpened)}</div>
          ) : (
            <div className="text-gray-500">Nenhuma abertura ainda</div>
          )}
          <div className="text-xs text-gray-500 mt-1">Abra mais para subir no ranking</div>
        </div>
      </div>

      {/* Ranking */}
      <div className="bg-black/60 backdrop-blur-md border-2 border-[#FFC700]/40 rounded-lg p-4 relative overflow-hidden group hover:border-[#FFC700]/60 transition">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFC700]/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Posição Global</div>
          <div className="text-2xl font-bold text-[#FFC700]">
            #{stats.ranking > 0 ? stats.ranking.toLocaleString() : '???'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Entre {(stats.ranking + 5000).toLocaleString()} jogadores</div>
        </div>
      </div>

      {/* Inventory Value */}
      <div className="bg-black/60 backdrop-blur-md border-2 border-[#00F0FF]/40 rounded-lg p-4 relative overflow-hidden group hover:border-[#00F0FF]/60 transition">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/10 via-transparent to-[#FF006D]/10 pointer-events-none" />
        <div className="relative z-10">
          <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Valor do Inventário</div>
          <div className="text-2xl font-bold text-white">
            R$ {stats.inventoryValue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.inventoryValue > 0 ? (
              <span className="text-green-400">↗ Crescendo</span>
            ) : (
              <span>Comece a colecionar</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
