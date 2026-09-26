import React, { useState } from 'react';
import type { DriverOffer, DeliveryRequest } from '../types';
import { X, Star, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

interface RateDriverModalProps {
  request: DeliveryRequest;
  driverOffer: DriverOffer;
  onClose: () => void;
  onSubmitRating: (requestId: string, driverId: string, rating: number, reviewNote: string) => void;
}

const HIGHLIGHT_TAGS = [
  'الالتزام الدقيق بالموعد ⏱️',
  'سلامة الطرد وتغليفه 📦',
  'التعامل الراقي والأمانة 🤝',
  'التواصل السريع والواضح ⚡',
  'سعر عادل ومناسب 💰'
];

export const RateDriverModal: React.FC<RateDriverModalProps> = ({
  request,
  driverOffer,
  onClose,
  onSubmitRating
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(['الالتزام الدقيق بالموعد ⏱️', 'سلامة الطرد وتغليفه 📦']);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fullNote = [
      selectedTags.join(' • '),
      reviewNote.trim()
    ].filter(Boolean).join(' - ');

    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
      setTimeout(() => {
        onSubmitRating(request.id, driverOffer.driverId, selectedRating, fullNote);
      }, 1200);
    }, 800);
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5: return 'خدمة ممتازة وتوصيل مثالي! 🌟🌟🌟🌟🌟';
      case 4: return 'خدمة جيدة جداً ومرضية 👍';
      case 3: return 'خدمة مقبولة ومناسبة 👌';
      case 2: return 'أقل من المتوقع ⚠️';
      case 1: return 'غير راضٍ عن الخدمة ❌';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 bg-[#F5F9FC] flex justify-center">
          <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-[#F5F9FC] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E5EDF3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#159B7A] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <Star className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-black text-[#142F52]">تقييم تجربة التوصيل مع السائق</h3>
              <p className="text-[11px] sm:text-xs text-[#64748B]">تقييمك يرفع من فرصة ظهور السائق المتميز في مقدمة العروض</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 overscroll-contain">
          {isDone ? (
            <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-[#EAF6F1] text-[#159B7A] rounded-full flex items-center justify-center shadow-md animate-bounce border border-[#159B7A]/30">
                <CheckCircle2 className="w-8 h-8 text-[#159B7A]" />
              </div>
              <h4 className="text-xl font-black text-[#142F52]">شكراً لك على تقييمك! 🎉</h4>
              <p className="text-[#64748B] text-xs leading-relaxed max-w-xs">
                تم حفظ التقييم بنجاح وتحديث ترتيب السائق في منصة واصل.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Driver Summary Card */}
              <div className="bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3] flex items-center gap-3.5">
                <img
                  src={driverOffer.driverAvatar}
                  alt={driverOffer.driverName}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-[#159B7A] shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-[#142F52] text-sm">{driverOffer.driverName}</h4>
                    {driverOffer.driverVerified && (
                      <ShieldCheck className="w-4 h-4 text-[#159B7A]" />
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">{driverOffer.driverVehicle}</p>
                  <p className="text-[11px] text-[#159B7A] font-bold mt-0.5">
                    الطلب: {request.title}
                  </p>
                </div>
              </div>

              {/* Interactive Stars Rating Picker */}
              <div className="text-center space-y-2 bg-[#F5F9FC] p-4 sm:p-5 rounded-2xl border border-[#E5EDF3]">
                <label className="block text-xs font-bold text-[#142F52]">
                  حدد تقييمك للسائق (من 1 إلى 5 نجوم):
                </label>
                
                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating !== null ? hoverRating : selectedRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setSelectedRating(star)}
                        className="p-1 transform hover:scale-125 transition-transform active:scale-95"
                      >
                        <Star
                          className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                              : 'text-[#CBD5E1] hover:text-[#94A3B8]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-black text-[#142F52] min-h-[20px]">
                  {getRatingLabel(hoverRating !== null ? hoverRating : selectedRating)}
                </div>
              </div>

              {/* Highlight Badges */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#142F52] flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#159B7A]" />
                  <span>ما الذي ميز تجربة التوصيل؟</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {HIGHLIGHT_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all font-semibold active:scale-95 ${
                          isSelected
                            ? 'bg-[#159B7A] text-white border-[#159B7A] shadow-xs'
                            : 'bg-white border-[#E5EDF3] text-[#64748B] hover:border-[#159B7A]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Note */}
              <div>
                <label className="block text-xs font-bold text-[#142F52] mb-1.5">
                  تعليقك أو ملاحظات إضافية (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="اكتب ملاحظاتك لمساعدة باقي العملاء وتشجيع السائق المتميز..."
                  className="w-full bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] focus:bg-white rounded-xl p-3 text-xs sm:text-sm text-[#142F52] focus:outline-none resize-none"
                />
              </div>

              {/* Impact Notice */}
              <div className="bg-[#EAF6F1] border border-[#159B7A]/20 p-3 rounded-xl flex items-center gap-2 text-[11px] text-[#159B7A]">
                <Sparkles className="w-4 h-4 text-[#159B7A] shrink-0" />
                <span>تقييمك يساهم تلقائياً في رفع ترتيب السائق ليظهر في مقدمة العروض للعملاء الآخرين.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <span>جاري تسجيل التقييم وتحديث ترتيب السائق...</span>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-white text-white" />
                    <span>إرسال التقييم النهائي ({selectedRating} نجوم ⭐)</span>
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
