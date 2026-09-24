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
    <div className="min-h-[75vh] flex flex-col justify-center py-4 sm:py-10 max-w-4xl mx-auto w-full px-2 sm:px-4">
      
      {/* Top Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3.5 py-2 sm:py-2.5 rounded-2xl border border-zinc-800 text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>

        <span className="text-xs text-white font-extrabold bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700">
          بوابة كباتن وسائقي واصل 🚚
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-8 sm:mb-10 space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          بوابة السائقين المستقلين
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto">
          اختر الطريقة المناسبة للمتابعة إلى حسابك في منصة واصل:
        </p>
      </div>

      {/* The 2 Driver Portal Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        
        {/* OPTION 1: NEW DRIVER REGISTRATION & SUBSCRIPTION */}
        <div
          onClick={onSelectNewDriver}
          className="group relative cursor-pointer bg-zinc-950 border-2 border-zinc-800 hover:border-white rounded-3xl p-5 sm:p-8 shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
        >
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-white bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-700">
                تسجيل فوري ✨
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-zinc-200 transition-colors">
                سائق جديد
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                ليس لديك حساب بعد؟ سجل بياناتك الآن، ارفع وثائقك ومركبتك، فعّل اشتراكك الموحد وابدأ استقبال الطلبات فوراً.
              </p>
            </div>

            <div className="space-y-2 pt-2.5 border-t border-zinc-800 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white shrink-0" />
                <span>تسجيل بيانات السائق ورفع الصور والمستندات</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white shrink-0" />
                <span>اشتراك موحد 199 درهم والدفع الإلكتروني</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white shrink-0" />
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
              className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3.5 px-5 rounded-2xl shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <span>تسجيل سائق جديد ودفع الاشتراك</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* OPTION 2: ALREADY HAVE AN ACCOUNT (LOGIN) */}
        <div
          onClick={onSelectExistingDriver}
          className="group relative cursor-pointer bg-zinc-950 border-2 border-zinc-800 hover:border-white rounded-3xl p-5 sm:p-8 shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
        >
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform">
                <LogIn className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-white bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-700">
                تسجيل الدخول 🔑
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-zinc-200 transition-colors">
                لدي حساب
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                هل أنت مسجل بالفعل كسائق في منصة واصل؟ أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة تحكمك.
              </p>
            </div>

            <div className="space-y-2 pt-2.5 border-t border-zinc-800 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-white shrink-0" />
                <span>استعراض سوق طلبات التوصيل الجديدة</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white shrink-0" />
                <span>تقديم العروض والتواصل المباشر مع العملاء</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                <span>متابعة رحلاتك المنجزة وتقييماتك</span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectExistingDriver();
              }}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-black py-3.5 px-5 rounded-2xl shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
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
