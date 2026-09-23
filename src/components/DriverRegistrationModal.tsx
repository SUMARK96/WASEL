import React, { useState } from 'react';
import type { DriverProfile, Emirate, SubscriptionPlanId, VehicleType } from '../types';
import { SUBSCRIPTION_PLANS, UAE_EMIRATES, VEHICLE_TRANSLATIONS } from '../data/mockData';
import { 
  X, 
  Check, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Zap, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Star,
  Lock
} from 'lucide-react';

interface DriverRegistrationModalProps {
  onClose: () => void;
  onRegisterSuccess: (newDriver: DriverProfile) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
];

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({
  onClose,
  onRegisterSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Personal & Contact Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+971 50 ');
  const [whatsappPhone, setWhatsappPhone] = useState('97150');
  const [email, setEmail] = useState('');
  const [emirate, setEmirate] = useState<Emirate>('دبي');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [bio, setBio] = useState('');

  // Step 2: Vehicle & License Details
  const [vehicleType, setVehicleType] = useState<VehicleType>('pickup');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  // Step 3: Subscription Plan
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('pro');

  // Step 4: Payment State
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('841');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const selectedPlanDetails = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan) || SUBSCRIPTION_PLANS[1];

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !whatsappPhone.trim()) {
      alert('يرجى ملء جميع البيانات الأساسية المطلوبة.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleModel.trim() || !vehiclePlate.trim()) {
      alert('يرجى إدخال بيانات المركبة ورقم اللوحة.');
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = () => {
    setStep(4);
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);

      const newDriverId = `drv-${Date.now()}`;
      const cleanWhatsapp = whatsappPhone.replace(/[^0-9]/g, '');
      const fullCallPhone = phone.trim().startsWith('+') ? phone.trim() : `+971 ${phone.trim()}`;

      const createdDriver: DriverProfile = {
        id: newDriverId,
        name: name.trim(),
        phone: fullCallPhone,
        whatsappPhone: cleanWhatsapp,
        callPhone: fullCallPhone,
        email: email.trim() || `${name.replace(/\s+/g, '.').toLowerCase()}@wasel.ae`,
        avatar,
        emirate,
        vehicleType,
        vehicleModel: vehicleModel.trim(),
        vehiclePlate: vehiclePlate.trim(),
        rating: 5.0,
        reviewsCount: 1,
        completedDeliveries: 0,
        isVerified: true,
        subscriptionStatus: 'active',
        subscriptionPlan: selectedPlan,
        subscriptionExpiry: '2026-10-31',
        joinedDate: '2026-09-23',
        bio: bio.trim() || `سائق معتمد يقدم خدمات التوصيل السريع بين الإمارات بسيارة ${vehicleModel.trim()}.`
      };

      setTimeout(() => {
        onRegisterSuccess(createdDriver);
      }, 1500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[94dvh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 bg-slate-950 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="bg-slate-950 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Truck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">تسجيل سائق جديد والاشتراك الشهري</h3>
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                  عمولة 0%
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">انضم لشبكة واصل، استقبل الطلبات وتواصل مباشرة مع العملاء</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        {!isDone && (
          <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <div className={`flex items-center gap-2 font-bold ${step >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                1
              </span>
              <span className="hidden sm:inline">البيانات الشخصية</span>
            </div>

            <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-amber-500' : 'bg-slate-800'}`} />

            <div className={`flex items-center gap-2 font-bold ${step >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                2
              </span>
              <span className="hidden sm:inline">المركبة والترخيص</span>
            </div>

            <div className={`h-0.5 flex-1 ${step >= 3 ? 'bg-amber-500' : 'bg-slate-800'}`} />

            <div className={`flex items-center gap-2 font-bold ${step >= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                3
              </span>
              <span className="hidden sm:inline">باقة الاشتراك</span>
            </div>

            <div className={`h-0.5 flex-1 ${step >= 4 ? 'bg-amber-500' : 'bg-slate-800'}`} />

            <div className={`flex items-center gap-2 font-bold ${step >= 4 ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                4
              </span>
              <span className="hidden sm:inline">الدفع والتفعيل</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">
          
          {/* STEP 1: Personal Data Form */}
          {step === 1 && !isDone && (
            <form onSubmit={handleNextStep1} className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-amber-300">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  أدخل بياناتك بدقة لتظهر للعملاء بشكل موثوق عند تقديم عروض التوصيل على طلباتهم.
                </span>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اختر الصورة الشخصية للملف:</label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {AVATAR_PRESETS.map((pic, idx) => (
                    <img
                      key={idx}
                      src={pic}
                      alt="Preset"
                      onClick={() => setAvatar(pic)}
                      className={`w-14 h-14 rounded-2xl object-cover cursor-pointer border-2 transition-all shrink-0 ${
                        avatar === pic ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>الاسم الكامل الثلاثي *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: خليفة سيف الكتبي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>الإمارة الرئيسية لنشاطك *</span>
                  </label>
                  <select
                    value={emirate}
                    onChange={(e) => setEmirate(e.target.value as Emirate)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {UAE_EMIRATES.map(em => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>رقم الاتصال الهاتفي المباشر *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500 dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-emerald-400" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>رقم الواتساب (بدون مسافات) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="971501234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-emerald-400 font-mono focus:outline-none focus:border-amber-500 dir-ltr text-right"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">يُستخدم للتواصل الفوري المباشر مع العملاء عند قبول عرضك</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>البريد الإلكتروني (اختياري)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>نبذة تعريفية بالخبرة والخدمات التي تقدمها:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="مثال: خبرة 4 سنوات في توصيل البضائع والمستندات والطرود بين دبي وأبوظبي والشارقة. الالتزام بالمواعيد والأمانة شعاري."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <span>متابعة لبيانات المركبة والترخيص</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Vehicle & License Form */}
          {step === 2 && !isDone && (
            <form onSubmit={handleNextStep2} className="space-y-5 animate-in fade-in duration-200">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">نوع المركبة المعتمدة للتوصيل:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(VEHICLE_TRANSLATIONS) as VehicleType[]).map((type) => {
                    const isSel = vehicleType === type;
                    return (
                      <div
                        key={type}
                        onClick={() => setVehicleType(type)}
                        className={`cursor-pointer p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                          isSel
                            ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-black shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Truck className={`w-6 h-6 ${isSel ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="text-xs">{VEHICLE_TRANSLATIONS[type]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">موديل وسنة صنع المركبة *</label>
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="مثال: تويوتا هايلوكس 2024"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم اللوحة ومصدرها *</label>
                  <input
                    type="text"
                    required
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="مثال: دبي X 98234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Document Upload Simulation */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-300">توثيق المستندات الرسمية (للحصول على شارة سائق معتمد):</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">رخصة القيادة الإماراتية</div>
                        <div className="text-[10px] text-emerald-400">تم التحقق والرفع بنجاح</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-lg">مرفقة</span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">الهوية الإماراتية / ملكية المركبة</div>
                        <div className="text-[10px] text-emerald-400">جاهز للتفعيل المباشر</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-lg">مرفقة</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm flex items-center gap-2"
                >
                  <span>متابعة لاختيار باقة الاشتراك</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: Subscription Plans & Benefits */}
          {step === 3 && !isDone && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Platform Benefits Highlight */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-amber-500/30">
                <h4 className="text-xs font-black text-amber-400 mb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>مزايا الاشتراك في منصة واصل:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>عمولة 0% على جميع رحلاتك</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>تواصل واتساب ومكالمة مباشر</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>إشعارات فورية بكل طلب جديد</span>
                  </div>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {plan.recommended && (
                        <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                          الأكثر اختياراً ⭐
                        </span>
                      )}

                      <div>
                        <h4 className="font-extrabold text-white text-sm mb-1">{plan.name}</h4>
                        <div className="flex items-baseline gap-1 my-2">
                          <span className="text-2xl font-black text-amber-400">{plan.price}</span>
                          <span className="text-[11px] text-slate-400 font-semibold">درهم / شهرياً</span>
                        </div>

                        <ul className="space-y-1.5 text-xs text-slate-300 mb-4">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div
                        className={`w-full py-2 rounded-xl text-center font-bold text-xs transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isSelected ? 'الباقة المحددة' : 'اختيار الباقة'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep3}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm flex items-center gap-2"
                >
                  <span>متابعة للدفع والتفعيل ({selectedPlanDetails.price} AED)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: Payment Simulation */}
          {step === 4 && !isDone && (
            <form onSubmit={handleCompletePayment} className="space-y-5 animate-in fade-in duration-200">
              
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">الباقة المختارة:</span>
                  <span className="text-sm font-black text-white">{selectedPlanDetails.name}</span>
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-400 block">المبلغ الإجمالي للدفع:</span>
                  <span className="text-xl font-black text-amber-400">{selectedPlanDetails.price} AED</span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-extrabold text-white text-xs sm:text-sm">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>بيانات الدفع الإلكتروني الآمن</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <Lock className="w-3 h-3" />
                    <span>تشفير آمن 256-bit</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">الاسم على البطاقة</label>
                  <input
                    type="text"
                    required
                    value={cardHolder || name}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="KHALIFA SAIF"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">رقم البطاقة (Visa / Mastercard / Mada)</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">الانتهاء</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setStep(3)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 mr-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-6 rounded-xl shadow-xl shadow-amber-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin text-slate-950" />
                      <span>جاري معالجة الدفع وتوثيق الحساب...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>دفع وتفعيل اشتراك السائق ({selectedPlanDetails.price} AED)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* SUCCESS SCREEN */}
          {isDone && (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border-2 border-emerald-500/30 animate-bounce shadow-xl shadow-emerald-500/10">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white">مرحباً بك كـ سائق معتمد في منصة واصل! 🎉</h4>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed">
                تم دفع الاشتراك وتفعيل حسابك بنجاح على خطة <strong className="text-amber-400">{selectedPlanDetails.name}</strong>. تم فتح لوحة تحكم السائق لك لتقديم العروض واستقبال طلبات التوصيل الفورية!
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
