import React from 'react';
import type { DriverProfile, DeliveryRequest, SubscriptionInvoice } from '../types';
import { createSubscriptionInvoice, getDaysUntilExpiry, getWhatsAppReminderUrl } from '../utils/subscriptionUtils';
import { InvoiceModal } from './InvoiceModal';
import { UNIFIED_SUBSCRIPTION_PLAN } from '../data/mockData';
import { 
  Package, 
  DollarSign, 
  Sparkles, 
  Truck,
  FileText,
  Bell,
  Share2
} from 'lucide-react';

interface AdminViewProps {
  drivers: DriverProfile[];
  requests: DeliveryRequest[];
  onToggleVerifyDriver: (driverId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  drivers,
  requests,
  onToggleVerifyDriver
}) => {
  const [selectedInvoice, setSelectedInvoice] = React.useState<SubscriptionInvoice | null>(null);
  const activeDriversCount = drivers.filter(d => d.subscriptionStatus === 'active').length;
  const totalRevenue = activeDriversCount * UNIFIED_SUBSCRIPTION_PLAN.price;
  const totalOffersCount = requests.reduce((acc, r) => acc + r.offers.length, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Hero Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-white bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700 mb-2 inline-block">
              لوحة تحكم منصة واصل (WASEL Admin)
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">إحصائيات المنصة واشتراكات السائقين المستقلين</h1>
            <p className="text-xs text-zinc-400 mt-1">نموذج الإيرادات: اشتراك شهري موحد (199 AED) للسائقين للتوصيل بين إمارات الدولة</p>
          </div>

          <div className="text-left bg-black px-5 py-3 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-400 font-semibold block">إجمالي الدخل الشهري المتوقع</span>
            <span className="text-xl sm:text-2xl font-black text-white">{totalRevenue.toLocaleString()} AED</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold">إجمالي إيراد الاشتراكات</span>
            <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalRevenue} AED</div>
          <span className="text-[10px] text-zinc-400 font-bold block">↑ اشتراكات شهرية موحدة نشطة</span>
        </div>

        <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold">السائقين المشتركين والنشطين</span>
            <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{activeDriversCount} سائقين</div>
          <span className="text-[10px] text-zinc-400 font-bold block">100% تم التوثيق برخصة الإمارات</span>
        </div>

        <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold">طلبات التوصيل المنشورة</span>
            <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{requests.length} طلبات</div>
          <span className="text-[10px] text-zinc-400 font-bold block">بين كافة إمارات الدولة</span>
        </div>

        <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold">عروض الأسعار المقدمة</span>
            <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalOffersCount} عروض</div>
          <span className="text-[10px] text-zinc-400 font-bold block">متوسط العروض المتوفرة</span>
        </div>

      </div>

      {/* Subscription Tier Overview */}
      <div className="bg-zinc-950 p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-3">
        <h3 className="font-black text-white text-base">الباقة الموحدة للسائقين</h3>
        <div className="bg-black p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:text-base">{UNIFIED_SUBSCRIPTION_PLAN.name}</span>
              <span className="text-xs font-bold text-white bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
                199 AED/شهر
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">باقة واحدة موحدة للجميع مع نظام الأولوية بالتقييم</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-zinc-400 block">السائقين المشتركين:</span>
            <span className="text-lg font-black text-white">{activeDriversCount} كباتن نشطين</span>
          </div>
        </div>
      </div>

      {/* Drivers Registry Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white text-base sm:text-lg">سجل السائقين المستقلين وتراخيصهم</h3>
          <span className="text-xs text-zinc-400">إجمالي الحسابات: {drivers.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-black text-zinc-400 uppercase font-bold border-b border-zinc-800">
              <tr>
                <th className="p-3">السائق</th>
                <th className="p-3">الإمارة</th>
                <th className="p-3">السيارة واللوحة</th>
                <th className="p-3">الاشتراك وصلاحية الشهر</th>
                <th className="p-3">الفاتورة والتذكير</th>
                <th className="p-3">الرحلات</th>
                <th className="p-3 text-center">حالة التوثيق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {drivers.map((drv) => (
                <tr key={drv.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-3 flex items-center gap-3">
                    <img src={drv.avatar} alt={drv.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-700" />
                    <div>
                      <div className="font-bold text-white text-sm">{drv.name}</div>
                      <div className="text-[10px] text-zinc-400">{drv.phone}</div>
                    </div>
                  </td>

                  <td className="p-3 font-semibold text-zinc-300">{drv.emirate}</td>

                  <td className="p-3">
                    <div className="font-bold text-zinc-200">{drv.vehicleModel}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{drv.vehiclePlate}</div>
                  </td>

                  {(() => {
                    const daysRemaining = getDaysUntilExpiry(drv.subscriptionExpiry);
                    const isExpiring = daysRemaining <= 5 && daysRemaining >= 0;
                    const inv = createSubscriptionInvoice(drv, `ZIN-${drv.id.replace(/[^0-9]/g, '').slice(-6) || '892134'}`, drv.joinedDate, drv.subscriptionExpiry);

                    return (
                      <>
                        <td className="p-3">
                          {drv.subscriptionStatus === 'active' ? (
                            <div className="space-y-1">
                              <span className="bg-zinc-900 text-white font-extrabold px-2.5 py-0.5 rounded-lg border border-zinc-700 inline-flex items-center gap-1">
                                <span>مفعل (زينة 199 AED) ✓</span>
                              </span>
                              <div className="text-[10px] text-zinc-400">
                                ينتهي: <strong className="text-white">{drv.subscriptionExpiry}</strong>
                              </div>
                              {isExpiring && (
                                <span className="bg-zinc-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-zinc-700 flex items-center gap-1 w-fit animate-pulse">
                                  <Bell className="w-2.5 h-2.5" />
                                  <span>تذكير 5 أيام (متبقي {daysRemaining} يوم)</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="bg-zinc-900 text-zinc-400 font-extrabold px-2.5 py-1 rounded-lg border border-zinc-700 flex items-center gap-1 w-fit">
                              <span>غير مفعل / بانتظار الدفع ⏳</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(inv)}
                              className="bg-zinc-900 hover:bg-zinc-800 text-white p-1.5 rounded-lg border border-zinc-700 transition-colors"
                              title="عرض الفاتورة الرسمية"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            {isExpiring && (
                              <a
                                href={getWhatsAppReminderUrl(drv.phone, drv.name, daysRemaining, drv.subscriptionExpiry)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-zinc-900 hover:bg-zinc-800 text-white p-1.5 rounded-lg border border-zinc-700 transition-all"
                                title="إرسال تذكير التجديد بالواتساب"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </>
                    );
                  })()}

                  <td className="p-3 font-bold text-zinc-200">{drv.completedDeliveries} توصيلة</td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => onToggleVerifyDriver(drv.id)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all active:scale-95 ${
                        drv.isVerified
                          ? 'bg-white text-black border border-white'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {drv.isVerified ? '✓ موثق' : 'غير موثق'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Invoice Preview Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};
