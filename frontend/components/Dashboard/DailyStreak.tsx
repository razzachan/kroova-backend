'use client';

import { useEffect, useState } from 'react';
import TextGlitch from '@/components/Effects/TextGlitch';

interface StreakData {
  currentStreak: number;
  lastLogin: string;
  totalLogins: number;
}

export default function DailyStreak() {
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, lastLogin: '', totalLogins: 0 });
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = () => {
    const stored = localStorage.getItem('kroova_daily_streak');
    const today = new Date().toDateString();
    
    if (!stored) {
      const newStreak = { currentStreak: 1, lastLogin: today, totalLogins: 1 };
      localStorage.setItem('kroova_daily_streak', JSON.stringify(newStreak));
      setStreak(newStreak);
      setShowReward(true);
      return;
    }

    const data: StreakData = JSON.parse(stored);
    const lastDate = new Date(data.lastLogin);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Já logou hoje
      setStreak(data);
    } else if (diffDays === 1) {
      // Login consecutivo
      const updated = {
        currentStreak: data.currentStreak + 1,
        lastLogin: today,
        totalLogins: data.totalLogins + 1
      };
      localStorage.setItem('kroova_daily_streak', JSON.stringify(updated));
      setStreak(updated);
      setShowReward(true);
      
      // Som de conquista
      if (typeof window !== 'undefined' && (window as any).Howl) {
        const sound = new (window as any).Howl({
          src: ['/sfx/rare_reveal.mp3'],
          volume: 0.3
        });
        sound.play();
      }
    } else {
      // Streak quebrada
      const reset = {
        currentStreak: 1,
        lastLogin: today,
        totalLogins: data.totalLogins + 1
      };
      localStorage.setItem('kroova_daily_streak', JSON.stringify(reset));
      setStreak(reset);
    }
  };

  const daysUntilReward = 7 - (streak.currentStreak % 7);
  const progress = ((streak.currentStreak % 7) / 7) * 100;

  return (
    <div className="bg-black/60 backdrop-blur-md border-2 border-[#FFC700]/40 rounded-lg p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFC700]/10 via-transparent to-[#FF006D]/10 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
            <TextGlitch delay={100}>DIAS NA INTERFACE</TextGlitch>
          </h3>
          <div className="text-4xl font-bold text-[#FFC700]" style={{ textShadow: '0 0 20px rgba(255, 199, 0, 0.8)' }}>
            {streak.currentStreak}
          </div>
        </div>

        {showReward && streak.currentStreak > 1 && (
          <div className="mb-4 p-3 bg-[#FFC700]/20 border border-[#FFC700] rounded animate-pulse">
            <p className="text-[#FFC700] font-semibold text-center">
              🎁 +{streak.currentStreak} pontos de streak!
            </p>
          </div>
        )}

        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progresso para recompensa</span>
            <span>{daysUntilReward} dias restantes</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-[#FFC700]/30">
            <div 
              className="h-full bg-gradient-to-r from-[#FFC700] to-[#FF006D] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-400">
            Total de logins: <span className="text-white font-semibold">{streak.totalLogins}</span>
          </div>
          {streak.currentStreak >= 7 && (
            <a 
              href="/boosters?claim=free"
              className="text-[#00F0FF] font-semibold animate-pulse hover:scale-110 transition-transform cursor-pointer"
            >
              🎁 3 PACOTES GRÁTIS DISPONÍVEIS!
            </a>
          )}
        </div>

        {streak.currentStreak >= 30 && (
          <div className="mt-3 p-2 bg-[#FF006D]/20 border border-[#FF006D] rounded">
            <p className="text-[#FF006D] font-semibold text-center text-sm">
              👑 MANIFESTAÇÃO CONTÍNUA - Streak de Elite!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
