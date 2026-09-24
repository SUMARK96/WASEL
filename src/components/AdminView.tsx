import React from 'react';
import type { DriverProfile, DeliveryRequest } from '../types';
import { UNIFIED_SUBSCRIPTION_PLAN } from '../data/mockData';
import { 
  Package, 
  DollarSign, 
  Sparkles, 
  Truck
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
  const activeDriversCount = drivers.filter(d => d.subscriptionStatus === 'active').length;
  const totalRevenue = activeDriversCount * UNIFIED_SUBSCRIPTION_PLAN.price;
  const totalOffersCount = requests.reduce((acc, r) => acc + r.offers.length, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Hero Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-500/30 mb-2 inline-block">
              لوحة تحكم منصة واصل (WASEL Admin)
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">إحصائيات المنصة واشتراكات السائقين المستقلين</h1>
            <p className="text-xs text-slate-400 mt-1">نموذج الإيرادات: اشتراك شهري موحد (199 AED) للسائقين للتوصيل بين إمارات الدولة</p>
          </div>

          <div className="text-left bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">إجمالي الدخل الشهري المتوقع</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400">{totalRevenue.toLocaleString()} AED</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">إجمالي إيراد الاشتراكات</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalRevenue} AED</div>
          <span className="text-[10px] text-emerald-400 font-bold block">↑ اشتراكات شهرية موحدة نشطة</span>
        </div>

        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">السائقين المشتركين والنشطين</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{activeDriversCount} سائقين</div>
          <span className="text-[10px] text-slate-400 font-bold block">100% تم التوثيق برخصة الإمارات</span>
        </div>

        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">طلبات التوصيل المنشورة</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{requests.length} طلبات</div>
          <span className="text-[10px] text-slate-400 font-bold block">بين أبوظبي، دبي، الشارقة وباقي الإمارات</span>
        </div>

        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">عروض الأسعار المقدمة</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalOffersCount} عروض</div>
          <span className="text-[10px] text-slate-400 font-bold block">متوسط العروض المتوفرة</span>
        </div>

      </div>

      {/* Subscription Tier Overview */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="font-black text-white text-base">الباقة الموحدة للسائقين</h3>
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:text-base">{UNIFIED_SUBSCRIPTION_PLAN.name}</span>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                199 AED/شهر
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">باقة واحدة موحدة للجميع مع نظام الأولوية بالتقييم</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">السائقين المشتركين:</span>
            <span className="text-lg font-black text-emerald-400">{activeDriversCount} كباتن نشطين</span>
          </div>
        </div>
      </div>

      {/* Drivers Registry Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white text-base sm:text-lg">سجل السائقين المستقلين وتراخيصهم</h3>
          <span className="text-xs text-slate-400">إجمالي الحسابات: {drivers.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">السائق</th>
                <th className="p-3">الإمارة</th>
                <th className="p-3">السيارة واللوحة</th>
                <th className="p-3">الاشتراك</th>
                <th className="p-3">الرحلات</th>
                <th className="p-3 text-center">حالة التوثيق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {drivers.map((drv) => (
                <tr key={drv.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="p-3 flex items-center gap-3">
                    <img src={drv.avatar} alt={drv.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <div className="font-bold text-white text-sm">{drv.name}</div>
                      <div className="text-[10px] text-slate-400">{drv.phone}</div>
                    </div>
                  </td>

                  <td className="p-3 font-semibold text-slate-300">{drv.emirate}</td>

                  <td className="p-3">
                    <div className="font-bold text-slate-200">{drv.vehicleModel}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">{drv.vehiclePlate}</div>
                  </td>

                  <td className="p-3">
                    {drv.subscriptionStatus === 'active' ? (
                      <span className="bg-emerald-500/10 text-emerald-400 font-extrabold px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <span>مفعل (تم الدفع في زينة) ✓</span>
                      </span>
                    ) : (
                      <span className="bg-rose-500/10 text-rose-400 font-extrabold px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center gap-1 w-fit">
                        <span>غير مفعل / بانتظار الدفع ⏳</span>
                      </span>
                    )}
                  </td>

                  <td className="p-3 font-bold text-slate-200">{drv.completedDeliveries} توصيلة</td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => onToggleVerifyDriver(drv.id)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all active:scale-95 ${
                        drv.isVerified
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
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

    </div>
  );
};
