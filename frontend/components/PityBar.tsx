'use client';

interface PityBarProps {
  current: number;
  max: number;
  edition?: string;
}

export function PityBar({ current, max, edition = 'ED01' }: PityBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const remaining = Math.max(max - current, 0);
  
  // Color based on progress
  const getColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 81) return 'bg-orange-500';
    if (percentage >= 51) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getGlow = () => {
    if (percentage >= 100) return 'shadow-[0_0_20px_rgba(239,68,68,0.8)]';
    if (percentage >= 81) return 'shadow-[0_0_15px_rgba(249,115,22,0.6)]';
    if (percentage >= 51) return 'shadow-[0_0_10px_rgba(234,179,8,0.4)]';
    return '';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-300">
          {percentage >= 100 ? (
            <span className="text-red-400 animate-pulse">💎 CARTA DE ALTO VALOR GARANTIDA!</span>
          ) : (
            <span>⏳ Progressão de Garantia</span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {current}/{max}
        </div>
      </div>

      <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-500 ${getColor()} ${getGlow()}`}
          style={{ width: `${percentage}%` }}
        >
          {percentage >= 100 && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        {percentage >= 100 ? (
          <span className="text-red-300 font-semibold">
            Seu próximo booster terá uma carta de alto valor garantida!
          </span>
        ) : (
          <span>
            Próxima carta de alto valor garantida em <strong className="text-white">{remaining}</strong> boosters
          </span>
        )}
      </div>
    </div>
  );
}
