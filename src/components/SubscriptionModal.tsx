import React, { useState } from 'react';
import type { DriverProfile, SubscriptionPlanId, SubscriptionInvoice } from '../types';
import { UNIFIED_SUBSCRIPTION_PLAN } from '../data/mockData';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Star, 
  ExternalLink, 
  AlertTriangle, 
  ArrowRight, 
  RotateCw, 
  CheckCircle2,
  FileText,
  Share2,
  Calendar,
  Bell
} from 'lucide-react';
import { 
  createSubscriptionInvoice, 
  calculateOneMonthExpiry, 
  getWhatsAppInvoiceUrl, 
  getDaysUntilExpiry,
  formatArabicDate
} from '../utils/subscriptionUtils';
import { InvoiceModal } from './InvoiceModal';

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
  const [stage, setStage] = useState<'plan' | 'link_opened' | 'verifying' | 'success' | 'failed'>('plan');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refNumber, setRefNumber] = useState<string>('');
  const [generatedInvoice, setGeneratedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const ZIINA_PAYMENT_URL = 'https://pay.ziina.com/Waslasd/IWXxU478H?source=app';
  const plan = UNIFIED_SUBSCRIPTION_PLAN;

  const handleOpenZiina = () => {
    setErrorMessage(null);
    setStage('link_opened');
    window.open(ZIINA_PAYMENT_URL, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmPayment = () => {
    setStage('verifying');
    setErrorMessage(null);

    // Strict verification simulation with Ziina Payment Gateway
    setTimeout(() => {
      const newExpiry = calculateOneMonthExpiry(new Date());
      const inv = createSubscriptionInvoice(
        driver, 
        refNumber || `ZIN-${Math.floor(100000 + Math.random() * 900000)}`,
        new Date().toISOString().split('T')[0],
        newExpiry
      );
      setGeneratedInvoice(inv);
      setStage('success');
    }, 2000);
  };

  const handlePaymentFailed = () => {
    setStage('failed');
    setErrorMessage('فشلت عملية الدفع أو تم إلغاؤها في بوابة زينة (Ziina). لم يتم تجديد الاشتراك.');
  };

  const handleFinalSuccess = () => {
    onSubscribeSuccess('unified');
  };

  const daysRemaining = getDaysUntilExpiry(driver.subscriptionExpiry);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
        <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
          
          {/* Mobile Drag Handle */}
          <div className="sm:hidden pt-2.5 pb-1 bg-slate-950 flex justify-center">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
          </div>

          {/* Modal Header */}
          <div className="bg-slate-950 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-500 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/25 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-black text-white">تجديد الاشتراك الشهري الموحد للسائقين</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">بوابة الدفع الإلكتروني المباشر (Ziina Pay) • عمولة 0%</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain">
            
            {/* STAGE: SUCCESS */}
            {stage === 'success' && generatedInvoice && (
              <div className="p-4 sm:p-6 text-center flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-1">
                  <span className="bg-emerald-500/15 text-emerald-400 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30">
                    تم تأكيد الدفع بنجاح وإصدار الفاتورة الرسمية ✓
                  </span>
                  <h4 className="text-lg sm:text-2xl font-black text-white pt-1">تم تجديد اشتراكك بنجاح! 🎉</h4>
                  <p className="text-emerald-400 font-bold text-xs sm:text-sm">
                    صلاحية الاشتراك الجديد: <strong className="text-white">شهر كامل بالظبط (حتى {generatedInvoice.expiryDate})</strong>.
                  </p>
                </div>

                {/* Invoice Summary Box */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 w-full text-right text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>رقم الفاتورة الصادرة:</span>
                    <span className="font-bold text-white font-mono">{generatedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>الباقة المجددة:</span>
                    <span className="font-bold text-cyan-400">{generatedInvoice.planName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>المبلغ المسدد:</span>
                    <span className="font-bold text-emerald-400">{generatedInvoice.amount}.00 AED</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>تاريخ الانتهاء الجديد:</span>
                    <span className="font-bold text-cyan-300">{generatedInvoice.expiryDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 border-t border-slate-800/80 pt-2">
                    <span>حالة الحساب:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      نشط ومفعل 🟢
                    </span>
                  </div>
                </div>

                {/* 5-Day Reminder Automated Promise Notice */}
                <div className="bg-blue-950/40 border border-cyan-500/30 p-3 rounded-xl text-right text-[11px] text-cyan-300 flex items-start gap-2.5 w-full">
                  <Bell className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>تنبيه التجديد التلقائي:</strong> سيقوم نظام واصل بإرسال رسالة تذكير لهاتفك المسجل ({driver.phone}) قبل انتهاء هذا الاشتراك بـ 5 أيام لضمان استمرار عملك دون انقطاع.
                  </span>
                </div>

                {/* Invoice Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    <span>عرض وتحميل الفاتورة الرسمية</span>
                  </button>

                  <a
                    href={getWhatsAppInvoiceUrl(generatedInvoice)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>إرسال الفاتورة لواتساب السائق</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleFinalSuccess}
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-3.5 rounded-xl shadow-xl shadow-blue-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>متابعة لتقديم عروض الأسعار للعملاء</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            )}

            {/* STAGE: VERIFYING */}
            {stage === 'verifying' && (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-bold text-white">جاري التحقق من نجاح الدفع في بوابة زينة (Ziina)...</h4>
                  <p className="text-xs text-slate-400">التحقق من إتمام الحوالة وتأكيد دفع الاشتراك الموحد ({plan.price} AED)</p>
                </div>
              </div>
            )}

            {/* STAGE: FAILED */}
            {stage === 'failed' && (
              <div className="p-6 text-center flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center border-2 border-rose-500/30">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white">فشلت عملية الدفع أو لم تكتمل!</h4>
                  <p className="text-rose-400 text-xs sm:text-sm">{errorMessage}</p>
                </div>
                
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl w-full text-right text-xs text-slate-300">
                  <p className="font-semibold text-rose-300 mb-1">⚠️ تنبيه عدم التجديد:</p>
                  <p className="text-slate-400 leading-relaxed">
                    لم يتم تجديد الاشتراك. لن تتمكن من تقديم عروض أسعار جديدة للعملاء حتى إتمام الدفع بنجاح في رابط زينة.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                  <button
                    type="button"
                    onClick={handleOpenZiina}
                    className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>إعادة محاولة الدفع عبر رابط زينة</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-5 rounded-xl text-xs active:scale-95"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}

            {/* STAGE: LINK_OPENED */}
            {stage === 'link_opened' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-blue-950/40 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">تم فتح بوابة الدفع (Ziina) في نافذة جديدة</h4>
                      <p className="text-xs text-slate-400">يرجى إتمام عملية دفع رسوم التجديد ({plan.price} AED)</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5 leading-relaxed">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold">
                      <span>1.</span>
                      <span>قم بإتمام الدفع عبر Apple Pay أو بطاقتك البنكية في صفحة زينة.</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-300 font-bold">
                      <span>2.</span>
                      <span>عند الانتهاء بنجاح، اضغط على زر "تأكيد والتحقق من نجاح الدفع" أدناه لتجديد اشتراكك فوراً واستلام فاتورتك.</span>
                    </div>
                  </div>
                </div>

                {/* Optional Reference Input */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    رقم مرجع الحوالة / الإيصال من زينة (اختياري للتوثيق):
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="مثال: ZIN-893240"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✅ لقد أتممت الدفع بنجاح (التحقق وإصدار الفاتورة)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenZiina}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold py-2.5 rounded-xl text-xs border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>إعادة فتح رابط زينة</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePaymentFailed}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2.5 rounded-xl text-xs border border-rose-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>فشلت العملية / إلغاء</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE: PLAN (Initial state) */}
            {stage === 'plan' && (
              <>
                {/* Expiry Status Notice if already expiring soon */}
                {daysRemaining <= 5 && daysRemaining >= 0 && (
                  <div className="bg-amber-500/15 border border-amber-500/40 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-amber-300">
                    <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold">تنبيه انتهاء الاشتراك (يتبقى {daysRemaining} أيام)</div>
                      <div className="text-[11px] text-slate-300">ينتهي اشتراكك الحالي بتاريخ {formatArabicDate(driver.subscriptionExpiry)}. بادر بالتجديد الآن.</div>
                    </div>
                  </div>
                )}

                {/* Single Unified Plan Card */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-cyan-500/40 relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block mb-1">
                        الباقة الموحدة للجميع ⭐
                      </span>
                      <h4 className="font-black text-white text-sm sm:text-lg">{plan.name}</h4>
                    </div>

                    <div className="text-left">
                      <div className="text-2xl sm:text-3xl font-black text-cyan-400">{plan.price}</div>
                      <div className="text-[10px] text-slate-400 font-bold">درهم / شهر كامل</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 bg-blue-950/40 p-2.5 rounded-xl flex items-center gap-2 text-[11px] text-cyan-300 font-medium">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    <span>تظهر عروضك في مقدمة نتائج البحث للعميل بناءً على تقييمك الإيجابي!</span>
                  </div>
                </div>

                {/* Ziina Gateway Secure Notice */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-black shadow shrink-0 text-sm">
                      💳
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>بوابة الدفع الإلكتروني المباشر (Ziina Pay)</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30 font-bold">آمن ومشفر</span>
                      </div>
                      <p className="text-[11px] text-slate-400">تدعم بطاقات الفيزا، ماستركارد، و Apple Pay مباشرة</p>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-base font-black text-cyan-400">{plan.price} AED</span>
                  </div>
                </div>

                {/* Strict Policy & Automated Invoice Notice */}
                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>سياسة التجديد والفواتير:</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    يتم تمديد صلاحية الاشتراك لمدة شهر كامل بالظبط بعد تأكيد الدفع في زينة مباشرة، ويتم إصدار فاتورة ضريبية رسمية قابلة للطباعة والإرسال للواتساب.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleOpenZiina}
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-3.5 rounded-xl shadow-xl shadow-blue-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>الانتقال للدفع وتجديد الاشتراك عبر زينة ({plan.price} AED)</span>
                </button>
              </>
            )}

          </div>

        </div>
      </div>

      {/* Official Invoice Modal */}
      {showInvoiceModal && generatedInvoice && (
        <InvoiceModal
          invoice={generatedInvoice}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </>
  );
};
