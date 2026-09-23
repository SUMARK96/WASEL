import React, { useState } from 'react';
import type { DeliveryRequest, DriverProfile, DriverNotification } from '../types';
import { UAE_EMIRATES } from '../data/mockData';
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
  ArrowRight
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
    <div className="space-y-8">
      
      {/* Real-time Broadcast Driver Alert Banner */}
      {latestNotification && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-md">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-sm text-slate-950">
                <span>إشعار جديد لجميع السائقين!</span>
                <span className="bg-slate-950 text-amber-300 text-[10px] px-2 py-0.5 rounded-full">الآن</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                قام عميل بنشر طلب توصيل جديد: <strong className="text-slate-950">{latestNotification.title}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const targetReq = requests.find(r => r.id === latestNotification.requestId);
              if (targetReq) {
                onOpenSubmitOffer(targetReq);
                onMarkNotificationRead(latestNotification.id);
              }
            }}
            className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>تقديم عرض سعر فوراً</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      )}

      {/* Driver Status & Subscription Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{driver.name}</h2>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> سائق معتمد
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{driver.vehicleModel}</span>
                <span>•</span>
                <span>لوحة: {driver.vehiclePlate}</span>
              </p>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-3">
                <span>💬 الواتساب: <strong className="font-mono dir-ltr">{driver.whatsappPhone}</strong></span>
                <span>📞 المكالمات: <strong className="font-mono dir-ltr">{driver.callPhone}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Rating Widget */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 flex items-center gap-3 flex-1 md:flex-initial">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black">
                ⭐
              </div>
              <div>
                <div className="text-[10px] text-slate-400">تقييمك لدى العملاء</div>
                <div className="text-xs font-black text-amber-400">
                  {driver.rating} / 5.0 ({driver.reviewsCount} تقييم)
                </div>
              </div>
            </div>

            {/* Unified Subscription Widget */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3 flex-1 md:flex-initial">
              <Sparkles className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">الاشتراك الشهري الموحد</div>
                <div className="text-xs font-black text-emerald-400">
                  نشط حتى {driver.subscriptionExpiry}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenSubscription}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/10 shrink-0"
            >
              تجديد الاشتراك
            </button>
          </div>

        </div>

        {/* Priority Explanation Banner */}
        <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-amber-300/90 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>نظام أولوية الظهور:</strong> كلما ارتفع تقييمك من العملاء ({driver.rating} ⭐)، زادت فرص ظهور عروضك في المرتبة الأولى للعميل مع شارة "الأعلى تقييماً 🏆".
          </span>
        </div>
      </div>

      {/* Tabs & Emirates Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'available'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              سوق طلبات التوصيل المتاحة ({openRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                activeTab === 'notifications'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>إشعارات الطلبات</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('my_bids')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'my_bids'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              العروض التي قدمتها ({myBids.length})
            </button>

            <button
              onClick={() => setActiveTab('active_jobs')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'active_jobs'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              رحلاتي المقبولة ({activeJobs.length})
            </button>
          </div>
        </div>

        {/* Filter Toolbar for Available Jobs */}
        {activeTab === 'available' && (
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Filter className="w-4 h-4" />
              <span>تصفية حسب الإمارات:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">من إمارة:</span>
              <select
                value={filterPickup}
                onChange={(e) => setFilterPickup(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-amber-500"
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
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="all">جميع الإمارات</option>
                {UAE_EMIRATES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {(filterPickup !== 'all' || filterDelivery !== 'all') && (
              <button
                onClick={() => { setFilterPickup('all'); setFilterDelivery('all'); }}
                className="text-amber-400 hover:underline font-bold mr-auto"
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
              <Bell className="w-5 h-5 text-amber-400" />
              <span>إشعارات الطلبات المنشورة مؤخراً لجميع السائقين</span>
            </h3>
            <span className="text-xs text-slate-400">الإجمالي: {notifications.length} إشعارات</span>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-slate-900/40 rounded-3xl p-12 text-center border border-slate-800">
              <Bell className="w-16 h-16 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">لا توجد إشعارات جديدة حالياً</h3>
              <p className="text-slate-400 text-xs">عند قيام أي عميل بنشر طلب توصيل، سيصلك إشعار فوري هنا.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const targetReq = requests.find(r => r.id === notif.requestId);
                return (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      notif.isRead
                        ? 'bg-slate-900/60 border-slate-800'
                        : 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          طلب جديد 🔔
                        </span>
                        <span className="text-xs text-slate-400">{notif.timestamp}</span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">{notif.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <EmirateBadge emirate={notif.pickupEmirate} type="pickup" size="sm" />
                        <span>⬅️</span>
                        <EmirateBadge emirate={notif.deliveryEmirate} type="delivery" size="sm" />
                      </div>
                    </div>

                    {targetReq && (
                      <button
                        onClick={() => {
                          onOpenSubmitOffer(targetReq);
                          onMarkNotificationRead(notif.id);
                        }}
                        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 shrink-0"
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

      {/* Available Requests Feed */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.length === 0 ? (
            <div className="col-span-2 bg-slate-900/40 rounded-3xl p-12 text-center border border-slate-800">
              <Truck className="w-16 h-16 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">لا توجد طلبات توصيل تطابق التصفية الحالية</h3>
              <p className="text-slate-400 text-xs">جرب تغيير إمارات الانطلاق أو الوصول لاستعراض باقي الطلبات.</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const alreadyBid = req.offers.some(o => o.driverId === driver.id);

              return (
                <div
                  key={req.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        {req.packageType}
                      </span>
                      <span className="text-xs text-slate-400">{req.createdAt}</span>
                    </div>

                    <h3 className="text-base font-black text-white mb-3">{req.title}</h3>

                    {/* Route Strip */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 mb-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">الاستلام:</span>
                        <div className="flex items-center gap-1">
                          <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                          <span className="text-slate-300 font-medium">({req.pickupArea})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">التسليم:</span>
                        <div className="flex items-center gap-1">
                          <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                          <span className="text-slate-300 font-medium">({req.deliveryArea})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-950/40 p-3 rounded-xl">
                      <div>
                        <span className="text-slate-400 block">نوع الطرد</span>
                        <span className="text-amber-400 font-bold">{req.packageType}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-slate-400 block">الموعد المطلوب</span>
                        <span className="text-white font-bold">{req.deliveryDate}</span>
                      </div>
                    </div>
                  </div>

                  {alreadyBid ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      لقد قدمت عرضك لهذا الطلب بنجاح
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenSubmitOffer(req)}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-xs flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      تقديم عرض سعر على هذا الطلب
                    </button>
                  )}
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
            <div className="bg-slate-900/40 rounded-3xl p-12 text-center border border-slate-800">
              <CheckCircle2 className="w-16 h-16 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">لا توجد رحلات مقبولة حالياً</h3>
              <p className="text-slate-400 text-xs">تصفح الطلبات المتاحة وقدم عروضك ليقوم العملاء باختيارك.</p>
            </div>
          ) : (
            activeJobs.map((req) => (
              <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20 mb-2 inline-block">
                    تم قبولك لهذا الطلب 🟢
                  </span>
                  <h3 className="text-lg font-black text-white mb-1">{req.title}</h3>
                  <p className="text-xs text-slate-400">العميل: {req.customerName} • هاتف: {req.customerPhone}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${req.customerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <span>محادثة العميل واتساب</span>
                  </a>

                  <a
                    href={`tel:${req.customerPhone}`}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-600/20"
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

    </div>
  );
};
