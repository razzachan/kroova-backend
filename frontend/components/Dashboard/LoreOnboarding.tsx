'use client';

import { useState, useEffect, useRef } from 'react';
import TextGlitch from '@/components/Effects/TextGlitch';

export default function LoreOnboarding() {
  const [dismissed, setDismissed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem('kroova_onboarding_seen');
    if (seen) {
      setDismissed(true);
    } else {
      // Habilita áudio automaticamente ao abrir onboarding
      // Pequeno delay para garantir que o componente está montado
      const timer = setTimeout(() => setAudioEnabled(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Tocar áudio do step atual
  useEffect(() => {
    if (dismissed || !audioEnabled) return;
    
    const audioFile = `/audio/onboarding/onboarding_step${currentStep + 1}.mp3`;
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    audioRef.current = new Audio(audioFile);
    audioRef.current.volume = 0.7;
    
    // Event listeners para rastrear estado
    audioRef.current.addEventListener('playing', () => setAudioPlaying(true));
    audioRef.current.addEventListener('pause', () => setAudioPlaying(false));
    audioRef.current.addEventListener('ended', () => setAudioPlaying(false));
    
    // Tentar tocar áudio
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`🔊 Áudio do step ${currentStep + 1} tocando`);
        })
        .catch((err) => {
          console.log('Áudio bloqueado pelo navegador:', err.message);
          setAudioPlaying(false);
          // Se for o primeiro step e áudio foi bloqueado, mostrar aviso
          if (currentStep === 0) {
            console.log('💡 Clique em "Continuar" para habilitar o áudio');
          }
        });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentStep, dismissed, audioEnabled]);

  const handleDismiss = () => {
    localStorage.setItem('kroova_onboarding_seen', 'true');
    setDismissed(true);
  };

  const handleClaimBooster = () => {
    if (!audioEnabled) setAudioEnabled(true);
    // Pausar áudio antes de redirecionar
    if (audioRef.current) {
      audioRef.current.pause();
    }
    localStorage.setItem('kroova_onboarding_seen', 'true');
    setDismissed(true);
    // Redirecionar para boosters com parâmetro de claim
    window.location.href = '/boosters?claim=free';
  };

  if (dismissed) return null;

  const steps = [
    {
      title: 'ALGO ESTÁ ERRADO',
      content: 'Você acaba de despertar dentro da Interface — uma dimensão digital corrompida onde os vícios da humanidade ganharam consciência própria. Eles se manifestam como Kroovas, entidades parasitárias que se alimentam do desejo humano. Quanto mais profundo o vício, mais poderosa a manifestação. E você foi escolhido para caçá-las.',
      icon: '⚠️',
      color: '#FF006D',
      cards: ['crd_24ff7f', 'crd_2f91e0', 'crd_2e0f36']
    },
    {
      title: 'VAZAMENTOS INSTÁVEIS',
      content: 'Cada pacote de cartas é um portal instável entre dimensões. Dentro dele, você encontrará cinco Kroovas capturadas. Algumas são comuns — vícios menores como procrastinação. Outras são lendárias — obsessões que destroem vidas inteiras. No mercado negro da Interface, as mais raras valem fortunas.',
      icon: '🌀',
      color: '#00F0FF',
      cards: ['crd_27e626', 'crd_261181', 'crd_18d8b8']
    },
    {
      title: 'COMERCIANTE DE VÍCIOS',
      content: 'Agora você é o comerciante. Abra pacotes de cartas. Negocie no marketplace. Recicle as fracas para invocar manifestações mais poderosas. Mas cuidado: a Interface está viva, ela observa cada movimento e aprende com você. Quanto mais você joga, mais ela cresce.',
      icon: '💎',
      color: '#FFC700',
      cards: ['crd_185a68', 'crd_3e5727', 'crd_139062']
    }
  ];

  const step = steps[currentStep];

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-25px) translateX(5px);
          }
        }
      `}</style>
      
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 rounded-lg max-w-2xl w-full p-8 relative overflow-hidden"
           style={{ borderColor: step.color }}>
        {/* Animated background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
             style={{ background: `radial-gradient(circle at center, ${step.color}40, transparent)` }} />
        
        {/* Floating real cards */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {step.cards.map((cardId, idx) => (
            <div
              key={`${currentStep}-${idx}`}
              className="absolute w-40 h-56 rounded-lg shadow-2xl"
              style={{
                backgroundImage: `url(/cards/${cardId}.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                left: `${15 + idx * 30}%`,
                top: `${20 + idx * 15}%`,
                animation: `float ${3 + idx}s ease-in-out infinite`,
                animationDelay: `${idx * 0.5}s`,
                transform: `rotate(${-10 + idx * 10}deg)`,
                filter: 'drop-shadow(0 0 20px rgba(255, 0, 109, 0.3))'
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          {/* Audio indicator */}
          {audioPlaying && (
            <div className="absolute top-0 right-0 flex items-center gap-2 text-xs text-gray-400">
              <span className="animate-pulse">🔊</span>
              <span>Áudio ativo</span>
            </div>
          )}
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className="h-2 w-12 rounded-full transition-all"
                style={{
                  backgroundColor: idx === currentStep ? step.color : '#374151',
                  opacity: idx === currentStep ? 1 : 0.3
                }}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="text-center mb-4">
            <div 
              className="text-8xl inline-block animate-pulse" 
              style={{ 
                filter: `drop-shadow(0 0 30px ${step.color})`,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              {step.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white text-center mb-4 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-geist-mono), monospace', color: step.color }}>
            <TextGlitch delay={100}>{step.title}</TextGlitch>
          </h2>

          {/* Content */}
          <p className="text-gray-300 text-center text-lg mb-8 leading-relaxed">
            {step.content}
          </p>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            {currentStep < steps.length - 1 ? (
              <>
                <button
                  onClick={handleDismiss}
                  className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 transition uppercase font-semibold"
                  style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                >
                  Pular
                </button>
                <button
                  onClick={() => {
                    if (!audioEnabled) setAudioEnabled(true);
                    setCurrentStep(currentStep + 1);
                  }}
                  className="px-8 py-3 text-white rounded font-bold uppercase tracking-wider hover:opacity-80 transition"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}, ${step.color}80)`,
                    fontFamily: 'var(--font-geist-mono), monospace',
                    boxShadow: `0 0 20px ${step.color}60`
                  }}
                >
                  Continuar →
                </button>
              </>
            ) : (
              <button
                onClick={handleClaimBooster}
                className="px-10 py-4 text-white rounded-lg font-bold uppercase tracking-wider hover:scale-105 transition animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #FF006D, #00F0FF)',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  boxShadow: '0 0 30px rgba(255, 0, 109, 0.6)'
                }}
              >
                🎁 REIVINDICAR 3 PACOTES GRÁTIS
              </button>
            )}
          </div>

          {/* Skip link for last step */}
          {currentStep === steps.length - 1 && (
            <div className="text-center mt-4">
              <button
                onClick={handleDismiss}
                className="text-gray-400 text-sm hover:text-white transition underline"
              >
                Pular por enquanto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
