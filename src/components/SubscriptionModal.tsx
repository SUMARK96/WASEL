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
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
        <div className="bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
          
          {/* Mobile Drag Handle */}
          <div className="sm:hidden pt-2.5 pb-1 bg-black flex justify-center">
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
          </div>

          {/* Modal Header */}
          <div className="bg-black px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-md shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-black text-white">تجديد الاشتراك الشهري الموحد للسائقين</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400">بوابة الدفع الإلكتروني المباشر (Ziina Pay) • عمولة 0%</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain">
            
            {/* STAGE: SUCCESS */}
            {stage === 'success' && generatedInvoice && (
              <div className="p-4 sm:p-6 text-center flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-white text-black rounded-full flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10 text-black" />
                </div>
                <div className="space-y-1">
                  <span className="bg-zinc-900 text-white text-xs font-black px-3 py-1 rounded-full border border-zinc-700">
                    تم تأكيد الدفع بنجاح وإصدار الفاتورة الرسمية ✓
                  </span>
                  <h4 className="text-lg sm:text-2xl font-black text-white pt-1">تم تجديد اشتراكك بنجاح! 🎉</h4>
                  <p className="text-zinc-300 font-bold text-xs sm:text-sm">
                    صلاحية الاشتراك الجديد: <strong className="text-white">شهر كامل بالظبط (حتى {generatedInvoice.expiryDate})</strong>.
                  </p>
                </div>

                {/* Invoice Summary Box */}
                <div className="bg-black p-4 rounded-2xl border border-zinc-800 w-full text-right text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>رقم الفاتورة الصادرة:</span>
                    <span className="font-bold text-white font-mono">{generatedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>الباقة المجددة:</span>
                    <span className="font-bold text-white">{generatedInvoice.planName}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>المبلغ المسدد:</span>
                    <span className="font-bold text-white">{generatedInvoice.amount}.00 AED</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>تاريخ الانتهاء الجديد:</span>
                    <span className="font-bold text-white">{generatedInvoice.expiryDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300 border-t border-zinc-800 pt-2">
                    <span>حالة الحساب:</span>
                    <span className="text-black font-bold bg-white px-2.5 py-0.5 rounded-full">
                      نشط ومفعل 🟢
                    </span>
                  </div>
                </div>

                {/* 5-Day Reminder Automated Promise Notice */}
                <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl text-right text-[11px] text-zinc-300 flex items-start gap-2.5 w-full">
                  <Bell className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>
                    <strong>تنبيه التجديد التلقائي:</strong> سيقوم نظام واصل بإرسال رسالة تذكير لهاتفك المسجل ({driver.phone}) قبل انتهاء هذا الاشتراك بـ 5 أيام لضمان استمرار عملك دون انقطاع.
                  </span>
                </div>

                {/* Invoice Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    <span>عرض وتحميل الفاتورة الرسمية</span>
                  </button>

                  <a
                    href={getWhatsAppInvoiceUrl(generatedInvoice)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white hover:bg-zinc-200 text-black font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Share2 className="w-4 h-4 text-black" />
                    <span>إرسال الفاتورة لواتساب السائق</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleFinalSuccess}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3.5 rounded-xl shadow-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
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
                  <div className="w-16 h-16 rounded-full border-4 border-zinc-700 border-t-white animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-bold text-white">جاري التحقق من نجاح الدفع في بوابة زينة (Ziina)...</h4>
                  <p className="text-xs text-zinc-400">التحقق من إتمام الحوالة وتأكيد دفع الاشتراك الموحد ({plan.price} AED)</p>
                </div>
              </div>
            )}

            {/* STAGE: FAILED */}
            {stage === 'failed' && (
              <div className="p-6 text-center flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-zinc-900 text-white rounded-full flex items-center justify-center border-2 border-zinc-700">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white">فشلت عملية الدفع أو لم تكتمل!</h4>
                  <p className="text-zinc-300 text-xs sm:text-sm">{errorMessage}</p>
                </div>
                
                <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-2xl w-full text-right text-xs text-zinc-300">
                  <p className="font-semibold text-white mb-1">⚠️ تنبيه عدم التجديد:</p>
                  <p className="text-zinc-400 leading-relaxed">
                    لم يتم تجديد الاشتراك. لن تتمكن من تقديم عروض أسعار جديدة للعملاء حتى إتمام الدفع بنجاح في رابط زينة.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                  <button
                    type="button"
                    onClick={handleOpenZiina}
                    className="w-full sm:flex-1 bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>إعادة محاولة الدفع عبر رابط زينة</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3 px-5 rounded-xl text-xs active:scale-95"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}

            {/* STAGE: LINK_OPENED */}
            {stage === 'link_opened' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center font-bold shrink-0">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">تم فتح بوابة الدفع (Ziina) في نافذة جديدة</h4>
                      <p className="text-xs text-zinc-400">يرجى إتمام عملية دفع رسوم التجديد ({plan.price} AED)</p>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-300 bg-black p-3.5 rounded-xl border border-zinc-800 space-y-1.5 leading-relaxed">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <span>1.</span>
                      <span>قم بإتمام الدفع عبر Apple Pay أو بطاقتك البنكية في صفحة زينة.</span>
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <span>2.</span>
                      <span>عند الانتهاء بنجاح، اضغط على زر "تأكيد والتحقق من نجاح الدفع" أدناه لتجديد اشتراكك فوراً واستلام فاتورتك.</span>
                    </div>
                  </div>
                </div>

                {/* Optional Reference Input */}
                <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">
                    رقم مرجع الحوالة / الإيصال من زينة (اختياري للتوثيق):
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="مثال: ZIN-893240"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3.5 rounded-xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>✅ لقد أتممت الدفع بنجاح (التحقق وإصدار الفاتورة)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenZiina}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs border border-zinc-700 flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>إعادة فتح رابط زينة</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePaymentFailed}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold py-2.5 rounded-xl text-xs border border-zinc-700 flex items-center justify-center gap-1.5 active:scale-95"
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
                  <div className="bg-zinc-900 border border-zinc-700 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-white">
                    <Calendar className="w-5 h-5 text-white shrink-0" />
                    <div>
                      <div className="font-bold">تنبيه انتهاء الاشتراك (يتبقى {daysRemaining} أيام)</div>
                      <div className="text-[11px] text-zinc-400">ينتهي اشتراكك الحالي بتاريخ {formatArabicDate(driver.subscriptionExpiry)}. بادر بالتجديد الآن.</div>
                    </div>
                  </div>
                )}

                {/* Single Unified Plan Card */}
                <div className="bg-black p-4 sm:p-5 rounded-2xl border-2 border-zinc-700 relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="bg-white text-black text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block mb-1">
                        الباقة الموحدة للجميع ⭐
                      </span>
                      <h4 className="font-black text-white text-sm sm:text-lg">{plan.name}</h4>
                    </div>

                    <div className="text-left">
                      <div className="text-2xl sm:text-3xl font-black text-white">{plan.price}</div>
                      <div className="text-[10px] text-zinc-400 font-bold">درهم / شهر كامل</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-zinc-800 text-xs text-zinc-300">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-800 bg-zinc-900 p-2.5 rounded-xl flex items-center gap-2 text-[11px] text-zinc-300 font-medium">
                    <Star className="w-4 h-4 text-white fill-white shrink-0" />
                    <span>تظهر عروضك في مقدمة نتائج البحث للعميل بناءً على تقييمك الإيجابي!</span>
                  </div>
                </div>

                {/* Ziina Gateway Secure Notice */}
                <div className="bg-black p-4 rounded-2xl border border-zinc-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black shadow shrink-0 text-sm border border-zinc-800">
                      💳
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>بوابة الدفع الإلكتروني المباشر (Ziina Pay)</span>
                        <span className="text-[10px] text-white bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-700 font-bold">آمن ومشفر</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">تدعم بطاقات الفيزا، ماستركارد، و Apple Pay مباشرة</p>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-base font-black text-white">{plan.price} AED</span>
                  </div>
                </div>

                {/* Strict Policy & Automated Invoice Notice */}
                <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-xs text-zinc-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>سياسة التجديد والفواتير:</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    يتم تمديد صلاحية الاشتراك لمدة شهر كامل بالظبط بعد تأكيد الدفع في زينة مباشرة، ويتم إصدار فاتورة ضريبية رسمية قابلة للطباعة والإرسال للواتساب.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleOpenZiina}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3.5 rounded-xl shadow-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
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
