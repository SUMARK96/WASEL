import React from 'react';
import type { AppScreen, DriverProfile } from '../types';
import { Truck, Plus, Sparkles, ShieldCheck, LogOut, ArrowRight, UserCheck } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Platform Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onNavigate('landing')}
            title="العودة للصفحة الرئيسية"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-2xl group-hover:scale-105 transition-transform">
              <Truck className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-amber-400 transition-colors">واصـل</span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                  WASEL UAE
                </span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-bold tracking-wide mt-0.5">أمان . سرعة . إحترافية</p>
            </div>
          </div>

          {/* Current Mode Badge / Breadcrumb */}
          {currentScreen !== 'landing' && (
            <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-bold">
              {currentScreen === 'customer' && (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>بوابة العميل - نشر واستقبال العروض</span>
                </span>
              )}
              {currentScreen === 'driver' && currentDriver && (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>حساب السائق: {currentDriver.name}</span>
                </span>
              )}
              {(currentScreen === 'driver_portal' || currentScreen === 'driver_login' || currentScreen === 'driver_register') && (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
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
          <div className="flex items-center gap-2.5">
            
            {/* If on Customer screen */}
            {currentScreen === 'customer' && (
              <>
                <button
                  onClick={onOpenNewRequest}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3.5 sm:px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  <span className="hidden sm:inline">نشر طلب توصيل جديد</span>
                  <span className="sm:hidden">طلب جديد</span>
                </button>

                <button
                  onClick={() => onNavigate('landing')}
                  className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-3 py-2.5 rounded-xl border border-rose-500/20 text-xs transition-all"
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
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs border transition-all shadow-md ${
                    currentDriver.subscriptionStatus === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
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
                  className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-3 py-2.5 rounded-xl border border-rose-500/20 text-xs transition-all"
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
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            )}

            {/* If on Admin screen */}
            {currentScreen === 'admin' && (
              <button
                onClick={() => onNavigate('landing')}
                className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-3.5 py-2.5 rounded-xl border border-rose-500/20 text-xs transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج من الإدارة</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
