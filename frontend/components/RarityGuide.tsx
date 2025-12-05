'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface RarityGuideProps {
  autoShow?: boolean;
}

export function RarityGuide({ autoShow = false }: RarityGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(true);

  useEffect(() => {
    // Verificar se já viu o guia
    const seen = localStorage.getItem('kroova_seen_rarity_guide');
    setHasSeenGuide(!!seen);

    // Mostrar automaticamente na primeira visita
    if (!seen && autoShow) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, [autoShow]);

  const handleClose = () => {
    setIsOpen(false);
    if (!hasSeenGuide) {
      localStorage.setItem('kroova_seen_rarity_guide', 'true');
      setHasSeenGuide(true);
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-24 right-6 z-40 bg-gradient-to-r from-[#FF006D] to-[#00F0FF] p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 group"
        title="Ver guia de raridades"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="absolute -bottom-8 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Guia de Raridades
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-[#1a0033] to-[#0d001a] border-2 border-[#FF006D] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#FF006D] to-[#00F0FF] p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Guia de Raridades & Skins
              </h2>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Raridades */}
              <div>
                <h3 className="text-xl font-bold text-[#00F0FF] mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  RARIDADES
                </h3>
                <div className="space-y-3">
                  <RarityRow
                    emoji="🗑️"
                    name="TRASH"
                    value="R$ 0.01 - 0.05"
                    color="text-gray-400"
                    description="Comum em todos os pacotes"
                  />
                  <RarityRow
                    emoji="😎"
                    name="MEME"
                    value="R$ 0.05 - 0.30"
                    color="text-green-400"
                    description="Mais frequente em tiers médios"
                  />
                  <RarityRow
                    emoji="🔥"
                    name="VIRAL"
                    value="R$ 0.20 - 1.50"
                    color="text-blue-400"
                    description="Raro, bom valor de revenda"
                  />
                  <RarityRow
                    emoji="⭐"
                    name="LEGENDARY"
                    value="R$ 1.00 - 10.00"
                    color="text-yellow-400"
                    description="Muito raro, alto valor"
                  />
                  <RarityRow
                    emoji="👑"
                    name="GODMODE"
                    value="R$ 50.00 - 100.00"
                    color="text-purple-400"
                    description="Jackpot! Ultra raro (0.1-0.5%)"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#FF006D]/30"></div>

              {/* Skins */}
              <div>
                <h3 className="text-xl font-bold text-[#FF006D] mb-4 flex items-center gap-2">
                  <span className="text-2xl">💎</span>
                  TIPOS DE SKIN
                  <span className="text-sm font-normal text-gray-400">(Multiplicador de Valor)</span>
                </h3>
                <div className="space-y-3">
                  <SkinRow
                    emoji="📄"
                    name="DEFAULT"
                    multiplier="x1.0"
                    color="text-gray-300"
                  />
                  <SkinRow
                    emoji="✨"
                    name="PREMIUM"
                    multiplier="x1.5"
                    color="text-cyan-400"
                  />
                  <SkinRow
                    emoji="🌈"
                    name="HOLO"
                    multiplier="x2.5"
                    color="text-pink-400"
                  />
                  <SkinRow
                    emoji="👻"
                    name="GHOST"
                    multiplier="x3.0"
                    color="text-indigo-400"
                  />
                  <SkinRow
                    emoji="🌑"
                    name="DARK"
                    multiplier="x4.0"
                    color="text-red-400"
                  />
                  <SkinRow
                    emoji="💫"
                    name="GLITCH"
                    multiplier="x6.0"
                    color="text-purple-400"
                  />
                </div>
              </div>

              {/* Dica */}
              <div className="bg-gradient-to-r from-[#FF006D]/20 to-[#00F0FF]/20 border border-[#00F0FF]/30 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  <span className="font-bold text-[#00F0FF]">💡 DICA:</span> Uma carta{' '}
                  <span className="text-yellow-400 font-bold">LEGENDARY</span> com skin{' '}
                  <span className="text-purple-400 font-bold">GLITCH</span> pode valer até{' '}
                  <span className="text-green-400 font-bold">R$ 60,00</span>! (R$ 10 × 6.0)
                </p>
              </div>

              {/* Checkbox "Não mostrar novamente" */}
              {!hasSeenGuide && (
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    onChange={(e) => {
                      if (e.target.checked) {
                        localStorage.setItem('kroova_seen_rarity_guide', 'true');
                        setHasSeenGuide(true);
                      }
                    }}
                  />
                  Não mostrar automaticamente novamente
                </label>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-[#FF006D]/10 to-[#00F0FF]/10 p-4 border-t border-[#FF006D]/30">
              <button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-[#FF006D] to-[#00F0FF] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                Entendi! Vamos abrir pacotes 🎯
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RarityRow({
  emoji,
  name,
  value,
  color,
  description,
}: {
  emoji: string;
  name: string;
  value: string;
  color: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between bg-black/40 rounded-lg p-3 hover:bg-black/60 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className={`font-bold ${color}`}>{name}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <span className="text-green-400 font-mono font-bold">{value}</span>
    </div>
  );
}

function SkinRow({
  emoji,
  name,
  multiplier,
  color,
}: {
  emoji: string;
  name: string;
  multiplier: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between bg-black/40 rounded-lg p-3 hover:bg-black/60 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <p className={`font-bold ${color}`}>{name}</p>
      </div>
      <span className="text-[#00F0FF] font-mono font-bold text-lg">{multiplier}</span>
    </div>
  );
}
