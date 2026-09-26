import React from 'react';
import { X, FileText, AlertTriangle, CheckCircle2, ShieldAlert, DollarSign } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      
      {/* Modal Container */}
      <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-[#F5F9FC] flex justify-center">
          <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="bg-[#F5F9FC] px-4 sm:px-6 py-4 border-b border-[#E5EDF3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EEF4FA] text-[#142F52] flex items-center justify-center font-black shadow-xs shrink-0">
              <FileText className="w-6 h-6 text-[#159B7A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#142F52]">الشروط والأحكام وإخلاء المسؤولية</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-[#64748B]">اتفاقية الاستخدام والمسؤوليات القانونية والمالية لمنصة واصل</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 rounded-xl bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain touch-pan-y text-right">
          
          {/* Disclaimer High Priority Banner 1: Independent Drivers */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-amber-900">استقلالية السائقين وإخلاء المسؤولية المباشرة</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                جميع السائقين المسجلين في هذا الموقع <strong>لا يتبعون لمنصة واصل على الإطلاق</strong> بل هم سائقون مستقلون يعملون لحسابهم الشخصي، والمنصة وسيط تقني فقط ولا تتحمل أي مسؤولية مباشرة أو قانونية تجاه تصرفاتهم أو عمليات التوصيل.
              </p>
            </div>
          </div>

          {/* Disclaimer High Priority Banner 2: Financial Transactions */}
          <div className="bg-[#EAF6F1] border border-[#159B7A]/30 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#159B7A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-[#159B7A]">التعامل المالي المباشر (المنصة لا تستلم أموالاً من العميل)</h4>
              <p className="text-xs text-[#142F52] leading-relaxed">
                المدفوعات التي تتم بين السائق والعميل <strong>لا دخل للمنصة بها على الإطلاق</strong>. المنصة لا تستلم أي أموال أو عمولات من العميل، وسداد قيمة التوصيل المتفق عليها يتم مباشرة بين العميل والسائق (نقداً أو بالتحويل المباشر).
              </p>
            </div>
          </div>

          {/* Detailed Clauses */}
          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#142F52] font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
              <span>1. طبيعة دور منصة واصل (WASEL)</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed pr-6">
              تعمل المنصة كمنصة تقنية ذكية تتيح للعملاء نشر طلبات نقل وتوصيل الطرود، وتتيح للسائقين المستقلين تقديم عروض أسعار تنافسية عليها واختيار العرض الأنسب مباشرة.
            </p>
          </div>

          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#142F52] font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>2. سلامة ومحتويات الطرود</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed pr-6">
              يتحمل العميل والسائق كامل المسؤولية عن التأكد من أن محتويات الطرود المنقولة قانونية ومطابقة للأنظمة والتشريعات المعمول بها داخل دولة الإمارات العربية المتحدة، ويُحظر تماماً نقل أي مواد ممنوعة قانوناً.
            </p>
          </div>

          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#142F52] font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
              <span>3. تقييم السائقين وجودة الخدمة</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed pr-6">
              تعتمد المنصة نظام التقييم الشفاف من العملاء لقياس مدى التزام السائقين وموثوقيتهم، ويحق لإدارة المنصة تعليق أو إلغاء حساب أي سائق يتكرر عدم التزامه أو مخالفته لمعايير الجودة.
            </p>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="bg-[#F5F9FC] p-4 sm:px-6 border-t border-[#E5EDF3] shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 rounded-xl shadow-md transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
          >
            فهمت وموافق
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-auto bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] font-bold py-3 px-6 rounded-xl border border-[#E5EDF3] transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
          >
            إلغاء / إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
