import React, { useState, useMemo } from 'react';
import type { DeliveryRequest, DriverOffer, DriverProfile, CustomerProfile, CustomerNotification } from '../types';
import { sortRequestsNewestFirst, sortOffersDeterministically } from '../utils/requestUtils';
import { EmirateBadge } from './EmirateBadge';
import { NotificationBanner } from './NotificationBanner';
import { 
  Package, 
  Clock, 
  Plus, 
  Star, 
  Phone, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  BellRing, 
  Check, 
  ChevronDown, 
  ChevronUp,
  User,
  LogOut
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
  selectedSection?: CustomerDashboardSection;
  onSelectSection?: (section: CustomerDashboardSection) => void;
  onLogout?: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  currentCustomer,
  requests,
  drivers: _drivers,
  customerNotifications = [],
  onMarkCustomerNotificationRead,
  onOpenNewRequest,
  onOpenProfile,
  onAcceptOffer,
  onViewDriverProfile,
  onOpenRateDriver,
  selectedSection = 'my_requests',
  onSelectSection,
  onLogout
}) => {
  // Track expanded offer IDs for the accordion behavior
  const [expandedOfferIds, setExpandedOfferIds] = useState<Record<string, boolean>>({});

  const toggleOfferExpand = (offerId: string) => {
    setExpandedOfferIds(prev => ({
      ...prev,
      [offerId]: !prev[offerId]
    }));
  };

  // Filter requests belonging specifically to the logged-in customer (memoized, sorted newest first)
  const customerRequests = useMemo(() => {
    if (!currentCustomer) return [];
    return sortRequestsNewestFirst(
      requests.filter(r => {
        // 1. Direct ID match
        if (r.customerId && r.customerId === currentCustomer.id) return true;

        // 2. Normalized phone number match (check last 7+ digits)
        const normPhone1 = (r.customerPhone || '').replace(/[^0-9]/g, '');
        const normPhone2 = (currentCustomer.phone || '').replace(/[^0-9]/g, '');
        if (normPhone1 && normPhone2 && normPhone1.length >= 7 && normPhone2.length >= 7) {
          if (normPhone1.slice(-7) === normPhone2.slice(-7)) return true;
        }

        // 3. Exact customer name match (if not default/generic placeholder)
        if (r.customerName && currentCustomer.name && r.customerName.trim() === currentCustomer.name.trim() && r.customerName !== 'عميل واصل') {
          return true;
        }

        return false;
      })
    );
  }, [requests, currentCustomer]);

  const unreadNotifications = useMemo(() => {
    return customerNotifications.filter(n => !n.isRead);
  }, [customerNotifications]);

  const requestsWithOffers = useMemo(() => {
    return customerRequests.filter(r => r.offers && r.offers.length > 0);
  }, [customerRequests]);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* PWA & System Notifications Enable Banner */}
      <NotificationBanner userRole="customer" />

      {/* Logged-in Customer Status Bar */}
      {currentCustomer && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-2xl bg-white text-black font-black flex items-center justify-center text-lg shadow-md shrink-0">
              {currentCustomer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base">{currentCustomer.name}</span>
                <span className="text-[11px] bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700 font-bold">
                  {currentCustomer.emirate}
                </span>
              </div>
              <div className="text-xs text-zinc-400 font-mono dir-ltr text-right">
                {currentCustomer.phone}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white px-3.5 py-2 rounded-xl border border-zinc-700 text-xs font-bold transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>الملف الشخصي</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenNewRequest}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-black px-3.5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>طلب جديد</span>
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-all active:scale-95"
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
          <div className="bg-zinc-950 p-6 sm:p-10 rounded-3xl border-2 border-white shadow-2xl relative overflow-hidden text-center sm:text-right">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold mb-3">
                <Award className="w-3.5 h-3.5 text-white" />
                <span>خدمة توصيل فورية ومباشرة • عمولة 0%</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
                نشر طلب توصيل جديد بين كافة الإمارات
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                حدد مكان الاستلام ومكان التسليم، نوع الطرد وموعد التوصيل، وسيصل طلبك فوراً إلى شبكة السائقين المعتمدين لتقديم أفضل عروض الأسعار التنافسية.
              </p>

              <button
                type="button"
                onClick={onOpenNewRequest}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-black px-8 py-4 rounded-2xl shadow-xl text-sm sm:text-base transition-all active:scale-95"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>فتح نموذج نشر طلب جديد</span>
              </button>
            </div>
          </div>

          {/* Quick Advantages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">سائقون معتمدون وموثقون</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                يتم تدقيق الهوية الإماراتية ورخصة القيادة وملكية المركبة لكل سائق قبل منحه شارة التوثيق.
              </p>
            </div>

            <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">تواصل مباشر فوري</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                محادثة واتساب ومكالمة هاتفية حية بنقرة واحدة للتنسيق مع السائق دون أي وسيط أو تعقيدات.
              </p>
            </div>

            <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                <Star className="w-5 h-5 fill-black" />
              </div>
              <h4 className="font-bold text-white text-sm">أعلى تقييم وأفضل سعر</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                يرتب النظام العروض تلقائياً بحسب تقييمات السائقين السابقة لضمان أعلى جودة توصيل.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SECTION: العروض الجديدة (NEW OFFERS) - VERTICAL STACK & COLLAPSIBLE */}
      {/* ========================================================================= */}
      {selectedSection === 'new_offers' && (
        <div className="space-y-5">
          
          {/* Unread Notifications Strip */}
          {unreadNotifications.length > 0 && (
            <div className="bg-zinc-950 border border-zinc-700 rounded-2xl p-4 space-y-2 shadow-lg">
              <div className="flex items-center gap-2 font-bold text-xs text-white">
                <BellRing className="w-4 h-4 text-white" />
                <span>إشعارات العروض الواردة حديثاً ({unreadNotifications.length}):</span>
              </div>
              <div className="space-y-1.5">
                {unreadNotifications.map((notif) => (
                  <div key={notif.id} className="bg-black border border-zinc-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">الكابتن {notif.driverName}</span>
                      <span className="bg-white text-black px-2 py-0.5 rounded-full font-bold">{notif.price} AED</span>
                      <span className="text-zinc-400 text-[11px] truncate max-w-xs">{notif.requestTitle}</span>
                    </div>
                    {onMarkCustomerNotificationRead && (
                      <button
                        onClick={() => onMarkCustomerNotificationRead(notif.id)}
                        className="text-zinc-400 hover:text-white p-1"
                        title="تحديد كمقروء"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {requestsWithOffers.length === 0 ? (
            <div className="bg-zinc-950 rounded-3xl p-8 sm:p-12 text-center border border-zinc-800 space-y-3">
              <Clock className="w-12 h-12 text-zinc-600 mx-auto stroke-[1.5] animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-white">لا توجد عروض أسعار جديدة حالياً</h3>
              <p className="text-zinc-400 text-xs max-w-md mx-auto">
                عند قيام السائقين بتقديم عروض أسعار على طلباتك ستظهر هنا فوراً قائمة بالعروض تحت بعضها البعض مع تفاصيل السائق.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {requestsWithOffers.map((req) => {
                // Sort offers deterministically (accepted first, highest rating, highest completed, stable ID tie-breaker)
                const sortedOffers = sortOffersDeterministically(req.offers || []);

                return (
                  <div key={req.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
                    
                    {/* Request Summary Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white font-extrabold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
                            {req.packageType}
                          </span>
                          <span className="text-xs text-zinc-400">{req.createdAt}</span>
                          <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {sortedOffers.length} عروض متوفرة
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white">{req.title}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                        <span className="text-zinc-500">⬅️</span>
                        <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                      </div>
                    </div>

                    {/* VERTICAL LIST OF OFFERS (تحت بعضها البعض - مختصرة ويتم توسيعها بالضغط) */}
                    <div className="space-y-2.5">
                      {sortedOffers.map((offer, idx) => {
                        const isExpanded = !!expandedOfferIds[offer.id];
                        const isTop = idx === 0;
                        const isAccepted = req.selectedOfferId === offer.id;

                        return (
                          <div
                            key={offer.id}
                            className={`rounded-2xl border transition-colors duration-150 overflow-hidden ${
                              isAccepted 
                                ? 'bg-zinc-900 border-white' 
                                : isExpanded 
                                ? 'bg-black border-zinc-600 shadow-xl' 
                                : 'bg-black border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            {/* COMPACT SUMMARY BAR (اسم السائق + المبلغ + سهم التوسيع) */}
                            <button
                              type="button"
                              onClick={() => toggleOfferExpand(offer.id)}
                              className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-right hover:bg-zinc-900/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={offer.driverAvatar}
                                  alt={offer.driverName}
                                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-zinc-700 shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-white text-sm sm:text-base">{offer.driverName}</span>
                                    {offer.driverVerified && (
                                      <span title="سائق معتمد وموثق">
                                        <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                                      </span>
                                    )}
                                    {isTop && !isAccepted && (
                                      <span className="bg-zinc-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                                        ⭐ الأعلى تقييماً
                                      </span>
                                    )}
                                    {isAccepted && (
                                      <span className="bg-white text-black text-[9px] font-black px-2 py-0.5 rounded-full">
                                        ✓ العرض المقبول
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                                    <span className="flex items-center gap-0.5 text-white font-bold">
                                      <Star className="w-3 h-3 fill-white text-white" />
                                      {offer.driverRating}
                                    </span>
                                    <span>• {offer.driverVehicle}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Price and Expand Toggle */}
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-left">
                                  <span className="text-base sm:text-lg font-black text-white">{offer.price}</span>
                                  <span className="text-[10px] text-zinc-400 font-bold block">AED</span>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center border border-zinc-800">
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </button>

                            {/* EXPANDED DETAILS (تظهر فقط عند الضغط على البطاقة) */}
                            {isExpanded && (
                              <div className="p-4 pt-0 space-y-3.5 border-t border-zinc-800/80 mt-1">
                                
                                {/* Delivery Time & Driver Note */}
                                <div className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                                  <div className="text-white font-semibold flex items-center gap-1.5">
                                    <span>⏱️ موعد ومواصفات التوصيل:</span>
                                    <strong className="text-white">{offer.estimatedDeliveryTime}</strong>
                                  </div>
                                  {offer.note && (
                                    <p className="text-zinc-400 text-[11px] leading-relaxed pt-1">
                                      "{offer.note}"
                                    </p>
                                  )}
                                </div>

                                {/* Contact and Actions Bar */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <a
                                    href={`https://wa.me/${(offer.driverWhatsappPhone || offer.driverPhone || '').replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-black font-bold py-2.5 px-3 rounded-xl text-xs active:scale-95 transition-all shadow-md"
                                  >
                                    <svg className="w-3.5 h-3.5 fill-black shrink-0" viewBox="0 0 24 24">
                                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                    </svg>
                                    <span>محادثة واتساب مباشرة</span>
                                  </a>

                                  <a
                                    href={`tel:${offer.driverCallPhone || offer.driverPhone}`}
                                    className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs border border-zinc-700 active:scale-95 transition-all"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>اتصال هاتفي ({offer.driverPhone})</span>
                                  </a>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onViewDriverProfile(offer)}
                                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-2.5 px-3 rounded-xl text-xs border border-zinc-800 transition-colors"
                                  >
                                    معاينة ملف السائق
                                  </button>

                                  {!isAccepted ? (
                                    <button
                                      type="button"
                                      onClick={() => onAcceptOffer(req.id, offer.id)}
                                      className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-2.5 px-3 rounded-xl text-xs active:scale-95 transition-all shadow-md"
                                    >
                                      قبول هذا العرض
                                    </button>
                                  ) : (
                                    <div className="flex-1 bg-zinc-800 text-white text-center font-bold py-2.5 px-3 rounded-xl text-xs">
                                      تم قبول هذا العرض ✓
                                    </div>
                                  )}
                                </div>

                              </div>
                            )}

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
            <div className="bg-zinc-950 rounded-3xl p-8 sm:p-12 text-center border border-zinc-800 space-y-3">
              <Package className="w-14 h-14 text-zinc-600 mx-auto stroke-[1.5]" />
              <h3 className="text-base sm:text-lg font-bold text-white">لا توجد طلبات لديك حالياً</h3>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                يمكنك نشر طلب توصيل طرد جديد في أي وقت لاستقبال عروض السائقين المعتمدين.
              </p>
              <button
                onClick={onOpenNewRequest}
                className="bg-white hover:bg-zinc-200 text-black font-bold px-5 py-2.5 rounded-xl text-xs active:scale-95 transition-all"
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
                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white font-extrabold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
                            {req.packageType}
                          </span>
                          <span className="text-xs text-zinc-400">{req.createdAt}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'delivered'
                              ? 'bg-zinc-800 text-white border border-zinc-700'
                              : hasAssignedDriver
                              ? 'bg-white text-black'
                              : 'bg-zinc-900 text-zinc-300'
                          }`}>
                            {req.status === 'delivered' ? 'مكتمل ومسلم ✓' : hasAssignedDriver ? 'قيد التوصيل 🚚' : 'بانتظار العروض ⏳'}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white">{req.title}</h3>
                      </div>
                    </div>

                    {/* Route Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black p-3.5 rounded-2xl border border-zinc-800 text-xs">
                      <div>
                        <div className="text-zinc-400 mb-1">من (الاستلام):</div>
                        <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                          <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                        </div>
                        <div className="text-zinc-300">{req.pickupArea}</div>
                      </div>

                      <div>
                        <div className="text-zinc-400 mb-1">إلى (التسليم):</div>
                        <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                          <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                        </div>
                        <div className="text-zinc-300">{req.deliveryArea}</div>
                      </div>

                      <div>
                        <div className="text-zinc-400 mb-1">موعد ومواصفات التوصيل:</div>
                        <div className="text-white font-bold mb-0.5">📅 {req.deliveryDate}</div>
                        <div className="text-zinc-400">الوزن التقديري: {req.packageWeight}</div>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-zinc-300 bg-black p-3 rounded-xl border border-zinc-800">
                        💡 <strong className="text-white">ملاحظات:</strong> {req.notes}
                      </p>
                    )}

                    {/* Assigned Driver Box if accepted */}
                    {hasAssignedDriver && acceptedOffer ? (
                      <div className="bg-zinc-900 border-2 border-white rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                          <img
                            src={acceptedOffer.driverAvatar}
                            alt={acceptedOffer.driverName}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{acceptedOffer.driverName}</span>
                              <span className="bg-white text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                سائق معتمد
                              </span>
                            </div>
                            <div className="text-xs text-zinc-400 mt-0.5">
                              {acceptedOffer.driverVehicle} • السعر: <strong className="text-white">{acceptedOffer.price} AED</strong>
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp / Call / Rating Buttons */}
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                          <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-black font-bold px-4 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-md"
                          >
                            <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                            <span>واتساب</span>
                          </a>

                          <a
                            href={`tel:${callNumber}`}
                            className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-zinc-700 active:scale-95 transition-all"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>اتصال</span>
                          </a>

                          {onOpenRateDriver && (
                            req.isCustomerRated ? (
                              <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 text-white font-bold px-3 py-2 rounded-xl text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                <span>تم التقييم ({req.customerRating} ⭐)</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => onOpenRateDriver(req, acceptedOffer)}
                                className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-black font-black px-4 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-md"
                              >
                                <Star className="w-3.5 h-3.5 fill-black" />
                                <span>تقييم السائق</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-zinc-400 bg-black p-3 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-white" />
                          <span>العروض المقدمة: <strong className="text-white">{req.offers.length} عروض</strong></span>
                        </div>
                        {req.offers.length > 0 && onSelectSection && (
                          <button
                            onClick={() => onSelectSection('new_offers')}
                            className="text-white font-bold underline hover:text-zinc-300"
                          >
                            عرض وقبول العروض ⬅️
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

    </div>
  );
};
