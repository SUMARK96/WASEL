import React from 'react';
import { Package, Truck, ArrowLeft, ShieldCheck, Sparkles, PhoneCall, Clock, CheckCircle2 } from 'lucide-react';

interface LandingViewProps {
  onSelectCustomer: () => void;
  onSelectDriver: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSelectCustomer,
  onSelectDriver
}) => {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-6 sm:py-12">
      
      {/* Hero Title Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>المنصة الأولى المباشرة لتوصيل الطرود بين إمارات الدولة</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight">
          أهلاً بك في منصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300">واصـل</span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          يرجى تحديد نوع حسابك للبدء في استخدام المنصة:
        </p>
      </div>

      {/* The 2 Primary Selection Cards (Customer or Driver ONLY) */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 px-2">
        
        {/* OPTION 1: CUSTOMER */}
        <div
          onClick={onSelectCustomer}
          className="group relative cursor-pointer bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 hover:border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-amber-500/10 flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all duration-500" />
          
          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-8 h-8 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                مجاني للعملاء 🎁
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-amber-400 transition-colors">
                أنا عميل
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                أريد إرسال أو توصيل طرد، مستندات، أجهزة، أو بضائع بين أي إمارتين في الدولة واستقبال عروض الأسعار مباشرة.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>نشر طلبات التوصيل مجاناً بدون رسوم</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>استقبال عروض أسعار تنافسية من سائقين مستقلين</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تواصل واتساب ومكالمات مباشر وفوري</span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectCustomer();
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl shadow-amber-500/20 transition-all text-sm sm:text-base flex items-center justify-center gap-2 group-hover:shadow-amber-500/30"
            >
              <span>الدخول كـ عميل</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* OPTION 2: DRIVER */}
        <div
          onClick={onSelectDriver}
          className="group relative cursor-pointer bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 hover:border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-emerald-500/10 flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />
          
          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                عمولة 0% ⚡
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">
                أنا سائق
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                أملك مركبة وأريد تقديم خدمات التوصيل بين الإمارات باشتراك شهري واستقبال طلبات الزبائن مباشرة.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>اشتراك شهري ثابت بدون أي نسبة عمولة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>إشعارات فورية بكل طلب توصيل ينشره العميل</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all text-sm sm:text-base flex items-center justify-center gap-2 group-hover:shadow-emerald-500/30"
            >
              <span>الدخول كـ سائق</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Trust Badges Bar */}
      <div className="mt-12 sm:mt-16 max-w-4xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
          <ShieldCheck className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-white">سائقون موثوقون</div>
          <div className="text-[10px] text-slate-400">توثيق الهوية والرخصة</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
          <Clock className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-white">توصيل فوري وعاجل</div>
          <div className="text-[10px] text-slate-400">في نفس اليوم أو بموعدك</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
          <PhoneCall className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-white">تواصل واتساب مباشر</div>
          <div className="text-[10px] text-slate-400">بدون وسطاء أو تعقيد</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
          <Truck className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-white">جميع إمارات الدولة</div>
          <div className="text-[10px] text-slate-400">تغطية شاملة 7 إمارات</div>
        </div>
      </div>

    </div>
  );
};
