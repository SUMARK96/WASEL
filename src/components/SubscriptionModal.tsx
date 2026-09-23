import React, { useState } from 'react';
import type { DriverProfile, SubscriptionPlanId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/mockData';
import { X, Check, Sparkles, CreditCard, ShieldCheck, Zap } from 'lucide-react';

interface SubscriptionModalProps {
  driver: DriverProfile;
  onClose: () => void;
  onSubscribeSuccess: (planId: SubscriptionPlanId) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  driver,
  onClose,
  onSubscribeSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>(driver.subscriptionPlan || 'pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Mock Payment Card Form
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
        onSubscribeSuccess(selectedPlan);
      }, 1200);
    }, 1500);
  };

  const planDetails = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan) || SUBSCRIPTION_PLANS[1];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Handle Indicator */}
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
              <h3 className="text-base sm:text-lg font-black text-white">الاشتراك الشهري للسائقين</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">اختر الباقة المناسبة للتقديم على طلبات التوصيل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Touch Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain touch-pan-y">
          {paymentDone ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border-2 border-emerald-500/30 animate-bounce">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white">تم تفعيل الاشتراك الشهري بنجاح!</h4>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md">
                تهانينا! حسابك الآن مفعّل على منصة واصل بخطة <span className="text-amber-400 font-bold">{planDetails.name}</span>. يمكنك البدء فوراً بتقديم العروض للعملاء.
              </p>
            </div>
          ) : (
            <>
              {/* Subscription Plans Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {plan.recommended && (
                        <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                          الأكثر طلباً ⭐
                        </span>
                      )}

                      <div>
                        <h4 className="font-extrabold text-white text-sm sm:text-base mb-1">{plan.name}</h4>
                        <div className="flex items-baseline gap-1 my-2 sm:my-3">
                          <span className="text-xl sm:text-2xl font-black text-amber-400">{plan.price}</span>
                          <span className="text-[11px] text-slate-400 font-semibold">درهم / شهرياً</span>
                        </div>

                        <ul className="space-y-1.5 text-xs text-slate-300 mb-4">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div
                        className={`w-full py-2 rounded-xl text-center font-bold text-xs transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isSelected ? 'الباقة المختارة' : 'اختيار الباقة'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Form Simulator */}
              <form onSubmit={handlePay} className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 font-extrabold text-white text-xs sm:text-sm">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>دفع الاشتراك عبر البطاقة</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">{planDetails.price} AED / شهر</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">رقم البطاقة (Visa / Mastercard)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">الانتهاء</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 text-center"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin text-slate-950" />
                      <span>جاري معالجة الدفع...</span>
                    </>
                  ) : (
                    <span>دفع وتأكيد الاشتراك الشهري ({planDetails.price} AED)</span>
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
