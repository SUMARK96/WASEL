import React, { useState, useMemo } from 'react';
import type { DeliveryRequest, DriverProfile, DriverNotification, DriverOffer } from '../types';
import { UAE_EMIRATES } from '../data/mockData';
import { sortRequestsNewestFirst } from '../utils/requestUtils';
import { 
  getWhatsAppInvoiceUrl, 
  createSubscriptionInvoice,
  checkDriverSubscriptionStatus 
} from '../utils/subscriptionUtils';
import { InvoiceModal } from './InvoiceModal';
import { EmirateBadge } from './EmirateBadge';
import { NotificationBanner } from './NotificationBanner';
import { DriverRequestModal } from './DriverRequestModal';
import { 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  Bell, 
  Star, 
  FileText, 
  Share2, 
  Check, 
  AlertTriangle,
  MessageCircle,
  User,
  Eye,
  Trash2
} from 'lucide-react';

export type DriverDashboardSection = 'profile' | 'new_requests' | 'subscription';

interface DriverViewProps {
  driver: DriverProfile;
  requests: DeliveryRequest[];
  notifications: DriverNotification[];
  selectedSection?: DriverDashboardSection;
  onSelectSection?: (section: DriverDashboardSection) => void;
  onOpenSubscription?: () => void;
  onOpenSubmitOffer: (request: DeliveryRequest) => void;
  onDeleteOffer?: (requestId: string, offerId: string) => void;
  onMarkNotificationRead?: (id: string) => void;
  onLogout?: () => void;
  subscriptionPrice?: number;
}

