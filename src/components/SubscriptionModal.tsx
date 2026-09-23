import React, { useState } from 'react';
import type { DriverProfile, SubscriptionPlanId } from '../types';
import { UNIFIED_SUBSCRIPTION_PLAN } from '../data/mockData';
import { X, Check, Sparkles, CreditCard, ShieldCheck, Zap, Lock, Star } from 'lucide-react';

interface SubscriptionModalProps {
  driver: DriverProfile;
  onClose: () => void;
  onSubscribeSuccess: (planId: SubscriptionPlanId) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  driver: _driver,
  onClose,
  onSubscribeSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Payment Form State
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('492');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);
      setTimeout(() => {
        onSubscribeSuccess('unified');
      }, 1200);
    }, 1500);
  };

  const plan = UNIFIED_SUBSCRIPTION_PLAN;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 bg-slate-950 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="bg-slate-950 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">الاشتراك الشهري الموحد للسائقين</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">باقة موحدة واحدة لجميع كباتن واصل • عمولة 0%</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
          {paymentDone ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border-2 border-emerald-500/30 animate-bounce">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white">تم تجديد اشتراكك بنجاح! 🎉</h4>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed">
                حسابك الآن نشط على <span className="text-amber-400 font-bold">{plan.name}</span>. يمكنك الاستمرار بتقديم العروض للعملاء وتلقي الإشعارات الفورية.
              </p>
            </div>
          ) : (
            <>
              {/* Single Unified Plan Card */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 rounded-2xl border-2 border-amber-500/40 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block mb-1">
                      الباقة الموحدة للجميع ⭐
                    </span>
                    <h4 className="font-black text-white text-base sm:text-lg">{plan.name}</h4>
                  </div>

                  <div className="text-left">
                    <div className="text-2xl sm:text-3xl font-black text-amber-400">{plan.price}</div>
                    <div className="text-[10px] text-slate-400 font-bold">درهم / شهرياً</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 bg-amber-500/5 p-2.5 rounded-xl flex items-center gap-2 text-[11px] text-amber-300">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span>تظهر عروضك في مقدمة نتائج البحث للعميل بناءً على تقييمك ورضا العملاء عن رحلاتك!</span>
                </div>
              </div>

              {/* Payment Form Simulator */}
              <form onSubmit={handlePay} className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 font-extrabold text-white text-xs sm:text-sm">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>دفع الاشتراك عبر البطاقة البنكية</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <Lock className="w-3 h-3" />
                    <span>تشفير آمن</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">رقم البطاقة (Visa / Mastercard / Mada)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">تاريخ الانتهاء</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">رمز الأمان (CVV)</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500 text-center"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-xl shadow-xl shadow-amber-500/20 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin text-slate-950" />
                      <span>جاري معالجة الدفع والتجديد...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>دفع وتأكيد الاشتراك الشهري ({plan.price} AED)</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
