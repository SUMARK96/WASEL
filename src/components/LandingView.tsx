import React from 'react';
import { Package, Truck, ArrowLeft, ShieldCheck, Sparkles, PhoneCall, Clock, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';
import { NotificationBanner } from './NotificationBanner';

interface LandingViewProps {
  onSelectCustomer: () => void;
  onSelectDriver: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSelectCustomer,
  onSelectDriver
}) => {
  return (
    <div className="min-h-[82vh] flex flex-col justify-center py-4 sm:py-10 px-2 sm:px-4 space-y-6">
      
      {/* PWA & System Notifications Banner */}
      <div className="max-w-4xl mx-auto w-full">
        <NotificationBanner userRole="general" />
      </div>

      {/* Hero Title Section with Logo */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-4">
        
        {/* Centered Brand Showcase */}
        <div className="flex justify-center mb-3">
          <Logo size="lg" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs sm:text-sm font-bold shadow-sm shadow-cyan-500/10">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>المنصة المباشرة الأولى لربط العملاء بسائقي التوصيل في الإمارات</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-snug">
          خدمة توصيل فورية ومباشرة <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300">
            بين جميع إمارات الدولة
          </span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
          اختر نوع حسابك للمتابعة والبدء في نشر أو استقبال طلبات التوصيل:
        </p>
      </div>

      {/* The 2 Primary Selection Cards (Customer or Driver ONLY) */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        
        {/* OPTION 1: CUSTOMER */}
        <div
          onClick={onSelectCustomer}
          className="group relative cursor-pointer bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 border-2 border-slate-800 hover:border-cyan-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/40 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-cyan-500/15 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />
          
          <div className="space-y-4 sm:space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-500/30 shadow-sm">
                مجاني للعملاء 🎁
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                عميل
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                أريد إرسال أو توصيل طرد، مستندات، أجهزة، أو بضائع بين أي إمارتين في الدولة واستقبال عروض الأسعار مباشرة.
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>نشر طلبات التوصيل مجاناً بدون رسوم</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>عروض فورية من سائقين معتمدين ومرخصين</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>تواصل واتساب ومكالمات مباشر بدون وسيط</span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectCustomer();
              }}
              className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-3.5 sm:py-4 px-6 rounded-2xl shadow-xl shadow-blue-600/30 transition-all text-sm sm:text-base flex items-center justify-center gap-2 group-hover:shadow-cyan-500/30 active:scale-95"
            >
              <span>دخول - عميل</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* OPTION 2: DRIVER */}
        <div
          onClick={onSelectDriver}
          className="group relative cursor-pointer bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 border-2 border-slate-800 hover:border-teal-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/40 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-teal-500/15 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none group-hover:bg-teal-500/20 transition-all duration-500" />
          
          <div className="space-y-4 sm:space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-teal-300 bg-teal-500/15 px-3 py-1 rounded-full border border-teal-500/30 shadow-sm">
                عمولة 0% ⚡
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-teal-400 transition-colors">
                سائق
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                أملك مركبة وأريد تقديم خدمات التوصيل بين الإمارات باشتراك شهري واستقبال طلبات الزبائن مباشرة.
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>اشتراك شهري موحد بدون اقتطاع أي عمولة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>إشعارات فورية بكل طلب توصيل ينشره العميل</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>تقديم عروضك وتواصل مباشر مع العميل</span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectDriver();
              }}
              className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black py-3.5 sm:py-4 px-6 rounded-2xl shadow-xl shadow-teal-600/30 transition-all text-sm sm:text-base flex items-center justify-center gap-2 group-hover:shadow-teal-500/30 active:scale-95"
            >
              <span>دخول - سائق</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Trust Badges Bar */}
      <div className="mt-10 sm:mt-14 max-w-4xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-white">سائقون موثوقون</div>
          <div className="text-[10px] text-slate-400">توثيق الهوية والرخصة والملكية</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-white">توصيل فوري وعاجل</div>
          <div className="text-[10px] text-slate-400">في نفس اليوم أو بموعدك المحدد</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
          <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-white">تواصل واتساب مباشر</div>
          <div className="text-[10px] text-slate-400">اتصال وتنسيق بدون وسطاء</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 text-center shadow-lg">
          <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-white">جميع إمارات الدولة</div>
          <div className="text-[10px] text-slate-400">تغطية شاملة لكل إمارات الدولة</div>
        </div>
      </div>

    </div>
  );
};
