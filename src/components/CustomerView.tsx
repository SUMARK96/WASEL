import React, { useState } from 'react';
import type { DeliveryRequest, DriverOffer, DriverProfile, CustomerNotification } from '../types';
import { EmirateBadge } from './EmirateBadge';
import { NotificationBanner } from './NotificationBanner';
import { 
  Package, 
  Clock, 
  Plus, 
  Star, 
  Phone, 
  Eye, 
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  BellRing,
  Check
} from 'lucide-react';

interface CustomerViewProps {
  requests: DeliveryRequest[];
  drivers: DriverProfile[];
  customerNotifications?: CustomerNotification[];
  onMarkCustomerNotificationRead?: (id: string) => void;
  onOpenNewRequest: () => void;
  onAcceptOffer: (requestId: string, offerId: string) => void;
  onViewDriverProfile: (driver: DriverOffer) => void;
  onOpenRateDriver?: (request: DeliveryRequest, offer: DriverOffer) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  requests,
  drivers: _drivers,
  customerNotifications = [],
  onMarkCustomerNotificationRead,
  onOpenNewRequest,
  onAcceptOffer,
  onViewDriverProfile,
  onOpenRateDriver
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const filteredRequests = requests.filter(r => 
    activeTab === 'active' ? (r.status === 'open' || r.status === 'assigned' || r.status === 'in_transit') : r.status === 'delivered'
  );

