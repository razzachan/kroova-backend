'use client';

import { useEffect, useState } from 'react';
import TextGlitch from '@/components/Effects/TextGlitch';

export default function JackpotProgress() {
  const [communityOpened, setCommunityOpened] = useState(0);
  const [userOpened, setUserOpened] = useState(0);

  useEffect(() => {
    // Simular contador da comunidade (em produção, viria da API)
    const interval = setInterval(() => {
      setCommunityOpened(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    // Carregar boosters abertos pelo usuário
    const stored = localStorage.getItem('kroova_user_boosters_opened');
    if (stored) {
      setUserOpened(parseInt(stored));
    }

    return () => clearInterval(interval);
  }, []);

  // Pity system: a cada 50 boosters, 1 booster grátis (fidelidade)
  const PITY_THRESHOLD = 50;
  const boostersUntilMythic = PITY_THRESHOLD - (userOpened % PITY_THRESHOLD);
  const progress = ((userOpened % PITY_THRESHOLD) / PITY_THRESHOLD) * 100;
  const isClose = boostersUntilMythic <= 10;

  return (
    <div className="bg-black/60 backdrop-blur-md border-2 border-[#FF006D]/40 rounded-lg p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF006D]/10 via-transparent to-[#00F0FF]/10 pointer-events-none" />
      
      {isClose && (
        <div className="absolute inset-0 animate-pulse pointer-events-none">
          <div className="absolute inset-0 bg-[#FF006D]/5" />
        </div>
      )}

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
          <TextGlitch delay={150}>PRÓXIMA MANIFESTAÇÃO RARA</TextGlitch>
        </h3>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">🎁 3 Pacotes Grátis (a cada 50)</span>
            <span className={`text-lg font-bold ${isClose ? 'text-[#FF006D] animate-pulse' : 'text-white'}`}>
              {boostersUntilMythic} pacotes
            </span>
          </div>
          
          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-[#FF006D]/30 relative">
            <div 
              className={`h-full transition-all duration-500 ${isClose ? 'bg-gradient-to-r from-[#FF006D] to-[#00F0FF] animate-pulse' : 'bg-gradient-to-r from-[#FF006D]/60 to-[#FF006D]'}`}
              style={{ width: `${progress}%` }}
            />
            {isClose && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-lg">
                  QUASE LÁ!
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-black/40 rounded p-3 border border-[#00F0FF]/30">
            <div className="text-2xl font-bold text-[#00F0FF]">{userOpened}</div>
            <div className="text-xs text-gray-400 uppercase mt-1">Seus Pacotes</div>
          </div>
          <div className="bg-black/40 rounded p-3 border border-[#FFC700]/30">
            <div className="text-2xl font-bold text-[#FFC700]">{communityOpened.toLocaleString()}</div>
            <div className="text-xs text-gray-400 uppercase mt-1">Hoje (Global)</div>
          </div>
        </div>

        {isClose && (
          <div className="mt-4 p-3 bg-[#FF006D]/20 border border-[#FF006D] rounded animate-pulse">
            <p className="text-[#FF006D] font-semibold text-center text-sm">
              ⚡ MANIFESTAÇÃO IMINENTE - Mítico garantido em breve!
            </p>
          </div>
        )}

        <div className="mt-4 text-center">
          <a 
            href="/boosters"
            className="inline-block px-6 py-2 bg-gradient-to-r from-[#FF006D] to-[#00F0FF] text-white font-bold rounded hover:opacity-80 transition uppercase text-sm tracking-wider"
            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
          >
            ABRIR PACOTE AGORA
          </a>
        </div>
      </div>
    </div>
  );
}
