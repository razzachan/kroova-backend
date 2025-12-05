'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface MysteryBoxInstance {
  instance_id: string;
  box_id: string;
  user_id: string;
  status: string;
  purchased_at: string;
  box_type: {
    name: string;
    tier: string;
    price_brl: number;
    visual_config: {
      color: string;
      particle_color: string;
      glow_color: string;
    };
  };
}

interface OpenResult {
  prize_tier: 'lose' | 'medium' | 'jackpot';
  prize_multiplier: number;
  prize_amount: number;
  message: string;
  is_jackpot: boolean;
  new_balance: number;
}

function MysteryBoxOpeningPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const instanceId = searchParams.get('id');

  const [instance, setInstance] = useState<MysteryBoxInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState<OpenResult | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'revealing' | 'celebrating'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Audio refs
  const spinningAudioRef = useRef<HTMLAudioElement | null>(null);
  const revealAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    spinningAudioRef.current = new Audio('/sfx/mystery-box/mystery-box-spinning.mp3');
    spinningAudioRef.current.loop = true;
    spinningAudioRef.current.volume = 0.85; // Aumentado de 0.6
    
    revealAudioRef.current = new Audio('/sfx/mystery-box/mystery-box-reveal-buildup.mp3');
    revealAudioRef.current.volume = 0.9; // Aumentado de 0.7

    return () => {
      spinningAudioRef.current?.pause();
      revealAudioRef.current?.pause();
      resultAudioRef.current?.pause();
    };
  }, []);

  const playResultSound = (tier: 'lose' | 'medium' | 'jackpot') => {
    const soundMap = {
      'lose': '/sfx/mystery-box/mystery-box-lose.mp3',
      'medium': '/sfx/mystery-box/mystery-box-medium-win.mp3',
      'jackpot': '/sfx/mystery-box/mystery-box-jackpot.mp3'
    };

    resultAudioRef.current = new Audio(soundMap[tier]);
    resultAudioRef.current.volume = tier === 'jackpot' ? 1.0 : 0.9; // Aumentado
    resultAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
  };

  useEffect(() => {
    loadInstance();
  }, [instanceId]);

  const loadInstance = async () => {
    if (!instanceId) {
      setError('ID da Mystery Box não encontrado');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('supabase-auth-token');
    const supabase = createClient(supabaseUrl, anonKey, {
      global: token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    });
    
    try {
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Buscar instância com tipo de box
      const { data, error: fetchError } = await supabase
        .from('mystery_box_instances')
        .select(`
          instance_id,
          box_id,
          user_id,
          status,
          purchased_at,
          box_type:mystery_box_types!inner (
            name,
            tier,
            price_brl,
            visual_config
          )
        `)
        .eq('instance_id', instanceId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !data) {
        setError('Mystery Box não encontrada');
        setLoading(false);
        return;
      }

      if (data.status !== 'pending') {
        setError('Esta Mystery Box já foi aberta');
        setLoading(false);
        return;
      }

      setInstance(data as any);
      setLoading(false);
    } catch (err) {
      console.error('Error loading instance:', err);
      setError('Erro ao carregar Mystery Box');
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    if (!instance || opening) return;

    setOpening(true);
    setAnimationPhase('spinning');
    setError(null);

    // Play spinning sound
    spinningAudioRef.current?.play().catch(e => console.log('Audio play failed:', e));

    // Animação de slot machine (3 segundos)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Stop spinning, start reveal buildup
    spinningAudioRef.current?.pause();
    if (spinningAudioRef.current) spinningAudioRef.current.currentTime = 0;
    revealAudioRef.current?.play().catch(e => console.log('Audio play failed:', e));

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const token = localStorage.getItem('supabase-auth-token');
      const response = await fetch('/api/v1/mystery-box/open', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ instance_id: instanceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao abrir Mystery Box');
      }

      setResult(data);
      setAnimationPhase('revealing');

      // Play result sound
      playResultSound(data.prize_tier);

      // Após revelar, celebrar se for jackpot
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (data.is_jackpot) {
        setAnimationPhase('celebrating');
      }
    } catch (err: any) {
      console.error('Error opening box:', err);
      setError(err.message || 'Erro ao abrir Mystery Box');
      setAnimationPhase('idle');
    } finally {
      setOpening(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando Mystery Box...</p>
        </div>
      </div>
    );
  }

  if (error || !instance) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-500 mb-4">{error || 'Mystery Box não encontrada'}</h1>
          <button
            onClick={() => router.push('/mystery-box')}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors"
          >
            Voltar para a Loja
          </button>
        </div>
      </div>
    );
  }

  const visualConfig = instance.box_type.visual_config;
  const boxColor = visualConfig.color;
  const glowColor = visualConfig.glow_color;
  const particleColor = visualConfig.particle_color;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 glitch-text" style={{ color: boxColor }}>
            {instance.box_type.name}
          </h1>
          <p className="text-gray-400">
            {result ? 'Resultado' : 'Clique para abrir e descobrir seu prêmio!'}
          </p>
        </div>

        {/* Main Box Container */}
        <div className="relative">
          {/* Box Display */}
          <div 
            className={`
              relative mx-auto w-64 h-64 md:w-80 md:h-80 mb-8
              ${animationPhase === 'spinning' ? 'animate-slot-spin' : ''}
              ${animationPhase === 'celebrating' ? 'animate-jackpot-celebration' : ''}
            `}
          >
            {/* Box Border with Glow */}
            <div 
              className="absolute inset-0 rounded-2xl border-4 transition-all duration-300"
              style={{ 
                borderColor: boxColor,
                boxShadow: animationPhase === 'spinning' 
                  ? `0 0 40px ${glowColor}, 0 0 80px ${glowColor}` 
                  : `0 0 20px ${glowColor}`,
              }}
            />

            {/* Box Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              {animationPhase === 'idle' && (
                <div className="text-center">
                  <img
                    src={`/mystery-boxes/mystery-box-${instance.box_type.tier}.png`}
                    alt={instance.box_type.name}
                    className="w-64 h-64 object-contain mx-auto mb-4"
                    style={{
                      filter: `drop-shadow(0 0 30px ${glowColor})`
                    }}
                  />
                  <p className="text-xl font-bold" style={{ color: boxColor }}>
                    {instance.box_type.tier.toUpperCase()}
                  </p>
                </div>
              )}

              {animationPhase === 'spinning' && (
                <div className="text-center relative">
                  {/* Spinning particles orbit */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-4 h-4 rounded-full animate-spin"
                        style={{
                          backgroundColor: particleColor,
                          animationDuration: '2s',
                          animationDelay: `${i * 0.1}s`,
                          left: `${50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                          top: `${50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                          boxShadow: `0 0 10px ${particleColor}`,
                          opacity: 0.6,
                        }}
                      />
                    ))}
                  </div>

                  {/* Main spinning box */}
                  <img
                    src={`/mystery-boxes/mystery-box-${instance.box_type.tier}.png`}
                    alt={instance.box_type.name}
                    className="w-56 h-56 object-contain mx-auto mb-4 animate-spin relative z-10"
                    style={{
                      filter: `drop-shadow(0 0 40px ${glowColor}) brightness(1.5) saturate(1.5)`,
                      animationDuration: '0.5s'
                    }}
                  />

                  {/* Pulsing dots */}
                  <div className="mt-4 flex justify-center gap-2">
                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: particleColor }}></div>
                    <div className="w-3 h-3 rounded-full animate-pulse delay-100" style={{ backgroundColor: particleColor }}></div>
                    <div className="w-3 h-3 rounded-full animate-pulse delay-200" style={{ backgroundColor: particleColor }}></div>
                  </div>

                  {/* Status text with glitch effect */}
                  <p className="text-sm text-gray-400 mt-4 animate-pulse">Calculando seu destino...</p>
                  
                  {/* Horizontal scanlines */}
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
                  </div>
                </div>
              )}

              {(animationPhase === 'revealing' || animationPhase === 'celebrating') && result && (
                <div className="text-center px-4 relative">
                  {/* Confetti effect for jackpot */}
                  {result.prize_tier === 'jackpot' && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(30)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 rounded-full animate-bounce"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            backgroundColor: ['#fbbf24', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][i % 5],
                            animationDelay: `${Math.random() * 0.5}s`,
                            animationDuration: `${1 + Math.random()}s`,
                            opacity: 0.8,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Prize reveal animation */}
                  <div 
                    className={`${
                      animationPhase === 'revealing' 
                        ? 'animate-[zoomIn_0.5s_ease-out]' 
                        : result.prize_tier === 'jackpot' 
                        ? 'animate-[bounce_1s_ease-in-out_infinite]'
                        : result.prize_tier === 'lose'
                        ? 'animate-[shake_0.5s_ease-in-out]'
                        : ''
                    }`}
                  >
                    <div className="text-8xl mb-6 drop-shadow-2xl">
                      {result.prize_tier === 'jackpot' && '🎰'}
                      {result.prize_tier === 'medium' && '🎉'}
                      {result.prize_tier === 'lose' && '😔'}
                    </div>
                    
                    <div 
                      className={`text-5xl font-black mb-4 ${result.prize_tier === 'jackpot' ? 'animate-pulse' : ''}`}
                      style={{ 
                        color: result.prize_tier === 'jackpot' ? '#fbbf24' : boxColor,
                        textShadow: result.prize_tier === 'jackpot' 
                          ? '0 0 20px #fbbf24, 0 0 40px #f59e0b' 
                          : `0 0 10px ${boxColor}`,
                      }}
                    >
                      {result.prize_multiplier}x
                    </div>
                    
                    <div className="relative inline-block">
                      <p 
                        className="text-4xl font-black mb-2"
                        style={{ 
                          color: boxColor,
                          textShadow: `0 0 15px ${glowColor}`,
                        }}
                      >
                        R$ {result.prize_amount.toFixed(2)}
                      </p>
                      {result.prize_tier === 'jackpot' && (
                        <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 blur-xl animate-pulse"></div>
                      )}
                    </div>
                    
                    <p className="text-lg text-gray-300 mt-4 font-semibold">{result.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Particles Effect */}
            {animationPhase === 'celebrating' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full animate-particle"
                    style={{
                      backgroundColor: particleColor,
                      left: `${50 + Math.cos((i / 20) * Math.PI * 2) * 40}%`,
                      top: `${50 + Math.sin((i / 20) * Math.PI * 2) * 40}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {animationPhase === 'idle' && (
              <button
                onClick={handleOpen}
                disabled={opening}
                className="px-8 py-4 text-xl font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shimmer-button"
                style={{
                  backgroundColor: boxColor,
                  boxShadow: `0 0 20px ${glowColor}`,
                }}
              >
                {opening ? 'Abrindo...' : 'ABRIR MYSTERY BOX'}
              </button>
            )}

            {result && (animationPhase === 'revealing' || animationPhase === 'celebrating') && (
              <>
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Novo Saldo:</span>
                    <span className="text-2xl font-bold text-green-400">
                      R$ {result.new_balance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/mystery-box')}
                  className="px-8 py-4 text-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  Abrir Outra Mystery Box
                </button>

                <button
                  onClick={() => router.push('/marketplace')}
                  className="px-8 py-4 text-lg font-bold bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Ir para o Marketplace
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        .glitch-text {
          animation: glitch 1s infinite;
        }

        @keyframes glitch {
          0%, 100% { text-shadow: 0 0 10px currentColor; }
          25% { text-shadow: -2px 0 10px currentColor, 2px 2px 10px currentColor; }
          50% { text-shadow: 2px -2px 10px currentColor, -2px 2px 10px currentColor; }
          75% { text-shadow: -2px -2px 10px currentColor, 2px 0 10px currentColor; }
        }

        .animate-slot-spin {
          animation: slot-spin 3s ease-in-out;
        }

        @keyframes slot-spin {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(1800deg) scale(1.1); }
          100% { transform: rotateY(1800deg) scale(1); }
        }

        .animate-jackpot-celebration {
          animation: jackpot-celebrate 1s ease-in-out infinite;
        }

        @keyframes jackpot-celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(5deg); }
          75% { transform: scale(1.1) rotate(-5deg); }
        }

        .animate-particle {
          animation: particle-burst 2s ease-out forwards;
        }

        @keyframes particle-burst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0);
            opacity: 0;
          }
        }

        .shimmer-button {
          position: relative;
          overflow: hidden;
        }

        .shimmer-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function MysteryBoxOpeningPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    }>
      <MysteryBoxOpeningPage />
    </Suspense>
  );
}
