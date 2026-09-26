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
  Trash2,
  Lock,
  MessageCircle,
  Phone,
  User
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

  // Customer contact is visible ONLY when the customer has accepted this driver's offer
  const isAcceptedByCustomer = Boolean(
    request.selectedOfferId && 
    myOffer && 
    (request.selectedOfferId === myOffer.id || myOffer.status === 'accepted')
  );

  const cleanCustomerPhone = (request.customerPhone || '').replace(/[^0-9]/g, '');
  const formattedCustomerWa = cleanCustomerPhone 
    ? (cleanCustomerPhone.startsWith('971') ? cleanCustomerPhone : '971' + cleanCustomerPhone.replace(/^0+/, '')) 
    : '';
  const customerWaUrl = formattedCustomerWa
    ? `https://wa.me/${formattedCustomerWa}?text=${encodeURIComponent(`مرحباً ${request.customerName || 'عزيزي العميل'}، أنا الكابتن ${driver.name} من منصة واصل بخصوص قبول طلبك "${request.title}". جاهز للتنفيذ فوراً.`)}`
    : '#';

  const handleProceedToOffer = () => {
    onClose();
    onOpenSubmitOffer(request);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      
      {/* Modal Container */}
      <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-[#F5F9FC] flex justify-center">
          <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="bg-[#F5F9FC] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E5EDF3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#159B7A] text-white flex items-center justify-center font-black shadow-md">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-black text-[#142F52]">تفاصيل طلب التوصيل</h3>
              <p className="text-[11px] sm:text-xs text-[#64748B]">معاينة متطلبات العميل بدقة قبل تقديم عرض السعر</p>
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

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain touch-pan-y text-right">
          
          {/* Main Title & Badges */}
          <div className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="bg-[#EAF6F1] text-[#159B7A] text-xs font-bold px-3 py-1 rounded-full border border-[#159B7A]/20 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#159B7A]" />
                <span>{request.packageType}</span>
              </span>

              <div className="flex items-center gap-2 text-[11px] text-[#64748B] font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  {request.createdAt}
                </span>
                <span>•</span>
                <span className="text-[#159B7A] font-bold bg-[#EAF6F1] px-2 py-0.5 rounded-md border border-[#159B7A]/20">
                  {request.offers?.length || 0} عروض مقدمة
                </span>
              </div>
            </div>

            <h4 className="text-base sm:text-lg font-black text-[#142F52] leading-snug">
              {request.title}
            </h4>
          </div>

          {/* Route Section (من ➔ إلى) */}
          <div className="bg-white border border-[#E5EDF3] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] border-b border-[#E5EDF3] pb-2">
              <MapPin className="w-4 h-4 text-[#159B7A]" />
              <span>مسار التوصيل ونقاط الاستلام والتسليم</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Pickup */}
              <div className="bg-[#F5F9FC] border border-[#E5EDF3] p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B] font-semibold">نقطة الاستلام:</span>
                  <EmirateBadge emirate={request.pickupEmirate} type="pickup" size="sm" />
                </div>
                <div className="font-bold text-[#142F52] text-sm">
                  {request.pickupEmirate}
                </div>
                <div className="text-xs text-[#64748B]">
                  {request.pickupArea || 'المنطقة غير محددة'}
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-[#F5F9FC] border border-[#E5EDF3] p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B] font-semibold">نقطة التسليم:</span>
                  <EmirateBadge emirate={request.deliveryEmirate} type="delivery" size="sm" />
                </div>
                <div className="font-bold text-[#142F52] text-sm">
                  {request.deliveryEmirate}
                </div>
                <div className="text-xs text-[#64748B]">
                  {request.deliveryArea || 'المنطقة غير محددة'}
                </div>
              </div>
            </div>
          </div>

          {/* Package Specifications & Delivery Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#F5F9FC] border border-[#E5EDF3] p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#64748B] font-bold">
                <Calendar className="w-4 h-4 text-[#159B7A]" />
                <span>موعد التسليم المطلوب:</span>
              </div>
              <p className="font-black text-[#142F52] text-sm pt-1">
                {request.deliveryDate}
              </p>
            </div>

            <div className="bg-[#F5F9FC] border border-[#E5EDF3] p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#64748B] font-bold">
                <Weight className="w-4 h-4 text-[#159B7A]" />
                <span>الوزن والمواصفات:</span>
              </div>
              <p className="font-black text-[#142F52] text-sm pt-1">
                {request.packageWeight || 'طرد عادي'} {request.packageSize ? `(${request.packageSize})` : ''}
              </p>
            </div>
          </div>

          {/* Customer Special Notes */}
          {request.notes && (
            <div className="bg-[#F5F9FC] border border-[#E5EDF3] p-4 sm:p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
                <FileText className="w-4 h-4 text-[#159B7A]" />
                <span>ملاحظات وتعليمات العميل:</span>
              </div>
              <p className="text-xs sm:text-sm text-[#142F52] leading-relaxed bg-white p-3 rounded-xl border border-[#E5EDF3]">
                {request.notes}
              </p>
            </div>
          )}

          {/* If Driver already submitted an offer */}
          {alreadySubmitted && myOffer && (
            <div className="bg-[#EAF6F1] border-2 border-[#159B7A] p-4 sm:p-5 rounded-2xl space-y-2.5 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2 text-[#159B7A] text-xs sm:text-sm font-black">
                <CheckCircle2 className="w-5 h-5 text-[#159B7A]" />
                <span>لقد قمت بتقديم عرضك لهذا الطلب مسبقاً</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-[#159B7A]/20">
                  <span className="text-[#64748B] block text-[10px]">سعرك المقترح:</span>
                  <span className="font-black text-[#159B7A] text-sm font-mono">{myOffer.price} AED</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#159B7A]/20">
                  <span className="text-[#64748B] block text-[10px]">موعد التوصيل:</span>
                  <span className="font-bold text-[#142F52] text-xs truncate block">{myOffer.estimatedDeliveryTime}</span>
                </div>
              </div>
              {myOffer.note && (
                <div className="text-[11px] text-[#142F52] bg-white p-2 rounded-lg border border-[#159B7A]/20">
                  <span className="text-[#64748B] font-bold">رسالتك: </span>
                  <span>{myOffer.note}</span>
                </div>
              )}
            </div>
          )}

          {/* Customer Contact Details - Visible ONLY after customer accepts this driver's offer */}
          {isAcceptedByCustomer ? (
            <div className="bg-[#EAF6F1] border-2 border-[#159B7A] p-4 sm:p-5 rounded-2xl space-y-3 shadow-sm animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-[#159B7A] text-xs sm:text-sm font-black">
                <CheckCircle2 className="w-5 h-5 text-[#159B7A]" />
                <span>🎉 وافق العميل على عرضك! بيانات التواصل المباشر:</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#159B7A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-bold shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#64748B] font-medium">العميل:</div>
                    <div className="font-black text-[#142F52] text-sm sm:text-base">{request.customerName || 'عميل واصل'}</div>
                    {request.customerPhone && (
                      <div className="text-xs text-[#159B7A] font-bold font-mono mt-0.5">📞 {request.customerPhone}</div>
                    )}
                  </div>
                </div>

                {cleanCustomerPhone && (
                  <div className="flex items-center gap-2">
                    <a
                      href={customerWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#159B7A] hover:bg-[#108466] text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
                      <span>واتساب</span>
                    </a>
                    <a
                      href={`tel:${cleanCustomerPhone}`}
                      className="bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#142F52] border border-[#E5EDF3] font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#159B7A]" />
                      <span>اتصال</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#EEF4FA] border border-[#E5EDF3] p-3.5 rounded-2xl flex items-center gap-3 text-xs text-[#142F52]">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#E5EDF3] flex items-center justify-center shrink-0 font-bold text-[#159B7A] shadow-2xs">
                <Lock className="w-4 h-4 text-[#159B7A]" />
              </div>
              <div>
                <span className="font-bold block text-[#142F52]">بيانات التواصل بالعميل محمية</span>
                <span className="text-[11px] text-[#64748B]">تظهر بيانات الاتصال المباشر (الهاتف والواتساب) للسائق فور قبول العميل لعرضك لضمان الخصوصية وسرية البيانات.</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="bg-[#F5F9FC] p-4 sm:px-6 border-t border-[#E5EDF3] shrink-0 flex flex-col sm:flex-row items-center gap-3">
          {alreadySubmitted ? (
            <>
              <button
                type="button"
                onClick={handleProceedToOffer}
                className="w-full sm:flex-1 bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 sm:py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
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
                  className="w-full sm:w-auto bg-white hover:bg-red-50 text-red-600 font-bold py-3 sm:py-3.5 px-4 rounded-xl border border-red-200 transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
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
                  className="w-full sm:w-auto bg-white hover:bg-[#EEF4FA] text-[#142F52] font-bold py-3 sm:py-3.5 px-4 rounded-xl border border-[#E5EDF3] transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>عروضي المقدمة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] font-bold py-3 sm:py-3.5 px-5 rounded-xl border border-[#E5EDF3] transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
              >
                إلغاء / إغلاق
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleProceedToOffer}
                className="w-full sm:flex-1 bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 sm:py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>تقديم عرض سعر للعميل الآن</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] font-bold py-3 sm:py-3.5 px-6 rounded-xl border border-[#E5EDF3] transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
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
