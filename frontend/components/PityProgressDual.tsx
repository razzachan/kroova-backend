'use client';

interface PityProgressDualProps {
  legendary: {
    current: number;
    max: number;
  };
  godmode: {
    current: number;
    max: number;
  };
}

export function PityProgressDual({ legendary, godmode }: PityProgressDualProps) {
  const legendaryPct = Math.min((legendary.current / legendary.max) * 100, 100);
  const godmodePct = Math.min((godmode.current / godmode.max) * 100, 100);
  
  const remainingLegendary = Math.max(legendary.max - legendary.current, 0);
  const remainingGodmode = Math.max(godmode.max - godmode.current, 0);

  // Legendary (0-20): purple/pink gradient
  const getLegendaryGlow = () => {
    if (legendaryPct >= 100) return 'shadow-[0_0_30px_rgba(168,85,247,1)]';
    if (legendaryPct >= 75) return 'shadow-[0_0_20px_rgba(168,85,247,0.7)]';
    if (legendaryPct >= 50) return 'shadow-[0_0_15px_rgba(168,85,247,0.5)]';
    if (legendaryPct >= 25) return 'shadow-[0_0_10px_rgba(168,85,247,0.3)]';
    return '';
  };

  // Godmode (0-150): rainbow gradient intensifying
  const getGodmodeGlow = () => {
    if (godmodePct >= 100) return 'shadow-[0_0_40px_rgba(251,191,36,1)]';
    if (godmodePct >= 75) return 'shadow-[0_0_30px_rgba(251,191,36,0.8)]';
    if (godmodePct >= 50) return 'shadow-[0_0_20px_rgba(251,191,36,0.6)]';
    if (godmodePct >= 25) return 'shadow-[0_0_15px_rgba(251,191,36,0.4)]';
    return '';
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 space-y-6">
      
      {/* LEGENDARY BAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <div>
              <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                LEGENDARY PITY
              </div>
              <div className="text-xs text-gray-400">
                Próxima garantida em <strong className="text-purple-300">{remainingLegendary}</strong> {remainingLegendary === 1 ? 'pack' : 'packs'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-purple-400">
              {legendary.current}/{legendary.max}
            </div>
            <div className="text-xs text-gray-500">
              {legendaryPct.toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 ${getLegendaryGlow()}`}
            style={{ width: `${legendaryPct}%` }}
          >
            {legendaryPct >= 100 && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white to-transparent opacity-40" />
            )}
            {legendaryPct >= 75 && legendaryPct < 100 && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-20" />
            )}
          </div>
        </div>

        {legendaryPct >= 100 && (
          <div className="text-center">
            <span className="text-purple-400 font-bold text-sm animate-pulse">
              ⚡ PRÓXIMO PACK GARANTE LEGENDARY! ⚡
            </span>
          </div>
        )}
      </div>

      {/* GODMODE BAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <div>
              <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
                GODMODE PITY
              </div>
              <div className="text-xs text-gray-400">
                Próxima garantida em <strong className="text-yellow-300">{remainingGodmode}</strong> {remainingGodmode === 1 ? 'pack' : 'packs'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-yellow-400">
              {godmode.current}/{godmode.max}
            </div>
            <div className="text-xs text-gray-500">
              {godmodePct.toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 ${getGodmodeGlow()}`}
            style={{ width: `${godmodePct}%` }}
          >
            {godmodePct >= 100 && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
            )}
            {godmodePct >= 75 && godmodePct < 100 && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-25" />
            )}
          </div>
        </div>

        {godmodePct >= 100 && (
          <div className="text-center">
            <span className="text-yellow-400 font-bold text-sm animate-pulse">
              🔥 PRÓXIMO PACK GARANTE GODMODE! 🔥
            </span>
          </div>
        )}
      </div>

      {/* Average Progress Indicator */}
      <div className="pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Progresso Geral</span>
          <span className="font-mono">
            {((legendaryPct + godmodePct) / 2).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
