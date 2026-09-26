import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowLeft, ShieldCheck, ChevronLeft } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const EMIRATES = [
  'أبوظبي',
  'دبي',
  'الشارقة',
  'عجمان',
  'أم القيوين',
  'رأس الخيمة',
  'الفجيرة'
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [activeEmirateIdx, setActiveEmirateIdx] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isInteractive, setIsInteractive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Progressive loading simulation with dynamic speed
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4s total showcase duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      // Rotate highlighted emirate as loading progresses
      const emirateStep = Math.min(
        EMIRATES.length - 1,
        Math.floor((currentProgress / 100) * EMIRATES.length)
      );
      setActiveEmirateIdx(emirateStep);

      if (currentProgress >= 100) {
        clearInterval(interval);
        handleExit();
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onFinish();
    }, 700); // 700ms smooth cinematic fade out
  };

  // 3D Parallax Tilt Effect on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 18, y: -y * 18 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExiting
          ? 'opacity-0 scale-105 pointer-events-none filter blur-sm'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 35%, #142F52 0%, #0A192F 60%, #060F1E 100%)'
      }}
    >
      {/* Background Animated Ambient Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Emerald Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#159B7A]/25 rounded-full blur-3xl animate-pulse" />
        {/* Bottom Navy Glow */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#159B7A]/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Subtle Luxury Grid Lines Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Top Bar: Skip / Fast-forward Button */}
      <div className="w-full max-w-4xl flex items-center justify-between relative z-20 pt-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-white/90 text-xs font-semibold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#159B7A] animate-ping" />
          <span>منصة واصل الإماراتية</span>
        </div>

        <button
          type="button"
          onClick={handleExit}
          className="group flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white border border-white/15 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 backdrop-blur-md cursor-pointer shadow-md"
        >
          <span>تخطي</span>
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Center: Interactive 3D Logo Showcase */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-20 my-auto text-center px-4">
        
        {/* Logo Interactive Container */}
        <div
          onClick={handleExit}
          onMouseEnter={() => setIsInteractive(true)}
          onMouseLeave={() => setIsInteractive(false)}
          className="relative cursor-pointer group mb-8 transition-transform duration-300 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(${
              isInteractive ? '1.05' : '1'
            }, ${isInteractive ? '1.05' : '1'}, 1)`
          }}
        >
          {/* Multi-layered Pulsing Radar Halo Rings */}
          <div className="absolute inset-0 rounded-3xl bg-[#159B7A]/30 blur-xl scale-125 animate-pulse" />
          <div className="absolute -inset-4 rounded-3xl border border-[#159B7A]/30 scale-100 animate-ping duration-1000 opacity-60" />
          <div className="absolute -inset-8 rounded-full border border-white/10 scale-95 animate-pulse duration-700" />

          {/* Logo Card with Glassmorphic Luxury Border */}
          <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-xl p-3 border border-white/30 shadow-[0_20px_50px_rgba(21,155,122,0.35)] flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-[#159B7A]/60 group-hover:shadow-[0_25px_60px_rgba(21,155,122,0.55)]">
            
            {/* Shimmer Light Reflection passing over logo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            {/* Official Logo Image */}
            <img
              src="/wasel-logo.jpg"
              alt="واصل WASEL"
              className="w-full h-full object-contain rounded-2xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Floating Interactive Badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#159B7A] text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full shadow-lg border border-white/30 flex items-center gap-1 whitespace-nowrap group-hover:scale-110 transition-transform">
            <Sparkles className="w-3 h-3 animate-spin duration-300" />
            <span>WASEL PLATFORM</span>
          </div>
        </div>

        {/* Animated Brand Typography */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            منصة <span className="text-[#159B7A] underline decoration-[#159B7A]/40 underline-offset-8">واصل</span>
          </h1>

          <p className="text-sm sm:text-lg text-white/80 font-medium leading-relaxed max-w-md mx-auto">
            التوصيل المباشر والفوري بين جميع إمارات الدولة
          </p>
        </div>

        {/* 7 Emirates Animated Interactive Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-xl mx-auto">
          {EMIRATES.map((emirate, idx) => {
            const isHighlighted = idx <= activeEmirateIdx;
            const isCurrent = idx === activeEmirateIdx;
            return (
              <span
                key={emirate}
                className={`text-[11px] sm:text-xs font-bold px-3 py-1 rounded-xl transition-all duration-300 border ${
                  isCurrent
                    ? 'bg-[#159B7A] text-white border-[#159B7A] shadow-[0_0_15px_rgba(21,155,122,0.8)] scale-105'
                    : isHighlighted
                    ? 'bg-white/15 text-white/90 border-white/20'
                    : 'bg-white/5 text-white/40 border-white/5'
                }`}
              >
                {emirate}
              </span>
            );
          })}
        </div>

      </div>

      {/* Bottom: Luxury Progress Bar & Touch Prompt */}
      <div className="w-full max-w-md relative z-20 pb-2 sm:pb-4 space-y-3">
        {/* Progress Tracker with Percentage */}
        <div className="flex items-center justify-between text-xs font-bold text-white/80 px-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#159B7A]" />
            <span>{progress < 100 ? 'جاري تجهيز المنصة...' : 'مرحباً بك في واصل!'}</span>
          </span>
          <span className="text-[#159B7A] font-black">{progress}%</span>
        </div>

        {/* Smooth Emerald Progress Bar */}
        <div className="w-full h-2 rounded-full bg-white/10 p-0.5 border border-white/15 overflow-hidden backdrop-blur-sm shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#159B7A] via-[#1DC9A0] to-[#159B7A] transition-all duration-100 ease-out shadow-[0_0_12px_rgba(21,155,122,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Action Button to Enter Immediately */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleExit}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-bold tracking-wide transition-colors cursor-pointer active:scale-95"
          >
            <span>انقر في أي مكان للدخول الفوري</span>
            <ArrowLeft className="w-3.5 h-3.5 animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
};
