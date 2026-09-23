import React, { useState } from 'react';
import type { DriverProfile, Emirate, SubscriptionPlanId } from '../types';
import { UNIFIED_SUBSCRIPTION_PLAN, UAE_EMIRATES } from '../data/mockData';
import { validateEmiratesIdImage, formatEmiratesIdNumber, type EmiratesIdValidationResult } from '../utils/emiratesIdValidator';
import { validateDrivingLicenseImage, type DrivingLicenseValidationResult } from '../utils/drivingLicenseValidator';
import { validateMulkiyaImage, type MulkiyaValidationResult } from '../utils/mulkiyaValidator';
import uaeIdSampleImg from '../assets/uae-id-sample.jpg';
import uaeLicenseSampleImg from '../assets/uae-license-sample.webp';
import uaeMulkiyaSampleImg from '../assets/uae-mulkiya-sample.jpg';
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
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Scan,
  Eye
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
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  
  // Real Multiple Vehicle Photos Upload States
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([DEFAULT_VEHICLE_IMG]);

  const [drivingLicensePhoto, setDrivingLicensePhoto] = useState<string>(DEFAULT_DOC_IMG);
  const [drivingLicenseName, setDrivingLicenseName] = useState<string>('uae_driving_license.jpg');
  const [isScanningLicense, setIsScanningLicense] = useState<boolean>(false);
  const [licenseScanError, setLicenseScanError] = useState<string | null>(null);
  const [licenseValidationResult, setLicenseValidationResult] = useState<DrivingLicenseValidationResult | null>(null);
  const [showLicenseReferenceModal, setShowLicenseReferenceModal] = useState<boolean>(false);

  const [mulkiyaPhoto, setMulkiyaPhoto] = useState<string>(DEFAULT_DOC_IMG);
  const [mulkiyaName, setMulkiyaName] = useState<string>('vehicle_mulkiya.jpg');
  const [isScanningMulkiya, setIsScanningMulkiya] = useState<boolean>(false);
  const [mulkiyaScanError, setMulkiyaScanError] = useState<string | null>(null);
  const [mulkiyaValidationResult, setMulkiyaValidationResult] = useState<MulkiyaValidationResult | null>(null);
  const [showMulkiyaReferenceModal, setShowMulkiyaReferenceModal] = useState<boolean>(false);

  const [emiratesIdPhoto, setEmiratesIdPhoto] = useState<string>(DEFAULT_DOC_IMG);
  const [emiratesIdName, setEmiratesIdName] = useState<string>('emirates_id.jpg');
  const [emiratesIdNumber, setEmiratesIdNumber] = useState<string>('784-1990-1234567-1');
  const [isScanningId, setIsScanningId] = useState<boolean>(false);
  const [idScanError, setIdScanError] = useState<string | null>(null);
  const [idValidationResult, setIdValidationResult] = useState<EmiratesIdValidationResult | null>(null);
  const [showIdReferenceModal, setShowIdReferenceModal] = useState<boolean>(false);

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

  // Multiple vehicle photos upload handler
  const handleMultipleVehiclePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    let processed = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          newPhotos.push(reader.result);
        }
        processed++;
        if (processed === files.length) {
          setVehiclePhotos(prev => {
            const filtered = prev.filter(p => p !== DEFAULT_VEHICLE_IMG);
            return [...filtered, ...newPhotos];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveVehiclePhoto = (indexToRemove: number) => {
    setVehiclePhotos(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      return updated.length > 0 ? updated : [DEFAULT_VEHICLE_IMG];
    });
  };

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

  // Dedicated Smart UAE Driving License Scanner & Design Validation Handler
  const handleDrivingLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDrivingLicenseName(file.name);
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result;
        setDrivingLicensePhoto(base64);
        setIsScanningLicense(true);
        setLicenseScanError(null);

        // Visual AI Scanning effect
        setTimeout(async () => {
          const result = await validateDrivingLicenseImage(base64);
          setIsScanningLicense(false);
          setLicenseValidationResult(result);

          if (!result.isValid) {
            setLicenseScanError(result.message);
          } else {
            setLicenseScanError(null);
          }
        }, 1100);
      }
    };
    reader.readAsDataURL(file);
  };

  // Dedicated Smart UAE Vehicle Mulkiya Scanner & Design Validation Handler
  const handleMulkiyaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMulkiyaName(file.name);
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result;
        setMulkiyaPhoto(base64);
        setIsScanningMulkiya(true);
        setMulkiyaScanError(null);

        // Visual AI Scanning effect
        setTimeout(async () => {
          const result = await validateMulkiyaImage(base64);
          setIsScanningMulkiya(false);
          setMulkiyaValidationResult(result);

          if (!result.isValid) {
            setMulkiyaScanError(result.message);
          } else {
            setMulkiyaScanError(null);
          }
        }, 1100);
      }
    };
    reader.readAsDataURL(file);
  };

  // Dedicated Smart Emirates ID Scanner & Design Validation Handler
  const handleEmiratesIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEmiratesIdName(file.name);
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result;
        setEmiratesIdPhoto(base64);
        setIsScanningId(true);
        setIdScanError(null);

        // Visual AI Scanning effect
        setTimeout(async () => {
          const result = await validateEmiratesIdImage(base64);
          setIsScanningId(false);
          setIdValidationResult(result);

          if (!result.isValid) {
            setIdScanError(result.message);
          } else {
            setIdScanError(null);
          }
        }, 1100);
      }
    };
    reader.readAsDataURL(file);
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

    if (drivingLicensePhoto && licenseValidationResult && !licenseValidationResult.isValid) {
      alert('⚠️ تنبيه: صورة رخصة القيادة المرفقة لا تطابق تصميم وشكل رخصة القيادة الإماراتية الرسمية. يرجى إدراج الرخصة المعتمدة للمتابعة.');
      return;
    }

    if (mulkiyaPhoto && mulkiyaValidationResult && !mulkiyaValidationResult.isValid) {
      alert('⚠️ تنبيه: صورة ملكية المركبة المرفقة لا تطابق تصميم وشكل ملكية المركبة (رخصة مركبة) الإماراتية الرسمية. يرجى إدراج الملكية المعتمدة للمتابعة.');
      return;
    }

    if (emiratesIdPhoto && idValidationResult && !idValidationResult.isValid) {
      alert('⚠️ تنبيه: صورة الهوية الإماراتية المرفقة لا تطابق تصميم وأبعاد بطاقة الهوية الإماراتية الرسمية. يرجى إرفاق الهوية المعتمدة للمتابعة.');
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
        vehicleModel: vehicleModel.trim(),
        vehiclePlate: vehiclePlate.trim(),
        vehiclePhoto: vehiclePhotos[0] || DEFAULT_VEHICLE_IMG,
        vehiclePhotos: vehiclePhotos.length > 0 ? vehiclePhotos : [DEFAULT_VEHICLE_IMG],
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

              {/* 1. Multiple Real Vehicle Photos Upload & Gallery */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>إدراج صور حقيقية للمركبة المعتمدة للتوصيل (يمكنك رفع عدة صور) *</span>
                  </label>
                  <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {vehiclePhotos.length} {vehiclePhotos.length === 1 ? 'صورة' : 'صور'}
                  </span>
                </div>

                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    id="multiple-vehicle-photos-upload"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleVehiclePhotosUpload}
                    className="sr-only"
                  />
                  <label
                    htmlFor="multiple-vehicle-photos-upload"
                    className="cursor-pointer w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-900/40 via-slate-900 to-cyan-900/40 hover:from-blue-900/60 hover:to-cyan-900/60 text-cyan-400 font-bold px-4 py-3 rounded-xl border border-dashed border-cyan-500/50 hover:border-cyan-400 text-xs transition-all active:scale-95 shadow-inner"
                  >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>+ رفع صور جديدة لمركبتك (اضغط لتحديد صورة أو عدة صور)</span>
                  </label>
                </div>

                {/* Photos Grid Gallery */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {vehiclePhotos.map((photoUrl, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 aspect-video bg-slate-900 shadow-md">
                      <img
                        src={photoUrl}
                        alt={`Vehicle ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {idx === 0 && (
                        <div className="absolute top-1.5 right-1.5 bg-blue-600/90 backdrop-blur-sm text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                          الرئيسية
                        </div>
                      )}
                      {vehiclePhotos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVehiclePhoto(idx)}
                          className="absolute top-1.5 left-1.5 bg-red-600/90 hover:bg-red-500 text-white p-1 rounded-full shadow transition-all opacity-90 group-hover:opacity-100"
                          title="حذف الصورة"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/75 py-0.5 text-center text-[9px] text-slate-300">
                        صورة {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>💡 يُفضل رفع صور واضحة للمركبة من الأمام والخلف والجانب</span>
                  <span className="text-emerald-400 font-bold">جاهزة للعرض ✓</span>
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
                  
                  {/* DOC 1: Smart Validated UAE Driving License (رخصة القيادة الإماراتية الذكية) */}
                  <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={drivingLicensePhoto}
                            alt="Driving License"
                            className="w-16 h-11 sm:w-20 sm:h-13 rounded-xl object-cover border border-slate-700 shadow-md"
                          />
                          {licenseValidationResult?.isValid && (
                            <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>1. رخصة القيادة الإماراتية الرسمية</span>
                            <span className="text-cyan-400 font-normal text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                              فحص آلي وتدقيق
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                            {drivingLicenseName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowLicenseReferenceModal(true)}
                          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold px-3 py-2 rounded-xl border border-slate-700 text-xs transition-colors active:scale-95"
                          title="معاينة شكل رخصة القيادة المعتمدة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة النموذج المعتمد</span>
                        </button>

                        <div className="relative shrink-0">
                          <input
                            type="file"
                            id="license-upload"
                            accept="image/*"
                            onChange={handleDrivingLicenseUpload}
                            className="sr-only"
                          />
                          <label
                            htmlFor="license-upload"
                            className="cursor-pointer flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black px-3.5 py-2 rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>تحميل صورة الرخصة</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Scanning In Progress State */}
                    {isScanningLicense && (
                      <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                        <Scan className="w-5 h-5 text-cyan-400 animate-spin" />
                        <div className="text-xs">
                          <div className="font-bold text-cyan-300">جاري مسح وتدقيق رخصة القيادة الإماراتية آلياً...</div>
                          <div className="text-[10px] text-slate-400">التحقق من تطابق شعار صقر الإمارات، جدول بيانات الرخصة، والترويسة الرسمية باللون الأحمر</div>
                        </div>
                      </div>
                    )}

                    {/* Verification Passed Badge */}
                    {!isScanningLicense && licenseValidationResult?.isValid && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>تم التحقق: تصميم رخصة القيادة مطابق للشكل والجدول المعتمد رسمياً في دولة الإمارات ✓</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          نسبة المطابقة البصرية: <strong className="text-emerald-400 font-bold">{licenseValidationResult.score}%</strong> (تم تدقيق جدول البيانات وشعار الصقر وعنوان رخصة القيادة).
                        </div>
                      </div>
                    )}

                    {/* Verification Failed Error Banner */}
                    {!isScanningLicense && licenseScanError && (
                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-rose-400 font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>تنبيه: تم رفض الصورة - لا تطابق تصميم رخصة القيادة الإماراتية المعتمدة</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          يجب أن تكون الصورة المرفقة لرخصة القيادة الإماراتية الرسمية (المحتوية على شعار صقر الإمارات، الترويسة باللغتين وعنوان رخصة القيادة، والجدول المعتمد).
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowLicenseReferenceModal(true)}
                          className="text-cyan-400 underline hover:text-cyan-300 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          اضغط هنا لرؤية النموذج المعتمد المطلوب لرخصة القيادة
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DOC 2: Smart Validated UAE Mulkiya (ملكية المركبة الذكية) */}
                  <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={mulkiyaPhoto}
                            alt="Mulkiya"
                            className="w-16 h-11 sm:w-20 sm:h-13 rounded-xl object-cover border border-slate-700 shadow-md"
                          />
                          {mulkiyaValidationResult?.isValid && (
                            <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>2. ملكية المركبة (رخصة مركبة - الوجه الأمامي)</span>
                            <span className="text-cyan-400 font-normal text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                              فحص آلي وتدقيق
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                            {mulkiyaName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMulkiyaReferenceModal(true)}
                          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold px-3 py-2 rounded-xl border border-slate-700 text-xs transition-colors active:scale-95"
                          title="معاينة شكل ملكية المركبة المعتمدة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة النموذج المعتمد</span>
                        </button>

                        <div className="relative shrink-0">
                          <input
                            type="file"
                            id="mulkiya-upload"
                            accept="image/*"
                            onChange={handleMulkiyaUpload}
                            className="sr-only"
                          />
                          <label
                            htmlFor="mulkiya-upload"
                            className="cursor-pointer flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black px-3.5 py-2 rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>تحميل صورة الملكية</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Scanning In Progress State */}
                    {isScanningMulkiya && (
                      <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                        <Scan className="w-5 h-5 text-cyan-400 animate-spin" />
                        <div className="text-xs">
                          <div className="font-bold text-cyan-300">جاري مسح وتدقيق ملكية المركبة الإماراتية آلياً...</div>
                          <div className="text-[10px] text-slate-400">التحقق من الخلفية الذهبية الأمنية، شعار صقر الإمارات المركزي، والجدول المعتمد لرخصة المركبة</div>
                        </div>
                      </div>
                    )}

                    {/* Verification Passed Badge */}
                    {!isScanningMulkiya && mulkiyaValidationResult?.isValid && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>تم التحقق: تصميم ملكية المركبة مطابق للنموذج والجدول الذهبي المعتمد رسمياً في دولة الإمارات ✓</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          نسبة المطابقة البصرية: <strong className="text-emerald-400 font-bold">{mulkiyaValidationResult.score}%</strong> (تم تدقيق الخلفية الذهبية وشعار الصقر المركزي وجدول الترخيص).
                        </div>
                      </div>
                    )}

                    {/* Verification Failed Error Banner */}
                    {!isScanningMulkiya && mulkiyaScanError && (
                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-rose-400 font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>تنبيه: تم رفض الصورة - لا تطابق تصميم ملكية المركبة (رخصة مركبة) المعتمدة</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          يجب أن تكون الصورة المرفقة لملكية المركبة الإماراتية الرسمية (المحتوية على الخلفية الذهبية، شعار الصقر المركزي، ترويسة رخصة مركبة، وجدول البيانات).
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowMulkiyaReferenceModal(true)}
                          className="text-cyan-400 underline hover:text-cyan-300 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          اضغط هنا لرؤية النموذج المعتمد المطلوب لملكية المركبة
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DOC 3: Smart Validated Emirates ID (الهوية الإماراتية الذكية) */}
                  <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={emiratesIdPhoto}
                            alt="Emirates ID"
                            className="w-16 h-11 sm:w-20 sm:h-13 rounded-xl object-cover border border-slate-700 shadow-md"
                          />
                          {idValidationResult?.isValid && (
                            <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>3. بطاقة الهوية الإماراتية (الوجه الأمامي)</span>
                            <span className="text-cyan-400 font-normal text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                              فحص آلي وتدقيق
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                            {emiratesIdName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowIdReferenceModal(true)}
                          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold px-3 py-2 rounded-xl border border-slate-700 text-xs transition-colors active:scale-95"
                          title="معاينة شكل الهوية المعتمدة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة النموذج المعتمد</span>
                        </button>

                        <div className="relative shrink-0">
                          <input
                            type="file"
                            id="emiratesid-upload"
                            accept="image/*"
                            onChange={handleEmiratesIdUpload}
                            className="sr-only"
                          />
                          <label
                            htmlFor="emiratesid-upload"
                            className="cursor-pointer flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black px-3.5 py-2 rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>تحميل صورة الهوية</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Scanning In Progress State */}
                    {isScanningId && (
                      <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                        <Scan className="w-5 h-5 text-cyan-400 animate-spin" />
                        <div className="text-xs">
                          <div className="font-bold text-cyan-300">جاري مسح وتدقيق الهوية الإماراتية آلياً...</div>
                          <div className="text-[10px] text-slate-400">التحقق من تطابق الأبعاد، شعار الصقر، علم الإمارات، وهيكل البيانات الرسمي</div>
                        </div>
                      </div>
                    )}

                    {/* Verification Passed Badge */}
                    {!isScanningId && idValidationResult?.isValid && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>تم التحقق: تصميم الهوية مطابق للمواصفات الرسمية للهيئة الاتحادية للهوية والجنسية ✓</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              رقم الهوية الموحد (15 رقماً):
                            </label>
                            <input
                              type="text"
                              value={emiratesIdNumber}
                              onChange={(e) => setEmiratesIdNumber(formatEmiratesIdNumber(e.target.value))}
                              placeholder="784-1990-1234567-1"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold dir-ltr focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="flex items-center text-[10px] text-slate-400 pt-3">
                            <span>نسبة المطابقة البصرية: <strong className="text-emerald-400 font-bold">{idValidationResult.score}%</strong></span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verification Failed Error Banner */}
                    {!isScanningId && idScanError && (
                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-rose-400 font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>تنبيه: الصورة المرفقة لا تطابق تصميم بطاقة الهوية الإماراتية المعتمدة</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          يجب أن تكون الصورة المرفقة لبطاقة الهوية الإماراتية الصادرة من الهيئة الاتحادية للهوية والجنسية (المحتوية على الشعار والعلم والرقم الموحد 784).
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowIdReferenceModal(true)}
                          className="text-cyan-400 underline hover:text-cyan-300 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          اضغط هنا لرؤية النموذج المعتمد المطلوب
                        </button>
                      </div>
                    )}
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

      {/* UAE Emirates ID Official Reference Sample Modal */}
      {showIdReferenceModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm sm:text-base font-bold text-white">النموذج المعتمد لبطاقة الهوية الإماراتية</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowIdReferenceModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <p className="text-xs text-slate-300 leading-relaxed">
                يقوم النظام بالتحقق آلياً من تطابق صورة الهوية مع التصميم والشكل المعتمد الصادر من <strong className="text-cyan-400">الهيئة الاتحادية للهوية والجنسية</strong>:
              </p>

              {/* Sample Card Image */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-xl bg-slate-950">
                <img
                  src={uaeIdSampleImg}
                  alt="UAE Emirates ID Standard Sample"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Required Layout Landmarks */}
              <div className="space-y-2 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="font-bold text-cyan-300 text-xs mb-1.5">المعايير البصرية المطلوبة للقبول الفوري:</div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>الترويسة:</strong> ظهور اسم الهيئة باللغتين العربية والإنجليزية.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>الشعار والعلم:</strong> وجود شعار صقر الإمارات وعلم الدولة بالأعلى.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>رقم الهوية:</strong> رقم الهوية الموحد المكون من 15 خانة يبدأ بـ 784.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>الصورة والوضوح:</strong> ظهور صورة حامل البطاقة وخلفية الزخرفة الأمنية.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIdReferenceModal(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                فهمت ذلك، العودة لإرفاق الهوية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UAE Driving License Official Reference Sample Modal */}
      {showLicenseReferenceModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm sm:text-base font-bold text-white">النموذج المعتمد لرخصة القيادة الإماراتية</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowLicenseReferenceModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <p className="text-xs text-slate-300 leading-relaxed">
                يقوم النظام بالتحقق آلياً من تطابق صورة رخصة القيادة مع التصميم والجدول المعتمد رسمياً في <strong className="text-cyan-400">دولة الإمارات العربية المتحدة</strong>:
              </p>

              {/* Sample Card Image */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-xl bg-slate-950">
                <img
                  src={uaeLicenseSampleImg}
                  alt="UAE Driving License Standard Sample"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Required Layout Landmarks */}
              <div className="space-y-2 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="font-bold text-cyan-300 text-xs mb-1.5">المعايير البصرية المطلوبة للقبول الفوري:</div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>الترويسة:</strong> ترويسة الإمارات وعنوان "Driving License / رخصة قيادة" باللون الأحمر.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>الشعارات:</strong> وجود شعار صقر الإمارات وشعار المرور بالزوايا العلوية.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>جدول البيانات:</strong> الجدول الموحد للبيانات (رقم الرخصة، الاسم، الجنسية، التواريخ).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>الصورة والوضوح:</strong> ظهور صورة السائق واضحة بالجانب الأيسر.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLicenseReferenceModal(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                فهمت ذلك، العودة لإرفاق الرخصة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UAE Mulkiya Official Reference Sample Modal */}
      {showMulkiyaReferenceModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm sm:text-base font-bold text-white">النموذج المعتمد لملكية المركبة (رخصة مركبة)</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowMulkiyaReferenceModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <p className="text-xs text-slate-300 leading-relaxed">
                يقوم النظام بالتحقق آلياً من تطابق صورة ملكية المركبة مع التصميم الذهبي والجدول المعتمد رسمياً في <strong className="text-cyan-400">دولة الإمارات العربية المتحدة</strong>:
              </p>

              {/* Sample Card Image */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-xl bg-slate-950">
                <img
                  src={uaeMulkiyaSampleImg}
                  alt="UAE Vehicle License (Mulkiya) Standard Sample"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Required Layout Landmarks */}
              <div className="space-y-2 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="font-bold text-cyan-300 text-xs mb-1.5">المعايير البصرية المطلوبة للقبول الفوري:</div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>اللون الذهبي والزخرفة:</strong> الخلفية الذهبية الأمنية المميزة لملكية المركبات.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>الشعار المركزي:</strong> وجود شعار صقر الإمارات وعلم الدولة في أعلى المنتصف.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>الترويسة:</strong> ظهور عبارة "UAE Vehicle License / رخصة مركبة".</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>جدول الترخيص:</strong> شبكة الجدول الشامل لبيانات اللوحة، المالك، وتواريخ التأمين.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMulkiyaReferenceModal(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                فهمت ذلك، العودة لإرفاق الملكية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
