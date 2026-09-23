import React from 'react';
import type { DriverProfile, DriverOffer } from '../types';
import { X, Star, ShieldCheck, CheckCircle2, Phone, Truck, Award } from 'lucide-react';

interface DriverProfileModalProps {
  driver: DriverProfile | DriverOffer;
  onClose: () => void;
  onSelectDriver?: () => void;
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({
  driver,
  onClose,
  onSelectDriver
}) => {
  // Normalize fields between DriverProfile and DriverOffer
  const name = 'name' in driver ? driver.name : driver.driverName;
  const avatar = 'avatar' in driver ? driver.avatar : driver.driverAvatar;
  const rating = 'rating' in driver ? driver.rating : driver.driverRating;
  const vehicle = 'vehicleModel' in driver ? driver.vehicleModel : driver.driverVehicle;
  const completed = 'completedDeliveries' in driver ? driver.completedDeliveries : driver.driverCompletedCount;
  const isVerified = 'isVerified' in driver ? driver.isVerified : driver.driverVerified;
  const phone = 'phone' in driver ? driver.phone : driver.driverPhone;
  const whatsappPhone = 'whatsappPhone' in driver ? driver.whatsappPhone : ('driverWhatsappPhone' in driver ? (driver as any).driverWhatsappPhone : phone);
  const callPhone = 'callPhone' in driver ? driver.callPhone : ('driverCallPhone' in driver ? (driver as any).driverCallPhone : phone);
  const bio = 'bio' in driver ? driver.bio : 'سائق مستقل موثوق على منصة واصل للتوصيل بين إمارات الدولة.';

  const cleanWhatsapp = (whatsappPhone || phone || '').replace(/[^0-9]/g, '');
  const cleanCall = callPhone || phone || '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-slate-950 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Modal Top Banner */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 h-28 sm:h-32 px-5 sm:px-6 pt-5 sm:pt-6 flex items-start justify-between shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/50 hover:bg-slate-950/70 text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="bg-slate-950/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cyan-200 border border-cyan-400/30 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>سائق معتمد - اشتراك نشط</span>
          </div>
        </div>

        {/* Profile Card Main Body */}
        <div className="px-5 sm:px-6 pb-6 relative -mt-12 sm:-mt-14 overflow-y-auto overscroll-contain">
          <div className="flex items-end justify-between mb-3.5 sm:mb-4">
            <div className="relative">
              <img
                src={avatar}
                alt={name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-xl"
              />
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 border-2 border-slate-900 shadow-md" title="هوية ورخصة موثقة">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}
            </div>

            <div className="text-left bg-slate-800/80 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-1 text-amber-300 font-extrabold text-base sm:text-lg">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">من 5 نجوم</span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white mb-1">{name}</h3>
          <p className="text-xs sm:text-sm text-cyan-300 font-semibold mb-3 flex items-center gap-1">
            <Truck className="w-4 h-4 text-cyan-400" />
            {vehicle}
          </p>

          {/* Contact Numbers Banner */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 mb-3.5 text-xs">
            <div className="text-[11px] font-bold text-slate-400">أرقام التواصل المباشرة المسجلة:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-emerald-400">
                <span className="font-semibold">💬 واتساب:</span>
                <span className="font-mono font-bold dir-ltr">{cleanWhatsapp || 'غير متوفر'}</span>
              </div>
              <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl text-blue-400">
                <span className="font-semibold">📱 اتصال:</span>
                <span className="font-mono font-bold dir-ltr">{cleanCall || 'غير متوفر'}</span>
              </div>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 mb-4 sm:mb-6 leading-relaxed">
            "{bio}"
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] sm:text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                الرحلات الناجحة
              </div>
              <div className="text-base sm:text-xl font-bold text-white">{completed} توصيلة</div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] sm:text-xs text-slate-400 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                حالة التوثيق
              </div>
              <div className="text-xs sm:text-sm font-bold text-emerald-400">هوية ورخصة مفعلة ✓</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            {onSelectDriver && (
              <button
                onClick={onSelectDriver}
                className="flex-1 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-2.5 sm:py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-center text-xs sm:text-sm active:scale-95"
              >
                قبول العرض واختيار السائق
              </button>
            )}

            <div className="flex gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 sm:py-3 px-4 rounded-xl transition-colors text-xs sm:text-sm active:scale-95 shadow-md shadow-emerald-500/20"
                title="محادثة واتساب مباشرة"
              >
                <svg className="w-4 h-4 fill-slate-950 shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                واتساب
              </a>

              <a
                href={`tel:${cleanCall}`}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 sm:py-3 px-4 rounded-xl transition-colors text-xs sm:text-sm active:scale-95 shadow-md shadow-blue-600/20"
                title="اتصال هاتفي مباشر"
              >
                <Phone className="w-4 h-4" />
                اتصال
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
