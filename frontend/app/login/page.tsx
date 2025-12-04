'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import GlitchButton from '@/components/UI/GlitchButton';
import DataStreamInput from '@/components/UI/DataStreamInput';
import TextGlitch from '@/components/Effects/TextGlitch';
import { cardAudio } from '@/lib/cardAudio';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      setError(error.message);
      cardAudio.playErrorBuzz();
    } else {
      if (!isLogin) {
        setError('Conta criada! Verifique seu email para confirmar.');
        cardAudio.playSuccessChime();
      } else {
        cardAudio.playPortalOpen();
        router.push('/dashboard');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-black/60 backdrop-blur-md rounded-lg shadow-2xl p-8 border-2 border-[#FF006D]/30">
        {/* Logo e Título */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo_icon_transparent.png" 
            alt="KROOVA" 
            className="w-20 h-20 mb-4 rounded-lg object-contain" 
            style={{ 
              boxShadow: '0 0 20px rgba(255, 0, 109, 0.6), 0 0 40px rgba(0, 240, 255, 0.4)', 
              border: '2px solid rgba(255, 0, 109, 0.3)' 
            }} 
          />
          <h1 
            className="text-4xl font-bold text-white tracking-wider mb-2"
            style={{ 
              fontFamily: 'var(--font-geist-mono), monospace', 
              letterSpacing: '0.1em' 
            }}
          >
            KROOVA
          </h1>
          <p className="text-gray-400 text-center">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <DataStreamInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="magenta"
            required
          />

          <DataStreamInput
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="cyan"
            required
            minLength={6}
          />

          {error && (
            <div className={`p-3 rounded-lg border-2 ${error.includes('criada') ? 'bg-green-900/30 text-green-300 border-green-500' : 'bg-red-900/30 text-red-300 border-red-500'}`}>
              {error}
            </div>
          )}

          <GlitchButton
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
          >
            {loading ? 'PROCESSANDO...' : isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
          </GlitchButton>
        </form>

        <div className="mt-6 text-center">
          <GlitchButton
            onClick={() => setIsLogin(!isLogin)}
            variant="secondary"
            size="sm"
          >
            {isLogin ? 'CRIAR CONTA' : 'JÁ TENHO CONTA'}
          </GlitchButton>
        </div>
      </div>
    </div>
  );
}
