import React, { useState } from 'react';
import type { DeliveryRequest, DriverProfile, DriverNotification } from '../types';
import { UAE_EMIRATES } from '../data/mockData';
import { getDaysUntilExpiry, formatArabicDate, getWhatsAppReminderUrl, createSubscriptionInvoice } from '../utils/subscriptionUtils';
import { InvoiceModal } from './InvoiceModal';
import { EmirateBadge } from './EmirateBadge';
import { NotificationBanner } from './NotificationBanner';
import { 
  Truck, 
  Sparkles, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Phone, 
  Bell, 
  ArrowRight,
  Star,
  ChevronDown,
  Package,
  Clock,
  FileText,
  Share2,
  ExternalLink
} from 'lucide-react';

interface DriverViewProps {
  driver: DriverProfile;
  requests: DeliveryRequest[];
  notifications: DriverNotification[];
  onOpenSubscription: () => void;
  onOpenSubmitOffer: (request: DeliveryRequest) => void;
  onMarkNotificationRead: (id: string) => void;
}

export const DriverView: React.FC<DriverViewProps> = ({
  driver,
  requests,
  notifications,
  onOpenSubscription,
  onOpenSubmitOffer,
  onMarkNotificationRead
}) => {
  const [filterPickup, setFilterPickup] = useState<string>('all');
  const [filterDelivery, setFilterDelivery] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'available' | 'my_bids' | 'active_jobs' | 'notifications'>('available');
  
  // State for toggling expanded details on each request card
  const [expandedRequestIds, setExpandedRequestIds] = useState<Record<string, boolean>>({});
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const toggleRequestExpand = (id: string) => {
    setExpandedRequestIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOfferClick = (req: DeliveryRequest) => {
    if (driver.subscriptionStatus !== 'active') {
      alert('⚠️ حسابك غير مفعل أو انتهت صلاحية اشتراكك. يجب سداد وتأكيد الاشتراك عبر رابط زينة أولاً لتتمكن من تقديم عروض الأسعار للعملاء.');
      onOpenSubscription();
      return;
    }
    onOpenSubmitOffer(req);
  };

  const daysRemaining = getDaysUntilExpiry(driver.subscriptionExpiry);
  const isExpiring = daysRemaining <= 5 && daysRemaining >= 0;
  const isExpired = daysRemaining < 0 || driver.subscriptionStatus !== 'active';

  // Driver current invoice object
  const currentInvoice = createSubscriptionInvoice(
    driver,
    `ZIN-${driver.id.replace(/[^0-9]/g, '').slice(-6) || '892134'}`,
    driver.joinedDate || '2026-09-01',
    driver.subscriptionExpiry
  );

  const openRequests = requests.filter(r => r.status === 'open');

  const filteredRequests = openRequests.filter(r => {
    const matchPickup = filterPickup === 'all' || r.pickupEmirate === filterPickup;
    const matchDelivery = filterDelivery === 'all' || r.deliveryEmirate === filterDelivery;
    return matchPickup && matchDelivery;
  });

  const myBids = requests.filter(r => r.offers.some(o => o.driverId === driver.id));
  const activeJobs = requests.filter(r => r.selectedOfferId && r.offers.some(o => o.id === r.selectedOfferId && o.driverId === driver.id));

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const latestNotification = notifications[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* PWA & System Notifications Enable Banner */}
      <NotificationBanner userRole="driver" />

      {/* 1. Inactive / Expired Account Warning Banner */}
      {isExpired && (
        <div className="bg-zinc-950 border-2 border-zinc-700 text-white p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold shrink-0 border border-zinc-700">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-sm sm:text-base text-white">
                <span>⚠️ تنبيه: حساب السائق غير مفعل أو انتهت فترة الاشتراك</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                وفقاً لسياسة المنصة، لا يمكنك تقديم عروض أسعار للعملاء حتى يتم سداد رسوم الاشتراك وتأكيدها بنجاح عبر رابط زينة.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSubscription}
            className="w-full md:w-auto bg-white hover:bg-zinc-200 text-black font-black px-5 py-3 rounded-2xl text-xs transition-all shadow-lg shrink-0 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>سداد وتفعيل الاشتراك عبر زينة (199 AED)</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      )}

      {/* 2. Urgent 5-Day Expiry Reminder Banner */}
      {!isExpired && isExpiring && (
        <div className="bg-zinc-950 border-2 border-zinc-600 text-white p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold shrink-0 border border-zinc-700 animate-pulse">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm sm:text-base text-white">
                  ⏰ تنبيه قرب انتهاء الاشتراك (يتبقى {daysRemaining === 0 ? 'أقل من 24 ساعة' : daysRemaining === 1 ? 'يوم واحد' : `${daysRemaining} أيام`})
                </span>
                <span className="bg-zinc-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-zinc-700">
                  تذكير تلقائي عبر الهاتف
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                ينتهي اشتراكك بتاريخ <strong className="text-white">{formatArabicDate(driver.subscriptionExpiry)}</strong>. تم إرسال إشعار لرقم هاتفك المدرج ({driver.phone}). يرجى تجديد الاشتراك لضمان استمرار ظهور عروضك دون انقطاع.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
            <a
              href={getWhatsAppReminderUrl(driver.phone, driver.name, daysRemaining, driver.subscriptionExpiry)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs border border-zinc-700 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              title="إرسال نص التذكير الرسمي للواتساب"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>رسالة التذكير (واتساب)</span>
            </a>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs border border-zinc-700 flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>فاتورة الاشتراك</span>
            </button>

            <button
              onClick={onOpenSubscription}
              className="bg-white hover:bg-zinc-200 text-black font-black px-4 py-2.5 rounded-xl text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>تجديد الآن عبر زينة</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Broadcast Driver Alert Banner */}
      {latestNotification && (
        <div className="bg-zinc-900 border border-zinc-700 text-white p-3.5 sm:p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold shrink-0 shadow-md border border-zinc-800">
              <Bell className="w-5 h-5 animate-bounce text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-sm text-white">
                <span>إشعار جديد لجميع السائقين!</span>
                <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold border border-zinc-800">الآن</span>
              </div>
              <p className="text-xs font-semibold text-zinc-300 mt-0.5">
                طلب توصيل جديد: <strong className="text-white">{latestNotification.title}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const targetReq = requests.find(r => r.id === latestNotification.requestId);
              if (targetReq) {
                handleOfferClick(targetReq);
                onMarkNotificationRead(latestNotification.id);
              }
            }}
            className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>تقديم عرض سعر فوراً</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      )}

      {/* Driver Status & Subscription Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative z-10">
          
          <div className="flex items-center gap-3.5 sm:gap-4">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{driver.name}</h2>
                <span className="bg-zinc-900 text-white text-xs px-2.5 py-0.5 rounded-full border border-zinc-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" /> سائق معتمد
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                <span>{driver.vehicleModel}</span>
                <span>•</span>
                <span>لوحة: {driver.vehiclePlate}</span>
              </p>
              <div className="text-[11px] text-zinc-300 mt-1 flex flex-wrap items-center gap-3">
                <span>💬 واتساب: <strong className="font-mono dir-ltr text-white">{driver.whatsappPhone}</strong></span>
                <span>📞 اتصال: <strong className="font-mono dir-ltr text-white">{driver.callPhone}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Rating Widget */}
            <div className="bg-black p-3 sm:p-3.5 rounded-2xl border border-zinc-800 flex items-center gap-3 flex-1 md:flex-initial">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black">
                <Star className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400">تقييمك لدى العملاء</div>
                <div className="text-xs font-black text-white">
                  {driver.rating} / 5.0 ({driver.reviewsCount} تقييم)
                </div>
              </div>
            </div>

            {/* Unified Subscription Widget */}
            <div className="bg-black p-3 sm:p-3.5 rounded-2xl border border-zinc-800 flex items-center gap-3 flex-1 md:flex-initial">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-white" />
              <div>
                <div className="text-[10px] text-zinc-400">الاشتراك الموحد (199 AED)</div>
                <div className="text-xs font-black text-white">
                  {driver.subscriptionStatus === 'active' ? `نشط حتى ${driver.subscriptionExpiry}` : 'غير مفعل / بانتظار الدفع'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-3.5 py-3 sm:py-3.5 rounded-2xl text-xs border border-zinc-700 transition-colors flex items-center gap-1.5 active:scale-95"
                title="عرض وتحميل فاتورة الاشتراك الرسمية"
              >
                <FileText className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">فاتورة اشتراكي</span>
              </button>

              <button
                onClick={onOpenSubscription}
                className="bg-white hover:bg-zinc-200 text-black font-bold px-4 py-3 sm:py-3.5 rounded-2xl text-xs transition-all shadow-lg shrink-0 active:scale-95"
              >
                تجديد الاشتراك
              </button>
            </div>
          </div>

        </div>

        {/* Priority Explanation Banner */}
        <div className="mt-4 pt-3.5 border-t border-zinc-800 flex items-center gap-2 text-xs text-zinc-300 font-medium">
          <Sparkles className="w-4 h-4 text-white shrink-0" />
          <span>
            <strong>نظام أولوية الظهور:</strong> كلما ارتفع تقييمك من العملاء ({driver.rating} ⭐)، زادت فرص ظهور عروضك في المرتبة الأولى مع شارة "الأعلى تقييماً 🏆".
          </span>
        </div>
      </div>

      {/* Tabs & Emirates Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                activeTab === 'available'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              سوق طلبات التوصيل ({openRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 active:scale-95 ${
                activeTab === 'notifications'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>الإشعارات</span>
              {unreadCount > 0 && (
                <span className="bg-white text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('my_bids')}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                activeTab === 'my_bids'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              عروضي ({myBids.length})
            </button>

            <button
              onClick={() => setActiveTab('active_jobs')}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                activeTab === 'active_jobs'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              رحلاتي المقبولة ({activeJobs.length})
            </button>
          </div>
        </div>

        {/* Filter Toolbar for Available Jobs */}
        {activeTab === 'available' && (
          <div className="bg-zinc-950 p-3.5 sm:p-4 rounded-2xl border border-zinc-800 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <Filter className="w-4 h-4" />
              <span>تصفية حسب الإمارات:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400">من إمارة:</span>
              <select
                value={filterPickup}
                onChange={(e) => setFilterPickup(e.target.value)}
                className="bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-white"
              >
                <option value="all">جميع الإمارات</option>
                {UAE_EMIRATES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400">إلى إمارة:</span>
              <select
                value={filterDelivery}
                onChange={(e) => setFilterDelivery(e.target.value)}
                className="bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-white"
              >
                <option value="all">جميع الإمارات</option>
                {UAE_EMIRATES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {(filterPickup !== 'all' || filterDelivery !== 'all') && (
              <button
                onClick={() => { setFilterPickup('all'); setFilterDelivery('all'); }}
                className="text-white hover:underline font-bold mr-auto"
              >
                إلغاء الفلاتر
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-white" />
              <span>إشعارات الطلبات المنشورة مؤخراً</span>
            </h3>
            <span className="text-xs text-zinc-400">الإجمالي: {notifications.length} إشعار</span>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-zinc-950 rounded-3xl p-8 sm:p-12 text-center border border-zinc-800">
              <Bell className="w-14 h-14 sm:w-16 sm:h-16 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">لا توجد إشعارات جديدة حالياً</h3>
              <p className="text-zinc-400 text-xs">عند قيام أي عميل بنشر طلب توصيل، سيصلك إشعار فوري هنا.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* High Priority Expiration Alert Card if within 5 days */}
              {isExpiring && (
                <div className="p-4 sm:p-5 rounded-2xl border bg-zinc-950 border-zinc-600 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
                        تنبيه انتهاء الاشتراك (متبقي {daysRemaining} أيام) ⚠️
                      </span>
                      <span className="text-xs text-zinc-400">تذكير تلقائي</span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm">
                      ينتهي اشتراكك في باقة واصل الموحدة بتاريخ {driver.subscriptionExpiry}
                    </h4>
                    <p className="text-xs text-zinc-300">
                      يرجى تجديد الاشتراك قبل الموعد لضمان عدم توقف عروضك واستمرار تلقي الإشعارات الفورية.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={onOpenSubscription}
                      className="flex-1 sm:flex-initial bg-white hover:bg-zinc-200 text-black font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0 active:scale-95"
                    >
                      تجديد الاشتراك الآن
                    </button>
                  </div>
                </div>
              )}

              {notifications.map((notif) => {
                const targetReq = requests.find(r => r.id === notif.requestId);
                return (
                  <div
                    key={notif.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
                      notif.isRead
                        ? 'bg-zinc-950 border-zinc-800'
                        : 'bg-zinc-900 border-zinc-700 shadow-lg'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-700">
                          طلب جديد 🔔
                        </span>
                        <span className="text-xs text-zinc-400">{notif.timestamp}</span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">{notif.title}</h4>
                      {notif.pickupEmirate && notif.deliveryEmirate && (
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <EmirateBadge emirate={notif.pickupEmirate} type="pickup" size="sm" />
                          <span>⬅️</span>
                          <EmirateBadge emirate={notif.deliveryEmirate} type="delivery" size="sm" />
                        </div>
                      )}
                    </div>

                    {targetReq && (
                      <button
                        onClick={() => {
                          handleOfferClick(targetReq);
                          onMarkNotificationRead(notif.id);
                        }}
                        className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0 active:scale-95"
                      >
                        تقديم عرض سعر
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Available Requests Feed - Sentence Accordion Design */}
      {activeTab === 'available' && (
        <div className="space-y-3.5">
          {filteredRequests.length === 0 ? (
            <div className="bg-zinc-950 rounded-3xl p-8 sm:p-12 text-center border border-zinc-800">
              <Truck className="w-14 h-14 sm:w-16 sm:h-16 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">لا توجد طلبات توصيل تطابق التصفية الحالية</h3>
              <p className="text-zinc-400 text-xs">جرب تغيير إمارات الانطلاق أو الوصول لاستعراض باقي الطلبات.</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isExpanded = !!expandedRequestIds[req.id];
              const alreadyBid = req.offers.some(o => o.driverId === driver.id);
              
              const displaySentence = `توصيل ${req.packageType} من ${req.pickupEmirate} إلى ${req.deliveryEmirate}`;

              return (
                <div
                  key={req.id}
                  className={`bg-zinc-950 rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg ${
                    isExpanded 
                      ? 'border-white ring-2 ring-white/20' 
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {/* The Clickable Sentence Header */}
                  <div
                    onClick={() => toggleRequestExpand(req.id)}
                    className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none active:scale-[0.99] transition-transform"
                    title="انقر لفتح البطاقة وعرض كامل التفاصيل وتقديم العرض"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white text-black flex items-center justify-center font-bold shrink-0 shadow-md mt-0.5 sm:mt-0">
                        <Package className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-white font-extrabold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
                            {req.packageType}
                          </span>
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {req.createdAt}
                          </span>
                          {alreadyBid && (
                            <span className="text-[10px] text-black bg-white font-bold px-2 py-0.5 rounded-full">
                              تم تقديم عرضك ✓
                            </span>
                          )}
                        </div>

                        {/* The Key Sentence */}
                        <h3 className="text-sm sm:text-base font-black text-white hover:text-zinc-300 transition-colors leading-snug">
                          {displaySentence}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                      <span className="text-[11px] font-bold text-zinc-300 sm:hidden">
                        {isExpanded ? 'إخفاء التفاصيل' : 'اضغط لعرض التفاصيل وتقديم عرضك'}
                      </span>
                      <div className="flex items-center gap-2 mr-auto sm:mr-0">
                        <span className="hidden sm:inline-block text-xs font-bold text-white bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-700">
                          {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل وتقديم العرض'}
                        </span>
                        <div className={`w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-white text-black font-bold' : ''}`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-black border-t border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      
                      {/* Detailed Route Strip */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-950 p-3.5 sm:p-4 rounded-2xl border border-zinc-800 text-xs">
                        <div className="space-y-1">
                          <span className="text-zinc-400 block font-semibold">📍 مكان الاستلام بالتفصيل (من):</span>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                            <span className="text-zinc-200">({req.pickupArea})</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-zinc-400 block font-semibold">🏁 مكان التسليم بالتفصيل (إلى):</span>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                            <span className="text-zinc-200">({req.deliveryArea})</span>
                          </div>
                        </div>
                      </div>

                      {/* Package Specifications & Delivery Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-950 p-3.5 sm:p-4 rounded-2xl border border-zinc-800 text-xs">
                        <div>
                          <span className="text-zinc-400 block mb-1">نوع ومحتوى الطرد:</span>
                          <span className="font-extrabold text-white text-sm">{req.packageType}</span>
                        </div>

                        <div>
                          <span className="text-zinc-400 block mb-1">الوزن التقديري:</span>
                          <span className="font-bold text-white">{req.packageWeight}</span>
                        </div>

                        <div>
                          <span className="text-zinc-400 block mb-1">الموعد المطلوب للتوصيل:</span>
                          <span className="font-bold text-white">📅 {req.deliveryDate}</span>
                        </div>
                      </div>

                      {/* Customer Notes */}
                      {req.notes && (
                        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-xs space-y-1">
                          <span className="text-white font-bold flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            ملاحظات وتعليمات العميل:
                          </span>
                          <p className="text-zinc-300 leading-relaxed">{req.notes}</p>
                        </div>
                      )}

                      {/* Action Submission Footer in Expanded Card */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-zinc-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>الطلب متاح الآن لاستقبال عروض السائقين المعتمدين</span>
                        </div>

                        {alreadyBid ? (
                          <div className="w-full sm:w-auto bg-zinc-900 border border-zinc-700 px-5 py-3 rounded-xl text-center text-xs font-bold text-white flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>لقد قمت بتقديم عرض سعر على هذا الطلب بنجاح</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOfferClick(req)}
                            className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-black px-6 py-3 rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                          >
                            <Send className="w-4 h-4" />
                            <span>تقديم عرض سعر على هذا الطلب</span>
                          </button>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* My Bids Tab */}
      {activeTab === 'my_bids' && (
        <div className="space-y-3.5">
          {myBids.length === 0 ? (
            <div className="bg-zinc-950 rounded-3xl p-8 sm:p-12 text-center border border-zinc-800">
              <Package className="w-14 h-14 sm:w-16 sm:h-16 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">لم تقدم أي عروض بعد</h3>
              <p className="text-zinc-400 text-xs">تصفح سوق الطلبات المتاحة وقدم عروض أسعارك للعملاء.</p>
            </div>
          ) : (
            myBids.map((req) => {
              const myOffer = req.offers.find(o => o.driverId === driver.id);
              const isAccepted = req.selectedOfferId === myOffer?.id;

              return (
                <div key={req.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div>
                      <span className="text-[10px] text-white font-extrabold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
                        {req.packageType}
                      </span>
                      <h4 className="font-extrabold text-white text-sm sm:text-base mt-1">{req.title}</h4>
                    </div>
                    <div>
                      {isAccepted ? (
                        <span className="bg-white text-black font-black text-xs px-3 py-1 rounded-full">
                          تم قبول عرضك 🎉
                        </span>
                      ) : (
                        <span className="bg-zinc-900 text-zinc-300 font-bold text-xs px-3 py-1 rounded-full border border-zinc-700">
                          قيد مراجعة العميل
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-zinc-300 gap-2 bg-black p-3 rounded-xl border border-zinc-800">
                    <div>
                      <span className="text-zinc-400">سعر عرضك:</span> <strong className="text-white font-black">{myOffer?.price} AED</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400">وقت التوصيل:</span> <strong className="text-white">{myOffer?.estimatedDeliveryTime}</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                      <span>⬅️</span>
                      <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Active Jobs Tab */}
      {activeTab === 'active_jobs' && (
        <div className="space-y-4">
          {activeJobs.length === 0 ? (
            <div className="bg-zinc-950 rounded-3xl p-8 sm:p-12 text-center border border-zinc-800">
              <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">لا توجد رحلات مقبولة حالياً</h3>
              <p className="text-zinc-400 text-xs">تصفح الطلبات المتاحة وقدم عروضك ليقوم العملاء باختيارك.</p>
            </div>
          ) : (
            activeJobs.map((req) => (
              <div key={req.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs bg-zinc-900 text-white font-bold px-3 py-1 rounded-full border border-zinc-700 mb-2 inline-block">
                    تم قبولك لهذا الطلب 🟢
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white mb-1">{req.title}</h3>
                  <p className="text-xs text-zinc-400">العميل: {req.customerName} • هاتف: {req.customerPhone}</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <a
                    href={`https://wa.me/${req.customerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-initial bg-white hover:bg-zinc-200 text-black font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <span>محادثة العميل واتساب</span>
                  </a>

                  <a
                    href={`tel:${req.customerPhone}`}
                    className="flex-1 md:flex-initial bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-zinc-700 active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>اتصال</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Official Subscription Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          invoice={currentInvoice}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};
