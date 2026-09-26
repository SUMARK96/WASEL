import React, { useState } from 'react';
import type { Emirate, DeliveryRequest, CustomerProfile } from '../types';
import { UAE_EMIRATES, PACKAGE_TYPES } from '../data/mockData';
import { 
  X, 
  Package, 
  MapPin, 
  ChevronDown, 
  Sparkles,
  Clock,
  User,
  Phone
} from 'lucide-react';

interface NewRequestModalProps {
  customer?: CustomerProfile | null;
  onClose: () => void;
  onSubmit: (requestData: Omit<DeliveryRequest, 'id' | 'createdAt' | 'offers' | 'status'>) => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  customer,
  onClose,
  onSubmit
}) => {
  const customerName = customer?.name || 'عميل واصل';
  const customerPhone = customer?.phone || '+971 50 111 2233';
  const packageSize = 'medium' as const;
  const urgency = 'express' as const;
  const [pickupEmirate, setPickupEmirate] = useState<Emirate>(customer?.emirate || 'أبوظبي');
  const [pickupArea, setPickupArea] = useState('منطقة الخالدية');
  const [deliveryEmirate, setDeliveryEmirate] = useState<Emirate>('الشارقة');
  const [deliveryArea, setDeliveryArea] = useState('منطقة المجاز 2');
  const [packageType, setPackageType] = useState(PACKAGE_TYPES[0]);
  const [customPackageType, setCustomPackageType] = useState('');
  const [packageWeight, setPackageWeight] = useState('5 كجم');
  const [deliveryDate, setDeliveryDate] = useState('اليوم - خلال المساء');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const effectivePackageType = packageType === 'أخرى'
      ? (customPackageType.trim() || 'طرد مخصص (أخرى)')
      : packageType;

    const finalTitle = `توصيل ${effectivePackageType} من ${pickupEmirate} إلى ${deliveryEmirate}`;
    onSubmit({
      title: finalTitle,
      customerId: customer?.id,
      customerName,
      customerPhone,
      pickupEmirate,
      pickupArea,
      deliveryEmirate,
      deliveryArea,
      packageType: effectivePackageType,
      packageSize,
      packageWeight,
      deliveryDate,
      urgency,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      
      {/* Modal Card Box */}
      <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Touch Drag Handle Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-[#F5F9FC] flex justify-center">
          <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full" />
        </div>

        {/* Header Bar */}
        <div className="bg-[#F5F9FC] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E5EDF3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-black shadow-xs">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-black text-[#142F52]">نشر طلب توصيل طرد</h3>
              <p className="text-[11px] sm:text-xs text-[#64748B]">انشر طلبك وسيصلك عروض أسعار تنافسية من السائقين لاختيار الأنسب</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="new-request-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain touch-pan-y">
          
          {/* Customer Publishing Info */}
          <div className="bg-[#EEF4FA] border border-[#E5EDF3] rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#159B7A]" />
              <span className="text-[#64748B]">الطلب ينشر باسم: <strong className="text-[#142F52]">{customerName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-[#64748B] font-mono text-[11px] dir-ltr">
              <Phone className="w-3.5 h-3.5 text-[#159B7A]" />
              <span>{customerPhone}</span>
            </div>
          </div>

          {/* Step 1: Route Selection */}
          <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5EDF3] pb-2">
              <div className="flex items-center gap-2 font-bold text-[#142F52] text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-[#159B7A]" />
                <span>1. خط سير الطرد (من إمارة إلى إمارة)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              
              {/* Pickup Emirate */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#142F52]">مكان الاستلام (من):</label>
                <div className="relative">
                  <select
                    value={pickupEmirate}
                    onChange={(e) => setPickupEmirate(e.target.value as Emirate)}
                    className="w-full bg-white border border-[#E5EDF3] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#142F52] font-bold focus:outline-none focus:border-[#159B7A] appearance-none"
                  >
                    {UAE_EMIRATES.map(e => (
                      <option key={e} value={e}>إمارة {e}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-3 w-4 h-4 text-[#64748B] pointer-events-none" />
                </div>

                <input
                  type="text"
                  placeholder="المنطقة والشارع (مثال: الخالدية - قرب السفير مول)"
                  value={pickupArea}
                  onChange={(e) => setPickupArea(e.target.value)}
                  className="w-full bg-white border border-[#E5EDF3] rounded-xl px-3.5 py-2.5 text-xs text-[#142F52] placeholder-[#94A3B8] focus:outline-none focus:border-[#159B7A]"
                  required
                />
              </div>

              {/* Delivery Emirate */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#142F52]">مكان التسليم (إلى):</label>
                <div className="relative">
                  <select
                    value={deliveryEmirate}
                    onChange={(e) => setDeliveryEmirate(e.target.value as Emirate)}
                    className="w-full bg-white border border-[#E5EDF3] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#142F52] font-bold focus:outline-none focus:border-[#159B7A] appearance-none"
                  >
                    {UAE_EMIRATES.map(e => (
                      <option key={e} value={e}>إمارة {e}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-3 w-4 h-4 text-[#64748B] pointer-events-none" />
                </div>

                <input
                  type="text"
                  placeholder="المنطقة والشارع (مثال: المجاز 2 - شارع البحيرة)"
                  value={deliveryArea}
                  onChange={(e) => setDeliveryArea(e.target.value)}
                  className="w-full bg-white border border-[#E5EDF3] rounded-xl px-3.5 py-2.5 text-xs text-[#142F52] placeholder-[#94A3B8] focus:outline-none focus:border-[#159B7A]"
                  required
                />
              </div>

            </div>
          </div>

          {/* Step 2: Package Type & Weight */}
          <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 font-bold text-[#142F52] text-xs sm:text-sm border-b border-[#E5EDF3] pb-2">
              <Package className="w-4 h-4 text-[#159B7A]" />
              <span>2. مواصفات ونوع الطرد</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#142F52] mb-1.5">نوع ومحتوى الطرد</label>
                <div className="relative">
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    className="w-full bg-white border border-[#E5EDF3] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#142F52] focus:outline-none focus:border-[#159B7A] appearance-none"
                  >
                    {PACKAGE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="أخرى">أخرى (تحديد نوع آخر)...</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-3 w-4 h-4 text-[#64748B] pointer-events-none" />
                </div>

                {packageType === 'أخرى' && (
                  <div className="mt-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-[11px] font-bold text-[#142F52] mb-1">
                      يرجى كتابة نوع ومحتوى الطرد بالتفصيل *
                    </label>
                    <input
                      type="text"
                      required
                      value={customPackageType}
                      onChange={(e) => setCustomPackageType(e.target.value)}
                      placeholder="مثال: لوحات فنية، زهور ونباتات، معدات طبية..."
                      className="w-full bg-white border-2 border-[#159B7A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#142F52] placeholder-[#94A3B8] focus:outline-none font-medium"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142F52] mb-1.5">الوزن التقديري</label>
                <input
                  type="text"
                  value={packageWeight}
                  onChange={(e) => setPackageWeight(e.target.value)}
                  placeholder="مثال: 5 كجم"
                  className="w-full bg-white border border-[#E5EDF3] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#142F52] focus:outline-none focus:border-[#159B7A]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 3: Delivery Date & Notes */}
          <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 font-bold text-[#142F52] text-xs sm:text-sm border-b border-[#E5EDF3] pb-2">
              <Clock className="w-4 h-4 text-[#159B7A]" />
              <span>3. موعد التوصيل والملاحظات</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142F52] mb-1.5">موعد التوصيل المطلوب</label>
              <input
                type="text"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                placeholder="مثال: اليوم قبل 8 مساءً"
                className="w-full bg-white border border-[#E5EDF3] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#142F52] focus:outline-none focus:border-[#159B7A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142F52] mb-1.5">ملاحظات وتعليمات خاصة للسائقين</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب تعليمات خاصة (طرد قابل للكسر، أوقات الاستلام، إلخ)..."
                className="w-full bg-white border border-[#E5EDF3] rounded-xl p-3 text-xs sm:text-sm text-[#142F52] placeholder-[#94A3B8] focus:outline-none focus:border-[#159B7A] resize-none"
              />
            </div>
          </div>

        </form>

        {/* Sticky Action Footer Bar */}
        <div className="bg-[#F5F9FC] p-4 sm:px-6 border-t border-[#E5EDF3] shrink-0">
          <button
            type="submit"
            form="new-request-form"
            className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 sm:py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>نشر الطلب واستقبال عروض السائقين</span>
          </button>
        </div>

      </div>
    </div>
  );
};
