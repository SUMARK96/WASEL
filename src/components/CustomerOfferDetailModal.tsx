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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      
      {/* Modal Container */}
      <div className="bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-black flex justify-center">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="bg-black px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={offer.driverAvatar}
              alt={offer.driverName}
              className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white">{offer.driverName}</h3>
                {offer.driverVerified && (
                  <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                    <ShieldCheck className="w-3 h-3 text-black" />
                    <span>موثق</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span className="flex items-center gap-0.5 text-white font-bold bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800">
                  <Star className="w-3 h-3 fill-white text-white" />
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
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain touch-pan-y text-right">
          
          {/* Price & Status Banner */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-[11px] text-zinc-400 font-semibold block mb-0.5">سعر العرض المقدم من السائق:</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">{offer.price}</span>
                <span className="text-xs font-bold text-zinc-300">درهم إماراتي (AED)</span>
              </div>
            </div>

            {isAccepted ? (
              <span className="bg-white text-black font-black text-xs px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>العرض المقبول ✓</span>
              </span>
            ) : (
              <span className="bg-zinc-800 text-white text-xs font-bold px-3 py-1 rounded-xl border border-zinc-700">
                بانتظار موافقتك ⏳
              </span>
            )}
          </div>

          {/* Delivery Schedule & Estimate */}
          <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 border-b border-zinc-800 pb-2">
              <Clock className="w-4 h-4 text-white" />
              <span>موعد ووقت التوصيل التقديري</span>
            </div>
            <p className="font-bold text-white text-sm pt-1">
              {offer.estimatedDeliveryTime || 'خلال ساعات قليلة'}
            </p>
          </div>

          {/* Driver Note / Message */}
          {offer.note && (
            <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 border-b border-zinc-800 pb-2">
                <FileText className="w-4 h-4 text-white" />
                <span>رسالة وملاحظات السائق للعميل:</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                "{offer.note}"
              </p>
            </div>
          )}

          {/* Driver Vehicle Specs */}
          <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <Truck className="w-4 h-4 text-white" />
                <span>مركبة التوصيل المعتمدة:</span>
              </div>
              <span className="text-white font-bold text-xs">{offer.driverVehicle}</span>
            </div>

            {offer.driverVehiclePhotos && offer.driverVehiclePhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {offer.driverVehiclePhotos.slice(0, 2).map((photo, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-900">
                    <img src={photo} alt={`Vehicle ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Request Quick Summary */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3.5 text-xs text-zinc-400 flex items-center justify-between">
            <div className="truncate flex-1 min-w-0 pr-1">
              <span className="text-zinc-500 block text-[10px]">الطلب:</span>
              <span className="font-bold text-white truncate block">{request.title}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <EmirateBadge emirate={request.pickupEmirate} type="pickup" size="sm" />
              <span>➔</span>
              <EmirateBadge emirate={request.deliveryEmirate} type="delivery" size="sm" />
            </div>
          </div>

          {/* If already accepted -> direct contact shortcuts */}
          {isAccepted && cleanPhone && (
            <div className="bg-zinc-900 border border-white/40 p-4 rounded-2xl space-y-2.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>أنت قبلت هذا العرض. تواصل مع السائق مباشرة:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-zinc-200 text-black font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>واتساب</span>
                </a>
                <a
                  href={`tel:${cleanPhone}`}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs border border-zinc-700 flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال هاتفي</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="bg-black p-4 sm:px-6 border-t border-zinc-800 shrink-0 flex flex-col sm:flex-row items-center gap-3">
          {!isAccepted ? (
            <>
              <button
                type="button"
                onClick={handleAccept}
                className="w-full sm:flex-1 bg-white hover:bg-zinc-200 text-black font-black py-3 sm:py-3.5 rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
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
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-3 sm:py-3.5 px-4 rounded-xl border border-zinc-700 transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>الملف الشخصي</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-3 sm:py-3.5 px-6 rounded-xl border border-zinc-700 transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
              >
                إلغاء
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 sm:py-3.5 rounded-xl border border-zinc-700 transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
            >
              إلغاء / إغلاق
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
