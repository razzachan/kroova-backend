'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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
      setStats({
        balance: walletRes.data.data?.wallet?.balance_brl || 0,
        cardsCount: inventoryRes.data.data?.inventory?.length || 0,
        listingsCount: 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🃏 Krouva</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{user.email}</span>
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Wallet"
            value={`R$ ${stats.balance.toFixed(2)}`}
            icon="💰"
            href="/wallet"
          />
          <DashboardCard
            title="Cartas"
            value={stats.cardsCount.toString()}
            icon="🃏"
            href="/inventory"
          />
          <DashboardCard
            title="Marketplace"
            value="Explorar"
            icon="🛒"
            href="/marketplace"
          />
          <DashboardCard
            title="Boosters"
            value="Comprar"
            icon="📦"
            href="/boosters"
          />
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Bem-vindo!</h2>
          <p className="text-gray-300 mb-4">
            Sua conta foi criada com sucesso. Em breve você poderá:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>Comprar e vender cartas no marketplace</li>
            <li>Abrir boosters e colecionar cartas raras</li>
            <li>Gerenciar sua wallet e transações</li>
            <li>Competir com outros jogadores</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({ title, value, icon, href }: { title: string; value: string; icon: string; href: string }) {
  return (
    <a
      href={href}
      className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition cursor-pointer"
    >
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-2xl font-bold text-blue-400">{value}</p>
    </a>
  );
}
