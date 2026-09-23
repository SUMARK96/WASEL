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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Top Banner */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 h-32 px-6 pt-6 flex items-start justify-between">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-950/40 hover:bg-slate-950/60 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="bg-slate-950/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-200 border border-amber-400/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>سائق معتمد - اشتراك شهري نشط</span>
          </div>
        </div>

        {/* Profile Card Main Body */}
        <div className="px-6 pb-6 relative -mt-14">
          <div className="flex items-end justify-between mb-4">
            <div className="relative">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-xl"
              />
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 border-2 border-slate-900" title="هوية ورخصة موثقة">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="text-left bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-1 text-amber-400 font-extrabold text-lg">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{rating}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">من 5 نجوم</span>
            </div>
          </div>

          <h3 className="text-2xl font-black text-white mb-1">{name}</h3>
          <p className="text-sm text-amber-400/90 font-semibold mb-4 flex items-center gap-1">
            <Truck className="w-4 h-4" />
            {vehicle}
          </p>

          <p className="text-slate-300 text-sm bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 mb-6 leading-relaxed">
            "{bio}"
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                الرحلات الناجحة
              </div>
              <div className="text-xl font-bold text-white">{completed} توصيلة</div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                حالة التوثيق
              </div>
              <div className="text-sm font-bold text-emerald-400">هوية ورخصة مفعلة</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onSelectDriver && (
              <button
                onClick={onSelectDriver}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-center text-sm"
              >
                قبول العرض واختيار السائق
              </button>
            )}

            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl border border-slate-700 transition-colors text-sm"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              اتصال
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
