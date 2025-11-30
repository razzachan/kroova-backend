// ============================================================================
// PRICE CHART - Component
// Gráfico de linha para histórico de preços com estilo cyberpunk
// ============================================================================

'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PricePoint {
  date: string;
  avg_price?: number;
  price?: number; // Aceita ambos
  min_price?: number;
  max_price?: number;
  volume?: number;
}

interface PriceChartProps {
  data: PricePoint[];
  height?: number;
  showVolume?: boolean;
}

export function PriceChart({ data, height = 300, showVolume = false }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-900/30 rounded-lg border border-gray-800"
        style={{ height }}
      >
        <p className="text-gray-500">Sem dados de preço disponíveis</p>
      </div>
    );
  }

  // Normalizar dados (aceita avg_price ou price)
  const normalizedData = data.map(point => ({
    ...point,
    price: point.avg_price || point.price || 0
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-black/95 border border-[#00F0FF] rounded-lg p-3 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
        <p className="text-xs text-gray-400 mb-2">
          {format(new Date(data.date), 'dd MMM yyyy', { locale: ptBR })}
        </p>
        <p className="text-[#00F0FF] font-bold text-lg">
          R$ {data.price.toFixed(2)}
        </p>
        {showVolume && data.volume && (
          <p className="text-xs text-gray-500 mt-1">
            Volume: {data.volume} vendas
          </p>
        )}
        {data.min_price && data.max_price && (
          <div className="text-xs text-gray-500 mt-1">
            <span>Min: R$ {data.min_price.toFixed(2)}</span>
            <span className="ml-2">Max: R$ {data.max_price.toFixed(2)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={normalizedData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          {/* Grid cyberpunk */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(0, 240, 255, 0.1)" 
            vertical={false}
          />
          
          {/* Eixos */}
          <XAxis 
            dataKey="date"
            stroke="#666"
            fontSize={11}
            tickFormatter={(date) => format(new Date(date), 'dd/MM', { locale: ptBR })}
            tickLine={false}
          />
          <YAxis 
            stroke="#666"
            fontSize={11}
            tickFormatter={(value) => `R$ ${value}`}
            tickLine={false}
            width={60}
          />
          
          {/* Tooltip customizado */}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00F0FF', strokeWidth: 1 }} />
          
          {/* Linha principal */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#00F0FF" 
            strokeWidth={3}
            dot={{ 
              fill: '#FF006D', 
              r: 4,
              strokeWidth: 2,
              stroke: '#000'
            }}
            activeDot={{ 
              r: 6, 
              fill: '#00F0FF',
              stroke: '#FF006D',
              strokeWidth: 2,
              filter: 'drop-shadow(0 0 5px #00F0FF)'
            }}
          />
          
          {/* Min/Max range (opcional) */}
          {data[0]?.min_price && (
            <>
              <Line 
                type="monotone" 
                dataKey="min_price" 
                stroke="#666" 
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="max_price" 
                stroke="#666" 
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[#00F0FF]"></div>
          <span>Preço Médio</span>
        </div>
        {data[0]?.min_price && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gray-600 border-dashed"></div>
            <span>Min/Max</span>
          </div>
        )}
      </div>
    </div>
  );
}
