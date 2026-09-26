import React from 'react';
import { X, ShieldCheck, Lock, CheckCircle2, FileCheck } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
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
            <div className="w-11 h-11 rounded-2xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-black shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#142F52]">سياسة الخصوصية وسرية البيانات</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-[#64748B]">التزام منصة واصل بأعلى معايير حماية البيانات والخصوصية</p>
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
          
          {/* Main Guarantee Banner */}
          <div className="bg-[#EAF6F1] border border-[#159B7A]/30 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#159B7A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-[#159B7A]">بياناتكم في أمان تام وسرية مطلقة</h4>
              <p className="text-xs text-[#142F52] leading-relaxed">
                تؤكد منصة واصل أن جميع بيانات العملاء والسائقين يتم التعامل معها بأقصى درجات السرية والأمان وفق أعلى المعايير التقنية.
              </p>
            </div>
          </div>

          {/* Policy Point 1 */}
          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#142F52] font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
              <span>1. حماية بيانات العملاء والسائقين</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed pr-6">
              جميع المعلومات الشخصية المسجلة في المنصة (الأسماء، أرقام الهواتف، تفاصيل الشحنات والطرود، ومواقع الاستلام والتسليم) محفوظة ومحمية بشكل كامل لمنع أي وصول غير مصرح به.
            </p>
          </div>

          {/* Policy Point 2 */}
          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#142F52] font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
              <span>2. عدم استخدام البيانات لأي أغراض أخرى</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed pr-6">
              لا يتم استخدام أو مشاركة بيانات أي عميل أو سائق لأي أغراض تسويقية أو تجارية خارجية أو بيعها لأي جهة أو طرف ثالث على الإطلاق.
            </p>
          </div>

          {/* Policy Point 3 */}
          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#142F52] font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
              <span>3. التنسيق المباشر لخدمة التوصيل فقط</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed pr-6">
              يتم إتاحة بيانات التواصل المباشرة (رقم الهاتف والواتساب) بين العميل والسائق حصرياً بعد قبول عرض السعر لتنسيق تسليم واستلام الطرد بنجاح.
            </p>
          </div>

          {/* Policy Point 4 */}
          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#142F52] font-bold text-xs sm:text-sm">
              <FileCheck className="w-4 h-4 text-[#159B7A] shrink-0" />
              <span>4. حقوق المستخدم وحذف الحساب</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed pr-6">
              يحق للمستخدم (سواء عميل أو سائق) طلب تحديث بياناته أو حذف حسابه وطلباته في أي وقت عبر لوحة التحكم أو التواصل مع إدارة المنصة.
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
