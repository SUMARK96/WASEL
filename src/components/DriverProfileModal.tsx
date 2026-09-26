import React, { useState } from 'react';
import type { DriverProfile, DriverOffer } from '../types';
import { X, Star, ShieldCheck, CheckCircle2, Phone, Truck, Award, Image as ImageIcon, ZoomIn } from 'lucide-react';

interface DriverProfileModalProps {
  driver: DriverProfile | DriverOffer;
  drivers?: DriverProfile[];
  onClose: () => void;
  onSelectDriver?: () => void;
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({
  driver,
  drivers = [],
  onClose,
  onSelectDriver
}) => {
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // Look up full driver profile from drivers list if available
  const fullDriver = 'driverId' in driver 
    ? drivers.find(d => d.id === driver.driverId || (d.phone && driver.driverPhone && d.phone.replace(/[^0-9]/g, '') === driver.driverPhone.replace(/[^0-9]/g, '')))
    : ('id' in driver ? drivers.find(d => d.id === driver.id) : null);

  // Normalize fields between DriverProfile and DriverOffer
  const name = fullDriver?.name || ('name' in driver ? driver.name : driver.driverName);
  const avatar = fullDriver?.avatar || ('avatar' in driver ? driver.avatar : driver.driverAvatar);
  const rating = fullDriver?.rating || ('rating' in driver ? driver.rating : driver.driverRating);
  const vehicle = fullDriver ? `${fullDriver.vehicleModel} (${fullDriver.vehiclePlate})` : ('vehicleModel' in driver ? driver.vehicleModel : driver.driverVehicle);
  const completed = fullDriver?.completedDeliveries ?? ('completedDeliveries' in driver ? driver.completedDeliveries : driver.driverCompletedCount);
  const isVerified = fullDriver?.isVerified ?? ('isVerified' in driver ? driver.isVerified : driver.driverVerified);
  const phone = fullDriver?.phone || ('phone' in driver ? driver.phone : driver.driverPhone);
  const whatsappPhone = fullDriver?.whatsappPhone || ('whatsappPhone' in driver ? driver.whatsappPhone : ('driverWhatsappPhone' in driver ? (driver as any).driverWhatsappPhone : phone));
  const callPhone = fullDriver?.callPhone || ('callPhone' in driver ? driver.callPhone : ('driverCallPhone' in driver ? (driver as any).driverCallPhone : phone));
  const bio = fullDriver?.bio || ('bio' in driver ? driver.bio : 'سائق مستقل موثوق على منصة واصل للتوصيل بين إمارات الدولة.');

  const cleanWhatsapp = (whatsappPhone || phone || '').replace(/[^0-9]/g, '');
  const cleanCall = callPhone || phone || '';

  const rawPhotos: string[] = 
    (fullDriver?.vehiclePhotos && fullDriver.vehiclePhotos.length > 0 ? fullDriver.vehiclePhotos : null) ||
    (fullDriver?.vehiclePhoto ? [fullDriver.vehiclePhoto] : null) ||
    ('vehiclePhotos' in driver && Array.isArray(driver.vehiclePhotos) && driver.vehiclePhotos.length > 0 ? driver.vehiclePhotos : null) ||
    ('driverVehiclePhotos' in driver && Array.isArray((driver as any).driverVehiclePhotos) && (driver as any).driverVehiclePhotos.length > 0 ? (driver as any).driverVehiclePhotos : null) ||
    ('vehiclePhoto' in driver && driver.vehiclePhoto ? [driver.vehiclePhoto] : []);

  const vehiclePhotos = Array.from(new Set(rawPhotos.filter(Boolean)));

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
        <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
          
          {/* Mobile Drag Indicator */}
          <div className="sm:hidden pt-2.5 pb-1 bg-[#F5F9FC] flex justify-center">
            <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full" />
          </div>

          {/* Modal Top Banner */}
          <div className="relative bg-gradient-to-r from-[#159B7A] to-[#142F52] h-28 sm:h-32 px-5 sm:px-6 pt-5 sm:pt-6 flex items-start justify-between shrink-0">
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors active:scale-95"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#159B7A] flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#159B7A]" />
              <span>سائق معتمد - اشتراك نشط</span>
            </div>
          </div>

          {/* Profile Card Main Body */}
          <div className="px-5 sm:px-6 pb-6 relative -mt-12 sm:-mt-14 overflow-y-auto overscroll-contain space-y-4">
            <div className="flex items-end justify-between">
              <div className="relative">
                <img
                  src={avatar}
                  alt={name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-[#159B7A] text-white rounded-full p-1 border-2 border-white shadow-md" title="هوية ورخصة موثقة">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="text-left bg-[#F5F9FC] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-[#E5EDF3]">
                <div className="flex items-center gap-1 text-amber-500 font-extrabold text-base sm:text-lg">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500" />
                  <span>{rating}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-[#64748B] font-medium">من 5 نجوم</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#142F52] mb-1">{name}</h3>
              <p className="text-xs sm:text-sm text-[#64748B] font-semibold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#159B7A]" />
                <span>{vehicle}</span>
              </p>
            </div>

            {/* Vehicle Photos Gallery */}
            <div className="bg-[#F5F9FC] p-3.5 rounded-2xl border border-[#E5EDF3] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#142F52]">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#159B7A]" />
                  <span>صور سيارة السائق المعتمدة:</span>
                </div>
                <span className="text-[11px] text-[#64748B] font-normal">
                  {vehiclePhotos.length > 0 ? `${vehiclePhotos.length} صور مرفقة` : 'صورة المركبة الأساسية'}
                </span>
              </div>

              {vehiclePhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {vehiclePhotos.map((photo, pIdx) => (
                    <div 
                      key={pIdx} 
                      onClick={() => setSelectedPhotoModal(photo)}
                      className="relative rounded-2xl overflow-hidden border-2 border-[#E5EDF3] hover:border-[#159B7A] aspect-video bg-white group cursor-pointer shadow-sm transition-all active:scale-95"
                      title="اضغط للتكبير"
                    >
                      <img
                        src={photo}
                        alt={`Vehicle ${pIdx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-[#142F52]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                      {pIdx === 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-[#159B7A] text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow">
                          الرئيسية
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl text-center text-xs text-[#64748B] border border-[#E5EDF3]">
                  لا توجد صور إضافية للمركبة مرفقة
                </div>
              )}
            </div>

            {/* Contact Numbers Banner */}
            <div className="bg-[#F5F9FC] p-3.5 rounded-2xl border border-[#E5EDF3] space-y-2 mb-3.5 text-xs">
              <div className="text-[11px] font-bold text-[#64748B]">أرقام التواصل المباشرة المسجلة:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center justify-between bg-white border border-[#E5EDF3] px-3 py-2 rounded-xl text-[#142F52]">
                  <span className="font-semibold text-[#159B7A]">💬 واتساب:</span>
                  <span className="font-mono font-bold dir-ltr">{cleanWhatsapp || 'غير متوفر'}</span>
                </div>
                <div className="flex items-center justify-between bg-white border border-[#E5EDF3] px-3 py-2 rounded-xl text-[#142F52]">
                  <span className="font-semibold text-[#142F52]">📱 اتصال:</span>
                  <span className="font-mono font-bold dir-ltr">{cleanCall || 'غير متوفر'}</span>
                </div>
              </div>
            </div>

            <p className="text-[#64748B] text-xs sm:text-sm bg-[#F5F9FC] p-3.5 sm:p-4 rounded-2xl border border-[#E5EDF3] mb-4 sm:mb-6 leading-relaxed">
              "{bio}"
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
              <div className="bg-[#F5F9FC] p-3 rounded-xl border border-[#E5EDF3]">
                <div className="text-[11px] sm:text-xs text-[#64748B] mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#159B7A]" />
                  الرحلات الناجحة
                </div>
                <div className="text-base sm:text-xl font-bold text-[#142F52]">{completed} توصيلة</div>
              </div>

              <div className="bg-[#F5F9FC] p-3 rounded-xl border border-[#E5EDF3]">
                <div className="text-[11px] sm:text-xs text-[#64748B] mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#159B7A]" />
                  حالة التوثيق
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#159B7A]">هوية ورخصة مفعلة ✓</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              {onSelectDriver && (
                <button
                  onClick={onSelectDriver}
                  className="flex-1 bg-[#159B7A] hover:bg-[#108466] text-white font-black py-2.5 sm:py-3 px-4 rounded-xl shadow-md transition-all text-center text-xs sm:text-sm active:scale-95"
                >
                  قبول العرض واختيار السائق
                </button>
              )}

              <div className="flex gap-2 w-full sm:w-auto">
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-2.5 sm:py-3 px-4 rounded-xl transition-colors text-xs sm:text-sm active:scale-95 shadow-md"
                  title="محادثة واتساب مباشرة"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  واتساب
                </a>

                <a
                  href={`tel:${cleanCall}`}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-[#EEF4FA] text-[#142F52] font-bold py-2.5 sm:py-3 px-4 rounded-xl border border-[#E5EDF3] transition-colors text-xs sm:text-sm active:scale-95 shadow-sm"
                  title="اتصال هاتفي مباشر"
                >
                  <Phone className="w-4 h-4 text-[#159B7A]" />
                  اتصال
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Fullscreen Vehicle Photo Viewer */}
      {selectedPhotoModal && (
        <div 
          onClick={() => setSelectedPhotoModal(null)}
          className="fixed inset-0 z-60 bg-[#142F52]/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#142F52] flex items-center justify-center border border-[#E5EDF3] transition-all active:scale-95 shadow-2xl"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhotoModal}
              alt="Full Vehicle View"
              className="max-h-[85vh] w-auto max-w-full rounded-3xl object-contain border-2 border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
