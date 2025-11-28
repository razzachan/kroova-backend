'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';

interface JackpotReveal {
  amount_brl: number;
  created_at: string;
  user_mask: string;
}

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
      setReveals(data?.items || []);
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

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">🔥 Revelações Recentes</h3>
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (reveals.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">🔥 Revelações Recentes</h3>
        <p className="text-sm text-gray-400">Nenhuma revelação de alto valor ainda. Seja o primeiro!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">🔥 Revelações Recentes</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Ao vivo" />
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {reveals.map((reveal, idx) => (
          <div
            key={`${reveal.created_at}-${idx}`}
            className="flex items-center justify-between p-2 bg-gray-700/50 rounded hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                {reveal.user_mask.slice(2, 4).toUpperCase()}
              </div>
              <div className="text-sm">
                <div className="text-gray-300">
                  <span className="font-mono text-gray-400">{reveal.user_mask}</span>
                  <span className="text-gray-500 mx-1">•</span>
                  <span className="text-gray-500">{formatTimeAgo(reveal.created_at)}</span>
                </div>
                <div className="text-green-400 font-semibold">
                  +R$ {reveal.amount_brl.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              💎
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
