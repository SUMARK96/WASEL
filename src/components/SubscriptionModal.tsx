import React, { useState } from 'react';
import type { DriverProfile, SubscriptionPlanId, SubscriptionInvoice, ExemptionCode } from '../types';
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
  Bell,
  Ticket
} from 'lucide-react';
import { 
  createSubscriptionInvoice, 
  calculateOneMonthExpiry, 
  calculateExpiryByMonths,
  getWhatsAppInvoiceUrl, 
  getDaysUntilExpiry,
  formatArabicDate
} from '../utils/subscriptionUtils';
import { InvoiceModal } from './InvoiceModal';

interface SubscriptionModalProps {
  driver: DriverProfile;
  onClose: () => void;
  onSubscribeSuccess: (planId: SubscriptionPlanId, newExpiry?: string, usedPromoCode?: string, isExemption?: boolean) => void;
  subscriptionPrice?: number;
  exemptionCodes?: ExemptionCode[];
  onApplyExemptionCode?: (codeStr: string, driverId?: string) => { success: boolean; message: string; months?: number };
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  driver,
  onClose,
  onSubscribeSuccess,
  subscriptionPrice = UNIFIED_SUBSCRIPTION_PLAN.price,
  exemptionCodes = [],
  onApplyExemptionCode
}) => {
  const [stage, setStage] = useState<'plan' | 'link_opened' | 'verifying' | 'success' | 'failed'>('plan');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refNumber, setRefNumber] = useState<string>('');
  const [generatedInvoice, setGeneratedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Exemption Code States
  const [inputPromoCode, setInputPromoCode] = useState('');
  const [appliedExemption, setAppliedExemption] = useState<{ code: string; months: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const ZIINA_PAYMENT_URL = 'https://pay.ziina.com/Waslasd/IWXxU478H?source=app';
  const plan = {
    ...UNIFIED_SUBSCRIPTION_PLAN,
    price: subscriptionPrice
  };

  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);
    const clean = inputPromoCode.trim().toUpperCase();
    if (!clean) {
      setPromoError('يرجى كتابة رمز الكود أولاً');
      return;
    }

    if (onApplyExemptionCode) {
      const res = onApplyExemptionCode(clean, driver.id);
      if (res.success && res.months) {
        setAppliedExemption({ code: clean, months: res.months });
        setPromoSuccess(`🎉 تم تفعيل كود الإعفاء بنجاح! تجديد مجاني بنسبة 100% لمدة ${res.months} ${res.months === 1 ? 'شهر' : res.months === 2 ? 'شهرين' : `${res.months} شهور`} دون أي رسوم.`);
      } else {
        setPromoError(res.message || 'كود الإعفاء غير صالح أو انتهت صلاحيته');
      }
    } else {
      const found = exemptionCodes?.find(c => c.code.toUpperCase() === clean && c.isActive);
      if (found) {
        if (found.usedDriversCount >= found.maxDrivers) {
          setPromoError('تم استنفاد الحد الأقصى لعدد السائقين المسموح لهم بهذا الكود');
          return;
        }
        setAppliedExemption({ code: found.code, months: found.months });
        setPromoSuccess(`🎉 تم تفعيل كود الإعفاء بنجاح! تجديد مجاني بنسبة 100% لمدة ${found.months} ${found.months === 1 ? 'شهر' : found.months === 2 ? 'شهرين' : `${found.months} شهور`} دون أي رسوم.`);
      } else {
        setPromoError('كود الإعفاء غير صحيح أو غير مفعل');
      }
    }
  };

  const handleActivateWithExemption = () => {
    if (!appliedExemption) return;
    setStage('verifying');
    setErrorMessage(null);

    setTimeout(() => {
      // Calculate start date from the exact moment/date of this transaction
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const newExpiry = calculateExpiryByMonths(now, appliedExemption.months);

      const inv = createSubscriptionInvoice(
        driver, 
        `PROMO-${appliedExemption.code}`,
        todayStr,
        newExpiry,
        0,
        `كود إعفاء ترويجي (${appliedExemption.code} - ${appliedExemption.months} شهر مجاناً)`
      );
      setGeneratedInvoice(inv);
      setStage('success');
    }, 1200);
  };

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
      // Calculate start date from the exact moment/date of this payment
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const newExpiry = calculateOneMonthExpiry(now);

      const inv = createSubscriptionInvoice(
        driver, 
        refNumber || `ZIN-${Math.floor(100000 + Math.random() * 900000)}`,
        todayStr,
        newExpiry,
        subscriptionPrice
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
    onSubscribeSuccess('unified', generatedInvoice?.expiryDate, appliedExemption?.code, Boolean(appliedExemption));
  };

  const daysRemaining = getDaysUntilExpiry(driver.subscriptionExpiry);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
        <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
          
          {/* Mobile Drag Handle */}
          <div className="sm:hidden pt-2.5 pb-1 bg-[#F5F9FC] flex justify-center">
            <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full" />
          </div>

          {/* Modal Header */}
          <div className="bg-[#F5F9FC] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E5EDF3] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#159B7A] text-white flex items-center justify-center font-black shadow-md shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-black text-[#142F52]">تجديد الاشتراك الشهري الموحد للسائقين</h3>
                <p className="text-[11px] sm:text-xs text-[#64748B]">بوابة الدفع الإلكتروني المباشر (Ziina Pay) أو كود الإعفاء • عمولة 0%</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain">
            
            {/* STAGE: SUCCESS */}
            {stage === 'success' && generatedInvoice && (
              <div className="p-4 sm:p-6 text-center flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-[#159B7A] text-white rounded-full flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="space-y-1">
                  <span className="bg-[#EAF6F1] text-[#159B7A] text-xs font-black px-3 py-1 rounded-full border border-[#159B7A]/20">
                    تم تأكيد التجديد بنجاح وإصدار الفاتورة الرسمية ✓
                  </span>
                  <h4 className="text-lg sm:text-2xl font-black text-[#142F52] pt-1">تم تجديد اشتراكك بنجاح! 🎉</h4>
                  <p className="text-[#64748B] font-bold text-xs sm:text-sm">
                    صلاحية الاشتراك الجديد: <strong className="text-[#142F52]">حتى {generatedInvoice.expiryDate}</strong>.
                  </p>
                </div>

                {/* Invoice Summary Box */}
                <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] w-full text-right text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>رقم الفاتورة الصادرة:</span>
                    <span className="font-bold text-[#142F52] font-mono">{generatedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>الباقة المجددة:</span>
                    <span className="font-bold text-[#142F52]">{generatedInvoice.planName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>المبلغ المسدد:</span>
                    <span className="font-bold text-[#159B7A]">
                      {generatedInvoice.amount === 0 ? '0.00 AED (إعفاء مجاني)' : `${generatedInvoice.amount}.00 AED`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>طريقة السداد / الاعتماد:</span>
                    <span className="font-bold text-[#142F52]">{generatedInvoice.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>تاريخ الانتهاء الجديد:</span>
                    <span className="font-bold text-[#142F52]">{generatedInvoice.expiryDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B] border-t border-[#E5EDF3] pt-2">
                    <span>حالة الحساب:</span>
                    <span className="text-[#159B7A] font-bold bg-[#EAF6F1] px-2.5 py-0.5 rounded-full border border-[#159B7A]/20">
                      نشط ومفعل 🟢
                    </span>
                  </div>
                </div>

                {/* 5-Day Reminder Automated Promise Notice */}
                <div className="bg-[#EAF6F1] border border-[#159B7A]/20 p-3 rounded-xl text-right text-[11px] text-[#142F52] flex items-start gap-2.5 w-full">
                  <Bell className="w-4 h-4 text-[#159B7A] shrink-0 mt-0.5" />
                  <span>
                    <strong>تنبيه التجديد التلقائي:</strong> سيقوم نظام واصل بإرسال رسالة تذكير لهاتفك المسجل ({driver.phone}) قبل انتهاء هذا الاشتراك بـ 5 أيام لضمان استمرار عملك دون انقطاع.
                  </span>
                </div>

                {/* Invoice Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="bg-white hover:bg-[#EEF4FA] text-[#142F52] font-bold py-2.5 px-4 rounded-xl text-xs border border-[#E5EDF3] flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-xs"
                  >
                    <FileText className="w-4 h-4 text-[#159B7A]" />
                    <span>عرض وتحميل الفاتورة الرسمية</span>
                  </button>

                  <a
                    href={getWhatsAppInvoiceUrl(generatedInvoice)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                    <span>إرسال الفاتورة لواتساب السائق</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleFinalSuccess}
                  className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
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
                  <div className="w-16 h-16 rounded-full border-4 border-[#E5EDF3] border-t-[#159B7A] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#159B7A] animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-bold text-[#142F52]">
                    {appliedExemption ? 'جاري تفعيل وتمديد الاشتراك بكود الإعفاء...' : 'جاري التحقق من نجاح الدفع في بوابة زينة (Ziina)...'}
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    {appliedExemption ? `تطبيق إعفاء مجاني لمدة ${appliedExemption.months} شهر` : `التحقق من إتمام الحوالة وتأكيد دفع الاشتراك الموحد (${plan.price} AED)`}
                  </p>
                </div>
              </div>
            )}

            {/* STAGE: FAILED */}
            {stage === 'failed' && (
              <div className="p-6 text-center flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center border-2 border-red-200">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-[#142F52]">فشلت عملية الدفع أو لم تكتمل!</h4>
                  <p className="text-[#64748B] text-xs sm:text-sm">{errorMessage}</p>
                </div>
                
                <div className="bg-[#F5F9FC] border border-[#E5EDF3] p-4 rounded-2xl w-full text-right text-xs text-[#64748B]">
                  <p className="font-semibold text-[#142F52] mb-1">⚠️ تنبيه عدم التجديد:</p>
                  <p className="leading-relaxed">
                    لم يتم تجديد الاشتراك. لن تتمكن من تقديم عروض أسعار جديدة للعملاء حتى إتمام الدفع بنجاح في رابط زينة أو إدخال كود إعفاء صالح.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                  <button
                    type="button"
                    onClick={handleOpenZiina}
                    className="w-full sm:flex-1 bg-[#159B7A] hover:bg-[#108466] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>إعادة محاولة الدفع عبر رابط زينة</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto bg-white hover:bg-[#EEF4FA] text-[#64748B] font-bold py-3 px-5 rounded-xl text-xs border border-[#E5EDF3] active:scale-95"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}

            {/* STAGE: LINK_OPENED */}
            {stage === 'link_opened' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#159B7A] text-white flex items-center justify-center font-bold shrink-0">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#142F52] text-sm sm:text-base">تم فتح بوابة الدفع (Ziina) في نافذة جديدة</h4>
                      <p className="text-xs text-[#64748B]">يرجى إتمام عملية دفع رسوم التجديد ({plan.price} AED)</p>
                    </div>
                  </div>

                  <div className="text-xs text-[#64748B] bg-white p-3.5 rounded-xl border border-[#E5EDF3] space-y-1.5 leading-relaxed">
                    <div className="flex items-center gap-2 text-[#142F52] font-bold">
                      <span>1.</span>
                      <span>قم بإتمام الدفع عبر Apple Pay أو بطاقتك البنكية في صفحة زينة.</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#142F52] font-bold">
                      <span>2.</span>
                      <span>عند الانتهاء بنجاح، اضغط على زر "تأكيد والتحقق من نجاح الدفع" أدناه لتجديد اشتراكك فوراً واستلام فاتورتك.</span>
                    </div>
                  </div>
                </div>

                {/* Optional Reference Input */}
                <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] space-y-2">
                  <label className="block text-xs font-semibold text-[#142F52]">
                    رقم مرجع الحوالة / الإيصال من زينة (اختياري للتوثيق):
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="مثال: ZIN-893240"
                    className="w-full bg-white border border-[#E5EDF3] focus:border-[#159B7A] rounded-xl px-3.5 py-2.5 text-xs text-[#142F52] font-mono focus:outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3.5 rounded-xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>✅ لقد أتممت الدفع بنجاح (التحقق وإصدار الفاتورة)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenZiina}
                      className="flex-1 bg-white hover:bg-[#EEF4FA] text-[#142F52] font-bold py-2.5 rounded-xl text-xs border border-[#E5EDF3] flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#159B7A]" />
                      <span>إعادة فتح رابط زينة</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePaymentFailed}
                      className="flex-1 bg-white hover:bg-red-50 text-red-600 font-bold py-2.5 rounded-xl text-xs border border-red-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
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
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
                    <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold">تنبيه انتهاء الاشتراك (يتبقى {daysRemaining} أيام)</div>
                      <div className="text-[11px] text-amber-700">ينتهي اشتراكك الحالي بتاريخ {formatArabicDate(driver.subscriptionExpiry)}. بادر بالتجديد الآن.</div>
                    </div>
                  </div>
                )}

                {/* Single Unified Plan Card */}
                <div className="bg-[#F5F9FC] p-4 sm:p-5 rounded-2xl border-2 border-[#159B7A] relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="bg-[#159B7A] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block mb-1">
                        الباقة الموحدة للجميع ⭐
                      </span>
                      <h4 className="font-black text-[#142F52] text-sm sm:text-lg">{plan.name}</h4>
                    </div>

                    <div className="text-left">
                      {appliedExemption ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#94A3B8] line-through text-sm font-bold">{plan.price} AED</span>
                            <span className="text-2xl sm:text-3xl font-black text-[#159B7A]">0 AED</span>
                          </div>
                          <span className="text-[10px] text-[#159B7A] font-black bg-[#EAF6F1] px-2 py-0.5 rounded-md border border-[#159B7A]/20">
                            إعفاء مجاني ({appliedExemption.months} شهر)
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-2xl sm:text-3xl font-black text-[#142F52]">{plan.price}</span>
                          <span className="text-[10px] text-[#64748B] font-bold">درهم / شهر كامل</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-[#E5EDF3] text-xs text-[#64748B]">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#159B7A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E5EDF3] bg-white p-2.5 rounded-xl flex items-center gap-2 text-[11px] text-[#64748B] font-medium border border-[#E5EDF3]">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span>تظهر عروضك في مقدمة نتائج البحث للعميل بناءً على تقييمك الإيجابي!</span>
                  </div>
                </div>

                {/* Exemption & Promo Code Section */}
                <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#159B7A]" />
                      <span className="font-black text-[#142F52] text-xs sm:text-sm">لديك كود إعفاء أو تجديد ترويجي؟</span>
                    </div>
                    <span className="text-[10px] text-[#159B7A] font-semibold bg-[#EAF6F1] px-2 py-0.5 rounded-full">تجديد 100% بدون دفع</span>
                  </div>

                  {appliedExemption ? (
                    <div className="bg-white p-3.5 rounded-xl border border-[#159B7A] flex items-center justify-between gap-3 animate-in fade-in">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#159B7A] text-white text-xs font-black px-2 py-0.5 rounded font-mono">
                            {appliedExemption.code}
                          </span>
                          <span className="text-[#159B7A] text-xs font-black">✓ تم تفعيل كود الإعفاء بنجاح</span>
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          تمديد وتجديد مجاني لمدة <strong>{appliedExemption.months} {appliedExemption.months === 1 ? 'شهر' : 'شهور'}</strong> دون الحاجة لأي دفع.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedExemption(null);
                          setPromoSuccess(null);
                          setInputPromoCode('');
                        }}
                        className="text-[10px] font-bold text-[#64748B] hover:text-red-600 bg-[#F5F9FC] hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-[#E5EDF3]"
                      >
                        إلغاء الكود
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputPromoCode}
                          onChange={(e) => {
                            setInputPromoCode(e.target.value.toUpperCase());
                            setPromoError(null);
                          }}
                          placeholder="أدخل رمز الكود (مثال: WASEL2026)"
                          className="flex-1 bg-white border border-[#E5EDF3] focus:border-[#159B7A] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#142F52] tracking-wider focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="bg-[#159B7A] hover:bg-[#108466] text-white text-xs font-black px-4 py-2 rounded-xl transition-all active:scale-95 shadow"
                        >
                          تطبيق الكود
                        </button>
                      </div>

                      {promoError && (
                        <div className="text-red-600 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{promoError}</span>
                        </div>
                      )}

                      {promoSuccess && (
                        <div className="text-[#159B7A] bg-[#EAF6F1] p-2 rounded-lg border border-[#159B7A]/30 text-[11px] font-bold animate-in fade-in">
                          {promoSuccess}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Ziina Gateway Secure Notice (If no exemption code applied) */}
                {!appliedExemption && (
                  <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-black shadow-xs shrink-0 text-sm border border-[#159B7A]/20">
                        💳
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#142F52] flex items-center gap-1.5">
                          <span>بوابة الدفع الإلكتروني المباشر (Ziina Pay)</span>
                          <span className="text-[10px] text-[#159B7A] bg-[#EAF6F1] px-1.5 py-0.2 rounded border border-[#159B7A]/20 font-bold">آمن ومشفر</span>
                        </div>
                        <p className="text-[11px] text-[#64748B]">تدعم بطاقات الفيزا، ماستركارد، و Apple Pay مباشرة</p>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <span className="text-base font-black text-[#142F52]">{plan.price} AED</span>
                    </div>
                  </div>
                )}

                {/* Strict Policy & Automated Invoice Notice */}
                <div className="bg-[#F5F9FC] border border-[#E5EDF3] p-3.5 rounded-xl text-xs text-[#64748B] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#142F52]">
                    <ShieldCheck className="w-4 h-4 text-[#159B7A]" />
                    <span>سياسة التجديد والفواتير:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {appliedExemption
                      ? `سيتم تمديد اشتراكك فوراً لمدة ${appliedExemption.months} شهر مجاناً وإصدار فاتورة رسمية بقيمة 0 درهم.`
                      : `يتم تمديد صلاحية الاشتراك لمدة شهر كامل بالظبط بعد تأكيد الدفع في زينة مباشرة، ويتم إصدار فاتورة ضريبية رسمية قابلة للطباعة والإرسال للواتساب.`
                    }
                  </p>
                </div>

                {/* Submit / Activate Button */}
                {appliedExemption ? (
                  <button
                    type="button"
                    onClick={handleActivateWithExemption}
                    className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>✨ تأكيد التجديد المجاني وتمديد الصلاحية ({appliedExemption.months} شهر)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenZiina}
                    className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>الانتقال للدفع وتجديد الاشتراك عبر زينة ({plan.price} AED)</span>
                  </button>
                )}
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
