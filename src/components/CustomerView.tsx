import React, { useState, useMemo } from 'react';
import type { DeliveryRequest, DriverOffer, DriverProfile, CustomerProfile, CustomerNotification } from '../types';
import { sortRequestsNewestFirst, sortOffersDeterministically } from '../utils/requestUtils';
import { EmirateBadge } from './EmirateBadge';
import { NotificationBanner } from './NotificationBanner';
import { CustomerOfferDetailModal } from './CustomerOfferDetailModal';
import { CustomerAcceptedOfferModal } from './CustomerAcceptedOfferModal';
import { 
  Package, 
  Clock, 
  Plus, 
  Star, 
  Phone, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Eye, 
  User, 
  LogOut, 
  Trash2 
} from 'lucide-react';

export type CustomerDashboardSection = 'profile' | 'new_request' | 'new_offers' | 'my_requests';

interface CustomerViewProps {
  currentCustomer?: CustomerProfile | null;
  requests: DeliveryRequest[];
  drivers: DriverProfile[];
  customerNotifications?: CustomerNotification[];
  onMarkCustomerNotificationRead?: (id: string) => void;
  onOpenNewRequest: () => void;
  onOpenProfile?: () => void;
  onAcceptOffer: (requestId: string, offerId: string) => void;
  onViewDriverProfile: (driver: DriverOffer) => void;
  onOpenRateDriver?: (request: DeliveryRequest, offer: DriverOffer) => void;
  onMarkDelivered?: (request: DeliveryRequest, offer: DriverOffer) => void;
  onDeleteRequest?: (requestId: string) => void;
  selectedSection?: CustomerDashboardSection;
  onSelectSection?: (section: CustomerDashboardSection) => void;
  onLogout?: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  currentCustomer,
  requests,
  drivers: _drivers,
  customerNotifications: _customerNotifications = [],
  onMarkCustomerNotificationRead: _onMarkCustomerNotificationRead,
  onOpenNewRequest,
  onOpenProfile,
  onAcceptOffer,
  onViewDriverProfile,
  onOpenRateDriver,
  onMarkDelivered,
  onDeleteRequest,
  selectedSection = 'my_requests',
  onSelectSection,
  onLogout
}) => {
  // Modal states for viewing an offer and celebratory accepted offer modal
  const [selectedOfferForModal, setSelectedOfferForModal] = useState<{ request: DeliveryRequest; offer: DriverOffer } | null>(null);
  const [acceptedOfferSuccessModal, setAcceptedOfferSuccessModal] = useState<{ request: DeliveryRequest; offer: DriverOffer } | null>(null);

  const handleAcceptOfferFromModal = (requestId: string, offerId: string) => {
    onAcceptOffer(requestId, offerId);
    if (selectedOfferForModal) {
      const current = selectedOfferForModal;
      setSelectedOfferForModal(null);
      setAcceptedOfferSuccessModal(current);
    }
  };

  // Filter requests belonging specifically to the logged-in customer (memoized, sorted newest first)
  const customerRequests = useMemo(() => {
    if (!currentCustomer) {
      return sortRequestsNewestFirst(requests);
    }
    const filtered = requests.filter(r => {
      // 1. Direct ID match
      if (r.customerId && r.customerId === currentCustomer.id) return true;

      // 2. Normalized phone number match (check last 7+ digits)
      const normPhone1 = (r.customerPhone || '').replace(/[^0-9]/g, '');
      const normPhone2 = (currentCustomer.phone || '').replace(/[^0-9]/g, '');
      if (normPhone1 && normPhone2 && normPhone1.length >= 7 && normPhone2.length >= 7) {
        if (normPhone1.slice(-7) === normPhone2.slice(-7)) return true;
      }

      // 3. Exact customer name match (if not default/generic placeholder)
      if (r.customerName && currentCustomer.name && r.customerName.trim().toLowerCase() === currentCustomer.name.trim().toLowerCase()) {
        return true;
      }

      // 4. Default / Fallback matching for requests created in this session
      if (!r.customerId || r.customerId === 'cust-current' || r.customerId === 'customer' || r.customerName === 'عميل واصل') {
        return true;
      }

      return false;
    });

    return sortRequestsNewestFirst(filtered.length > 0 ? filtered : requests);
  }, [requests, currentCustomer]);

  const requestsWithOffers = useMemo(() => {
    return customerRequests.filter(r => r.offers && r.offers.length > 0);
  }, [customerRequests]);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* PWA & System Notifications Enable Banner */}
      <NotificationBanner userRole="customer" />

      {/* Logged-in Customer Status Bar */}
      {currentCustomer && (
        <div className="bg-white border border-[#E5EDF3] rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-2xl bg-[#EAF6F1] text-[#159B7A] font-black flex items-center justify-center text-lg shadow-xs shrink-0">
              {currentCustomer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#142F52] text-sm sm:text-base">{currentCustomer.name}</span>
                <span className="text-[11px] bg-[#EEF4FA] text-[#142F52] px-2 py-0.5 rounded-full border border-[#E5EDF3] font-bold">
                  {currentCustomer.emirate}
                </span>
              </div>
              <div className="text-xs text-[#64748B] font-mono dir-ltr text-right">
                {currentCustomer.phone}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#142F52] px-3.5 py-2 rounded-xl border border-[#E5EDF3] text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#159B7A]" />
                <span>الملف الشخصي</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenNewRequest}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#159B7A] hover:bg-[#108466] text-white px-3.5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>طلب جديد</span>
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 bg-[#F5F9FC] hover:bg-red-50 text-[#64748B] hover:text-red-600 rounded-xl border border-[#E5EDF3] transition-all active:scale-95 cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SECTION: طلب جديد (NEW REQUEST) */}
      {/* ========================================================================= */}
      {selectedSection === 'new_request' && (
        <div className="space-y-6">
          
          {/* Hero Request Creation Box */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#159B7A]/30 shadow-sm relative overflow-hidden text-center sm:text-right">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6F1] border border-[#159B7A]/20 text-[#159B7A] text-xs font-bold mb-3">
                <Award className="w-3.5 h-3.5 text-[#159B7A]" />
                <span>خدمة توصيل فورية ومباشرة • عمولة 0%</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#142F52] mb-3 leading-tight">
                نشر طلب توصيل جديد بين كافة الإمارات
              </h1>
              <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed mb-6">
                حدد مكان الاستلام ومكان التسليم، نوع الطرد وموعد التوصيل، وسيصل طلبك فوراً إلى شبكة السائقين المعتمدين لتقديم أفضل عروض الأسعار التنافسية.
              </p>

              <button
                type="button"
                onClick={onOpenNewRequest}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#159B7A] hover:bg-[#108466] text-white font-black px-8 py-4 rounded-2xl shadow-md hover:shadow-lg text-sm sm:text-base transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>فتح نموذج نشر طلب جديد</span>
              </button>
            </div>
          </div>

          {/* Quick Advantages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5EDF3] space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#142F52] text-sm">سائقون معتمدون وموثقون</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                يتم تدقيق الهوية الإماراتية ورخصة القيادة وملكية المركبة لكل سائق قبل منحه شارة التوثيق.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5EDF3] space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#EEF4FA] text-[#142F52] flex items-center justify-center font-bold">
                <Phone className="w-5 h-5 text-[#159B7A]" />
              </div>
              <h4 className="font-bold text-[#142F52] text-sm">تواصل مباشر فوري</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                محادثة واتساب ومكالمة هاتفية حية بنقرة واحدة للتنسيق مع السائق دون أي وسيط أو تعقيدات.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5EDF3] space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-bold">
                <Star className="w-5 h-5 fill-[#159B7A] text-[#159B7A]" />
              </div>
              <h4 className="font-bold text-[#142F52] text-sm">أعلى تقييم وأفضل سعر</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                يرتب النظام العروض تلقائياً بحسب تقييمات السائقين السابقة لضمان أعلى جودة توصيل.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SECTION: العروض الجديدة (NEW OFFERS) - MODAL TRIGGER LIST */}
      {/* ========================================================================= */}
      {selectedSection === 'new_offers' && (
        <div className="space-y-5">
          
          {requestsWithOffers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E5EDF3] space-y-3 shadow-xs">
              <Clock className="w-12 h-12 text-[#94A3B8] mx-auto stroke-[1.5] animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-[#142F52]">لا توجد عروض أسعار جديدة حالياً</h3>
              <p className="text-[#64748B] text-xs max-w-md mx-auto">
                عند قيام السائقين بتقديم عروض أسعار على طلباتك ستظهر هنا فوراً قائمة بالعروض. اضغط على أي عرض لمعاينته في نافذة منبثقة وقبوله والتواصل مع السائق.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {requestsWithOffers.map((req) => {
                // Sort offers deterministically (accepted first, highest rating, highest completed, stable ID tie-breaker)
                const sortedOffers = sortOffersDeterministically(req.offers || []);

                return (
                  <div key={req.id} className="bg-white border border-[#E5EDF3] rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs">
                    
                    {/* Request Summary Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5EDF3] pb-3.5">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs text-[#142F52] font-extrabold bg-[#EEF4FA] px-2.5 py-0.5 rounded-full border border-[#E5EDF3]">
                            {req.packageType}
                          </span>
                          <span className="text-xs text-[#64748B]">{req.createdAt}</span>
                          <span className="bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                            {sortedOffers.length} عروض متوفرة
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-[#142F52]">{req.title}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
                        <div className="flex items-center gap-1.5 text-xs bg-[#F5F9FC] px-3 py-1.5 rounded-xl border border-[#E5EDF3]">
                          <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                          <span className="text-[#94A3B8]">⬅️</span>
                          <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                        </div>
                        
                        {onDeleteRequest && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟ سيتم إلغاؤه واختفاؤه من لوحة السائقين فوراً.')) {
                                onDeleteRequest(req.id);
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer shrink-0 shadow-xs"
                            title="حذف هذا الطلب"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>حذف الطلب</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* VERTICAL LIST OF OFFERS (قائمة عروض منسقة تفتح نافذة تفاصيل العرض عند الضغط) */}
                    <div className="space-y-2.5">
                      {sortedOffers.map((offer, idx) => {
                        const isTop = idx === 0;
                        const isAccepted = req.selectedOfferId === offer.id;

                        return (
                          <div
                            key={offer.id}
                            onClick={() => setSelectedOfferForModal({ request: req, offer })}
                            className={`w-full p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 text-right cursor-pointer group ${
                              isAccepted 
                                ? 'bg-[#EAF6F1] border-[#159B7A] shadow-sm ring-1 ring-[#159B7A]/30' 
                                : 'bg-[#F5F9FC] border-[#E5EDF3] hover:border-[#159B7A] hover:bg-white shadow-xs active:scale-[0.99]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={offer.driverAvatar}
                                alt={offer.driverName}
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-[#E5EDF3] shrink-0 group-hover:border-[#159B7A] transition-colors"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-[#142F52] text-sm sm:text-base truncate group-hover:text-[#159B7A] transition-colors">{offer.driverName}</span>
                                  {offer.driverVerified && (
                                    <span title="سائق معتمد وموثق">
                                      <ShieldCheck className="w-4 h-4 text-[#159B7A] shrink-0" />
                                    </span>
                                  )}
                                  {offer.driverRating >= 4.8 && !isAccepted && (
                                    <span className="bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/30 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                                      ⭐ موصى به من واصل
                                    </span>
                                  )}
                                  {isTop && !isAccepted && offer.driverRating < 4.8 && (
                                    <span className="bg-[#EEF4FA] text-[#142F52] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#E5EDF3]">
                                      ⭐ الأعلى تقييماً
                                    </span>
                                  )}
                                  {isAccepted && (
                                    <span className="bg-[#159B7A] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                      ✓ العرض المقبول
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#64748B] mt-1 flex items-center gap-2 flex-wrap">
                                  <span className="flex items-center gap-0.5 text-[#142F52] font-bold">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {offer.driverRating}
                                    <span className="text-[10px] text-[#159B7A] font-semibold mr-0.5">({(offer.driverRating * 20).toFixed(0)}% موثوقية)</span>
                                  </span>
                                  <span>•</span>
                                  <span className="truncate">{offer.driverVehicle}</span>
                                  {offer.estimatedDeliveryTime && (
                                    <>
                                      <span>•</span>
                                      <span className="text-[#159B7A] font-medium">⏱️ {offer.estimatedDeliveryTime}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Price and Action Button */}
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-left">
                                <span className="text-base sm:text-xl font-black text-[#159B7A] font-mono">{offer.price}</span>
                                <span className="text-[10px] text-[#64748B] font-bold block">AED</span>
                              </div>
                              <button
                                type="button"
                                className="px-3.5 py-2.5 rounded-xl bg-[#159B7A] group-hover:bg-[#108466] text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-white" />
                                <span className="hidden sm:inline">معاينة العرض (نافذة)</span>
                                <span className="sm:hidden">معاينة</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION: طلباتي (MY REQUESTS) */}
      {/* ========================================================================= */}
      {selectedSection === 'my_requests' && (
        <div className="space-y-6">
          
          {customerRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E5EDF3] space-y-3 shadow-xs">
              <Package className="w-14 h-14 text-[#94A3B8] mx-auto stroke-[1.5]" />
              <h3 className="text-base sm:text-lg font-bold text-[#142F52]">لا توجد طلبات لديك حالياً</h3>
              <p className="text-[#64748B] text-xs max-w-sm mx-auto">
                يمكنك نشر طلب توصيل طرد جديد في أي وقت لاستقبال عروض السائقين المعتمدين.
              </p>
              <button
                onClick={onOpenNewRequest}
                className="bg-[#159B7A] hover:bg-[#108466] text-white font-bold px-5 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                + نشر طلب الآن
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {customerRequests.map((req) => {
                const hasAssignedDriver = req.selectedOfferId !== undefined;
                const acceptedOffer = req.offers.find(o => o.id === req.selectedOfferId);
                const whatsappNumber = acceptedOffer?.driverWhatsappPhone || acceptedOffer?.driverPhone.replace(/[^0-9]/g, '') || '';
                const callNumber = acceptedOffer?.driverCallPhone || acceptedOffer?.driverPhone || '';

                return (
                  <div
                    key={req.id}
                    className="bg-white border border-[#E5EDF3] hover:border-[#159B7A]/50 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#E5EDF3] pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-[#142F52] font-extrabold bg-[#EEF4FA] px-2.5 py-0.5 rounded-full border border-[#E5EDF3]">
                            {req.packageType}
                          </span>
                          <span className="text-xs text-[#64748B]">{req.createdAt}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'delivered'
                              ? 'bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20'
                              : hasAssignedDriver
                              ? 'bg-[#159B7A] text-white'
                              : 'bg-[#F5F9FC] text-[#64748B] border border-[#E5EDF3]'
                          }`}>
                            {req.status === 'delivered' ? 'مكتمل ومسلم ✓' : hasAssignedDriver ? 'قيد التوصيل 🚚' : 'بانتظار العروض ⏳'}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-[#142F52]">{req.title}</h3>
                      </div>

                      {onDeleteRequest && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟ سيتم إلغاؤه واختفاؤه من لوحة السائقين فوراً.')) {
                              onDeleteRequest(req.id);
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer shrink-0 shadow-xs"
                          title="حذف هذا الطلب"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>حذف الطلب</span>
                        </button>
                      )}
                    </div>

                    {/* Route Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F5F9FC] p-3.5 rounded-2xl border border-[#E5EDF3] text-xs">
                      <div>
                        <div className="text-[#64748B] mb-1">من (الاستلام):</div>
                        <div className="flex items-center gap-1.5 font-bold text-[#142F52] mb-0.5">
                          <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                        </div>
                        <div className="text-[#64748B]">{req.pickupArea}</div>
                      </div>

                      <div>
                        <div className="text-[#64748B] mb-1">إلى (التسليم):</div>
                        <div className="flex items-center gap-1.5 font-bold text-[#142F52] mb-0.5">
                          <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                        </div>
                        <div className="text-[#64748B]">{req.deliveryArea}</div>
                      </div>

                      <div>
                        <div className="text-[#64748B] mb-1">موعد ومواصفات التوصيل:</div>
                        <div className="text-[#142F52] font-bold mb-0.5">📅 {req.deliveryDate}</div>
                        <div className="text-[#64748B]">الوزن التقديري: {req.packageWeight}</div>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-[#64748B] bg-[#F5F9FC] p-3 rounded-xl border border-[#E5EDF3]">
                        💡 <strong className="text-[#142F52]">ملاحظات:</strong> {req.notes}
                      </p>
                    )}

                    {/* Assigned Driver Box if accepted */}
                    {hasAssignedDriver && acceptedOffer ? (
                      <div className="bg-[#EAF6F1] border border-[#159B7A]/30 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                          <img
                            src={acceptedOffer.driverAvatar}
                            alt={acceptedOffer.driverName}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-[#159B7A] shrink-0 shadow-xs"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#142F52]">{acceptedOffer.driverName}</span>
                              <span className="bg-[#159B7A] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                سائق معتمد
                              </span>
                            </div>
                            <div className="text-xs text-[#64748B] mt-0.5">
                              {acceptedOffer.driverVehicle} • السعر: <strong className="text-[#159B7A] font-bold">{acceptedOffer.price} AED</strong>
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp / Call / Delivery Confirmation / Rating Buttons */}
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                          <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 bg-[#159B7A] hover:bg-[#108466] text-white font-bold px-3.5 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-xs"
                          >
                            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                            <span>واتساب</span>
                          </a>

                          <a
                            href={`tel:${callNumber}`}
                            className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 bg-[#EEF4FA] hover:bg-[#E2EDF7] text-[#142F52] font-bold px-3.5 py-2.5 rounded-xl text-xs border border-[#E5EDF3] active:scale-95 transition-all"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#159B7A]" />
                            <span>اتصال</span>
                          </a>

                          {/* 1. If not yet delivered -> "تم التوصيل بنجاح" button */}
                          {req.status !== 'delivered' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onMarkDelivered) {
                                  onMarkDelivered(req, acceptedOffer);
                                } else if (onOpenRateDriver) {
                                  onOpenRateDriver(req, acceptedOffer);
                                }
                              }}
                              className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 bg-[#159B7A] hover:bg-[#108466] text-white font-black px-4 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-md cursor-pointer ring-2 ring-[#159B7A]/30"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
                              <span>تم التوصيل بنجاح ✅</span>
                            </button>
                          )}

                          {/* 2. If delivered and not yet rated -> "تقييم السائق الآن" */}
                          {req.status === 'delivered' && !req.isCustomerRated && onOpenRateDriver && (
                            <button
                              type="button"
                              onClick={() => onOpenRateDriver(req, acceptedOffer)}
                              className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 bg-[#159B7A] hover:bg-[#108466] text-white font-black px-4 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 fill-white text-white" />
                              <span>⭐ تقييم السائق الآن</span>
                            </button>
                          )}

                          {/* 3. If delivered and rated -> Badge */}
                          {req.status === 'delivered' && req.isCustomerRated && (
                            <div className="flex items-center gap-1.5 bg-[#EEF4FA] border border-[#E5EDF3] text-[#159B7A] font-bold px-3 py-2 rounded-xl text-xs shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#159B7A]" />
                              <span>تم التوصيل والتقييم ({req.customerRating || 5} ⭐)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs bg-[#F5F9FC] p-3.5 rounded-2xl border border-[#E5EDF3]">
                        <div className="flex items-center gap-2 text-[#64748B]">
                          <Clock className="w-4 h-4 text-[#159B7A] shrink-0" />
                          <span>العروض المقدمة: <strong className="text-[#142F52] font-bold">{req.offers.length} عروض متوفرة</strong></span>
                        </div>
                        {req.offers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (req.offers.length === 1) {
                                setSelectedOfferForModal({ request: req, offer: req.offers[0] });
                              } else if (onSelectSection) {
                                onSelectSection('new_offers');
                              }
                            }}
                            className="bg-[#159B7A] hover:bg-[#108466] text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-white" />
                            <span>استعراض وقبول العروض (نافذة منبثقة) ⬅️</span>
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: تفاصيل عرض السائق (DRIVER OFFER DETAIL MODAL) */}
      {/* ========================================================================= */}
      {selectedOfferForModal && (
        <CustomerOfferDetailModal
          request={selectedOfferForModal.request}
          offer={selectedOfferForModal.offer}
          isAccepted={selectedOfferForModal.request.selectedOfferId === selectedOfferForModal.offer.id}
          onClose={() => setSelectedOfferForModal(null)}
          onAcceptOffer={handleAcceptOfferFromModal}
          onViewDriverProfile={onViewDriverProfile}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: تأكيد قبول العرض والتواصل المباشر (ACCEPTED OFFER MODAL) */}
      {/* ========================================================================= */}
      {acceptedOfferSuccessModal && (
        <CustomerAcceptedOfferModal
          request={acceptedOfferSuccessModal.request}
          offer={acceptedOfferSuccessModal.offer}
          onClose={() => setAcceptedOfferSuccessModal(null)}
        />
      )}

    </div>
  );
};
