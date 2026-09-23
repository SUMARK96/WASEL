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
  const bio = 'bio' in driver ? driver.bio : 'سائق مستقل موثوق على منصة واصل للتوصيل بين إمارات الدولة.';

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
          <p className="text-xs sm:text-sm text-cyan-300 font-semibold mb-3.5 flex items-center gap-1">
            <Truck className="w-4 h-4 text-cyan-400" />
            {vehicle}
          </p>

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
          <div className="flex gap-2.5 sm:gap-3">
            {onSelectDriver && (
              <button
                onClick={onSelectDriver}
                className="flex-1 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-2.5 sm:py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-center text-xs sm:text-sm active:scale-95"
              >
                قبول العرض واختيار السائق
              </button>
            )}

            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 sm:py-3 px-4 rounded-xl border border-slate-700 transition-colors text-xs sm:text-sm active:scale-95"
            >
              <Phone className="w-4 h-4 text-cyan-400" />
              اتصال
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
