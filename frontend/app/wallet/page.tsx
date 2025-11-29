'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import GlitchButton from '@/components/UI/GlitchButton';
import DataStreamInput from '@/components/UI/DataStreamInput';
import TextGlitch from '@/components/Effects/TextGlitch';
import { cardAudio } from '@/lib/cardAudio';

interface Wallet {
  balance_brl: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState<number>(5);
  const [preview, setPreview] = useState<{ net_amount_brl: number; fee_brl: number; fee_applied: boolean } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions')
      ]);
      const wallet = unwrap<Wallet>(walletRes);
      const txData = unwrap<{ transactions?: Transaction[] }>(transactionsRes);
      setWallet(wallet || null);
      setTransactions(txData.transactions || []);
    } catch (error) {
      console.error('Erro ao carregar wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get('/wallet/deposit/preview', { params: { amount_brl: depositAmount } });
        const data = unwrap<{ net_amount_brl: number; fee_brl: number; fee_applied: boolean }>(res.data);
        setPreview(data || null);
      } catch (e) {
        setPreview(null);
      }
    };
    if (depositAmount && depositAmount > 0) {
      run();
    }
  }, [depositAmount]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-black/40 backdrop-blur-md border-b border-[#FFC700]/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/logo_icon.png" alt="KROUVA" className="w-10 h-10 rounded-lg" style={{ boxShadow: '0 0 20px rgba(255, 199, 0, 0.6), 0 0 40px rgba(0, 240, 255, 0.4)', border: '2px solid rgba(255, 199, 0, 0.3)' }} />
            <span className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.1em' }}>KROUVA</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-gray-300 hover:text-[#FFC700] transition">Dashboard</a>
            <a href="/marketplace" className="text-gray-300 hover:text-[#FFC700] transition">Marketplace</a>
            <a href="/boosters" className="text-gray-300 hover:text-[#FFC700] transition">Boosters</a>
            <a href="/wallet" className="text-[#FFC700] font-semibold">Wallet</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          <TextGlitch delay={300}>💰 DIGITAL VAULT</TextGlitch>
        </h1>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Carregando...</div>
        ) : (
          <>
            <div className="bg-black/40 backdrop-blur-md border-2 border-[#FFC700]/30 rounded-lg p-8 mb-8">
              <div className="text-center">
                <p className="text-gray-400 mb-2 uppercase tracking-wider text-sm">Saldo Disponível</p>
                <p className="text-5xl font-bold text-[#FFC700]">
                  R$ {wallet?.balance_brl || 0}
                </p>
              </div>
              <div className="flex gap-4 mt-6 justify-center items-end">
                <DataStreamInput
                  type="number"
                  label="Valor do Depósito (R$)"
                  min={0.1}
                  step={0.1}
                  value={depositAmount.toString()}
                  onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                  variant="amber"
                  className="w-48"
                />
                <GlitchButton 
                  onClick={() => cardAudio.playPortalOpen()}
                  variant="success"
                  size="md"
                >
                  GERAR PAGAMENTO
                </GlitchButton>
                <GlitchButton 
                  onClick={() => cardAudio.playPortalOpen()}
                  variant="primary"
                  size="md"
                >
                  SACAR
                </GlitchButton>
              </div>
              {preview && (
                <div className="text-center mt-3 text-sm text-gray-300">
                  <p>Você receberá líquido: <span className="text-white font-semibold">R$ {preview.net_amount_brl.toFixed(2)}</span>{' '}
                  {preview.fee_applied ? <span className="text-gray-400">(repasse taxa R$ {preview.fee_brl.toFixed(2)})</span> : <span className="text-gray-400">(sem taxa)</span>}</p>
                </div>
              )}
            </div>

            <div className="bg-black/40 backdrop-blur-md border-2 border-[#FFC700]/30 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Transações Recentes</h2>
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhuma transação ainda</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="bg-black/50 border border-[#FFC700]/20 rounded-lg p-4 flex justify-between items-center hover:border-[#FFC700]/40 transition">
                      <div>
                        <p className="text-white font-semibold">{tx.description}</p>
                        <p className="text-gray-400 text-sm font-mono">{new Date(tx.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                      <span className={`text-xl font-bold font-mono ${tx.type === 'credit' ? 'text-[#00F0FF]' : 'text-[#FF006D]'}`}>
                        {tx.type === 'credit' ? '+' : '-'}R$ {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
