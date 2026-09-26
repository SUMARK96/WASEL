import React from 'react';
import type { SubscriptionInvoice } from '../types';
import { Logo } from './Logo';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Share2, 
  CreditCard,
  Phone,
  User,
  MapPin,
  Car
} from 'lucide-react';
import { getWhatsAppInvoiceUrl, formatArabicDate } from '../utils/subscriptionUtils';

interface InvoiceModalProps {
  invoice: SubscriptionInvoice;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const whatsAppUrl = getWhatsAppInvoiceUrl(invoice);

  return (
    <div className="fixed inset-0 z-60 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[94dvh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 print:border-none print:shadow-none print:max-h-none print:rounded-none print:bg-white print:text-black">
        
        {/* Modal Action Header (Hidden in Print) */}
        <div className="bg-[#F5F9FC] px-4 sm:px-6 py-3.5 border-b border-[#E5EDF3] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-[#142F52]">
            <FileText className="w-5 h-5 text-[#159B7A]" />
            <h3 className="text-sm sm:text-base font-black">فاتورة الاشتراك الرسمية - منصة واصل</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white hover:bg-[#EEF4FA] text-[#142F52] px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E5EDF3] transition-colors active:scale-95 cursor-pointer"
              title="طباعة أو حفظ كملف PDF"
            >
              <Printer className="w-4 h-4 text-[#159B7A]" />
              <span className="hidden sm:inline">طباعة / حفظ PDF</span>
            </button>

            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#159B7A] hover:bg-[#108466] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="إرسال الفاتورة عبر واتساب"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">إرسال للواتساب</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div id="printable-invoice" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-white print:bg-white print:p-6 print:text-black print:overflow-visible">
          
          {/* Top Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EDF3] pb-6 print:border-zinc-300">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Logo size="md" />
              </div>
              <p className="text-[11px] sm:text-xs text-[#64748B] print:text-zinc-600 leading-relaxed">
                منصة واصل (WASEL) لخدمات التوصيل الذكي بين إمارات الدولة<br />
                دولة الإمارات العربية المتحدة • support@wasel.ae
              </p>
            </div>

            <div className="text-right sm:text-left space-y-1">
              <span className="bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20 text-xs font-black px-3 py-1 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159B7A]" />
                <span>مدفوعة بالكامل (PAID)</span>
              </span>
              <div className="text-xs text-[#64748B] print:text-zinc-600 pt-1 font-mono">
                رقم الفاتورة: <strong className="text-[#142F52] print:text-black font-bold">{invoice.invoiceNumber}</strong>
              </div>
              <div className="text-[11px] text-[#64748B] print:text-zinc-600">
                تاريخ الإصدار: {formatArabicDate(invoice.issueDate)}
              </div>
            </div>
          </div>

          {/* Billed To (Driver Details) & Subscription Term Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5F9FC] print:bg-zinc-50 p-4 sm:p-5 rounded-2xl border border-[#E5EDF3] print:border-zinc-200 text-xs">
            <div className="space-y-2">
              <span className="text-[#64748B] print:text-zinc-500 font-bold block text-[11px] border-b border-[#E5EDF3] print:border-zinc-200 pb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#159B7A]" />
                <span>بيانات السائق المشترك:</span>
              </span>
              <div className="font-black text-[#142F52] print:text-black text-sm">{invoice.driverName}</div>
              <div className="text-[#64748B] print:text-zinc-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#159B7A]" />
                <span className="font-mono dir-ltr">{invoice.driverPhone}</span>
              </div>
              <div className="text-[#64748B] print:text-zinc-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#159B7A]" />
                <span>إمارة النشاط: {invoice.driverEmirate}</span>
              </div>
              <div className="text-[#64748B] print:text-zinc-700 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#159B7A]" />
                <span>المركبة: {invoice.driverVehicle}</span>
              </div>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-r border-[#E5EDF3] print:border-zinc-200 pt-3 sm:pt-0 sm:pr-4">
              <span className="text-[#64748B] print:text-zinc-500 font-bold block text-[11px] border-b border-[#E5EDF3] print:border-zinc-200 pb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#159B7A]" />
                <span>فترة وسريان الاشتراك (شهر كامل بالظبط):</span>
              </span>
              <div className="text-[#64748B] print:text-zinc-700">
                تاريخ البدء: <strong className="text-[#142F52] print:text-black">{invoice.startDate}</strong>
              </div>
              <div className="text-[#64748B] print:text-zinc-700">
                تاريخ الانتهاء: <strong className="text-[#142F52] print:text-black font-bold">{invoice.expiryDate}</strong>
              </div>
              <div className="text-[#64748B] print:text-zinc-700">
                طريقة الدفع: <strong className="text-[#142F52] print:text-black">{invoice.paymentMethod}</strong>
              </div>
              <div className="text-[11px] text-[#64748B] print:text-zinc-600 font-mono">
                رقم المرجع: {invoice.paymentRef}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-2xl border border-[#E5EDF3] print:border-zinc-300">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F5F9FC] print:bg-zinc-100 text-[#64748B] print:text-zinc-700 border-b border-[#E5EDF3] print:border-zinc-300 font-bold">
                <tr>
                  <th className="p-3">الوصف / الباقة</th>
                  <th className="p-3 text-center">المدة</th>
                  <th className="p-3 text-left">المبلغ الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EDF3] print:divide-zinc-200 bg-white print:bg-white text-[#142F52] print:text-zinc-800">
                <tr>
                  <td className="p-3">
                    <div className="font-bold text-[#142F52] print:text-black">{invoice.planName}</div>
                    <div className="text-[11px] text-[#64748B] print:text-zinc-500">
                      اشتراك شهري موحد • عمولة 0% على كافة الطلبات • تقديم عروض غير محدودة
                    </div>
                  </td>
                  <td className="p-3 text-center font-semibold">شهر كامل (30 يوماً)</td>
                  <td className="p-3 text-left font-black text-[#159B7A] print:text-black">{invoice.amount}.00 AED</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Invoice Summary Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F5F9FC] print:bg-zinc-50 p-4 sm:p-5 rounded-2xl border border-[#E5EDF3] print:border-zinc-200">
            <div className="space-y-1 text-xs text-[#64748B] print:text-zinc-600">
              <div className="flex items-center gap-1.5 font-bold text-[#142F52] print:text-black">
                <ShieldCheck className="w-4 h-4 text-[#159B7A]" />
                <span>تم تأكيد العملية إلكترونياً عبر بوابة زينة (Ziina Pay)</span>
              </div>
              <p className="text-[11px]">هذه الفاتورة مستند رسمي معتمد لإثبات سداد الاشتراك في منصة واصل.</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-[#64748B] print:text-zinc-700 border-t sm:border-t-0 pt-2 sm:pt-0">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-[#142F52]">{invoice.amount}.00 AED</span>
              </div>
              <div className="flex justify-between text-[#64748B] print:text-zinc-500">
                <span>ضريبة القيمة المضافة (0%):</span>
                <span>0.00 AED</span>
              </div>
              <div className="flex justify-between font-black text-sm text-[#142F52] print:text-black border-t border-[#E5EDF3] print:border-zinc-300 pt-2">
                <span>الإجمالي المدفوع:</span>
                <span className="text-[#159B7A] print:text-black text-base">{invoice.amount}.00 AED</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center text-[10px] text-[#64748B] print:text-zinc-600 pt-2 space-y-1 border-t border-[#E5EDF3] print:border-zinc-200">
            <p>منصة واصل (WASEL) © 2026 • تواصل آمن ومباشر بين السائقين والعملاء في كافة إمارات الدولة</p>
            <p>قبل انتهاء موعد الاشتراك بـ 5 أيام، سيتم إرسال تذكير تلقائي لرقم هاتفك لإعلامك بضرورة التجديد.</p>
          </div>

        </div>

        {/* Modal Bottom Actions (Hidden in Print) */}
        <div className="bg-[#F5F9FC] p-4 sm:px-6 border-t border-[#E5EDF3] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs text-[#159B7A] font-bold">
            <CreditCard className="w-4 h-4 text-[#159B7A]" />
            <span>تم تفعيل الحساب وتوثيق الاشتراك بالكامل ✓</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial bg-white hover:bg-[#EEF4FA] text-[#142F52] border border-[#E5EDF3] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#159B7A]" />
              <span>إرسال الفاتورة لهاتفي بالواتساب</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial bg-[#159B7A] hover:bg-[#108466] text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              تم، العودة للموقع
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
