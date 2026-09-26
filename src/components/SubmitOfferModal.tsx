import React, { useState } from 'react';
import type { DeliveryRequest, DriverProfile } from '../types';
import { X, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { EmirateBadge } from './EmirateBadge';

interface SubmitOfferModalProps {
  request: DeliveryRequest;
  driver: DriverProfile;
  onClose: () => void;
  onSubmitOffer: (price: number, estimatedTime: string, note: string, whatsappPhone: string, callPhone: string) => void;
}

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({
  request,
  driver,
  onClose,
  onSubmitOffer
}) => {
  const [price, setPrice] = useState(150);
  const [estimatedTime, setEstimatedTime] = useState('خلال 3 ساعات من الآن');
  const [note, setNote] = useState(`أنا جاهز لنقل الطرد بسيارتي الـ ${driver.vehicleModel}. الالتزام بالوقت وسلامة الطرد مضمونين.`);
  
  // Driver Numbers from registered account
  const [whatsappPhone, setWhatsappPhone] = useState(driver.whatsappPhone || driver.phone || '');
  const [callPhone, setCallPhone] = useState(driver.callPhone || driver.phone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOffer(price, estimatedTime, note, whatsappPhone || driver.whatsappPhone || driver.phone, callPhone || driver.callPhone || driver.phone);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-[#F5F9FC] flex justify-center">
          <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-[#F5F9FC] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E5EDF3] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm sm:text-lg font-black text-[#142F52]">تقديم عرض سعر للعميل</h3>
            <p className="text-[11px] sm:text-xs text-[#64748B]">تواصل مباشر عبر الواتساب والمكالمات عند قبول عرضك</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content - Touch Scroll */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y">
          
          {/* Request Brief */}
          <div className="bg-[#F5F9FC] p-4 sm:p-5 border-b border-[#E5EDF3] space-y-2">
            <h4 className="font-bold text-[#142F52] text-xs sm:text-sm">{request.title}</h4>
            <div className="flex items-center gap-2 text-xs">
              <EmirateBadge emirate={request.pickupEmirate} type="pickup" size="sm" />
              <span className="text-[#94A3B8]">⬅️</span>
              <EmirateBadge emirate={request.deliveryEmirate} type="delivery" size="sm" />
            </div>
            <div className="text-xs text-[#64748B] pt-1">
              <span>فئة ونوع الطرد: <strong className="text-[#142F52]">{request.packageType}</strong></span>
            </div>
          </div>

          <form id="submit-offer-form" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            
            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-[#142F52] mb-1">سعر العرض (بالدرهم AED)</label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] focus:bg-white rounded-xl px-4 py-2.5 sm:py-3 text-base sm:text-lg font-black text-[#159B7A] focus:outline-none"
                  min={20}
                  required
                />
                <span className="absolute left-4 top-3 text-xs text-[#64748B] font-bold">AED</span>
              </div>
            </div>

            {/* Driver Contact Numbers */}
            <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#142F52] border-b border-[#E5EDF3] pb-2">
                <CheckCircle2 className="w-4 h-4 text-[#159B7A]" />
                <span>أرقام تواصلك المباشرة مع العميل (فعالة فوراً)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#142F52] mb-1">رقم الواتساب (WhatsApp)</label>
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="مثال: 971501234567"
                    className="w-full bg-white border border-[#E5EDF3] rounded-xl px-3 py-2 text-xs text-[#142F52] font-mono dir-ltr focus:outline-none focus:border-[#159B7A]"
                    required
                  />
                  <span className="text-[10px] text-[#64748B] mt-0.5 block">سيفتح محادثة واتساب فورية للعميل</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#142F52] mb-1">رقم المكالمات الهاتفية</label>
                  <input
                    type="text"
                    value={callPhone}
                    onChange={(e) => setCallPhone(e.target.value)}
                    placeholder="مثال: +971 50 123 4567"
                    className="w-full bg-white border border-[#E5EDF3] rounded-xl px-3 py-2 text-xs text-[#142F52] font-mono dir-ltr focus:outline-none focus:border-[#159B7A]"
                    required
                  />
                  <span className="text-[10px] text-[#64748B] mt-0.5 block">للاتصال الهاتفي المباشر</span>
                </div>
              </div>
            </div>

            {/* Estimated Delivery Time */}
            <div>
              <label className="block text-xs font-semibold text-[#142F52] mb-1">وقت التوصيل التقديري</label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="مثال: خلال ساعتين ونصف"
                className="w-full bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#142F52] focus:outline-none"
                required
              />
            </div>

            {/* Driver Note */}
            <div>
              <label className="block text-xs font-semibold text-[#142F52] mb-1">رسالة إضافية للعميل</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] focus:bg-white rounded-xl p-3 text-xs text-[#142F52] focus:outline-none resize-none"
                required
              />
            </div>

            <div className="bg-[#EAF6F1] border border-[#159B7A]/20 p-3 rounded-xl flex items-center gap-2 text-xs text-[#159B7A]">
              <ShieldCheck className="w-4 h-4 text-[#159B7A] shrink-0" />
              <span>بصفتك مشتركاً، لن تخصم أي عمولة من قيمة هذا العرض (100% لك).</span>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="bg-[#F5F9FC] p-4 sm:px-6 border-t border-[#E5EDF3] shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            form="submit-offer-form"
            className="w-full sm:flex-1 bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 sm:py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>إرسال العرض للعميل</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] font-bold py-3 sm:py-3.5 px-6 rounded-xl border border-[#E5EDF3] transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
          >
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
};
