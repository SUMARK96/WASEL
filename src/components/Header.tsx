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
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-zinc-800 shadow-lg shadow-black/40">
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
            <div className="hidden md:flex items-center gap-2 bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-800 text-xs font-bold">
              {currentScreen === 'customer' && (
                <span className="text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-white" />
                  <span>بوابة العميل - نشر واستقبال العروض</span>
                </span>
              )}
              {currentScreen === 'driver' && currentDriver && (
                <span className="text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-white" />
                  <span>حساب السائق: {currentDriver.name}</span>
                </span>
              )}
              {(currentScreen === 'driver_portal' || currentScreen === 'driver_login' || currentScreen === 'driver_register') && (
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-zinc-300" />
                  <span>بوابة السائقين المستقلين</span>
                </span>
              )}
              {currentScreen === 'admin' && (
                <span className="text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-white" />
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
                  className="flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-zinc-200 text-black font-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md transition-all transform active:scale-95 text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  <span className="hidden sm:inline">نشر طلب توصيل جديد</span>
                  <span className="sm:hidden">طلب جديد</span>
                </button>

                <button
                  onClick={() => onNavigate('landing')}
                  className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-zinc-800 text-xs transition-all active:scale-95"
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
                      ? 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800'
                      : 'bg-white text-black border-white hover:bg-zinc-200 animate-pulse'
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
                  className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-zinc-800 text-xs transition-all active:scale-95"
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
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-zinc-800 text-xs transition-all active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            )}

            {/* If on Admin screen */}
            {currentScreen === 'admin' && (
              <button
                onClick={() => onNavigate('landing')}
                className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-zinc-800 text-xs transition-all active:scale-95"
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
