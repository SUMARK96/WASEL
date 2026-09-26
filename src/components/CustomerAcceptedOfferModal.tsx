import React from 'react';
import type { DeliveryRequest, DriverOffer } from '../types';
import { EmirateBadge } from './EmirateBadge';
import { 
  X, 
  MessageCircle, 
  Phone, 
  ShieldCheck, 
  ArrowRight,
  MapPin
} from 'lucide-react';

interface CustomerAcceptedOfferModalProps {
  request: DeliveryRequest;
  offer: DriverOffer;
  onClose: () => void;
}

export const CustomerAcceptedOfferModal: React.FC<CustomerAcceptedOfferModalProps> = ({
  request,
  offer,
  onClose
}) => {
  const cleanPhone = (offer.driverWhatsappPhone || offer.driverPhone || '').replace(/[^0-9]/g, '');
  const formattedWa = cleanPhone ? (cleanPhone.startsWith('971') ? cleanPhone : '971' + cleanPhone.replace(/^0+/, '')) : '';
  const waUrl = formattedWa 
    ? `https://wa.me/${formattedWa}?text=${encodeURIComponent(`مرحباً الكابتن ${offer.driverName}، لقد قبلت عرضك (${offer.price} AED) لتوصيل "${request.title}". أنا جاهز للتنسيق معك.`)}` 
    : '#';

  return (
    <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      
      {/* Modal Container */}
      <div className="bg-white border-2 border-[#159B7A] rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-[#F5F9FC] flex justify-center">
          <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="bg-[#F5F9FC] px-4 sm:px-6 py-4 border-b border-[#E5EDF3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-black shadow-xs text-xl">
              🎉
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#142F52]">تم قبول العرض بنجاح!</h3>
              <p className="text-[11px] sm:text-xs text-[#64748B]">تم إرسال إشعار فوري للسائق وبدء مهمة التوصيل</p>
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain touch-pan-y text-right">
          
          {/* Driver Contact Box */}
          <div className="bg-[#EAF6F1] border border-[#159B7A]/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-3.5">
              <img
                src={offer.driverAvatar}
                alt={offer.driverName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#159B7A] shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-[#142F52] text-base truncate">{offer.driverName}</h4>
                  <span className="bg-[#159B7A] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    سائق معتمد ✓
                  </span>
                </div>
                <div className="text-xs text-[#64748B] mt-1 flex items-center gap-2">
                  <span>🚗 {offer.driverVehicle}</span>
                  <span>•</span>
                  <span className="font-bold text-[#159B7A] font-mono bg-white px-2 py-0.5 rounded border border-[#159B7A]/30">
                    {offer.price} AED
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Instant Action Buttons */}
            <div className="pt-2 border-t border-[#159B7A]/20 space-y-2">
              <span className="text-[11px] text-[#64748B] font-semibold block">
                تواصل مع السائق الآن لتأكيد موقع الاستلام ووقت الوصول:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>مراسلة واتساب فوراً</span>
                </a>

                <a
                  href={`tel:${offer.driverCallPhone || offer.driverPhone}`}
                  className="bg-white hover:bg-[#EEF4FA] text-[#142F52] font-bold py-3 px-4 rounded-xl text-xs border border-[#E5EDF3] flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#159B7A]" />
                  <span>اتصال هاتفي ({offer.driverPhone})</span>
                </a>
              </div>
            </div>
          </div>

          {/* Delivery Task Overview */}
          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#64748B] border-b border-[#E5EDF3] pb-2">
              <MapPin className="w-4 h-4 text-[#159B7A]" />
              <span>بيانات مهمة التوصيل:</span>
            </div>

            <div className="space-y-1">
              <span className="text-[#64748B] block text-[11px]">عنوان الطلب:</span>
              <span className="font-bold text-[#142F52] text-sm block">{request.title}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <EmirateBadge emirate={request.pickupEmirate} type="pickup" size="sm" />
              <span className="text-[#94A3B8]">➔</span>
              <EmirateBadge emirate={request.deliveryEmirate} type="delivery" size="sm" />
              <span className="text-[#64748B] mr-auto font-mono">📅 {request.deliveryDate}</span>
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="bg-[#EEF4FA] border border-[#E5EDF3] p-3 rounded-xl flex items-center gap-2 text-xs text-[#142F52]">
            <ShieldCheck className="w-4 h-4 text-[#159B7A] shrink-0" />
            <span>يمكنك متابعة حالة الطلب وتقييم السائق بعد إتمام التوصيل من لوحة "طلباتي".</span>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="bg-[#F5F9FC] p-4 sm:px-6 border-t border-[#E5EDF3] shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 sm:py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>إغلاق والعودة للطلبات</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