export const DriverView: React.FC<DriverViewProps> = ({
  driver,
  requests,
  notifications = [],
  selectedSection: propSelectedSection,
  onSelectSection,
  onOpenSubscription,
  onOpenSubmitOffer,
  onDeleteOffer,
  onMarkNotificationRead,
  onLogout: _onLogout,
  subscriptionPrice = 199
}) => {
  // Navigation Section State (Controlled or internal fallback)
  const [internalSection, setInternalSection] = useState<DriverDashboardSection>('new_requests');
  const selectedSection = propSelectedSection || internalSection;
  const setSelectedSection = onSelectSection || setInternalSection;

  // State for request details modal popup
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<DeliveryRequest | null>(null);

  // Filters for new delivery requests
  const [filterPickup, setFilterPickup] = useState<string>('all');
  const [filterDelivery, setFilterDelivery] = useState<string>('all');
  const [requestTab, setRequestTab] = useState<'available' | 'my_bids' | 'active_jobs'>('available');
  
  // State for invoice modal
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const subStatus = checkDriverSubscriptionStatus(driver);
  const daysRemaining = subStatus.daysRemaining;
  const isExpired = subStatus.isExpired || driver.subscriptionStatus === 'expired';
  const isSuspended = subStatus.isSuspended || driver.subscriptionStatus === 'suspended';

  // Driver current invoice object
  const currentInvoice = createSubscriptionInvoice(
    driver,
    `ZIN-${driver.id.replace(/[^0-9]/g, '').slice(-6) || '892134'}`,
    driver.joinedDate || '2026-09-01',
    driver.subscriptionExpiry,
    driver.isExemptionActive ? 0 : subscriptionPrice
  );

  // Robust helper to check if an offer belongs to the current driver (by id, phone variations, or name)
  const isOfferByCurrentDriver = (offer: DriverOffer, d: DriverProfile): boolean => {
    if (!offer || !d) return false;
    if (offer.driverId === d.id) return true;
    
    const phoneA = (offer.driverPhone || offer.driverWhatsappPhone || offer.driverCallPhone || '').replace(/[^0-9]/g, '');
    const phoneB = (d.phone || d.whatsappPhone || d.callPhone || '').replace(/[^0-9]/g, '');
    if (phoneA && phoneB) {
      if (phoneA === phoneB) return true;
      if (phoneA.length >= 7 && phoneB.length >= 7 && phoneA.slice(-7) === phoneB.slice(-7)) return true;
    }
    
    if (offer.driverName && d.name && offer.driverName.trim().toLowerCase() === d.name.trim().toLowerCase()) {
      return true;
    }
    return false;
  };

  // Memoized rock-solid request sorting & filtering
  const openRequests = useMemo(() => {
    return sortRequestsNewestFirst(requests.filter(r => r.status === 'open'));
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return openRequests.filter(r => {
      const matchPickup = filterPickup === 'all' || r.pickupEmirate === filterPickup;
      const matchDelivery = filterDelivery === 'all' || r.deliveryEmirate === filterDelivery;
      return matchPickup && matchDelivery;
    });
  }, [openRequests, filterPickup, filterDelivery]);

  const myBids = useMemo(() => {
    return sortRequestsNewestFirst(requests.filter(r => 
      r.offers.some(o => isOfferByCurrentDriver(o, driver))
    ));
  }, [requests, driver]);

  const activeJobs = useMemo(() => {
    return sortRequestsNewestFirst(requests.filter(r => 
      r.selectedOfferId && 
      r.offers.some(o => o.id === r.selectedOfferId && isOfferByCurrentDriver(o, driver))
    ));
  }, [requests, driver]);

  const acceptedOfferNotifications = useMemo(() => {
    return notifications.filter(n => n.type === 'offer_accepted' && !n.isRead);
  }, [notifications]);

  const handleOfferClick = (req: DeliveryRequest) => {
    if (isSuspended) {
      alert('⛔ تم تعليق حسابك لانتهاء فترة كود الإعفاء وعدم سداد الاشتراك الشهري. يرجى سداد الاشتراك لتتمكن من تقديم عروض الأسعار للعملاء.');
      if (onOpenSubscription) onOpenSubscription();
      else setSelectedSection('subscription');
      return;
    }
    if (isExpired || driver.subscriptionStatus !== 'active') {
      alert('⚠️ حسابك غير مفعل أو انتهت صلاحية اشتراكك. يجب سداد وتأكيد الاشتراك عبر بوابة الدفع الإلكتروني أولاً لتتمكن من تقديم عروض الأسعار للعملاء.');
      if (onOpenSubscription) onOpenSubscription();
      else setSelectedSection('subscription');
      return;
    }
    onOpenSubmitOffer(req);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* PWA & System Notifications Enable Banner */}
      <NotificationBanner userRole="driver" />

      {/* ========================================================================= */}
      {/* 1. SECTION: الملف الشخصي (PROFILE) */}
      {/* ========================================================================= */}
      {selectedSection === 'profile' && (
        <div className="space-y-6">
          
          {/* Main Driver Profile Card */}
          <div className="bg-white border border-[#E5EDF3] rounded-3xl p-6 sm:p-8 shadow-sm relative space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#E5EDF3] pb-6">
              <div className="flex items-center gap-4">
                <img
                  src={driver.avatar}
                  alt={driver.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-[#159B7A] shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-[#142F52]">{driver.name}</h2>
                    {driver.isVerified && (
                      <span className="bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#159B7A]" />
                        <span>سائق معتمد وموثق</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[#142F52] font-bold bg-[#EEF4FA] px-2 py-0.5 rounded-lg border border-[#E5EDF3]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {driver.rating} ({driver.reviewsCount} تقييم)
                    </span>
                    <span>• الإمارة: <strong className="text-[#142F52]">{driver.emirate}</strong></span>
                    <span>• انضم في: <strong className="text-[#142F52]">{driver.joinedDate}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSection('subscription')}
                  className="bg-[#159B7A] hover:bg-[#108466] text-white font-bold px-4 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  إدارة الاشتراك 📄
                </button>
              </div>
            </div>

            {/* Direct Contact Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF4FA] text-[#142F52] flex items-center justify-center font-bold">
                    <Phone className="w-5 h-5 text-[#159B7A]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#64748B]">رقم الاتصال الهاتفي:</div>
                    <div className="font-bold text-[#142F52] text-sm font-mono dir-ltr">{driver.callPhone || driver.phone}</div>
                  </div>
                </div>
                <a
                  href={`tel:${driver.callPhone || driver.phone}`}
                  className="bg-white hover:bg-[#EEF4FA] text-[#142F52] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#E5EDF3]"
                >
                  اتصال
                </a>
              </div>

              <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-bold">
                    <svg className="w-5 h-5 fill-[#159B7A]" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#64748B]">رقم الواتساب:</div>
                    <div className="font-bold text-[#142F52] text-sm font-mono dir-ltr">{driver.whatsappPhone}</div>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${driver.whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#159B7A] hover:bg-[#108466] text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs"
                >
                  واتساب
                </a>
              </div>
            </div>

            {/* Vehicle Details & Real Photos Gallery */}
            <div className="bg-[#F5F9FC] p-5 rounded-2xl border border-[#E5EDF3] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#159B7A]" />
                  <h3 className="font-bold text-[#142F52] text-sm sm:text-base">
                    مركبة التوصيل: {driver.vehicleModel} ({driver.vehiclePlate})
                  </h3>
                </div>
                <span className="text-xs text-[#142F52] font-bold bg-[#EEF4FA] px-2.5 py-0.5 rounded-full border border-[#E5EDF3]">
                  {driver.vehiclePhotos ? driver.vehiclePhotos.length : 1} صور
                </span>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(driver.vehiclePhotos && driver.vehiclePhotos.length > 0 ? driver.vehiclePhotos : [driver.vehiclePhoto]).map((photoUrl, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-[#E5EDF3] aspect-video bg-white group">
                    <img
                      src={photoUrl}
                      alt={`Vehicle Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-[#142F52]/80 py-0.5 text-center text-[9px] text-white">
                      صورة {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Official Documents Checklist */}
            <div className="bg-[#F5F9FC] p-5 rounded-2xl border border-[#E5EDF3] space-y-3">
              <h4 className="font-bold text-[#142F52] text-xs sm:text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#159B7A]" />
                <span>حالة الوثائق والمستندات الرسمية الثلاثة:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white border border-[#E5EDF3] p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
                  <div>
                    <div className="font-bold text-[#142F52]">رخصة القيادة الإماراتية</div>
                    <div className="text-[10px] text-[#159B7A]">مدققة ومطابقة رسمياً ✓</div>
                  </div>
                </div>

                <div className="bg-white border border-[#E5EDF3] p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
                  <div>
                    <div className="font-bold text-[#142F52]">ملكية المركبة (رخصة مركبة)</div>
                    <div className="text-[10px] text-[#159B7A]">مدققة ومطابقة رسمياً ✓</div>
                  </div>
                </div>

                <div className="bg-white border border-[#E5EDF3] p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159B7A] shrink-0" />
                  <div>
                    <div className="font-bold text-[#142F52]">بطاقة الهوية الإماراتية</div>
                    <div className="text-[10px] text-[#159B7A]">مدققة ومطابقة رسمياً ✓</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {driver.bio && (
              <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] text-xs space-y-1">
                <div className="font-bold text-[#64748B]">نبذة عن السائق:</div>
                <p className="text-[#142F52] leading-relaxed">{driver.bio}</p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SECTION: الطلبات الجديدة (NEW REQUESTS) */}
      {/* ========================================================================= */}
      {selectedSection === 'new_requests' && (
        <div className="space-y-6">
          
          {/* Status Alert if account is suspended due to exemption expiration */}
          {isSuspended ? (
            <div className="bg-white border border-red-200 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in zoom-in-95">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black shrink-0 text-lg shadow-xs">
                  ⛔
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-red-700 text-sm sm:text-base">تم تعليق حساب السائق مؤقتاً (Suspended)</h4>
                    {driver.usedExemptionCode && (
                      <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                        انتهاء كود الإعفاء: {driver.usedExemptionCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                    انتهت فترة كود الإعفاء المجاني ولم يتم سداد الاشتراك الشهري. يرجى سداد الاشتراك ({subscriptionPrice} AED) لإعادة تفعيل الحساب فوراً والبدء بتقديم عروض الأسعار للعملاء.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenSubscription) onOpenSubscription();
                  else setSelectedSection('subscription');
                }}
                className="w-full sm:w-auto bg-[#159B7A] hover:bg-[#108466] text-white font-black px-5 py-2.5 rounded-xl text-xs shrink-0 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                سداد الاشتراك الشهري وتنشيط الحساب ⚡
              </button>
            </div>
          ) : subStatus.isExemption && subStatus.isExpiringSoon ? (
            /* 5-Day Exemption Expiry Warning */
            <div className="bg-white border border-amber-200 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in zoom-in-95">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black shrink-0">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-amber-800 text-sm sm:text-base">
                      تنبيه: متبقي {subStatus.daysRemaining} {subStatus.daysRemaining === 1 ? 'يوم' : 'أيام'} على انتهاء فترة كود الإعفاء
                    </h4>
                    {driver.usedExemptionCode && (
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-200">
                        {driver.usedExemptionCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                    ينتهي الإعفاء بتاريخ {driver.subscriptionExpiry}. يرجى دفع الاشتراك الشهري ({subscriptionPrice} AED) لتجنب تعليق الحساب عند نهاية الفترة.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenSubscription) onOpenSubscription();
                  else setSelectedSection('subscription');
                }}
                className="w-full sm:w-auto bg-[#159B7A] hover:bg-[#108466] text-white font-black px-5 py-2.5 rounded-xl text-xs shrink-0 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                سداد الاشتراك الشهري الآن ({subscriptionPrice} AED)
              </button>
            </div>
          ) : isExpired ? (
            /* General Expired Alert */
            <div className="bg-white border border-amber-200 p-4 sm:p-5 rounded-3xl flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-black text-[#142F52] text-sm">حسابك غير مفعل حالياً أو انتهت صلاحية الاشتراك</h4>
                  <p className="text-xs text-[#64748B]">يجب سداد وتأكيد الاشتراك الموحد ({subscriptionPrice} AED) أو إدخال كود إعفاء لتقديم عروض الأسعار للعملاء.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenSubscription) onOpenSubscription();
                  else setSelectedSection('subscription');
                }}
                className="bg-[#159B7A] hover:bg-[#108466] text-white font-bold px-4 py-2.5 rounded-xl text-xs shrink-0 cursor-pointer"
              >
                تفعيل الاشتراك ⚡
              </button>
            </div>
          ) : null}

          {/* Instant Alert for Accepted Offers */}
          {acceptedOfferNotifications.length > 0 && (
            <div className="space-y-3">
              {acceptedOfferNotifications.map(notif => {
                const cleanPhone = notif.customerPhone ? notif.customerPhone.replace(/[^0-9]/g, '') : '';
                const formattedWa = cleanPhone ? (cleanPhone.startsWith('971') ? cleanPhone : '971' + cleanPhone.replace(/^0+/, '')) : '';
                const waUrl = formattedWa 
                  ? `https://wa.me/${formattedWa}?text=${encodeURIComponent(`مرحباً ${notif.customerName || 'عزيزي العميل'}، أنا الكابتن ${driver.name} من تطبيق واصل بخصوص قبول طلبك "${notif.title || ''}". جاهز للتنفيذ فوراً.`)}`
                  : '#';

                return (
                  <div 
                    key={notif.id} 
                    className="bg-[#EAF6F1] border border-[#159B7A]/40 p-5 rounded-3xl shadow-sm space-y-3 animate-in zoom-in-95"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#159B7A] text-white flex items-center justify-center font-black shrink-0 text-xl shadow-xs">
                          🎉
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-[#159B7A] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                              إشعار فوري: تم قبول عرضك!
                            </span>
                            {notif.price && (
                              <span className="bg-white text-[#142F52] font-mono text-xs font-bold px-2 py-0.5 rounded border border-[#E5EDF3]">
                                {notif.price} AED
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-[#142F52] text-base mt-1">{notif.title}</h4>
                          <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      </div>

                      {onMarkNotificationRead && (
                        <button
                          type="button"
                          onClick={() => onMarkNotificationRead(notif.id)}
                          className="self-end sm:self-center text-xs text-[#159B7A] hover:underline cursor-pointer font-bold"
                        >
                          تحديد كمقروء ✓
                        </button>
                      )}
                    </div>

                    {/* Quick Action Contact Buttons */}
                    <div className="pt-2 border-t border-[#159B7A]/20 flex flex-wrap items-center gap-2">
                      {cleanPhone ? (
                        <>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#159B7A] hover:bg-[#108466] text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                          >
                            <MessageCircle className="w-4 h-4 text-white" />
                            <span>مراسلة العميل واتساب فوراً ({cleanPhone})</span>
                          </a>

                          <a
                            href={`tel:${cleanPhone}`}
                            className="bg-white hover:bg-[#F5F9FC] text-[#142F52] border border-[#E5EDF3] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                          >
                            <Phone className="w-4 h-4 text-[#159B7A]" />
                            <span>اتصال هاتفي بالعميل</span>
                          </a>
                        </>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => setRequestTab('active_jobs')}
                        className="text-xs text-[#142F52] font-bold hover:text-[#159B7A] px-3 py-2 rounded-xl bg-white border border-[#E5EDF3] mr-auto cursor-pointer"
                      >
                        عرض المهمة في "المهام المقبولة" ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Subtabs for Requests: المتاحة / عروضي المقدمة / المهام النشطة */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5EDF3] pb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setRequestTab('available')}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  requestTab === 'available'
                    ? 'bg-[#159B7A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#142F52] bg-white border border-[#E5EDF3]'
                }`}
              >
                الطلبات المتاحة ({openRequests.length})
              </button>

              <button
                onClick={() => setRequestTab('my_bids')}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  requestTab === 'my_bids'
                    ? 'bg-[#159B7A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#142F52] bg-white border border-[#E5EDF3]'
                }`}
              >
                عروضي المقدمة ({myBids.length})
              </button>

              <button
                onClick={() => setRequestTab('active_jobs')}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  requestTab === 'active_jobs'
                    ? 'bg-[#159B7A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#142F52] bg-white border border-[#E5EDF3]'
                }`}
              >
                المهام المقبولة ({activeJobs.length})
              </button>
            </div>

            {/* Emirate Route Filters */}
            {requestTab === 'available' && (
              <div className="flex items-center gap-2">
                <select
                  value={filterPickup}
                  onChange={(e) => setFilterPickup(e.target.value)}
                  className="bg-white border border-[#E5EDF3] rounded-xl px-3 py-1.5 text-xs text-[#142F52] focus:outline-none"
                >
                  <option value="all">من: جميع الإمارات</option>
                  {UAE_EMIRATES.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>

                <select
                  value={filterDelivery}
                  onChange={(e) => setFilterDelivery(e.target.value)}
                  className="bg-white border border-[#E5EDF3] rounded-xl px-3 py-1.5 text-xs text-[#142F52] focus:outline-none"
                >
                  <option value="all">إلى: جميع الإمارات</option>
                  {UAE_EMIRATES.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* List of Requests */}
          {requestTab === 'available' && (
            filteredRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E5EDF3] space-y-3 shadow-xs">
                <Truck className="w-14 h-14 text-[#94A3B8] mx-auto stroke-[1.5]" />
                <h3 className="text-base sm:text-lg font-bold text-[#142F52]">لا توجد طلبات توصيل متاحة حالياً</h3>
                <p className="text-[#64748B] text-xs">سيتم تحديث القائمة تلقائياً فور قيام أي عميل بنشر طلب توصيل جديد.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => {
                  const myOffer = req.offers?.find(o => isOfferByCurrentDriver(o, driver));
                  const alreadySubmitted = Boolean(myOffer);

                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestForDetails(req)}
                      className={`bg-white border transition-all duration-150 rounded-2xl p-4 sm:p-5 cursor-pointer shadow-xs hover:border-[#159B7A] hover:bg-[#F5F9FC] group ${
                        alreadySubmitted
                          ? 'border-[#159B7A]/50 bg-[#EAF6F1]/20'
                          : 'border-[#E5EDF3]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          {/* Route Emirate Badges */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                            <span className="text-[#94A3B8] text-xs">➔</span>
                            <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                          </div>

                          {/* Request Title & Meta */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-[#142F52] text-sm sm:text-base group-hover:text-[#159B7A] transition-colors truncate">
                                {req.title}
                              </h4>
                              <span className="bg-[#EEF4FA] text-[#142F52] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#E5EDF3] shrink-0">
                                {req.packageType}
                              </span>
                              {alreadySubmitted && (
                                <span className="bg-[#159B7A] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs shrink-0">
                                  <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                                  <span>تم تقديم عرضك ({myOffer?.price} AED)</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-1 flex-wrap">
                              <span>📅 {req.deliveryDate}</span>
                              <span>•</span>
                              <span>{req.createdAt}</span>
                              <span>•</span>
                              <span className="text-[#142F52] font-bold">{req.offers?.length || 0} عروض</span>
                            </div>
                          </div>
                        </div>

                        {/* Action CTA Button */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5EDF3] w-full sm:w-auto justify-between sm:justify-start">
                          <div className="text-[11px] text-[#64748B] sm:hidden">
                            {alreadySubmitted ? 'اضغط للمعاينة والتعديل' : 'اضغط للمعاينة والتقديم'}
                          </div>
                          {alreadySubmitted ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequestForDetails(req);
                              }}
                              className="bg-[#EEF4FA] hover:bg-[#E2EDF7] text-[#142F52] border border-[#E5EDF3] font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                            >
                              <Check className="w-4 h-4 text-[#159B7A] stroke-[2.5]" />
                              <span>معاينة وتعديل العرض ({myOffer?.price} AED)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequestForDetails(req);
                              }}
                              className="bg-[#159B7A] hover:bg-[#108466] text-white font-black px-4.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-white" />
                              <span>معاينة الطلب والتفاصيل</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* My Bids Tab */}
          {requestTab === 'my_bids' && (
            myBids.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-[#E5EDF3] text-[#64748B] text-xs shadow-xs">
                لم تقم بتقديم عروض أسعار بعد. استعرض الطلبات المتاحة وقدم عروضك الآن.
              </div>
            ) : (
              <div className="space-y-3">
                {myBids.map((req) => {
                  const myOffer = req.offers.find(o => isOfferByCurrentDriver(o, driver));
                  return (
                    <div 
                      key={req.id} 
                      onClick={() => setSelectedRequestForDetails(req)}
                      className="bg-white border border-[#E5EDF3] hover:border-[#159B7A] rounded-2xl p-4 sm:p-5 space-y-3 cursor-pointer transition-all shadow-xs group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-[#142F52] text-base group-hover:text-[#159B7A] transition-colors">{req.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1">
                            <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                            <span>➔</span>
                            <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                            <span>•</span>
                            <span>{req.deliveryDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {myOffer && (
                            <span className="bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20 font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-xs">
                              عرضك: {myOffer.price} AED
                            </span>
                          )}
                          {onDeleteOffer && myOffer && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('هل أنت متأكد من رغبتك في حذف وسحب عرض السعر المقدم؟ سيختفي العرض مباشرة من لوحة العميل.')) {
                                  onDeleteOffer(req.id, myOffer.id);
                                }
                              }}
                              className="p-1.5 sm:p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all flex items-center gap-1 text-xs active:scale-95 cursor-pointer shrink-0"
                              title="سحب / حذف العرض"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">سحب العرض</span>
                            </button>
                          )}
                          <span className="bg-[#EEF4FA] text-[#142F52] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#E5EDF3] hidden sm:inline-block">
                            معاينة 👁️
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Active Jobs Tab */}
          {requestTab === 'active_jobs' && (
            activeJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-[#E5EDF3] text-[#64748B] text-xs space-y-2 shadow-xs">
                <Truck className="w-10 h-10 text-[#94A3B8] mx-auto" />
                <p>لا توجد مهام توصيل مقبولة حالياً. فور قبول العميل لعرضك ستظهر هنا مع بيانات العميل للتواصل الفوري.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((req) => {
                  const acceptedOffer = req.offers.find(o => o.id === req.selectedOfferId || o.status === 'accepted');
                  const cleanPhone = req.customerPhone ? req.customerPhone.replace(/[^0-9]/g, '') : '';
                  const formattedWa = cleanPhone ? (cleanPhone.startsWith('971') ? cleanPhone : '971' + cleanPhone.replace(/^0+/, '')) : '';
                  const waUrl = formattedWa
                    ? `https://wa.me/${formattedWa}?text=${encodeURIComponent(`مرحباً ${req.customerName || 'عزيزي العميل'}، أنا الكابتن ${driver.name} من منصة واصل بخصوص طلب التوصيل "${req.title}". جاهز للتنفيذ فوراً.`)}`
                    : '#';

                  return (
                    <div key={req.id} className="bg-white border border-[#E5EDF3] rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5EDF3] pb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="bg-[#159B7A] text-white font-black px-3 py-1 rounded-full text-xs shadow-xs">
                              مهمة توصيل مقبولة وجارية 🚚
                            </span>
                            <span className="bg-[#EEF4FA] text-[#142F52] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E5EDF3]">
                              {req.packageType}
                            </span>
                            {acceptedOffer && (
                              <span className="bg-[#EAF6F1] text-[#159B7A] font-mono text-xs font-black px-2.5 py-0.5 rounded border border-[#159B7A]/30">
                                السعر المتفق عليه: {acceptedOffer.price} AED
                              </span>
                            )}
                          </div>
                          <h3 className="font-black text-[#142F52] text-lg">{req.title}</h3>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-xs text-[#64748B]">تاريخ الطلب: {req.createdAt}</div>
                          <div className="text-xs font-bold text-[#142F52] mt-0.5">📅 موعد التسليم: {req.deliveryDate}</div>
                        </div>
                      </div>

                      {/* Locations and Package details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] text-xs">
                        <div className="space-y-1">
                          <div className="text-[#64748B] font-bold flex items-center gap-1.5">
                            <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                            <span>نقطة الاستلام:</span>
                          </div>
                          <p className="text-[#142F52] font-medium pr-2">{req.pickupArea}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[#64748B] font-bold flex items-center gap-1.5">
                            <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                            <span>نقطة التسليم:</span>
                          </div>
                          <p className="text-[#142F52] font-medium pr-2">{req.deliveryArea}</p>
                        </div>

                        {req.notes && (
                          <div className="sm:col-span-2 pt-2 border-t border-[#E5EDF3]">
                            <span className="text-[#64748B] font-bold">ملاحظات العميل: </span>
                            <span className="text-[#142F52]">{req.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Customer Contact Card */}
                      <div className="bg-[#EEF4FA] border border-[#E5EDF3] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-white border border-[#E5EDF3] flex items-center justify-center font-bold text-[#159B7A] shrink-0">
                            <User className="w-5 h-5 text-[#159B7A]" />
                          </div>
                          <div>
                            <div className="text-xs text-[#64748B] font-medium">بيانات العميل للتواصل المباشر:</div>
                            <div className="font-black text-[#142F52] text-base">{req.customerName || 'عميل واصل'}</div>
                            {req.customerPhone && (
                              <div className="text-xs text-[#159B7A] font-bold font-mono mt-0.5">
                                📞 {req.customerPhone}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {cleanPhone ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#159B7A] hover:bg-[#108466] text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs active:scale-95 transition-all"
                            >
                              <MessageCircle className="w-4 h-4 text-white" />
                              <span>مراسلة عبر واتساب</span>
                            </a>

                            <a
                              href={`tel:${cleanPhone}`}
                              className="bg-white hover:bg-[#F5F9FC] text-[#142F52] border border-[#E5EDF3] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 active:scale-95 transition-all"
                            >
                              <Phone className="w-4 h-4 text-[#159B7A]" />
                              <span>اتصال هاتفي</span>
                            </a>
                          </div>
                        ) : (
                          <div className="text-xs text-[#64748B] italic">
                            لا يتوفر رقم هاتف مسجل للعميل في هذا الطلب
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION: الاشتراك (SUBSCRIPTION) */}
      {/* ========================================================================= */}
      {selectedSection === 'subscription' && (
        <div className="space-y-6">
          
          {/* Subscription Status Card */}
          <div className="bg-white border border-[#E5EDF3] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EDF3] pb-6">
              <div>
                <span className="bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20 text-[10px] font-black px-3 py-1 rounded-full inline-block mb-2">
                  الباقة الموحدة للسائقين المعتمدين ⭐
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#142F52]">تفاصيل الاشتراك الرسمي والفاتورة</h2>
                <p className="text-xs text-[#64748B] mt-1">تجديد شهري شامل لجميع مميزات المنصة بدون أي عمولة إضافية</p>
              </div>

              <div className="text-right sm:text-left">
                <span className="text-3xl font-black text-[#159B7A]">{subscriptionPrice}</span>
                <span className="text-xs text-[#64748B] font-bold mr-1">درهم / شهرياً</span>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] space-y-1">
                <div className="text-[#64748B]">حالة الاشتراك الحالية:</div>
                <div className="font-black text-sm text-[#142F52]">
                  {isSuspended ? (
                    <span className="text-red-600 font-extrabold flex items-center gap-1">
                      <span>⛔ معلق لانتهاء كود الإعفاء</span>
                    </span>
                  ) : subStatus.isExemption ? (
                    <span className="text-[#159B7A] font-extrabold flex items-center gap-1">
                      <span>🟢 إعفاء نشط ({driver.usedExemptionCode || 'كود ترويجي'})</span>
                    </span>
                  ) : driver.subscriptionStatus === 'active' ? (
                    <span className="text-[#159B7A]">🟢 نشط ومفعل</span>
                  ) : (
                    <span className="text-amber-600">⚠️ غير نشط</span>
                  )}
                </div>
              </div>

              <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] space-y-1">
                <div className="text-[#64748B]">تاريخ انتهاء الاشتراك:</div>
                <div className="font-bold text-sm text-[#142F52] font-mono">{driver.subscriptionExpiry}</div>
              </div>

              <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] space-y-1">
                <div className="text-[#64748B]">الأيام المتبقية:</div>
                <div className="font-bold text-sm text-[#142F52]">
                  {isSuspended ? (
                    <span className="text-red-500">انتهت فترة الإعفاء (معلق)</span>
                  ) : daysRemaining > 0 ? (
                    `${daysRemaining} يوماً`
                  ) : (
                    <span className="text-red-500">منتهي الصلاحية</span>
                  )}
                </div>
              </div>
            </div>

            {/* Suspended Notice Banner inside Subscription Section */}
            {isSuspended && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-800 space-y-2">
                <div className="flex items-center gap-2 font-black text-sm">
                  <span>⛔ تنبيه تعليق الحساب (Account Suspended):</span>
                </div>
                <p className="text-red-700 leading-relaxed text-[11px]">
                  تم تعليق حسابك نظراً لانتهاء فترة كود الإعفاء وعدم سداد الاشتراك الشهري. قم بسداد الاشتراك الشهري عبر بوابة زينة ({subscriptionPrice} AED) أو إدخال كود إعفاء جديد لتنشيط حسابك فوراً.
                </p>
              </div>
            )}

            {/* 5-Day Automated Expiry Reminder Notice */}
            {!isSuspended && (
              <div className="bg-[#EEF4FA] border border-[#E5EDF3] p-4 rounded-2xl text-xs text-[#142F52] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#142F52]">
                  <Bell className="w-4 h-4 text-[#159B7A]" />
                  <span>
                    {subStatus.isExemption
                      ? 'نظام التنبيه التلقائي قبل انتهاء كود الإعفاء بـ 5 أيام:'
                      : 'نظام التنبيه التلقائي قبل الانتهاء بـ 5 أيام:'
                    }
                  </span>
                </div>
                <p className="text-[#64748B] leading-relaxed text-[11px]">
                  {subStatus.isExemption
                    ? `يقوم نظام واصل بإرسال إشعار ورسالة تذكير لهاتفك (${driver.phone}) قبل انتهاء كود الإعفاء بـ 5 أيام لتتمكن من سداد الاشتراك الشهري وتجنب تعليق الحساب.`
                    : `يقوم نظام واصل بإرسال رسالة تذكير وفاتورة رسمية لرقم هاتفك المدرج (${driver.phone}) قبل انتهاء موعد اشتراكك بـ 5 أيام لضمان استمرار ظهور عروضك دون انقطاع.`
                  }
                </p>
              </div>
            )}

            {/* Actions: Invoice Preview, WhatsApp Invoice, Ziina Pay / Promo Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="bg-white hover:bg-[#F5F9FC] text-[#142F52] font-bold py-3 px-4 rounded-2xl text-xs border border-[#E5EDF3] flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#159B7A]" />
                <span>عرض الفاتورة الرسمية</span>
              </button>

              <a
                href={getWhatsAppInvoiceUrl(currentInvoice)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-[#F5F9FC] text-[#142F52] font-bold py-3 px-4 rounded-2xl text-xs border border-[#E5EDF3] flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4 text-[#159B7A]" />
                <span>إرسال الفاتورة للواتساب</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (onOpenSubscription) onOpenSubscription();
                }}
                className="bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <span>
                  {isSuspended 
                    ? `⚡ تنشيط الحساب وسداد الاشتراك (${subscriptionPrice} AED)` 
                    : `⚡ تجديد الاشتراك / كود إعفاء (${subscriptionPrice} AED)`
                  }
                </span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Official Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          invoice={currentInvoice}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {/* Driver Request Details Popup Modal */}
      {selectedRequestForDetails && (
        <DriverRequestModal
          request={selectedRequestForDetails}
          driver={driver}
          onClose={() => setSelectedRequestForDetails(null)}
          onOpenSubmitOffer={(req) => {
            setSelectedRequestForDetails(null);
            handleOfferClick(req);
          }}
          onDeleteOffer={onDeleteOffer}
          onViewMyBids={() => {
            setSelectedRequestForDetails(null);
            setRequestTab('my_bids');
          }}
        />
      )}

    </div>
  );
};