  const unreadNotifications = customerNotifications.filter(n => !n.isRead);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* PWA & System Notifications Enable Banner */}
      <NotificationBanner userRole="customer" />

      {/* Unread Incoming Offers Alert for Customer */}
      {unreadNotifications.length > 0 && (
        <div className="bg-zinc-950 border-2 border-zinc-700 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                <BellRing className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  🔔 عروض أسعار جديدة وردت لطلباتك ({unreadNotifications.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  قدم سائقون معتمدون عروض أسعار لتوصيل طرودك، يمكنك مراجعتها والتواصل المباشر معهم
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {unreadNotifications.map((notif) => (
              <div 
                key={notif.id}
                className="bg-black border border-zinc-800 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 text-white flex items-center justify-center font-bold shrink-0">
                    {notif.driverName ? notif.driverName.charAt(0) : 'س'}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>الكابتن {notif.driverName}</span>
                      <span className="text-black font-extrabold bg-white px-2 py-0.5 rounded-full">
                        {notif.price} AED
                      </span>
                    </div>
                    <div className="text-zinc-400 text-[11px] truncate max-w-xs sm:max-w-md">
                      طلب: {notif.requestTitle} • {notif.timestamp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notif.driverWhatsappPhone && (
                    <a
                      href={`https://wa.me/${notif.driverWhatsappPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-zinc-200 text-black font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 active:scale-95"
                    >
                      واتساب
                    </a>
                  )}
                  {onMarkCustomerNotificationRead && (
                    <button
                      onClick={() => onMarkCustomerNotificationRead(notif.id)}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs border border-zinc-800"
                      title="تحديد كمقروء"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Welcome & Quick Action Hero */}
      <div className="bg-zinc-950 p-5 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold mb-2.5">
              <Award className="w-3.5 h-3.5 text-white" />
              <span>نظام التقييم الذكي: تظهر عروض السائقين الأعلى تقييماً أولاً دائماً</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white mb-2 leading-tight">
              أنشئ طلبك واستقبل أفضل عروض السائقين المعتمدين
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              انشر طلب توصيل طردك بين أي إمارتين في الدولة، واستقبل عروض الأسعار مرتبة بالأعلى تقييماً مع تواصل واتساب ومكالمة مباشر.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewRequest}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-black px-6 py-3.5 sm:py-4 rounded-2xl shadow-xl transition-all text-sm sm:text-base shrink-0 transform active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>نشر طلب توصيل جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
              activeTab === 'active'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            الطلبات النشطة ({requests.filter(r => r.status !== 'delivered').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
              activeTab === 'completed'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            المكتملة
          </button>
        </div>

        <div className="text-xs text-zinc-400 hidden sm:block">
          إجمالي الطلبات: <strong className="text-white">{requests.length}</strong>
        </div>
      </div>

      {/* Request Cards Feed */}
      {filteredRequests.length === 0 ? (
        <div className="bg-zinc-950 rounded-3xl p-8 sm:p-12 text-center border border-zinc-800">
          <Package className="w-14 h-14 sm:w-16 sm:h-16 text-zinc-600 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-base sm:text-lg font-bold text-white mb-1">لا توجد طلبات في هذه القائمة</h3>
          <p className="text-zinc-400 text-xs mb-5">قم بنشر طلب توصيل طرد جديد للاستفادة من شبكة السائقين المعتمدين.</p>
          <button
            onClick={onOpenNewRequest}
            className="bg-white hover:bg-zinc-200 text-black font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
          >
            نشر طلب جديد الآن
          </button>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {filteredRequests.map((req) => {
            const hasAssignedDriver = req.selectedOfferId !== undefined;
            const acceptedOffer = req.offers.find(o => o.id === req.selectedOfferId);

            const whatsappNumber = acceptedOffer?.driverWhatsappPhone || acceptedOffer?.driverPhone.replace(/[^0-9]/g, '') || '';
            const callNumber = acceptedOffer?.driverCallPhone || acceptedOffer?.driverPhone || '';

            // SMART RANKING: Sort offers by Driver Rating (highest first), then completed deliveries
            const sortedOffers = [...req.offers].sort((a, b) => {
              if (b.driverRating !== a.driverRating) {
                return b.driverRating - a.driverRating;
              }
              return b.driverCompletedCount - a.driverCompletedCount;
            });

            return (
              <div
                key={req.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-4 sm:p-6 shadow-xl transition-all space-y-5"
              >
                {/* Request Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-white font-extrabold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
                        {req.packageType}
                      </span>
                      <span className="text-xs text-zinc-400">{req.createdAt}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">{req.title}</h3>
                  </div>
                </div>

                {/* Route & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-black p-3.5 sm:p-4 rounded-2xl border border-zinc-800 text-xs">
                  <div>
                    <div className="text-zinc-400 mb-1">من (مكان الاستلام):</div>
                    <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                      <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                    </div>
                    <div className="text-zinc-300 font-medium">{req.pickupArea}</div>
                  </div>

                  <div>
                    <div className="text-zinc-400 mb-1">إلى (مكان التسليم):</div>
                    <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                      <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                    </div>
                    <div className="text-zinc-300 font-medium">{req.deliveryArea}</div>
                  </div>

                  <div>
                    <div className="text-zinc-400 mb-1">موعد ومواصفات التوصيل:</div>
                    <div className="text-white font-bold mb-0.5">📅 {req.deliveryDate}</div>
                    <div className="text-zinc-400">الوزن التقديري: {req.packageWeight}</div>
                  </div>
                </div>

                {req.notes && (
                  <p className="text-xs text-zinc-300 bg-black p-3 rounded-xl border border-zinc-800">
                    💡 <strong className="text-white">ملاحظات العميل:</strong> {req.notes}
                  </p>
                )}

                {/* Accepted Driver Direct WhatsApp, Call & Rating Buttons */}
                {hasAssignedDriver && acceptedOffer ? (
                  <div className="bg-zinc-900 border-2 border-white rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 w-full lg:w-auto">
                      <img
                        src={acceptedOffer.driverAvatar}
                        alt={acceptedOffer.driverName}
                        className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{acceptedOffer.driverName}</span>
                          <span className="bg-white text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            سائق مقبول ✓
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{acceptedOffer.driverVehicle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-0.5 text-white text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-white" />
                            {acceptedOffer.driverRating}
                          </span>
                          <span className="text-xs text-zinc-300 font-semibold">
                            • السعر: {acceptedOffer.price} AED • {acceptedOffer.estimatedDeliveryTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direct WhatsApp, Call & Rate Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      
                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-black font-black px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs transition-all shadow-md active:scale-95"
                        title="محادثة واتساب فورية مع السائق"
                      >
                        <svg className="w-4 h-4 fill-black shrink-0" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        <span>محادثة واتساب</span>
                      </a>

                      {/* Phone Call Button */}
                      <a
                        href={`tel:${callNumber}`}
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2.5 sm:py-3 rounded-xl text-xs transition-all border border-zinc-700 active:scale-95"
                        title="مكالمة هاتفية حية"
                      >
                        <Phone className="w-4 h-4 shrink-0" />
                        <span>اتصال</span>
                      </a>

                      {/* Rating Button */}
                      {onOpenRateDriver && (
                        req.isCustomerRated ? (
                          <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 text-white font-bold px-3 py-2.5 sm:py-3 rounded-xl text-xs">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>تم التقييم ({req.customerRating} ⭐)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenRateDriver(req, acceptedOffer)}
                            className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-black font-black px-4 py-2.5 sm:py-3 rounded-xl text-xs transition-all shadow-md active:scale-95"
                            title="تقييم تجربة التوصيل"
                          >
                            <Star className="w-4 h-4 fill-black" />
                            <span>تقييم السائق</span>
                          </button>
                        )
                      )}

                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                          <span>عروض السائقين المقدمة</span>
                          <span className="bg-white text-black text-xs px-2.5 py-0.5 rounded-full font-bold">
                            {sortedOffers.length} عروض
                          </span>
                        </h4>
                      </div>

                      {sortedOffers.length > 1 && (
                        <div className="text-[11px] text-zinc-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                          <span>مرتبة تلقائياً بالسائقين الأعلى تقييماً</span>
                        </div>
                      )}
                    </div>

                    {sortedOffers.length === 0 ? (
                      <div className="bg-black rounded-2xl p-6 text-center text-xs text-zinc-400 border border-zinc-800">
                        <Clock className="w-7 h-7 text-white mx-auto mb-2 animate-pulse" />
                        تم نشر الطلب بانتظار تقديم عروض السائقين المعتمدين...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                        {sortedOffers.map((offer, index) => {
                          const isTopRanked = index === 0 && offer.driverRating >= 4.7;

                          return (
                            <div
                              key={offer.id}
                              className={`bg-black rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3.5 relative ${
                                isTopRanked
                                  ? 'border-2 border-white shadow-xl'
                                  : 'border border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              {/* Top Rated Badge for #1 Ranked Driver */}
                              {isTopRanked && (
                                <div className="absolute -top-3 right-4 bg-white text-black text-[10px] font-black px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                  <Award className="w-3 h-3 text-black" />
                                  <span>الأعلى تقييماً 🏆 (الخيار الأول)</span>
                                </div>
                              )}

                              <div className="flex items-start justify-between pt-1">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={offer.driverAvatar}
                                    alt={offer.driverName}
                                    className={`w-12 h-12 rounded-xl object-cover border ${
                                      isTopRanked ? 'border-white' : 'border-zinc-800'
                                    }`}
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h5 className="font-bold text-white text-sm">{offer.driverName}</h5>
                                      {offer.driverVerified && (
                                        <span title="هوية ورخصة موثقة">
                                          <ShieldCheck className="w-4 h-4 text-white" />
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                                      <span className="flex items-center gap-1 text-white font-extrabold bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-700">
                                        <Star className="w-3.5 h-3.5 fill-white" />
                                        {offer.driverRating}
                                      </span>
                                      <span>({offer.driverCompletedCount} توصيلة)</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-left">
                                  <span className="text-xl font-black text-white">{offer.price}</span>
                                  <span className="text-[10px] text-zinc-400 font-bold block">AED</span>
                                </div>
                              </div>

                              {/* Driver Note & Delivery Time */}
                              <div className="text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                                <div className="text-white font-semibold mb-1">⏱️ {offer.estimatedDeliveryTime}</div>
                                <p className="text-zinc-400 line-clamp-2">"{offer.note}"</p>
                              </div>

                              {/* Driver Contact Info Banner (Phone & WhatsApp) */}
                              <div className="bg-black p-2.5 rounded-xl border border-zinc-800 space-y-1.5 text-xs">
                                <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between">
                                  <span>بيانات تواصل السائق المباشرة:</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg text-white text-[11px]">
                                    <span className="font-semibold text-zinc-400">💬 واتساب:</span>
                                    <span className="font-mono font-bold dir-ltr">{offer.driverWhatsappPhone || offer.driverPhone}</span>
                                  </div>
                                  <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg text-white text-[11px]">
                                    <span className="font-semibold text-zinc-400">📱 هاتف:</span>
                                    <span className="font-mono font-bold dir-ltr">{offer.driverCallPhone || offer.driverPhone}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Quick Contact & Action Buttons */}
                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href={`https://wa.me/${(offer.driverWhatsappPhone || offer.driverPhone || '').replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 px-2 rounded-xl text-xs border border-zinc-700 transition-all active:scale-95"
                                  title="محادثة واتساب فورية"
                                >
                                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                  </svg>
                                  <span>واتساب</span>
                                </a>

                                <a
                                  href={`tel:${offer.driverCallPhone || offer.driverPhone}`}
                                  className="flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 px-2 rounded-xl text-xs border border-zinc-700 transition-all active:scale-95"
                                  title="اتصال هاتفي مباشر"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>اتصال</span>
                                </a>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => onViewDriverProfile(offer)}
                                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 border border-zinc-800 active:scale-95"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  الملف الشخصي
                                </button>

                                <button
                                  onClick={() => onAcceptOffer(req.id, offer.id)}
                                  className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-2.5 px-3 rounded-xl text-xs transition-all shadow-md active:scale-95"
                                >
                                  قبول العرض
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
