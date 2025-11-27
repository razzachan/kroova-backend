'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { unwrap } from '@/lib/unwrap';
import { useState } from 'react';

export default function DebugPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});

  const testAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setResults((prev: any) => ({ ...prev, session: session }));
  };

  const testWallet = async () => {
    try {
      const res = await api.get('/wallet');
      const data = unwrap(res);
      setResults((prev: any) => ({ ...prev, wallet: { success: true, data } }));
    } catch (error: any) {
      setResults((prev: any) => ({ ...prev, wallet: { success: false, error: error.message } }));
    }
  };

  const testMarket = async () => {
    try {
      const res = await api.get('/market/listings');
      const data = unwrap(res);
      setResults((prev: any) => ({ ...prev, market: { success: true, data } }));
    } catch (error: any) {
      setResults((prev: any) => ({ ...prev, market: { success: false, error: error.message } }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Debug Page</h1>
      
      <div className="mb-8 p-4 bg-slate-800 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Auth Context</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify({ user: user ? { id: user.id, email: user.email } : null }, null, 2)}
        </pre>
      </div>

      <div className="space-y-4 mb-8">
        <button onClick={testAuth} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Test Supabase Session
        </button>
        <button onClick={testWallet} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 ml-4">
          Test /wallet
        </button>
        <button onClick={testMarket} className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 ml-4">
          Test /market/listings
        </button>
      </div>

      <div className="p-4 bg-slate-800 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Test Results</h2>
        <pre className="text-sm overflow-auto whitespace-pre-wrap">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>

      <div className="mt-8 p-4 bg-slate-800 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Environment</h2>
        <pre className="text-sm">
          API_URL: {process.env.NEXT_PUBLIC_API_URL}
          SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
        </pre>
      </div>
    </div>
  );
}
