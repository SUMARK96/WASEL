import React, { useState } from 'react';
import type { DeliveryRequest, DriverOffer, DriverProfile } from '../types';
import { EmirateBadge } from './EmirateBadge';
import { 
  Package, 
  Clock, 
  Plus, 
  Star, 
  Phone, 
  Eye, 
  ShieldCheck 
} from 'lucide-react';

interface CustomerViewProps {
  requests: DeliveryRequest[];
  drivers: DriverProfile[];
  onOpenNewRequest: () => void;
  onAcceptOffer: (requestId: string, offerId: string) => void;
  onViewDriverProfile: (driver: DriverOffer) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  requests,
  drivers: _drivers,
  onOpenNewRequest,
  onAcceptOffer,
  onViewDriverProfile
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const filteredRequests = requests.filter(r => 
    activeTab === 'active' ? (r.status === 'open' || r.status === 'assigned' || r.status === 'in_transit') : r.status === 'delivered'
  );

  return (
    <div className="space-y-8">
      
      {/* Welcome & Quick Action Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
              أنشئ طلبك واحصل على أفضل عروض السائقين المستقلين
            </h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              انشر طلب توصيل طردك بين أي إمارتين في الدولة، واستقبل عروض الأسعار مباشرة من سائقين موثوقين ومؤهلين مع باقات اشتراك معتمدة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewRequest}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all text-sm md:text-base shrink-0 transform active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>نشر طلب توصيل جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'active'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            الطلبات النشطة ({requests.filter(r => r.status !== 'delivered').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'completed'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            المكتملة
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          إجمالي الطلبات المضافة: <strong className="text-white">{requests.length}</strong>
        </div>
      </div>

      {/* Request Cards Feed */}
      {filteredRequests.length === 0 ? (
        <div className="bg-slate-900/40 rounded-3xl p-12 text-center border border-slate-800/80">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-lg font-bold text-white mb-1">لا توجد طلبات في هذه القائمة</h3>
          <p className="text-slate-400 text-xs mb-6">قم بنشر طلب توصيل طرد جديد للاستفادة من شبكة السائقين بين الإمارات.</p>
          <button
            onClick={onOpenNewRequest}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            نشر طلب جديد الآن
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((req) => {
            const hasAssignedDriver = req.selectedOfferId !== undefined;
            const acceptedOffer = req.offers.find(o => o.id === req.selectedOfferId);

            const whatsappNumber = acceptedOffer?.driverWhatsappPhone || acceptedOffer?.driverPhone.replace(/[^0-9]/g, '') || '';
            const callNumber = acceptedOffer?.driverCallPhone || acceptedOffer?.driverPhone || '';

            return (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg transition-all hover:border-slate-700 space-y-6"
              >
                {/* Request Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-amber-400 font-extrabold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        {req.packageType}
                      </span>
                      <span className="text-xs text-slate-400">{req.createdAt}</span>
                    </div>
                    <h3 className="text-lg font-black text-white">{req.title}</h3>
                  </div>
                </div>

                {/* Route & Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 text-xs">
                  <div>
                    <div className="text-slate-400 mb-1">من (مكان الاستلام):</div>
                    <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                      <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                    </div>
                    <div className="text-slate-300 font-medium">{req.pickupArea}</div>
                  </div>

                  <div>
                    <div className="text-slate-400 mb-1">إلى (مكان التسليم):</div>
                    <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                      <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                    </div>
                    <div className="text-slate-300 font-medium">{req.deliveryArea}</div>
                  </div>

                  <div>
                    <div className="text-slate-400 mb-1">موعد ومواصفات التوصيل:</div>
                    <div className="text-amber-300 font-bold mb-0.5">📅 {req.deliveryDate}</div>
                    <div className="text-slate-300">الوزن التقديري: {req.packageWeight}</div>
                  </div>
                </div>

                {req.notes && (
                  <p className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                    💡 <strong className="text-slate-300">ملاحظات العميل:</strong> {req.notes}
                  </p>
                )}

                {/* Accepted Driver Direct WhatsApp & Call Buttons */}
                {hasAssignedDriver && acceptedOffer ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                      <img
                        src={acceptedOffer.driverAvatar}
                        alt={acceptedOffer.driverName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/50 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{acceptedOffer.driverName}</span>
                          <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            سائق مقبول 🟢
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{acceptedOffer.driverVehicle}</p>
                        <p className="text-xs text-emerald-400 font-semibold mt-1">
                          السعر المتفق عليه: {acceptedOffer.price} AED • {acceptedOffer.estimatedDeliveryTime}
                        </p>
                      </div>
                    </div>

                    {/* Direct WhatsApp and Phone Action Buttons */}
                    <div className="flex items-center gap-2.5 w-full lg:w-auto">
                      
                      {/* WhatsApp Button - Direct Instant Launch */}
                      <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 transform active:scale-95"
                        title="محادثة واتساب فورية مع السائق"
                      >
                        <svg className="w-4 h-4 fill-slate-950 shrink-0" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        <span>محادثة واتساب فورية</span>
                      </a>

                      {/* Phone Call Button */}
                      <a
                        href={`tel:${callNumber}`}
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-xl text-xs transition-all shadow-lg shadow-blue-600/20 transform active:scale-95"
                        title="مكالمة هاتفية حية"
                      >
                        <Phone className="w-4 h-4 shrink-0" />
                        <span>اتصال هاتفي</span>
                      </a>

                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <span>عروض السائقين المقدمة</span>
                        <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
                          {req.offers.length} عروض
                        </span>
                      </h4>
                    </div>

                    {req.offers.length === 0 ? (
                      <div className="bg-slate-950/40 rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-800/40">
                        <Clock className="w-8 h-8 text-amber-500/60 mx-auto mb-2 animate-pulse" />
                        تم نشر الطلب للجميع بانتظار تقديم عروض السائقين النشطين...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {req.offers.map((offer) => (
                          <div
                            key={offer.id}
                            className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <img
                                  src={offer.driverAvatar}
                                  alt={offer.driverName}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-bold text-white text-sm">{offer.driverName}</h5>
                                    {offer.driverVerified && (
                                      <span title="هوية موثقة">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                    <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                                      {offer.driverRating}
                                    </span>
                                    <span>({offer.driverCompletedCount} توصيلة)</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-left">
                                <span className="text-xl font-black text-amber-400">{offer.price}</span>
                                <span className="text-[10px] text-slate-400 font-bold block">AED</span>
                              </div>
                            </div>

                            <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                              <div className="text-amber-300/90 font-semibold mb-1">⏱️ {offer.estimatedDeliveryTime}</div>
                              <p className="text-slate-400 line-clamp-2">"{offer.note}"</p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => onViewDriverProfile(offer)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                الملف الشخصي
                              </button>

                              <button
                                onClick={() => onAcceptOffer(req.id, offer.id)}
                                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 px-3 rounded-xl text-xs transition-all shadow-md shadow-amber-500/10"
                              >
                                قبول العرض
                              </button>
                            </div>

                          </div>
                        ))}
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
