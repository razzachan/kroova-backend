'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import TextGlitch from '@/components/Effects/TextGlitch';

interface JackpotReveal {
  amount_brl: number;
  created_at: string;
  user_mask: string;
  card_name?: string;
  rarity?: 'COMUM' | 'RARA' | 'ÉPICA' | 'LENDÁRIA' | 'MÍTICA';
  card_id?: string;
}

const RARITY_COLORS = {
  'COMUM': '#9CA3AF',
  'RARA': '#3B82F6',
  'ÉPICA': '#A855F7',
  'LENDÁRIA': '#F59E0B',
  'MÍTICA': '#FF006D'
};

export function LiveFeed() {
  const [reveals, setReveals] = useState<JackpotReveal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReveals();
    // Atualiza a cada 10 segundos
    const interval = setInterval(loadReveals, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadReveals() {
    try {
      const res = await api.get('/jackpots/recent?limit=10');
      const data = unwrap<{ items: JackpotReveal[] }>(res);
      
      // Se não tiver dados reais, simular para demo
      if (!data?.items || data.items.length === 0) {
        const mockReveals: JackpotReveal[] = [
          { amount_brl: 250, created_at: new Date(Date.now() - 120000).toISOString(), user_mask: 'user_42****', card_name: 'Consumo Dopamínico', rarity: 'ÉPICA', card_id: '1' },
          { amount_brl: 50, created_at: new Date(Date.now() - 300000).toISOString(), user_mask: 'user_13****', card_name: 'Glitch Temporal', rarity: 'RARA', card_id: '2' },
          { amount_brl: 1200, created_at: new Date(Date.now() - 600000).toISOString(), user_mask: 'user_88****', card_name: 'Manifestação Primordial', rarity: 'MÍTICA', card_id: '3' },
          { amount_brl: 30, created_at: new Date(Date.now() - 900000).toISOString(), user_mask: 'user_27****', card_name: 'Código Corrupto', rarity: 'COMUM', card_id: '4' },
          { amount_brl: 400, created_at: new Date(Date.now() - 1200000).toISOString(), user_mask: 'user_56****', card_name: 'Vazamento da Interface', rarity: 'LENDÁRIA', card_id: '5' },
        ];
        setReveals(mockReveals);
      } else {
        setReveals(data.items);
      }
      
      // Som sutil para manifestações raras (se tiver mítica/lendária recente)
      const hasRareRecent = data?.items?.some(r => 
        ['MÍTICA', 'LENDÁRIA'].includes(r.rarity || '') && 
        new Date(r.created_at).getTime() > Date.now() - 60000
      );
      
      if (hasRareRecent && typeof window !== 'undefined' && (window as any).Howl) {
        const sound = new (window as any).Howl({
          src: ['/sfx/rare_reveal.mp3'],
          volume: 0.15
        });
        sound.play();
      }
    } catch (error) {
      console.error('Erro ao carregar revelações:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatTimeAgo(dateStr: string): string {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  }

  function maskUsername(mask: string): string {
    // Converter user_42**** para u**_42****
    if (mask.startsWith('user_')) {
      const parts = mask.split('_');
      return `u**_${parts[1]}`;
    }
    return mask;
  }

  if (loading) {
    return (
      <div className="bg-black/60 backdrop-blur-md border-2 border-[#00F0FF]/40 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
          <TextGlitch delay={200}>MANIFESTAÇÕES RECENTES</TextGlitch>
        </h3>
        <p className="text-sm text-gray-400">Detectando vazamentos da Interface...</p>
      </div>
    );
  }

  return (
    <div className="bg-black/60 backdrop-blur-md border-2 border-[#00F0FF]/40 rounded-lg p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/5 via-transparent to-[#FF006D]/5 pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
          <TextGlitch delay={200}>🔥 MANIFESTAÇÕES RECENTES</TextGlitch>
        </h3>

        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {reveals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Nenhuma manifestação detectada ainda...</p>
          ) : (
            reveals.map((reveal, idx) => {
              const rarityColor = RARITY_COLORS[reveal.rarity || 'COMUM'];
              const isRare = ['MÍTICA', 'LENDÁRIA', 'ÉPICA'].includes(reveal.rarity || '');
              
              return (
                <div
                  key={`${reveal.user_mask}-${idx}`}
                  className={`p-3 rounded border transition-all hover:scale-[1.02] ${
                    isRare 
                      ? 'bg-gradient-to-r from-black/80 to-black/60 border-[' + rarityColor + '] animate-pulse' 
                      : 'bg-black/40 border-gray-700'
                  }`}
                  style={isRare ? { borderColor: rarityColor, boxShadow: `0 0 15px ${rarityColor}40` } : {}}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono text-gray-400">
                      {maskUsername(reveal.user_mask)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(reveal.created_at)}
                    </span>
                  </div>
                  
                  {reveal.card_name && (
                    <div className="mb-2">
                      <a 
                        href={reveal.card_id ? `/marketplace?card=${reveal.card_id}` : '/marketplace'}
                        className="text-white font-semibold hover:underline"
                        style={{ color: rarityColor }}
                      >
                        {reveal.card_name}
                      </a>
                      {reveal.rarity && (
                        <span 
                          className="ml-2 text-xs px-2 py-0.5 rounded font-bold uppercase"
                          style={{ 
                            backgroundColor: `${rarityColor}20`,
                            color: rarityColor,
                            border: `1px solid ${rarityColor}`
                          }}
                        >
                          {reveal.rarity}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#FFC700] font-bold text-sm">
                      R$ {reveal.amount_brl.toFixed(2)}
                    </span>
                    {isRare && (
                      <span className="text-xs text-[#FF006D] font-semibold animate-pulse">
                        ⚡ MANIFESTAÇÃO RARA
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 240, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 240, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
