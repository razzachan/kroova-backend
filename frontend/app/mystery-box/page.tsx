'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import JackpotFeed from '../components/JackpotFeed';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface MysteryBoxType {
  box_id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  price_brl: number;
  target_rtp: number;
  prize_distribution: {
    lose: { probability: number; multiplier: number; label: string };
    medium: { probability: number; multiplier: number; label: string };
    big: { probability: number; multiplier: number; label: string };
    jackpot: { probability: number; multiplier: number; label: string };
  };
  visual_config: {
    color: string;
    particle_color: string;
    glow_color: string;
  };
}

const tierNames = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond'
};

export default function MysteryBoxPage() {
  const [boxes, setBoxes] = useState<MysteryBoxType[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Usar Supabase client corretamente (não localStorage)
      const supabase = createClient(supabaseUrl, anonKey);
      
      // Verificar se está logado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }

      // Carregar boxes (DISTINCT por tier para evitar duplicatas)
      const { data: boxesData, error: boxesError } = await supabase
        .from('mystery_box_types')
        .select('*')
        .eq('is_active', true)
        .order('price_brl');
      
      // Remover duplicatas por tier (pega o primeiro de cada tier)
      const uniqueBoxes = boxesData?.filter((box, index, self) => 
        index === self.findIndex((b) => b.tier === box.tier)
      );

      if (boxesError) throw boxesError;
      setBoxes(uniqueBoxes || []);

      // Carregar saldo do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('balance_brl')
          .eq('id', user.id)
          .single();
        
        setBalance(userData?.balance_brl || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(box: MysteryBoxType) {
    if (balance < box.price_brl) {
      alert('Saldo insuficiente!');
      return;
    }

    setPurchasing(box.box_id);

    try {
      const res = await api.post('/mystery-box/purchase', {
        box_tier: box.tier
      });
      
      const data = unwrap<{ instance_id: string }>(res.data);

      // Redirecionar para página de abertura
      router.push(`/mystery-box/opening?id=${data.instance_id}`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erro ao comprar Mystery Box';
      alert(errorMsg);
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="bg-black/40 backdrop-blur-md border-b border-cyan-500/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/logo_icon_transparent.png" alt="KROUVA" className="w-10 h-10 rounded-lg object-contain" style={{ boxShadow: '0 0 20px rgba(255, 199, 0, 0.6), 0 0 40px rgba(0, 240, 255, 0.4)', border: '2px solid rgba(255, 199, 0, 0.3)' }} />
            <span className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.1em' }}>KROUVA</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-gray-300 hover:text-[#FFC700] transition">Dashboard</a>
            <a href="/marketplace" className="text-gray-300 hover:text-[#FFC700] transition">Marketplace</a>
            <a href="/boosters" className="text-gray-300 hover:text-[#FFC700] transition">Boosters</a>
            <a href="/mystery-box" className="text-cyan-400 font-semibold">🎰 Mystery Box</a>
            <a href="/inventory" className="text-gray-300 hover:text-[#FFC700] transition">Inventário</a>
            <a href="/wallet" className="text-gray-300 hover:text-[#FFC700] transition">Wallet</a>
          </div>
        </div>
      </nav>

      <div className="p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-5xl font-bold mb-4 glitch-text">
          🎰 MYSTERY BOXES
        </h1>
        <p className="text-gray-400 text-lg mb-6">
          Teste sua sorte! Prêmio máximo de até <span className="text-yellow-400">R$ 300</span>
        </p>
        <div className="flex items-center gap-4">
          <div className="bg-gray-900 px-6 py-3 rounded-lg border border-cyan-500">
            <span className="text-gray-400 text-sm">Seu saldo:</span>
            <span className="text-cyan-400 text-xl font-bold ml-2">
              R$ {balance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area com Grid e Sidebar */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Grid de Mystery Boxes (3/4 do espaço) */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boxes.map((box) => (
          <div
            key={box.box_id}
            className="relative bg-gray-900 rounded-xl overflow-hidden border-2 transition-all hover:scale-105"
            style={{ borderColor: box.visual_config.color }}
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 opacity-20 blur-xl"
              style={{ background: `radial-gradient(circle, ${box.visual_config.glow_color} 0%, transparent 70%)` }}
            />

            {/* Mystery Box Image */}
            <div className="relative z-10 flex justify-center py-6">
              <img
                src={`/mystery-boxes/mystery-box-${box.tier}.png`}
                alt={box.name}
                className="w-48 h-48 object-contain drop-shadow-2xl"
                style={{
                  filter: `drop-shadow(0 0 20px ${box.visual_config.glow_color})`
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 pt-0">
              {/* Tier badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold uppercase"
                  style={{
                    backgroundColor: box.visual_config.color + '33',
                    color: box.visual_config.color
                  }}
                >
                  {tierNames[box.tier]}
                </span>
                <span className="text-2xl">🎁</span>
              </div>

              {/* Nome */}
              <h3 className="text-2xl font-bold mb-2">{box.name}</h3>

              {/* Preço */}
              <div className="text-4xl font-bold mb-6" style={{ color: box.visual_config.color }}>
                R$ {box.price_brl.toFixed(2)}
              </div>

              {/* Prêmios (4 tiers) */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Quase (50%):</span>
                  <span className="text-gray-300">
                    R$ {(box.price_brl * box.prize_distribution.lose.multiplier).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ganhou (35%):</span>
                  <span className="text-blue-400">
                    R$ {(box.price_brl * box.prize_distribution.medium.multiplier).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Grande (12%):</span>
                  <span className="text-orange-400 font-bold">
                    🔥 R$ {(box.price_brl * box.prize_distribution.big.multiplier).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">JACKPOT (3%):</span>
                  <span className="text-yellow-400 font-bold">
                    🎰 R$ {(box.price_brl * box.prize_distribution.jackpot.multiplier).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botão de compra */}
              <button
                onClick={() => handlePurchase(box)}
                disabled={purchasing === box.box_id || balance < box.price_brl}
                className={`
                  w-full py-3 rounded-lg font-bold text-lg
                  transition-all duration-200
                  ${balance < box.price_brl
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'glitch-button hover:scale-105'
                  }
                `}
                style={{
                  backgroundColor: balance >= box.price_brl ? box.visual_config.color : undefined,
                  boxShadow: balance >= box.price_brl ? `0 0 20px ${box.visual_config.glow_color}` : undefined
                }}
              >
                {purchasing === box.box_id ? (
                  'COMPRANDO...'
                ) : balance < box.price_brl ? (
                  'SALDO INSUFICIENTE'
                ) : (
                  'COMPRAR AGORA'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

        {/* Jackpot Feed Sidebar (1/4 do espaço) */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <JackpotFeed />
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="max-w-7xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>⚠️ Mystery Boxes são jogos de azar. Jogue com responsabilidade.</p>
        <p className="mt-2">RTP (Return to Player): 65% no longo prazo</p>
      </div>
      </div>

      <style jsx>{`
        .glitch-text {
          animation: glitch 1s infinite;
        }

        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }

        .glitch-button {
          position: relative;
          overflow: hidden;
        }

        .glitch-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
