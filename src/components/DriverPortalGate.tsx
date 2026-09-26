import React from 'react';
import { UserPlus, LogIn, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, CreditCard, Bell } from 'lucide-react';

interface DriverPortalGateProps {
  onSelectNewDriver: () => void;
  onSelectExistingDriver: () => void;
  onBackToLanding: () => void;
  subscriptionPrice?: number;
}

export const DriverPortalGate: React.FC<DriverPortalGateProps> = ({
  onSelectNewDriver,
  onSelectExistingDriver,
  onBackToLanding,
  subscriptionPrice = 199
}) => {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-4 sm:py-10 max-w-4xl mx-auto w-full px-2 sm:px-4">
      
      {/* Top Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 bg-white hover:bg-[#F5F9FC] text-[#142F52] hover:text-[#159B7A] px-3.5 py-2 sm:py-2.5 rounded-2xl border border-[#E5EDF3] text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>

        <span className="text-xs text-[#159B7A] font-extrabold bg-[#EAF6F1] px-3 py-1 rounded-full border border-[#159B7A]/20">
          بوابة كباتن وسائقي واصل 🚚
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-8 sm:mb-10 space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-[#142F52]">
          بوابة السائقين المستقلين
        </h1>
        <p className="text-[#64748B] text-xs sm:text-sm max-w-lg mx-auto">
          اختر الطريقة المناسبة للمتابعة إلى حسابك في منصة واصل:
        </p>
      </div>

      {/* The 2 Driver Portal Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        
        {/* OPTION 1: NEW DRIVER REGISTRATION & SUBSCRIPTION */}
        <div
          onClick={onSelectNewDriver}
          className="group relative cursor-pointer bg-white border border-[#E5EDF3] hover:border-[#159B7A] rounded-3xl p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
        >
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-black shadow-xs group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-[#159B7A] bg-[#EAF6F1] px-2.5 py-1 rounded-full border border-[#159B7A]/20">
                تسجيل فوري ✨
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#142F52] group-hover:text-[#159B7A] transition-colors">
                سائق جديد
              </h3>
              <p className="text-[#64748B] text-xs sm:text-sm mt-1.5 leading-relaxed">
                ليس لديك حساب بعد؟ سجل بياناتك الآن، ارفع وثائقك ومركبتك، فعّل اشتراكك الموحد وابدأ استقبال الطلبات فوراً.
              </p>
            </div>

            <div className="space-y-2 pt-2.5 border-t border-[#E5EDF3] text-xs text-[#142F52]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#159B7A] shrink-0" />
                <span>تسجيل بيانات السائق ورفع الصور والمستندات</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#159B7A] shrink-0" />
                <span>اشتراك موحد {subscriptionPrice} درهم أو كود إعفاء مجاني</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#159B7A] shrink-0" />
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
              className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3.5 px-5 rounded-2xl shadow-md hover:shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>تسجيل سائق جديد ودفع الاشتراك</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* OPTION 2: ALREADY HAVE AN ACCOUNT (LOGIN) */}
        <div
          onClick={onSelectExistingDriver}
          className="group relative cursor-pointer bg-white border border-[#E5EDF3] hover:border-[#159B7A] rounded-3xl p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
        >
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EEF4FA] text-[#142F52] group-hover:text-[#159B7A] flex items-center justify-center font-black shadow-xs group-hover:scale-110 transition-transform">
                <LogIn className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-[#142F52] bg-[#EEF4FA] px-2.5 py-1 rounded-full border border-[#E5EDF3]">
                تسجيل الدخول 🔑
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#142F52] group-hover:text-[#159B7A] transition-colors">
                لدي حساب
              </h3>
              <p className="text-[#64748B] text-xs sm:text-sm mt-1.5 leading-relaxed">
                هل أنت مسجل بالفعل كسائق في منصة واصل؟ أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة تحكمك.
              </p>
            </div>

            <div className="space-y-2 pt-2.5 border-t border-[#E5EDF3] text-xs text-[#142F52]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#159B7A] shrink-0" />
                <span>استعراض سوق طلبات التوصيل الجديدة</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#159B7A] shrink-0" />
                <span>تقديم العروض والتواصل المباشر مع العملاء</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#159B7A] shrink-0" />
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
              className="w-full bg-[#EEF4FA] hover:bg-[#E2EDF7] text-[#142F52] border border-[#E5EDF3] hover:border-[#CBD5E1] font-bold py-3.5 px-5 rounded-2xl shadow-xs transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
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
