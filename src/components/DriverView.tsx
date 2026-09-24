import React, { useState } from 'react';
import type { DeliveryRequest, DriverProfile, DriverNotification } from '../types';
import { UAE_EMIRATES } from '../data/mockData';
import { getDaysUntilExpiry, formatArabicDate, getWhatsAppReminderUrl, createSubscriptionInvoice } from '../utils/subscriptionUtils';
import { InvoiceModal } from './InvoiceModal';
import { EmirateBadge } from './EmirateBadge';
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
      
      {/* 1. Inactive / Expired Account Warning Banner */}
      {isExpired && (
        <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-2 border-rose-500/60 text-white p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0 border border-rose-500/40">
              <ShieldCheck className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-sm sm:text-base text-rose-300">
                <span>⚠️ تنبيه: حساب السائق غير مفعل أو انتهت فترة الاشتراك</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                وفقاً لسياسة المنصة، لا يمكنك تقديم عروض أسعار للعملاء حتى يتم سداد رسوم الاشتراك وتأكيدها بنجاح عبر رابط زينة.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSubscription}
            className="w-full md:w-auto bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black px-5 py-3 rounded-2xl text-xs transition-all shadow-lg shadow-rose-600/30 shrink-0 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>سداد وتفعيل الاشتراك عبر زينة (199 AED)</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      )}

      {/* 2. Urgent 5-Day Expiry Reminder Banner */}
      {!isExpired && isExpiring && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/60 text-white p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-500/40 animate-pulse">
              <Bell className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm sm:text-base text-amber-300">
                  ⏰ تنبيه قرب انتهاء الاشتراك (يتبقى {daysRemaining === 0 ? 'أقل من 24 ساعة' : daysRemaining === 1 ? 'يوم واحد' : `${daysRemaining} أيام`})
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  تذكير تلقائي عبر الهاتف
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ينتهي اشتراكك بتاريخ <strong className="text-white">{formatArabicDate(driver.subscriptionExpiry)}</strong>. تم إرسال إشعار لرقم هاتفك المدرج ({driver.phone}). يرجى تجديد الاشتراك لضمان استمرار ظهور عروضك دون انقطاع.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
            <a
              href={getWhatsAppReminderUrl(driver.phone, driver.name, daysRemaining, driver.subscriptionExpiry)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              title="إرسال نص التذكير الرسمي للواتساب"
            >
              <Share2 className="w-4 h-4" />
              <span>رسالة التذكير (واتساب)</span>
            </a>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>فاتورة الاشتراك</span>
            </button>

            <button
              onClick={onOpenSubscription}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>تجديد الآن عبر زينة</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Broadcast Driver Alert Banner */}
      {latestNotification && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white p-3.5 sm:p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/40 text-cyan-300 flex items-center justify-center font-bold shrink-0 shadow-md">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-sm text-white">
                <span>إشعار جديد لجميع السائقين!</span>
                <span className="bg-slate-950/50 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full font-bold">الآن</span>
              </div>
              <p className="text-xs font-semibold text-slate-100 mt-0.5">
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
            className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-cyan-400 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>تقديم عرض سعر فوراً</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      )}

      {/* Driver Status & Subscription Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative z-10">
          
          <div className="flex items-center gap-3.5 sm:gap-4">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-cyan-500 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{driver.name}</h2>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> سائق معتمد
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{driver.vehicleModel}</span>
                <span>•</span>
                <span>لوحة: {driver.vehiclePlate}</span>
              </p>
              <div className="text-[11px] text-cyan-300 mt-1 flex flex-wrap items-center gap-3">
                <span>💬 واتساب: <strong className="font-mono dir-ltr">{driver.whatsappPhone}</strong></span>
                <span>📞 اتصال: <strong className="font-mono dir-ltr">{driver.callPhone}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Rating Widget */}
            <div className="bg-slate-950/80 p-3 sm:p-3.5 rounded-2xl border border-cyan-500/30 flex items-center gap-3 flex-1 md:flex-initial">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400">تقييمك لدى العملاء</div>
                <div className="text-xs font-black text-amber-400">
                  {driver.rating} / 5.0 ({driver.reviewsCount} تقييم)
                </div>
              </div>
            </div>

            {/* Unified Subscription Widget */}
            <div className="bg-slate-950/80 p-3 sm:p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3 flex-1 md:flex-initial">
              <Sparkles className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${driver.subscriptionStatus === 'active' ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`} />
              <div>
                <div className="text-[10px] text-slate-400">الاشتراك الموحد (199 AED)</div>
                <div className={`text-xs font-black ${driver.subscriptionStatus === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {driver.subscriptionStatus === 'active' ? `نشط حتى ${driver.subscriptionExpiry}` : 'غير مفعل / بانتظار الدفع'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold px-3.5 py-3 sm:py-3.5 rounded-2xl text-xs border border-slate-700 transition-colors flex items-center gap-1.5 active:scale-95"
                title="عرض وتحميل فاتورة الاشتراك الرسمية"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">فاتورة اشتراكي</span>
              </button>

              <button
                onClick={onOpenSubscription}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold px-4 py-3 sm:py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-blue-500/20 shrink-0 active:scale-95"
              >
                تجديد الاشتراك
              </button>
            </div>
          </div>

        </div>

        {/* Priority Explanation Banner */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-cyan-300 font-medium">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>نظام أولوية الظهور:</strong> كلما ارتفع تقييمك من العملاء ({driver.rating} ⭐)، زادت فرص ظهور عروضك في المرتبة الأولى مع شارة "الأعلى تقييماً 🏆".
          </span>
        </div>
      </div>

      {/* Tabs & Emirates Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                activeTab === 'available'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              سوق طلبات التوصيل ({openRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 active:scale-95 ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>الإشعارات</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('my_bids')}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                activeTab === 'my_bids'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              عروضي ({myBids.length})
            </button>

            <button
              onClick={() => setActiveTab('active_jobs')}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                activeTab === 'active_jobs'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              رحلاتي المقبولة ({activeJobs.length})
            </button>
          </div>
        </div>

        {/* Filter Toolbar for Available Jobs */}
        {activeTab === 'available' && (
          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-cyan-400">
              <Filter className="w-4 h-4" />
              <span>تصفية حسب الإمارات:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">من إمارة:</span>
              <select
                value={filterPickup}
                onChange={(e) => setFilterPickup(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-cyan-500"
              >
                <option value="all">جميع الإمارات</option>
                {UAE_EMIRATES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">إلى إمارة:</span>
              <select
                value={filterDelivery}
                onChange={(e) => setFilterDelivery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-cyan-500"
              >
                <option value="all">جميع الإمارات</option>
                {UAE_EMIRATES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {(filterPickup !== 'all' || filterDelivery !== 'all') && (
              <button
                onClick={() => { setFilterPickup('all'); setFilterDelivery('all'); }}
                className="text-cyan-400 hover:underline font-bold mr-auto"
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
              <Bell className="w-5 h-5 text-cyan-400" />
              <span>إشعارات الطلبات المنشورة مؤخراً</span>
            </h3>
            <span className="text-xs text-slate-400">الإجمالي: {notifications.length} إشعار</span>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-slate-900/40 rounded-3xl p-8 sm:p-12 text-center border border-slate-800">
              <Bell className="w-14 h-14 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">لا توجد إشعارات جديدة حالياً</h3>
              <p className="text-slate-400 text-xs">عند قيام أي عميل بنشر طلب توصيل، سيصلك إشعار فوري هنا.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* High Priority Expiration Alert Card if within 5 days */}
              {isExpiring && (
                <div className="p-4 sm:p-5 rounded-2xl border bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                        تنبيه انتهاء الاشتراك (متبقي ${daysRemaining} أيام) ⚠️
                      </span>
                      <span className="text-xs text-slate-400">تذكير تلقائي</span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm">
                      ينتهي اشتراكك في باقة واصل الموحدة بتاريخ ${driver.subscriptionExpiry}
                    </h4>
                    <p className="text-xs text-slate-300">
                      يرجى تجديد الاشتراك قبل الموعد لضمان عدم توقف عروضك واستمرار تلقي الإشعارات الفورية.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={onOpenSubscription}
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 shrink-0 active:scale-95"
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
                        ? 'bg-slate-900/60 border-slate-800'
                        : 'bg-blue-950/40 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                          طلب جديد 🔔
                        </span>
                        <span className="text-xs text-slate-400">{notif.timestamp}</span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">{notif.title}</h4>
                      {notif.pickupEmirate && notif.deliveryEmirate && (
                        <div className="flex items-center gap-2 text-xs text-slate-300">
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
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 shrink-0 active:scale-95"
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
            <div className="bg-slate-900/40 rounded-3xl p-8 sm:p-12 text-center border border-slate-800">
              <Truck className="w-14 h-14 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">لا توجد طلبات توصيل تطابق التصفية الحالية</h3>
              <p className="text-slate-400 text-xs">جرب تغيير إمارات الانطلاق أو الوصول لاستعراض باقي الطلبات.</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isExpanded = !!expandedRequestIds[req.id];
              const alreadyBid = req.offers.some(o => o.driverId === driver.id);
              
              // Exactly formatted title sentence as requested by user
              const displaySentence = `توصيل ${req.packageType} من ${req.pickupEmirate} إلى ${req.deliveryEmirate}`;

              return (
                <div
                  key={req.id}
                  className={`bg-slate-900/90 rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg ${
                    isExpanded 
                      ? 'border-cyan-500/80 ring-2 ring-cyan-500/20 shadow-cyan-500/10' 
                      : 'border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900'
                  }`}
                >
                  {/* The Clickable Sentence Header */}
                  <div
                    onClick={() => toggleRequestExpand(req.id)}
                    className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none active:scale-[0.99] transition-transform"
                    title="انقر لفتح البطاقة وعرض كامل التفاصيل وتقديم العرض"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-blue-500/20 mt-0.5 sm:mt-0">
                        <Package className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-cyan-300 font-extrabold bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                            {req.packageType}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {req.createdAt}
                          </span>
                          {alreadyBid && (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              تم تقديم عرضك ✓
                            </span>
                          )}
                        </div>

                        {/* The Key Sentence */}
                        <h3 className="text-sm sm:text-base font-black text-white hover:text-cyan-300 transition-colors leading-snug">
                          {displaySentence}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                      <span className="text-[11px] font-bold text-cyan-400 sm:hidden">
                        {isExpanded ? 'إخفاء التفاصيل' : 'اضغط لعرض التفاصيل وتقديم عرضك'}
                      </span>
                      <div className="flex items-center gap-2 mr-auto sm:mr-0">
                        <span className="hidden sm:inline-block text-xs font-bold text-cyan-400 bg-blue-950/60 px-3 py-1.5 rounded-xl border border-cyan-500/30">
                          {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل وتقديم العرض'}
                        </span>
                        <div className={`w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-cyan-500 text-slate-950 font-bold' : ''}`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-slate-950/80 border-t border-slate-800/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      
                      {/* Detailed Route Strip */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-xs">
                        <div className="space-y-1">
                          <span className="text-slate-400 block font-semibold">📍 مكان الاستلام بالتفصيل (من):</span>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                            <span className="text-slate-200">({req.pickupArea})</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-400 block font-semibold">🏁 مكان التسليم بالتفصيل (إلى):</span>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                            <span className="text-slate-200">({req.deliveryArea})</span>
                          </div>
                        </div>
                      </div>

                      {/* Package Specifications & Delivery Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-1">نوع ومحتوى الطرد:</span>
                          <span className="font-extrabold text-cyan-300 text-sm">{req.packageType}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-1">الوزن التقديري:</span>
                          <span className="font-bold text-white">{req.packageWeight}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-1">الموعد المطلوب للتوصيل:</span>
                          <span className="font-bold text-white">📅 {req.deliveryDate}</span>
                        </div>
                      </div>

                      {/* Customer Notes */}
                      {req.notes && (
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                          <span className="text-cyan-300 font-bold flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            ملاحظات وتعليمات العميل:
                          </span>
                          <p className="text-slate-300 leading-relaxed">{req.notes}</p>
                        </div>
                      )}

                      {/* Action Submission Footer in Expanded Card */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>الطلب متاح الآن لاستقبال عروض السائقين المعتمدين</span>
                        </div>

                        {alreadyBid ? (
                          <div className="w-full sm:w-auto bg-emerald-500/15 border border-emerald-500/30 px-5 py-3 rounded-xl text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>لقد قمت بتقديم عرض سعر على هذا الطلب بنجاح</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOfferClick(req)}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
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
            <div className="bg-slate-900/40 rounded-3xl p-8 sm:p-12 text-center border border-slate-800">
              <Package className="w-14 h-14 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">لم تقدم أي عروض بعد</h3>
              <p className="text-slate-400 text-xs">تصفح سوق الطلبات المتاحة وقدم عروض أسعارك للعملاء.</p>
            </div>
          ) : (
            myBids.map((req) => {
              const myOffer = req.offers.find(o => o.driverId === driver.id);
              const isAccepted = req.selectedOfferId === myOffer?.id;

              return (
                <div key={req.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-cyan-300 font-extrabold bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                        {req.packageType}
                      </span>
                      <h4 className="font-extrabold text-white text-sm sm:text-base mt-1">{req.title}</h4>
                    </div>
                    <div>
                      {isAccepted ? (
                        <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full">
                          تم قبول عرضك 🎉
                        </span>
                      ) : (
                        <span className="bg-cyan-500/10 text-cyan-300 font-bold text-xs px-3 py-1 rounded-full border border-cyan-500/20">
                          قيد مراجعة العميل
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 bg-slate-950/60 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-400">سعر عرضك:</span> <strong className="text-cyan-400 font-black">{myOffer?.price} AED</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">وقت التوصيل:</span> <strong className="text-white">{myOffer?.estimatedDeliveryTime}</strong>
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
            <div className="bg-slate-900/40 rounded-3xl p-8 sm:p-12 text-center border border-slate-800">
              <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">لا توجد رحلات مقبولة حالياً</h3>
              <p className="text-slate-400 text-xs">تصفح الطلبات المتاحة وقدم عروضك ليقوم العملاء باختيارك.</p>
            </div>
          ) : (
            activeJobs.map((req) => (
              <div key={req.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20 mb-2 inline-block">
                    تم قبولك لهذا الطلب 🟢
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white mb-1">{req.title}</h3>
                  <p className="text-xs text-slate-400">العميل: {req.customerName} • هاتف: {req.customerPhone}</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <a
                    href={`https://wa.me/${req.customerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    <span>محادثة العميل واتساب</span>
                  </a>

                  <a
                    href={`tel:${req.customerPhone}`}
                    className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95"
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
