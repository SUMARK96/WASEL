import React from 'react';
import { UserPlus, LogIn, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, CreditCard, Bell } from 'lucide-react';

interface DriverPortalGateProps {
  onSelectNewDriver: () => void;
  onSelectExistingDriver: () => void;
  onBackToLanding: () => void;
}

export const DriverPortalGate: React.FC<DriverPortalGateProps> = ({
  onSelectNewDriver,
  onSelectExistingDriver,
  onBackToLanding
}) => {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-6 sm:py-10 max-w-4xl mx-auto w-full">
      
      {/* Top Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-2xl border border-slate-800 text-xs font-bold transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية (اختيار عميل أو سائق)</span>
        </button>

        <span className="text-xs text-amber-400 font-extrabold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          بوابة كباتن وسائقي واصل 🚚
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          بوابة السائقين المستقلين
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
          اختر الطريقة المناسبة للمتابعة إلى حسابك في منصة واصل:
        </p>
      </div>

      {/* The 2 Driver Portal Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 px-2">
        
        {/* OPTION 1: NEW DRIVER REGISTRATION & SUBSCRIPTION */}
        <div
          onClick={onSelectNewDriver}
          className="group relative cursor-pointer bg-slate-900 border-2 border-slate-800 hover:border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none group-hover:bg-amber-500/15 transition-all" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <UserPlus className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                تسجيل فوري ✨
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                سائق جديد
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                ليس لديك حساب بعد؟ سجل بياناتك الآن، اختر مركبتك، فعّل اشتراكك الشهري وابدأ استقبال الطلبات فوراً.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>تسجيل بيانات السائق والمركبة</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                <span>اختيار باقة الاشتراك والدفع الإلكتروني</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تفعيل فوري لشارة "سائق معتمد"</span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectNewDriver();
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 px-5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <span>تسجيل سائق جديد ودفع الاشتراك</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* OPTION 2: ALREADY HAVE AN ACCOUNT (LOGIN) */}
        <div
          onClick={onSelectExistingDriver}
          className="group relative cursor-pointer bg-slate-900 border-2 border-slate-800 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <LogIn className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                تسجيل الدخول 🔑
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                لدي حساب
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                هل أنت مسجل بالفعل كسائق في منصة واصل؟ أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة تحكمك.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>استعراض سوق طلبات التوصيل الجديدة</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تقديم العروض والتواصل المباشر مع العملاء</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>متابعة رحلاتك المنجزة والمقبولة</span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectExistingDriver();
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-3.5 px-5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <span>تسجيل الدخول إلى حسابي</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
