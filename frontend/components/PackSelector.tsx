'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface BoosterTier {
  id: string;
  name: string;
  pack_id: string;
  price_brl: number;
  godmode_chance: number;
  legendary_chance: number;
  price_multiplier: number;
  rarity_distribution: Record<string, number>;
}

interface PackData {
  pack_id: string;
  pack_name: string;
  description: string;
  theme: string;
  image: string;
  tiers: BoosterTier[];
}

interface PackSelectorProps {
  packs: PackData[];
  selectedPackId: string | null;
  selectedTier: BoosterTier | null;
  onSelectPack: (packId: string) => void;
  onSelectTier: (tier: BoosterTier) => void;
  onPurchase: (tier: BoosterTier) => void;
}

const TIER_COLORS = {
  'Básico': 'from-gray-600 to-gray-800',
  'Padrão': 'from-blue-600 to-blue-800',
  'Premium': 'from-purple-600 to-purple-800',
  'Elite': 'from-yellow-500 to-orange-600',
  'Whale': 'from-pink-500 to-red-600'
};

const TIER_GLOW = {
  'Básico': 'shadow-gray-500/50',
  'Padrão': 'shadow-blue-500/50',
  'Premium': 'shadow-purple-500/50',
  'Elite': 'shadow-yellow-500/50',
  'Whale': 'shadow-pink-500/50'
};

export function PackSelector({
  packs,
  selectedPackId,
  selectedTier,
  onSelectPack,
  onSelectTier,
  onPurchase
}: PackSelectorProps) {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const selectedPack = packs.find(p => p.pack_id === selectedPackId);

  return (
    <div className="w-full space-y-8">
      {/* Pack Selection */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#FF006D] to-[#00F0FF] bg-clip-text text-transparent">
          ESCOLHA SEU PACK
        </h2>
        <p className="text-gray-400">Cada pack possui cartas exclusivas e temática única</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {packs.map((pack) => (
          <motion.div
            key={pack.pack_id}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectPack(pack.pack_id)}
            className={`
              relative cursor-pointer rounded-xl overflow-hidden
              border-2 transition-all duration-300
              ${selectedPackId === pack.pack_id 
                ? 'border-[#FF006D] shadow-lg shadow-[#FF006D]/50' 
                : 'border-gray-700 hover:border-[#00F0FF]'}
            `}
          >
            {/* Pack Image */}
            <div className="relative h-64 bg-gradient-to-b from-gray-800 to-gray-900">
              <Image
                src={pack.image}
                alt={pack.pack_name}
                fill
                className="object-contain p-4"
              />
              {selectedPackId === pack.pack_id && (
                <div className="absolute top-2 right-2 bg-[#FF006D] text-white px-3 py-1 rounded-full text-sm font-bold">
                  SELECIONADO
                </div>
              )}
            </div>

            {/* Pack Info */}
            <div className="p-4 bg-gray-900">
              <h3 className="text-xl font-bold mb-1">{pack.pack_name}</h3>
              <p className="text-sm text-gray-400 mb-2">{pack.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-gray-800 rounded">
                  🎨 {pack.theme}
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded">
                  🃏 {pack.tiers.length} Tiers
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tier Selection */}
      <AnimatePresence mode="wait">
        {selectedPack && (
          <motion.div
            key={selectedPack.pack_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">
                ESCOLHA SEU TIER - {selectedPack.pack_name}
              </h3>
              <p className="text-gray-400">
                Tiers mais altos = Maior chance de cartas raras + Jackpots maiores
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {selectedPack.tiers.map((tier) => {
                const tierName = tier.name.split(' ')[0]; // 'Básico', 'Padrão', etc
                const isSelected = selectedTier?.id === tier.id;
                const isHovered = hoveredTier === tier.id;

                return (
                  <motion.div
                    key={tier.id}
                    onHoverStart={() => setHoveredTier(tier.id)}
                    onHoverEnd={() => setHoveredTier(null)}
                    onClick={() => onSelectTier(tier)}
                    className="relative"
                  >
                    <div
                      className={`
                        relative p-4 rounded-xl cursor-pointer
                        bg-gradient-to-br ${TIER_COLORS[tierName as keyof typeof TIER_COLORS] || 'from-gray-700 to-gray-900'}
                        border-2 transition-all duration-300
                        ${isSelected 
                          ? `border-white shadow-2xl ${TIER_GLOW[tierName as keyof typeof TIER_GLOW]}` 
                          : 'border-transparent hover:border-gray-500'}
                        ${isHovered ? 'scale-105' : ''}
                      `}
                    >
                      {/* Tier Badge */}
                      <div className="text-center mb-3">
                        <div className="text-lg font-bold mb-1">{tierName}</div>
                        <div className="text-2xl font-black">
                          R$ {tier.price_brl.toFixed(2)}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Godmode:</span>
                          <span className="font-bold text-pink-400">
                            {tier.godmode_chance.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Legendary:</span>
                          <span className="font-bold text-yellow-400">
                            {tier.legendary_chance.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Mult:</span>
                          <span className="font-bold text-cyan-400">
                            {tier.price_multiplier}x
                          </span>
                        </div>
                      </div>

                      {/* Jackpot Indicator */}
                      {tier.price_multiplier >= 10 && (
                        <div className="mt-3 text-center">
                          <div className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded text-xs font-bold">
                            🎰 JACKPOT 500x
                          </div>
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-white text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Purchase Button */}
                    {isSelected && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPurchase(tier);
                        }}
                        className="w-full mt-2 py-3 bg-gradient-to-r from-[#FF006D] to-[#00F0FF] 
                                   rounded-lg font-bold text-white hover:scale-105 transition-transform"
                      >
                        COMPRAR AGORA
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
