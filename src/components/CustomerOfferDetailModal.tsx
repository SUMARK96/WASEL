import React from 'react';
import type { DeliveryRequest, DriverOffer } from '../types';
import { EmirateBadge } from './EmirateBadge';
import { 
  X, 
  Star, 
  ShieldCheck, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Phone, 
  User, 
  FileText,
  MessageCircle
} from 'lucide-react';

interface CustomerOfferDetailModalProps {
  request: DeliveryRequest;
  offer: DriverOffer;
  isAccepted?: boolean;
  onClose: () => void;
  onAcceptOffer: (requestId: string, offerId: string) => void;
  onViewDriverProfile?: (driverOffer: DriverOffer) => void;
}

export const CustomerOfferDetailModal: React.FC<CustomerOfferDetailModalProps> = ({
  request,
  offer,
  isAccepted = false,
  onClose,
  onAcceptOffer,
  onViewDriverProfile
}) => {
  const cleanPhone = (offer.driverWhatsappPhone || offer.driverPhone || '').replace(/[^0-9]/g, '');
  const formattedWa = cleanPhone ? (cleanPhone.startsWith('971') ? cleanPhone : '971' + cleanPhone.replace(/^0+/, '')) : '';
  const waUrl = formattedWa 
    ? `https://wa.me/${formattedWa}?text=${encodeURIComponent(`مرحباً الكابتن ${offer.driverName}، بخصوص عرضك لتوصيل "${request.title}".`)}` 
    : '#';

  const handleAccept = () => {
    onAcceptOffer(request.id, offer.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      
      {/* Modal Container */}
      <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-[#F5F9FC] flex justify-center">
          <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="bg-[#F5F9FC] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E5EDF3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={offer.driverAvatar}
              alt={offer.driverName}
              className="w-11 h-11 rounded-2xl object-cover border-2 border-[#159B7A] shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-[#142F52]">{offer.driverName}</h3>
                {offer.driverVerified && (
                  <span className="bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-[#159B7A]" />
                    <span>موثق</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                <span className="flex items-center gap-0.5 text-[#142F52] font-bold bg-[#EEF4FA] px-1.5 py-0.2 rounded border border-[#E5EDF3]">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {offer.driverRating}
                </span>
                <span>•</span>
                <span>{offer.driverCompletedCount || 0} توصيلة مكتملة</span>
              </div>
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
          
          {/* Price & Status Banner */}
          <div className="bg-[#EAF6F1] border border-[#159B7A]/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] text-[#64748B] font-semibold block mb-0.5">سعر العرض المقدم من السائق:</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#159B7A] font-mono">{offer.price}</span>
                <span className="text-xs font-bold text-[#142F52]">درهم إماراتي (AED)</span>
              </div>
            </div>

            {isAccepted ? (
              <span className="bg-[#159B7A] text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>العرض المقبول ✓</span>
              </span>
            ) : (
              <span className="bg-white text-[#142F52] text-xs font-bold px-3 py-1 rounded-xl border border-[#E5EDF3]">
                بانتظار موافقتك ⏳
              </span>
            )}
          </div>

          {/* Wasel Platform Recommendation & High Reliability Badge */}
          {offer.driverRating >= 4.8 && (
            <div className="bg-[#EAF6F1] border border-[#159B7A]/30 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#159B7A] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                ⭐
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-[#159B7A]">موصى به من منصة واصل (أعلى موثوقية)</span>
                  <span className="bg-white text-[#142F52] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#E5EDF3]">
                    {offer.driverRating} ⭐ • {(offer.driverRating * 20).toFixed(0)}% موثوقية
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  يحظى هذا السائق بسجل تقييمات متميز والتزام عالٍ بمواعيد التوصيل وسلامة الطرود.
                </p>
              </div>
            </div>
          )}

          {/* Delivery Schedule & Estimate */}
          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] border-b border-[#E5EDF3] pb-2">
              <Clock className="w-4 h-4 text-[#159B7A]" />
              <span>موعد ووقت التوصيل التقديري</span>
            </div>
            <p className="font-bold text-[#142F52] text-sm pt-1">
              {offer.estimatedDeliveryTime || 'خلال ساعات قليلة'}
            </p>
          </div>

          {/* Driver Note / Message */}
          {offer.note && (
            <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] border-b border-[#E5EDF3] pb-2">
                <FileText className="w-4 h-4 text-[#159B7A]" />
                <span>رسالة وملاحظات السائق للعميل:</span>
              </div>
              <p className="text-xs sm:text-sm text-[#142F52] leading-relaxed bg-white p-3 rounded-xl border border-[#E5EDF3]">
                "{offer.note}"
              </p>
            </div>
          )}

          {/* Driver Vehicle Specs */}
          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5EDF3] pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
                <Truck className="w-4 h-4 text-[#159B7A]" />
                <span>مركبة التوصيل المعتمدة:</span>
              </div>
              <span className="text-[#142F52] font-bold text-xs">{offer.driverVehicle}</span>
            </div>

            {offer.driverVehiclePhotos && offer.driverVehiclePhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {offer.driverVehiclePhotos.slice(0, 2).map((photo, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-[#E5EDF3] aspect-video bg-white">
                    <img src={photo} alt={`Vehicle ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Request Quick Summary */}
          <div className="bg-[#EEF4FA] border border-[#E5EDF3] rounded-2xl p-3.5 text-xs text-[#64748B] flex items-center justify-between">
            <div className="truncate flex-1 min-w-0 pr-1">
              <span className="text-[#64748B] block text-[10px]">الطلب:</span>
              <span className="font-bold text-[#142F52] truncate block">{request.title}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <EmirateBadge emirate={request.pickupEmirate} type="pickup" size="sm" />
              <span>➔</span>
              <EmirateBadge emirate={request.deliveryEmirate} type="delivery" size="sm" />
            </div>
          </div>

          {/* If already accepted -> direct contact shortcuts */}
          {isAccepted && cleanPhone && (
            <div className="bg-[#EAF6F1] border border-[#159B7A]/30 p-4 rounded-2xl space-y-2.5">
              <div className="text-xs font-bold text-[#142F52] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#159B7A]" />
                <span>أنت قبلت هذا العرض. تواصل مع السائق مباشرة:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#159B7A] hover:bg-[#108466] text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>واتساب</span>
                </a>
                <a
                  href={`tel:${cleanPhone}`}
                  className="bg-white hover:bg-[#F5F9FC] text-[#142F52] font-bold py-2.5 px-3 rounded-xl text-xs border border-[#E5EDF3] flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-[#159B7A]" />
                  <span>اتصال هاتفي</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="bg-[#F5F9FC] p-4 sm:px-6 border-t border-[#E5EDF3] shrink-0 flex flex-col sm:flex-row items-center gap-3">
          {!isAccepted ? (
            <>
              <button
                type="button"
                onClick={handleAccept}
                className="w-full sm:flex-1 bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 sm:py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>الموافقة وقبول هذا العرض ({offer.price} AED)</span>
              </button>

              {onViewDriverProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewDriverProfile(offer);
                  }}
                  className="w-full sm:w-auto bg-white hover:bg-[#EEF4FA] text-[#142F52] font-bold py-3 sm:py-3.5 px-4 rounded-xl border border-[#E5EDF3] transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#159B7A]" />
                  <span>الملف الشخصي</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] font-bold py-3 sm:py-3.5 px-6 rounded-xl border border-[#E5EDF3] transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
              >
                إلغاء
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#142F52] font-bold py-3 sm:py-3.5 rounded-xl border border-[#E5EDF3] transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
            >
              إلغاء / إغلاق
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
