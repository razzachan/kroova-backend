'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import GlitchButton from '@/components/UI/GlitchButton';

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
      {/* Botão Flutuante com Glitch Style */}
      <div className="fixed top-28 right-6 z-40">
        <GlitchButton
          onClick={() => setIsOpen(true)}
          variant="primary"
          size="md"
          className="!w-12 !h-12 !p-0 shadow-lg hover:shadow-xl"
          aria-label="Guia de Raridades"
        >
          <span className="text-xl">ℹ️</span>
        </GlitchButton>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pt-24">
          <div className="bg-[#0a0a0f] border-2 border-[#FF006D] rounded-lg max-w-2xl w-full max-h-[calc(100vh-8rem)] overflow-y-auto shadow-2xl shadow-[#FF006D]/20">
            {/* Header */}
            <div className="sticky top-0 bg-[#0a0a0f] border-b-2 border-[#FF006D] p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#FF006D] flex items-center gap-2">
                <span className="text-2xl">ℹ️</span>
                Guia de Raridades & Skins
              </h2>
              <GlitchButton
                onClick={handleClose}
                variant="secondary"
                size="sm"
                className="!w-10 !h-10 !p-0"
              >
                <X className="w-5 h-5" />
              </GlitchButton>
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
                    description="Comum em todos os pacotes"
                    color="text-gray-400"
                  />
                  <RarityRow
                    emoji="😎"
                    name="MEME"
                    description="Mais frequente em tiers médios"
                    color="text-green-400"
                  />
                  <RarityRow
                    emoji="🔥"
                    name="VIRAL"
                    description="Raro, bom valor de revenda"
                    color="text-blue-400"
                  />
                  <RarityRow
                    emoji="⭐"
                    name="LEGENDARY"
                    description="Muito raro, alto valor"
                    color="text-yellow-400"
                  />
                  <RarityRow
                    emoji="👑"
                    name="GODMODE"
                    description="Jackpot! Ultra raro (0.1-0.5%)"
                    color="text-purple-400"
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
                  <span className="text-sm font-normal text-gray-400">(Visual)</span>
                </h3>
                <div className="space-y-3">
                  <SkinRow
                    emoji="📄"
                    name="DEFAULT"
                    color="text-gray-300"
                    description="Aparência padrão"
                  />
                  <SkinRow
                    emoji="✨"
                    name="PREMIUM"
                    color="text-cyan-400"
                    description="Variante especial"
                  />
                  <SkinRow
                    emoji="🌈"
                    name="HOLO"
                    color="text-pink-400"
                    description="Efeito holográfico"
                  />
                  <SkinRow
                    emoji="👻"
                    name="GHOST"
                    color="text-indigo-400"
                    description="Estilo fantasmagórico"
                  />
                  <SkinRow
                    emoji="🌑"
                    name="DARK"
                    color="text-red-400"
                    description="Versão sombria"
                  />
                  <SkinRow
                    emoji="💫"
                    name="GLITCH"
                    color="text-purple-400"
                    description="Efeito glitch raro"
                  />
                </div>
              </div>

              {/* Dicas */}
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-[#FF006D]/20 to-[#00F0FF]/20 border border-[#00F0FF]/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    <span className="font-bold text-[#00F0FF]">💡 RECICLAGEM:</span> Recicle cartas para ganhar{' '}
                    <span className="text-purple-400 font-bold">pontos</span> e trocar por{' '}
                    <span className="text-yellow-400 font-bold">boosters grátis</span>! Pontos variam por raridade:{' '}
                    <span className="text-gray-400">Trash</span> = 1pt,{' '}
                    <span className="text-green-400">Meme</span> = 2pts,{' '}
                    <span className="text-blue-400">Viral</span> = 5pts,{' '}
                    <span className="text-yellow-400">Legendary</span> = 10pts,{' '}
                    <span className="text-purple-400">Godmode</span> = 20pts.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    <span className="font-bold text-green-400">💰 CASHBACK:</span> Toda carta ganha{' '}
                    <span className="text-green-400 font-bold">cashback resgatável</span> baseado no prêmio do pacote.{' '}
                    Resgate no inventário para adicionar ao seu saldo!
                  </p>
                </div>
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
            <div className="sticky bottom-0 bg-[#0a0a0f]/90 backdrop-blur-sm p-4 border-t border-[#FF006D]/30">
              <GlitchButton
                onClick={handleClose}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Entendi! Vamos abrir pacotes 🎯
              </GlitchButton>
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
  color,
  description,
}: {
  emoji: string;
  name: string;
  color: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-3 hover:bg-black/60 transition-colors">
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <p className={`font-bold ${color}`}>{name}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function SkinRow({
  emoji,
  name,
  color,
  description,
}: {
  emoji: string;
  name: string;
  color: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-3 hover:bg-black/60 transition-colors">
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <p className={`font-bold ${color}`}>{name}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  );
}
