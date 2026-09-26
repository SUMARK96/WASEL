import React from 'react';
import { Package, Truck, ArrowLeft, ShieldCheck, PhoneCall, Clock, CheckCircle2 } from 'lucide-react';
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

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#142F52] tracking-tight leading-snug">
          خدمة توصيل فورية ومباشرة <br className="hidden sm:inline" />
          <span className="text-[#159B7A]">
            بين جميع إمارات الدولة
          </span>
        </h1>

        <p className="text-[#64748B] text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
          اختر نوع حسابك للمتابعة والبدء في نشر أو استقبال طلبات التوصيل:
        </p>
      </div>

      {/* The 2 Primary Selection Cards (Customer or Driver ONLY) */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        
        {/* OPTION 1: CUSTOMER */}
        <div
          onClick={onSelectCustomer}
          className="group relative cursor-pointer bg-white border border-[#E5EDF3] hover:border-[#159B7A] rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
        >
          <div className="space-y-4 sm:space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-black shadow-xs group-hover:scale-110 transition-transform duration-300">
                <Package className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-[#159B7A] bg-[#EAF6F1] border border-[#159B7A]/20 px-3 py-1 rounded-full shadow-xs">
                مجاني للعملاء 🎁
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#142F52] group-hover:text-[#159B7A] transition-colors">
                عميل
              </h2>
              <p className="text-[#64748B] text-xs sm:text-sm mt-1.5 leading-relaxed">
                أريد إرسال أو توصيل طرد، مستندات، أجهزة، أو بضائع بين أي إمارتين في الدولة واستقبال عروض الأسعار مباشرة.
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-[#E5EDF3] text-xs sm:text-sm text-[#142F52]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
                <span>نشر طلبات التوصيل مجاناً بدون رسوم</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
                <span>عروض فورية من سائقين معتمدين ومرخصين</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
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
              className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3.5 sm:py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>دخول - عميل</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* OPTION 2: DRIVER */}
        <div
          onClick={onSelectDriver}
          className="group relative cursor-pointer bg-white border border-[#E5EDF3] hover:border-[#159B7A] rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
        >
          <div className="space-y-4 sm:space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EEF4FA] text-[#142F52] group-hover:text-[#159B7A] flex items-center justify-center font-black shadow-xs group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-[#142F52] bg-[#EEF4FA] border border-[#E5EDF3] px-3 py-1 rounded-full shadow-xs">
                عمولة 0% ⚡
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#142F52] group-hover:text-[#159B7A] transition-colors">
                سائق
              </h2>
              <p className="text-[#64748B] text-xs sm:text-sm mt-1.5 leading-relaxed">
                أملك مركبة وأريد تقديم خدمات التوصيل بين الإمارات باشتراك شهري واستقبال طلبات الزبائن مباشرة.
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-[#E5EDF3] text-xs sm:text-sm text-[#142F52]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
                <span>اشتراك شهري موحد بدون اقتطاع أي عمولة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
                <span>إشعارات فورية بكل طلب توصيل ينشره العميل</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
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
              className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3.5 sm:py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>دخول - سائق</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Trust Badges Bar */}
      <div className="mt-10 sm:mt-14 max-w-4xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E5EDF3] rounded-2xl p-3 sm:p-4 text-center shadow-xs">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#159B7A] mx-auto mb-1.5" />
          <div className="text-xs font-bold text-[#142F52]">سائقون موثوقون</div>
          <div className="text-[10px] text-[#64748B]">توثيق الهوية والرخصة والملكية</div>
        </div>

        <div className="bg-white border border-[#E5EDF3] rounded-2xl p-3 sm:p-4 text-center shadow-xs">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#159B7A] mx-auto mb-1.5" />
          <div className="text-xs font-bold text-[#142F52]">توصيل فوري وعاجل</div>
          <div className="text-[10px] text-[#64748B]">في نفس اليوم أو بموعدك المحدد</div>
        </div>

        <div className="bg-white border border-[#E5EDF3] rounded-2xl p-3 sm:p-4 text-center shadow-xs">
          <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 text-[#159B7A] mx-auto mb-1.5" />
          <div className="text-xs font-bold text-[#142F52]">تواصل واتساب مباشر</div>
          <div className="text-[10px] text-[#64748B]">اتصال وتنسيق بدون وسطاء</div>
        </div>

        <div className="bg-white border border-[#E5EDF3] rounded-2xl p-3 sm:p-4 text-center shadow-xs">
          <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#159B7A] mx-auto mb-1.5" />
          <div className="text-xs font-bold text-[#142F52]">جميع إمارات الدولة</div>
          <div className="text-[10px] text-[#64748B]">تغطية شاملة لكل إمارات الدولة</div>
        </div>
      </div>

    </div>
  );
};
