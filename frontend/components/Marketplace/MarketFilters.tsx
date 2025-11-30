// ============================================================================
// MARKET FILTERS - Component
// Filtros avançados para marketplace com estilo cyberpunk
// ============================================================================

'use client';

import { useState } from 'react';

interface Filters {
  rarity?: string;
  minPrice?: number;
  maxPrice?: number;
  edition?: string;
  sortBy?: string;
}

interface MarketFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Filters;
}

const rarities = [
  { value: '', label: 'Todas' },
  { value: 'legendary', label: '👑 Legendary' },
  { value: 'viral', label: '⚡ Viral' },
  { value: 'meme', label: '😂 Meme' },
  { value: 'trash', label: '💩 Trash' }
];

const sortOptions = [
  { value: 'price_asc', label: 'Preço: Menor' },
  { value: 'price_desc', label: 'Preço: Maior' },
  { value: 'date_desc', label: 'Mais Recentes' },
  { value: 'popular', label: 'Mais Vendidas' }
];

export function MarketFilters({ onFilterChange, initialFilters = {} }: MarketFiltersProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[#00F0FF]">⚙️</span>
          <h3 className="text-white font-bold">FILTROS</h3>
        </div>
        <button className="text-gray-400 hover:text-[#00F0FF] transition-colors">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Filtros */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Raridade */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">
                Raridade
              </label>
              <select
                value={filters.rarity || ''}
                onChange={(e) => handleChange('rarity', e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white
                         focus:border-[#00F0FF] focus:outline-none transition-colors
                         hover:border-gray-600 cursor-pointer"
              >
                {rarities.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preço Min */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">
                Preço Mínimo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="R$ 0.00"
                value={filters.minPrice || ''}
                onChange={(e) => handleChange('minPrice', parseFloat(e.target.value))}
                className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white
                         focus:border-[#00F0FF] focus:outline-none transition-colors
                         hover:border-gray-600"
              />
            </div>

            {/* Preço Max */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">
                Preço Máximo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="R$ 999.99"
                value={filters.maxPrice || ''}
                onChange={(e) => handleChange('maxPrice', parseFloat(e.target.value))}
                className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white
                         focus:border-[#00F0FF] focus:outline-none transition-colors
                         hover:border-gray-600"
              />
            </div>

            {/* Ordenar Por */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">
                Ordenar Por
              </label>
              <select
                value={filters.sortBy || 'date_desc'}
                onChange={(e) => handleChange('sortBy', e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white
                         focus:border-[#00F0FF] focus:outline-none transition-colors
                         hover:border-gray-600 cursor-pointer"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão Reset */}
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700
                       rounded text-sm text-gray-300 hover:text-white transition-all
                       hover:border-[#FF006D]"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
