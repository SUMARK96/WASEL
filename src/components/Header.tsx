import React from 'react';
import type { AppScreen, DriverProfile } from '../types';
import { Logo } from './Logo';
import { Plus, Sparkles, ShieldCheck, LogOut, ArrowRight, UserCheck, Truck } from 'lucide-react';

interface HeaderProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onOpenNewRequest: () => void;
  onOpenSubscription: () => void;
  currentDriver?: DriverProfile;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenNewRequest,
  onOpenSubscription,
  currentDriver
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/80 shadow-lg shadow-blue-950/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Official Logo Brand */}
          <div 
            className="flex items-center cursor-pointer group active:scale-95 transition-transform" 
            onClick={() => onNavigate('landing')}
            title="العودة للصفحة الرئيسية"
          >
            <Logo size="md" />
          </div>

          {/* Current Mode Badge / Breadcrumb for medium/large screens */}
          {currentScreen !== 'landing' && (
            <div className="hidden md:flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-bold shadow-inner">
              {currentScreen === 'customer' && (
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <span>بوابة العميل - نشر واستقبال العروض</span>
                </span>
              )}
              {currentScreen === 'driver' && currentDriver && (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>حساب السائق: {currentDriver.name}</span>
                </span>
              )}
              {(currentScreen === 'driver_portal' || currentScreen === 'driver_login' || currentScreen === 'driver_register') && (
                <span className="text-blue-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>بوابة السائقين المستقلين</span>
                </span>
              )}
              {currentScreen === 'admin' && (
                <span className="text-rose-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>لوحة الإدارة المعتمدة</span>
                </span>
              )}
            </div>
          )}

          {/* Action Buttons Depending on Current Screen */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* If on Customer screen */}
            {currentScreen === 'customer' && (
              <>
                <button
                  onClick={onOpenNewRequest}
                  className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  <span className="hidden sm:inline">نشر طلب توصيل جديد</span>
                  <span className="sm:hidden">طلب جديد</span>
                </button>

                <button
                  onClick={() => onNavigate('landing')}
                  className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-rose-500/20 text-xs transition-all active:scale-95"
                  title="الخروج والعودة للشاشة الرئيسية"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">تسجيل خروج</span>
                </button>
              </>
            )}

            {/* If on Driver screen */}
            {currentScreen === 'driver' && currentDriver && (
              <>
                <button
                  onClick={onOpenSubscription}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs border transition-all shadow-md active:scale-95 ${
                    currentDriver.subscriptionStatus === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 animate-pulse'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {currentDriver.subscriptionStatus === 'active'
                      ? `اشتراك (${currentDriver.subscriptionPlan.toUpperCase()})`
                      : 'تجديد الاشتراك'}
                  </span>
                  <span className="sm:hidden">الاشتراك</span>
                </button>

                <button
                  onClick={() => onNavigate('landing')}
                  className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-rose-500/20 text-xs transition-all active:scale-95"
                  title="تسجيل الخروج والعودة للرئيسية"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">تسجيل خروج</span>
                </button>
              </>
            )}

            {/* If on Driver portal / login / register */}
            {(currentScreen === 'driver_portal' || currentScreen === 'driver_login' || currentScreen === 'driver_register') && (
              <button
                onClick={() => onNavigate('landing')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-700 text-xs transition-all active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            )}

            {/* If on Admin screen */}
            {currentScreen === 'admin' && (
              <button
                onClick={() => onNavigate('landing')}
                className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-rose-500/20 text-xs transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
