'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import { LiveFeed } from '@/components/LiveFeed';
import GlitchButton from '@/components/UI/GlitchButton';
import TextGlitch from '@/components/Effects/TextGlitch';
import DailyStreak from '@/components/Dashboard/DailyStreak';
import JackpotProgress from '@/components/Dashboard/JackpotProgress';
import LoreOnboarding from '@/components/Dashboard/LoreOnboarding';
import QuickStats from '@/components/Dashboard/QuickStats';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    balance: 0,
    cardsCount: 0,
    listingsCount: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [walletRes, inventoryRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/inventory')
      ]);
      const wallet = unwrap<{ balance_brl: number }>(walletRes);
      const inv = unwrap<{ cards?: any[]; inventory?: any[] }>(inventoryRes);
      const cardsArr = (inv.cards ?? inv.inventory) || [];
      setStats({
        balance: (wallet as any)?.balance_brl || 0,
        cardsCount: cardsArr.length || 0,
        listingsCount: 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // CTAs dinâmicos baseados no estado do usuário
  const getDynamicCTA = () => {
    const streak = JSON.parse(localStorage.getItem('kroova_daily_streak') || '{"currentStreak":0}');
    const alreadyClaimed = localStorage.getItem('kroova_free_booster_claimed');
    
    // Booster grátis do streak (só se não reivindicou ainda)
    if (streak.currentStreak >= 7 && !alreadyClaimed) {
      return {
        title: '🎁 3 PACOTES GRÁTIS DISPONÍVEIS!',
        subtitle: 'Você conquistou 7 dias de streak consecutivo',
        href: '/boosters?claim=free',
        color: '#FFC700'
      };
    }
    
    if (stats.balance < 5) {
      return {
        title: 'DEPOSITE E GANHE +10% BÔNUS',
        subtitle: 'Primeira recarga do dia',
        href: '/wallet',
        color: '#00F0FF'
      };
    }
    
    if (stats.cardsCount === 0) {
      return {
        title: 'ABRA SEU PRIMEIRO PACOTE',
        subtitle: 'Comece sua coleção agora',
        href: '/boosters',
        color: '#FF006D'
      };
    }
    
    if (stats.cardsCount >= 25) {
      return {
        title: 'RECICLE 25 CARTAS E GANHE 1 BOOSTER',
        subtitle: 'Transforme sua coleção em novas chances',
        href: '/inventory',
        color: '#A855F7'
      };
    }
    
    return {
      title: 'EXPLORAR MARKETPLACE',
      subtitle: 'Negocie suas manifestações',
      href: '/marketplace',
      color: '#00F0FF'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) return null;

  const dynamicCTA = getDynamicCTA();

  return (
    <div className="min-h-screen">
      <LoreOnboarding />
      
      <nav className="bg-black/40 backdrop-blur-md border-b border-[#FF006D]/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/logo_icon_transparent.png" alt="KROUVA" className="w-10 h-10 rounded-lg object-contain" style={{ boxShadow: '0 0 20px rgba(255, 0, 109, 0.6), 0 0 40px rgba(0, 240, 255, 0.4)', border: '2px solid rgba(255, 0, 109, 0.3)' }} />
            <span className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.1em' }}>KROUVA</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-[#FF006D] font-semibold">Dashboard</a>
            <a href="/marketplace" className="text-gray-300 hover:text-[#00F0FF] transition">Marketplace</a>
            <a href="/boosters" className="text-gray-300 hover:text-[#00F0FF] transition">Boosters</a>
            <a href="/inventory" className="text-gray-300 hover:text-[#00F0FF] transition">Inventário</a>
            <a href="/wallet" className="text-gray-300 hover:text-[#00F0FF] transition">Wallet</a>
            <div className="ml-4 flex items-center gap-3 border-l border-gray-700 pl-4">
              <span className="text-gray-400 text-sm">{user.email}</span>
              <GlitchButton
                onClick={() => signOut()}
                variant="danger"
                size="sm"
              >
                SAIR
              </GlitchButton>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Hero CTA Dinâmico */}
        <a 
          href={dynamicCTA.href}
          className="block mb-8 bg-black/60 backdrop-blur-md border-2 rounded-lg p-8 relative overflow-hidden group hover:scale-[1.02] transition-all"
          style={{ borderColor: dynamicCTA.color }}
        >
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition pointer-events-none"
               style={{ background: `radial-gradient(circle at center, ${dynamicCTA.color}60, transparent)` }} />
          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-bold mb-2 uppercase tracking-wider animate-pulse"
                style={{ color: dynamicCTA.color, fontFamily: 'var(--font-geist-mono), monospace' }}>
              {dynamicCTA.title}
            </h2>
            <p className="text-gray-300 text-lg">{dynamicCTA.subtitle}</p>
          </div>
        </a>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Wallet"
            value={`R$ ${stats.balance.toFixed(2)}`}
            icon="/icon_wallet_thumb_transparent.png"
            href="/wallet"
          />
          <DashboardCard
            title="Cartas"
            value={stats.cardsCount.toString()}
            icon="/icon_cards_thumb_transparent.png"
            href="/inventory"
          />
          <DashboardCard
            title="Marketplace"
            value="Explorar"
            icon="/icon_marketplace_thumb_transparent.png"
            href="/marketplace"
          />
          <DashboardCard
            title="Pacotes de Cartas"
            value="Comprar"
            icon="/icon_boosters_thumb_transparent.png"
            href="/boosters"
          />
        </div>

        {/* Daily Streak & Jackpot Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DailyStreak />
          <JackpotProgress />
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
            <TextGlitch delay={100}>ESTATÍSTICAS RÁPIDAS</TextGlitch>
          </h3>
          <QuickStats />
        </div>

        {/* Live Feed */}
        <LiveFeed />
      </main>
    </div>
  );
}

function DashboardCard({ title, value, icon, href }: { title: string; value: string; icon: string; href: string }) {
  const isImage = icon.startsWith('/');
  
  return (
    <a
      href={href}
      className="bg-black/40 backdrop-blur-md border-2 border-[#00F0FF]/30 rounded-lg p-6 hover:border-[#00F0FF]/60 transition cursor-pointer group"
    >
      {isImage ? (
        <div className="w-16 h-16 mb-2 group-hover:scale-110 transition-transform relative">
          <img 
            src={icon} 
            alt={title} 
            className="w-full h-full object-contain absolute inset-0"
            style={{ 
              filter: 'drop-shadow(0 2px 8px rgba(0, 240, 255, 0.3))'
            }}
          />
        </div>
      ) : (
        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-white mb-1 uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-[#00F0FF]">{value}</p>
    </a>
  );
}
