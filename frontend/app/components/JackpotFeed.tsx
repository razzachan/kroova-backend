'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface JackpotWin {
  jackpot_id: string;
  box_name: string;
  box_tier: string;
  prize_amount_brl: number;
  masked_email: string;
  created_at: string;
}

export default function JackpotFeed() {
  const [jackpots, setJackpots] = useState<JackpotWin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJackpots();
    
    // Auto-refresh a cada 10 segundos
    const interval = setInterval(loadJackpots, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadJackpots = async () => {
    try {
      const supabase = createClient(supabaseUrl, anonKey);
      
      const { data, error } = await supabase
        .from('recent_mystery_jackpots')
        .select('*')
        .limit(10);

      if (error) throw error;
      
      setJackpots(data || []);
    } catch (error) {
      console.error('Erro ao carregar jackpots:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2',
      diamond: '#b9f2ff',
    };
    return colors[tier] || '#94a3b8';
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
          🎰 <span className="glitch-text">JACKPOTS RECENTES</span>
        </h3>
        <div className="text-center text-gray-500 py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
        🎰 <span className="glitch-text">JACKPOTS RECENTES</span>
      </h3>

      {jackpots.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">🎲</div>
          <p className="text-sm">Nenhum jackpot ainda...</p>
          <p className="text-xs mt-1">Seja o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-gray-800">
          {jackpots.map((jackpot) => (
            <div
              key={jackpot.jackpot_id}
              className="bg-black/40 border rounded-lg p-3 animate-fade-in hover:scale-[1.02] transition-transform"
              style={{
                borderColor: getTierColor(jackpot.box_tier),
                boxShadow: `0 0 10px ${getTierColor(jackpot.box_tier)}40`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div 
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ color: getTierColor(jackpot.box_tier) }}
                  >
                    {jackpot.box_tier} BOX
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {jackpot.masked_email}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {getTimeAgo(jackpot.created_at)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-yellow-400 animate-pulse">
                  R$ {jackpot.prize_amount_brl.toFixed(2)}
                </div>
                <div className="text-xs text-yellow-400 font-bold">
                  30x 🎉
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .glitch-text {
          animation: glitch-small 2s infinite;
        }

        @keyframes glitch-small {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-1px, 1px); }
          40% { transform: translate(-1px, -1px); }
          60% { transform: translate(1px, 1px); }
          80% { transform: translate(1px, -1px); }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thumb-cyan-500::-webkit-scrollbar-thumb {
          background-color: #06b6d4;
          border-radius: 3px;
        }

        .scrollbar-track-gray-800::-webkit-scrollbar-track {
          background-color: #1f2937;
        }
      `}</style>
    </div>
  );
}
