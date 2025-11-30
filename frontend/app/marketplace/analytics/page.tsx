// ============================================================================
// MARKET ANALYTICS DASHBOARD
// Dashboard geral do marketplace com KPIs e gráficos
// /marketplace/analytics
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TextGlitch from '@/components/Effects/TextGlitch';
import { TrendingCards } from '@/components/Marketplace/TrendingCards';
import { FloorPriceCard } from '@/components/Marketplace/FloorPriceCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, ResponsiveContainer as LineContainer } from 'recharts';
import { api } from '@/lib/api';

interface Analytics {
  period: string;
  overview: {
    total_volume_brl: number;
    total_sales: number;
    avg_price_brl: number;
    volume_change_pct: number;
    sales_change_pct: number;
  };
  sales_by_rarity: Record<string, number>;
  floor_prices: Record<string, number | null>;
}

export default function MarketAnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('24h');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [trendingCards, setTrendingCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // 1. Analytics gerais
      const analyticsResponse = await api.get(`/market/analytics?period=${period}`);
      setAnalytics(analyticsResponse.data.data);

      // 2. Trending cards
      const trendingResponse = await api.get(`/market/trending?period=${period}&limit=10`);
      setTrendingCards(trendingResponse.data.data || []);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (cardId: string) => {
    router.push(`/marketplace/${cardId}`);
  };

  // Preparar dados para pie chart
  const getPieData = () => {
    if (!analytics?.sales_by_rarity) return [];
    
    const colors: Record<string, string> = {
      legendary: '#FFD700',
      viral: '#00F0FF',
      meme: '#FF006D',
      trash: '#666666'
    };

    return Object.entries(analytics.sales_by_rarity).map(([rarity, count]) => ({
      name: rarity.toUpperCase(),
      value: count,
      color: colors[rarity] || '#888888'
    }));
  };

  // Preparar dados para line chart (simulado - idealmente viria da API)
  const getFloorPriceTrends = () => {
    if (!analytics?.floor_prices) return [];

    // Simulação de dados históricos (em produção, viria de um endpoint separado)
    const days = period === '24h' ? 1 : period === '7d' ? 7 : 30;
    const data = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const point: any = {
        date: date.toISOString().split('T')[0]
      };

      Object.entries(analytics.floor_prices).forEach(([rarity, price]) => {
        if (price) {
          // Adicionar variação aleatória para simulação
          const variation = 1 + (Math.random() - 0.5) * 0.2;
          point[rarity] = parseFloat((price * variation).toFixed(2));
        }
      });

      data.push(point);
    }

    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#00F0FF] text-2xl">
          <TextGlitch>CARREGANDO ANALYTICS...</TextGlitch>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Erro ao carregar analytics</p>
        </div>
      </div>
    );
  }

  const pieData = getPieData();
  const floorTrends = getFloorPriceTrends();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/marketplace')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#00F0FF] transition-colors"
        >
          <span>←</span> Voltar ao Marketplace
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <TextGlitch>📊 MARKET ANALYTICS</TextGlitch>
            </h1>
            <p className="text-gray-400">Análise completa do mercado Kroova</p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {['24h', '7d', '30d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded transition-all ${
                  period === p
                    ? 'bg-[#00F0FF] text-black font-bold'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-gray-800
                        hover:border-[#00F0FF] transition-all">
            <p className="text-sm text-gray-400 mb-2 uppercase">Volume Total</p>
            <p className="text-4xl font-bold text-[#00F0FF] mb-2">
              R$ {analytics.overview.total_volume_brl.toFixed(2)}
            </p>
            <div className={`inline-flex items-center gap-1 text-sm font-bold ${
              analytics.overview.volume_change_pct >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {analytics.overview.volume_change_pct >= 0 ? '▲' : '▼'} 
              {Math.abs(analytics.overview.volume_change_pct).toFixed(1)}%
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-gray-800
                        hover:border-[#00F0FF] transition-all">
            <p className="text-sm text-gray-400 mb-2 uppercase">Total de Vendas</p>
            <p className="text-4xl font-bold text-white mb-2">
              {analytics.overview.total_sales}
            </p>
            <div className={`inline-flex items-center gap-1 text-sm font-bold ${
              analytics.overview.sales_change_pct >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {analytics.overview.sales_change_pct >= 0 ? '▲' : '▼'} 
              {Math.abs(analytics.overview.sales_change_pct).toFixed(1)}%
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-gray-800
                        hover:border-[#00F0FF] transition-all">
            <p className="text-sm text-gray-400 mb-2 uppercase">Preço Médio</p>
            <p className="text-4xl font-bold text-[#FFD600]">
              R$ {analytics.overview.avg_price_brl.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales by Rarity */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">
              <TextGlitch>VENDAS POR RARIDADE</TextGlitch>
            </h2>
            
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #00F0FF',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Sem dados disponíveis
              </div>
            )}
          </div>

          {/* Floor Price Trends */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">
              <TextGlitch>TENDÊNCIA DE FLOOR PRICE</TextGlitch>
            </h2>
            
            {floorTrends.length > 0 ? (
              <LineContainer width="100%" height={300}>
                <LineChart data={floorTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666" 
                    fontSize={11}
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis stroke="#666" fontSize={11} tickFormatter={(value) => `R$ ${value}`} />
                  <LineTooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #00F0FF',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  
                  {Object.keys(analytics.floor_prices).map((rarity, index) => {
                    const colors = {
                      legendary: '#FFD700',
                      viral: '#00F0FF',
                      meme: '#FF006D',
                      trash: '#666666'
                    };
                    
                    return (
                      <Line 
                        key={rarity}
                        type="monotone" 
                        dataKey={rarity} 
                        stroke={colors[rarity as keyof typeof colors] || '#888'}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    );
                  })}
                </LineChart>
              </LineContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Sem dados disponíveis
              </div>
            )}
          </div>
        </div>

        {/* Floor Prices */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            <TextGlitch>💎 FLOOR PRICES ATUAIS</TextGlitch>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.floor_prices).map(([rarity, price]) => (
              <FloorPriceCard key={rarity} rarity={rarity} price={price} />
            ))}
          </div>
        </div>

        {/* Trending Cards */}
        {trendingCards.length > 0 && (
          <TrendingCards 
            cards={trendingCards} 
            period={period}
            onCardClick={handleCardClick}
          />
        )}
      </div>
    </div>
  );
}
