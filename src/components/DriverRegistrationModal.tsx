import React, { useState } from 'react';
import type { DriverProfile, Emirate, SubscriptionPlanId, VehicleType } from '../types';
import { UNIFIED_SUBSCRIPTION_PLAN, UAE_EMIRATES, VEHICLE_TRANSLATIONS } from '../data/mockData';
import { 
  X, 
  Check, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Zap, 
  ArrowLeft, 
  ArrowRight,
  Star,
  Lock,
  Upload,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

interface DriverRegistrationModalProps {
  onClose: () => void;
  onRegisterSuccess: (newDriver: DriverProfile) => void;
}

// Default avatar placeholder if not uploaded yet
const DEFAULT_AVATAR_PLACEHOLDER = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

// Sample default placeholders for documents if user wants instant demo
const DEFAULT_VEHICLE_IMG = 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400';
const DEFAULT_DOC_IMG = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=300';

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({
  onClose,
  onRegisterSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Personal & Contact Details + Avatar Upload
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+971 50 ');
  const [whatsappPhone, setWhatsappPhone] = useState('97150');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emirate, setEmirate] = useState<Emirate>('دبي');
  const [avatar, setAvatar] = useState<string>('');
  const [customAvatarUploaded, setCustomAvatarUploaded] = useState(false);
  const [bio, setBio] = useState('');

  // Step 2: Vehicle & License Details + Real Photo & 3 Required Official Documents
  const [vehicleType, setVehicleType] = useState<VehicleType>('pickup');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  
  // Real Photos Upload States
  const [vehiclePhoto, setVehiclePhoto] = useState<string>(DEFAULT_VEHICLE_IMG);
  const [vehiclePhotoName, setVehiclePhotoName] = useState<string>('vehicle_photo.jpg');

  const [drivingLicensePhoto, setDrivingLicensePhoto] = useState<string>(DEFAULT_DOC_IMG);
  const [drivingLicenseName, setDrivingLicenseName] = useState<string>('uae_driving_license.jpg');

  const [mulkiyaPhoto, setMulkiyaPhoto] = useState<string>(DEFAULT_DOC_IMG);
  const [mulkiyaName, setMulkiyaName] = useState<string>('vehicle_mulkiya.jpg');

  const [emiratesIdPhoto, setEmiratesIdPhoto] = useState<string>(DEFAULT_DOC_IMG);
  const [emiratesIdName, setEmiratesIdName] = useState<string>('emirates_id.jpg');

  // Step 3: Subscription Plan (Unified Plan)
  const [selectedPlan] = useState<SubscriptionPlanId>('unified');

  // Step 4: Payment State
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('841');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const selectedPlanDetails = UNIFIED_SUBSCRIPTION_PLAN;

  // File to base64 helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImageState: (url: string) => void,
    setNameState?: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (setNameState) setNameState(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageState(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !whatsappPhone.trim() || !email.trim() || !password.trim()) {
      alert('يرجى ملء جميع البيانات الأساسية المطلوبة.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleModel.trim() || !vehiclePlate.trim()) {
      alert('يرجى إدخال بيانات موديل ورقم لوحة المركبة.');
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
        password: password.trim() || '123456',
        avatar: avatar || DEFAULT_AVATAR_PLACEHOLDER,
        emirate,
        vehicleType,
        vehicleModel: vehicleModel.trim(),
        vehiclePlate: vehiclePlate.trim(),
        vehiclePhoto,
        licensePhoto: drivingLicensePhoto,
        mulkiyaPhoto,
        emiratesIdPhoto,
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
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-500 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/25 shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-lg font-black text-white">تسجيل سائق جديد وتوثيق الحساب</h3>
                <span className="bg-cyan-500/15 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  عمولة 0%
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">انضم لشبكة واصل، وثق مستنداتك واستقبل الطلبات فوراً</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        {!isDone && (
          <div className="bg-slate-950/60 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-800/80 flex items-center justify-between gap-1 sm:gap-2 text-[11px] sm:text-xs">
            <div className={`flex items-center gap-1.5 font-bold ${step >= 1 ? 'text-cyan-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${step >= 1 ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                1
              </span>
              <span className="hidden sm:inline">البيانات والصورة</span>
            </div>

            <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-cyan-500' : 'bg-slate-800'}`} />

            <div className={`flex items-center gap-1.5 font-bold ${step >= 2 ? 'text-cyan-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${step >= 2 ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                2
              </span>
              <span className="hidden sm:inline">المركبة والمستندات</span>
            </div>

            <div className={`h-0.5 flex-1 ${step >= 3 ? 'bg-cyan-500' : 'bg-slate-800'}`} />

            <div className={`flex items-center gap-1.5 font-bold ${step >= 3 ? 'text-cyan-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${step >= 3 ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                3
              </span>
              <span className="hidden sm:inline">الاشتراك الموحد</span>
            </div>

            <div className={`h-0.5 flex-1 ${step >= 4 ? 'bg-cyan-500' : 'bg-slate-800'}`} />

            <div className={`flex items-center gap-1.5 font-bold ${step >= 4 ? 'text-cyan-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${step >= 4 ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                4
              </span>
              <span className="hidden sm:inline">الدفع والتفعيل</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
          
          {/* STEP 1: Personal Data & Profile Picture Upload */}
          {step === 1 && !isDone && (
            <form onSubmit={handleNextStep1} className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
              
              {/* Profile Image Upload Section */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>الصورة الشخصية لحساب السائق *</span>
                  </span>
                  <span className="text-[11px] text-slate-400">تظهر للعملاء في كرت العرض والملف</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Selected Avatar Preview */}
                  <div className="relative group shrink-0">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Driver Avatar"
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-xl"
                      />
                    ) : (
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-dashed border-cyan-500/40 flex flex-col items-center justify-center text-slate-500">
                        <User className="w-8 h-8 text-cyan-400/60" />
                        <span className="text-[9px] text-slate-400 mt-1 font-medium">لا توجد صورة</span>
                      </div>
                    )}
                    {customAvatarUploaded && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-black p-1 rounded-full shadow-md">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Device File Upload Button */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="relative">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={(e) => {
                          handleFileUpload(e, (url) => {
                            setAvatar(url);
                            setCustomAvatarUploaded(true);
                          });
                        }}
                        className="sr-only"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600/10 to-cyan-500/20 hover:from-blue-600/20 hover:to-cyan-500/30 text-cyan-400 hover:text-cyan-300 font-bold px-4 py-3 rounded-xl border border-cyan-500/40 hover:border-cyan-500 text-xs transition-all shadow-md active:scale-95"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{customAvatarUploaded ? 'تغيير الصورة الشخصية' : 'تحميل صورة شخصية من جهازك'}</span>
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400 text-center sm:text-right">
                      {customAvatarUploaded ? '✓ تم رفع صورتك الشخصية بنجاح' : 'يرجى اختيار صورة واضحة لوجه السائق (JPG أو PNG)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>الاسم الكامل الثلاثي *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: خليفة سيف الكتبي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>الإمارة الرئيسية لنشاطك *</span>
                  </label>
                  <select
                    value={emirate}
                    onChange={(e) => setEmirate(e.target.value as Emirate)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500 dir-ltr text-right"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-emerald-400 font-mono focus:outline-none focus:border-cyan-500 dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>البريد الإلكتروني (لتسجيل الدخول) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>كلمة المرور للحساب *</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>نبذة تعريفية بالخبرة والخدمات التي تقدمها:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="مثال: خبرة 4 سنوات في توصيل البضائع والمستندات والطرود بين دبي وأبوظبي والشارقة. الالتزام بالمواعيد والأمانة شعاري."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>متابعة لصور المركبة والوثائق</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Vehicle Photos & 3 Required Official Documents */}
          {step === 2 && !isDone && (
            <form onSubmit={handleNextStep2} className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
              
              {/* Vehicle Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">نوع المركبة المعتمدة للتوصيل *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {(Object.keys(VEHICLE_TRANSLATIONS) as VehicleType[]).map((type) => {
                    const isSel = vehicleType === type;
                    return (
                      <div
                        key={type}
                        onClick={() => setVehicleType(type)}
                        className={`cursor-pointer p-3 sm:p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 active:scale-95 ${
                          isSel
                            ? 'bg-gradient-to-b from-blue-600/20 to-cyan-500/20 border-cyan-500 text-cyan-300 font-black shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Truck className={`w-5 h-5 sm:w-6 sm:h-6 ${isSel ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="text-xs">{VEHICLE_TRANSLATIONS[type]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vehicle Model & Plate Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">موديل وسنة صنع المركبة *</label>
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="مثال: تويوتا هايلوكس 2024"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* 1. Real Vehicle Photo Upload */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>إدراج صورة حقيقية للمركبة المعتمدة للتوصيل *</span>
                  </label>
                  <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    مطلوب للتوثيق
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={vehiclePhoto}
                      alt="Vehicle"
                      className="w-24 h-18 sm:w-28 sm:h-20 rounded-xl object-cover border-2 border-slate-700 shadow-md"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-1.5">
                    <div className="relative">
                      <input
                        type="file"
                        id="vehicle-photo-upload"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setVehiclePhoto, setVehiclePhotoName)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="vehicle-photo-upload"
                        className="cursor-pointer w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold px-4 py-2.5 rounded-xl border border-dashed border-cyan-500/50 hover:border-cyan-500 text-xs transition-all active:scale-95"
                      >
                        <Upload className="w-4 h-4" />
                        <span>تحميل صورة حقيقية لسيارتك</span>
                      </label>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate max-w-[200px]">الملف: {vehiclePhotoName}</span>
                      <span className="text-emerald-400 font-bold">جاهزة للعرض ✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Three Required Official Verification Documents */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>إدراج المستندات الرسمية الثلاثة لتفعيل الحساب وتوثيقه:</span>
                  </label>
                  <span className="text-[10px] text-slate-400">سرية وآمنة 100%</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                  
                  {/* DOC 1: UAE Driving License */}
                  <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={drivingLicensePhoto}
                        alt="Driving License"
                        className="w-12 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                          <span>1. رخصة القيادة الإماراتية</span>
                          <span className="text-emerald-400 text-[10px]">✓</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                          {drivingLicenseName}
                        </div>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <input
                        type="file"
                        id="license-upload"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, setDrivingLicensePhoto, setDrivingLicenseName)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="license-upload"
                        className="cursor-pointer flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold px-3 py-2 rounded-xl border border-slate-700 text-xs transition-all active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>تغيير / إرفاق الرخصة</span>
                      </label>
                    </div>
                  </div>

                  {/* DOC 2: Vehicle Mulkiya (ملكية المركبة) */}
                  <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={mulkiyaPhoto}
                        alt="Mulkiya"
                        className="w-12 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                          <span>2. ملكية المركبة (Mulkiya)</span>
                          <span className="text-emerald-400 text-[10px]">✓</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                          {mulkiyaName}
                        </div>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <input
                        type="file"
                        id="mulkiya-upload"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, setMulkiyaPhoto, setMulkiyaName)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="mulkiya-upload"
                        className="cursor-pointer flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold px-3 py-2 rounded-xl border border-slate-700 text-xs transition-all active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>تغيير / إرفاق الملكية</span>
                      </label>
                    </div>
                  </div>

                  {/* DOC 3: Emirates ID (الهوية الإماراتية) */}
                  <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={emiratesIdPhoto}
                        alt="Emirates ID"
                        className="w-12 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                          <span>3. الهوية الإماراتية للسائق</span>
                          <span className="text-emerald-400 text-[10px]">✓</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                          {emiratesIdName}
                        </div>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <input
                        type="file"
                        id="emiratesid-upload"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, setEmiratesIdPhoto, setEmiratesIdName)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="emiratesid-upload"
                        className="cursor-pointer flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold px-3 py-2 rounded-xl border border-slate-700 text-xs transition-all active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>تغيير / إرفاق الهوية</span>
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 sm:py-3 rounded-xl text-xs flex items-center gap-1.5 active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-blue-500/25 text-xs sm:text-sm flex items-center gap-2 active:scale-95"
                >
                  <span>متابعة للاشتراك الموحد</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: Unified Subscription Plan & Rating Algorithm Notice */}
          {step === 3 && !isDone && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
              
              {/* Single Unified Plan Card */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-2xl border-2 border-cyan-500/50 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block mb-1 shadow-sm">
                      الباقة الموحدة لجميع السائقين ⭐
                    </span>
                    <h4 className="font-black text-white text-base sm:text-xl">{selectedPlanDetails.name}</h4>
                  </div>

                  <div className="text-right sm:text-left">
                    <span className="text-2xl sm:text-3xl font-black text-cyan-400">{selectedPlanDetails.price}</span>
                    <span className="text-xs text-slate-400 font-semibold mr-1">درهم / شهرياً</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  {selectedPlanDetails.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 bg-blue-950/40 p-3 rounded-xl flex items-center gap-2.5 text-xs text-cyan-300 font-semibold">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span>
                    <strong>نظام أولوية التقييم:</strong> كلما حصلت على تقييمات إيجابية أعلى من العملاء بعد إتمام التوصيل، تظهر عروضك في المرتبة الأولى تلقائياً وتتصدر شاشة العميل!
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 sm:py-3 rounded-xl text-xs flex items-center gap-1.5 active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep3}
                  className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-blue-500/25 text-xs sm:text-sm flex items-center gap-2 active:scale-95"
                >
                  <span>متابعة للدفع ({selectedPlanDetails.price} AED)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: Payment Simulation */}
          {step === 4 && !isDone && (
            <form onSubmit={handleCompletePayment} className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
              
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">الباقة الموحدة:</span>
                  <span className="text-sm font-black text-white">{selectedPlanDetails.name}</span>
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-400 block">المبلغ الإجمالي للدفع:</span>
                  <span className="text-xl font-black text-cyan-400">{selectedPlanDetails.price} AED</span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-extrabold text-white text-xs sm:text-sm">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">رقم البطاقة (Visa / Mastercard / Apple Pay)</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500 text-center"
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
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 sm:py-3 rounded-xl text-xs flex items-center gap-1.5 active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 mr-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-2.5 sm:py-3 px-6 rounded-xl shadow-xl shadow-blue-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin text-white" />
                      <span>جاري معالجة الدفع وتوثيق الحساب...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>دفع وتفعيل اشتراك السائق ({selectedPlanDetails.price} AED)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* SUCCESS SCREEN */}
          {isDone && (
            <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border-2 border-emerald-500/30 animate-bounce shadow-xl shadow-emerald-500/10">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h4 className="text-lg sm:text-2xl font-black text-white">مرحباً بك كـ سائق موثّق ومعتمد في منصة واصل! 🎉</h4>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed">
                تم دفع الاشتراك الشهري ورفع مستنداتك وتفعيل حسابك بنجاح. تم فتح لوحة تحكم السائق لك لتقديم العروض واستقبال طلبات التوصيل الفورية!
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
