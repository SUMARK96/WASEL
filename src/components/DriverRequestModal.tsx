import React from 'react';
import type { DeliveryRequest, DriverProfile } from '../types';
import { EmirateBadge } from './EmirateBadge';
import { 
  X, 
  Package, 
  MapPin, 
  Calendar, 
  Weight, 
  FileText, 
  Send, 
  CheckCircle2, 
  Tag, 
  Clock, 
  ArrowLeft,
  Trash2
} from 'lucide-react';

interface DriverRequestModalProps {
  request: DeliveryRequest | null;
  driver: DriverProfile;
  onClose: () => void;
  onOpenSubmitOffer: (request: DeliveryRequest) => void;
  onDeleteOffer?: (requestId: string, offerId: string) => void;
  onViewMyBids?: () => void;
}

export const DriverRequestModal: React.FC<DriverRequestModalProps> = ({
  request,
  driver,
  onClose,
  onOpenSubmitOffer,
  onDeleteOffer,
  onViewMyBids
}) => {
  if (!request) return null;

  // Helper to check if the driver already submitted an offer
  const myOffer = request.offers?.find(o => {
    if (o.driverId === driver.id) return true;
    const phoneA = (o.driverPhone || o.driverWhatsappPhone || o.driverCallPhone || '').replace(/[^0-9]/g, '');
    const phoneB = (driver.phone || driver.whatsappPhone || driver.callPhone || '').replace(/[^0-9]/g, '');
    if (phoneA && phoneB && phoneA.length >= 7 && phoneB.length >= 7 && phoneA.slice(-7) === phoneB.slice(-7)) {
      return true;
    }
    if (o.driverName && driver.name && o.driverName.trim().toLowerCase() === driver.name.trim().toLowerCase()) {
      return true;
    }
    return false;
  });

  const alreadySubmitted = Boolean(myOffer);

  const handleProceedToOffer = () => {
    onClose();
    onOpenSubmitOffer(request);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      
      {/* Modal Container */}
      <div className="bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-black flex justify-center">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="bg-black px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-md">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-black text-white">تفاصيل طلب التوصيل</h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">معاينة متطلبات العميل بدقة قبل تقديم عرض السعر</p>
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

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain touch-pan-y text-right">
          
          {/* Main Title & Badges */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full border border-zinc-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                <span>{request.packageType}</span>
              </span>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  {request.createdAt}
                </span>
                <span>•</span>
                <span className="text-white font-bold bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                  {request.offers?.length || 0} عروض مقدمة
                </span>
              </div>
            </div>

            <h4 className="text-base sm:text-lg font-black text-white leading-snug">
              {request.title}
            </h4>
          </div>

          {/* Route Section (من ➔ إلى) */}
          <div className="bg-black border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 border-b border-zinc-800 pb-2">
              <MapPin className="w-4 h-4 text-white" />
              <span>مسار التوصيل ونقاط الاستلام والتسليم</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Pickup */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 font-semibold">نقطة الاستلام:</span>
                  <EmirateBadge emirate={request.pickupEmirate} type="pickup" size="sm" />
                </div>
                <div className="font-bold text-white text-sm">
                  {request.pickupEmirate}
                </div>
                <div className="text-xs text-zinc-300">
                  {request.pickupArea || 'المنطقة غير محددة'}
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 font-semibold">نقطة التسليم:</span>
                  <EmirateBadge emirate={request.deliveryEmirate} type="delivery" size="sm" />
                </div>
                <div className="font-bold text-white text-sm">
                  {request.deliveryEmirate}
                </div>
                <div className="text-xs text-zinc-300">
                  {request.deliveryArea || 'المنطقة غير محددة'}
                </div>
              </div>
            </div>
          </div>

          {/* Package Specifications & Delivery Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold">
                <Calendar className="w-4 h-4 text-white" />
                <span>موعد التسليم المطلوب:</span>
              </div>
              <p className="font-black text-white text-sm pt-1">
                {request.deliveryDate}
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold">
                <Weight className="w-4 h-4 text-white" />
                <span>الوزن والمواصفات:</span>
              </div>
              <p className="font-black text-white text-sm pt-1">
                {request.packageWeight || 'طرد عادي'} {request.packageSize ? `(${request.packageSize})` : ''}
              </p>
            </div>
          </div>

          {/* Customer Special Notes */}
          {request.notes && (
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <FileText className="w-4 h-4 text-white" />
                <span>ملاحظات وتعليمات العميل:</span>
              </div>
              <p className="text-xs sm:text-sm text-white leading-relaxed bg-black/60 p-3 rounded-xl border border-zinc-800">
                {request.notes}
              </p>
            </div>
          )}

          {/* If Driver already submitted an offer */}
          {alreadySubmitted && myOffer && (
            <div className="bg-zinc-900 border-2 border-white p-4 sm:p-5 rounded-2xl space-y-2.5 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-black">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>لقد قمت بتقديم عرضك لهذا الطلب مسبقاً</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-black p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">سعرك المقترح:</span>
                  <span className="font-black text-white text-sm font-mono">{myOffer.price} AED</span>
                </div>
                <div className="bg-black p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">موعد التوصيل:</span>
                  <span className="font-bold text-white text-xs truncate block">{myOffer.estimatedDeliveryTime}</span>
                </div>
              </div>
              {myOffer.note && (
                <div className="text-[11px] text-zinc-300 bg-black/60 p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 font-bold">رسالتك: </span>
                  <span>{myOffer.note}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="bg-black p-4 sm:px-6 border-t border-zinc-800 shrink-0 flex flex-col sm:flex-row items-center gap-3">
          {alreadySubmitted ? (
            <>
              <button
                type="button"
                onClick={handleProceedToOffer}
                className="w-full sm:flex-1 bg-white hover:bg-zinc-200 text-black font-black py-3 sm:py-3.5 rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>تحديث / تعديل عرض السعر</span>
              </button>

              {onDeleteOffer && myOffer && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من رغبتك في حذف وسحب عرضك لهذا الطلب؟ سيختفي العرض فوراً من لوحة العميل.')) {
                      onClose();
                      onDeleteOffer(request.id, myOffer.id);
                    }
                  }}
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-red-950/60 text-zinc-300 hover:text-red-400 font-bold py-3 sm:py-3.5 px-4 rounded-xl border border-zinc-700 hover:border-red-800/60 transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>سحب / حذف العرض</span>
                </button>
              )}

              {onViewMyBids && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewMyBids();
                  }}
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 sm:py-3.5 px-4 rounded-xl border border-zinc-700 transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>عروضي المقدمة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-3 sm:py-3.5 px-5 rounded-xl border border-zinc-700 transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
              >
                إلغاء / إغلاق
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleProceedToOffer}
                className="w-full sm:flex-1 bg-white hover:bg-zinc-200 text-black font-black py-3 sm:py-3.5 rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>تقديم عرض سعر للعميل الآن</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-3 sm:py-3.5 px-6 rounded-xl border border-zinc-700 transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
              >
                إلغاء
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
