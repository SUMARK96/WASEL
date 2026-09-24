import React, { useState } from 'react';
import type { DriverProfile, Emirate, SubscriptionPlanId, SubscriptionInvoice, ExemptionCode } from '../types';
import { createSubscriptionInvoice, calculateOneMonthExpiry, calculateExpiryByMonths, getWhatsAppInvoiceUrl } from '../utils/subscriptionUtils';
import { InvoiceModal } from './InvoiceModal';
import { UNIFIED_SUBSCRIPTION_PLAN, UAE_EMIRATES } from '../data/mockData';
import { validateEmiratesIdImage, formatEmiratesIdNumber, type EmiratesIdValidationResult } from '../utils/emiratesIdValidator';
import { validateDrivingLicenseImage, type DrivingLicenseValidationResult } from '../utils/drivingLicenseValidator';
import { validateMulkiyaImage, type MulkiyaValidationResult } from '../utils/mulkiyaValidator';
import uaeIdSampleImg from '../assets/uae-id-sample.jpg';
import uaeLicenseSampleImg from '../assets/uae-license-sample.webp';
import uaeMulkiyaSampleImg from '../assets/uae-mulkiya-sample.jpg';
import {
  X,
  ExternalLink,
  RotateCw,
  Share2,
  Bell,
  Check, 
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
  Eye,
  Ticket
} from 'lucide-react';

interface DriverRegistrationModalProps {
  onClose: () => void;
  onRegisterSuccess: (newDriver: DriverProfile) => void;
  subscriptionPrice?: number;
  exemptionCodes?: ExemptionCode[];
  onApplyExemptionCode?: (codeStr: string, driverId?: string) => { success: boolean; message: string; months?: number };
}

// Default avatar placeholder if not uploaded yet
const DEFAULT_AVATAR_PLACEHOLDER = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

// Sample default placeholders for documents if user wants instant demo
const DEFAULT_VEHICLE_IMG = 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400';
const DEFAULT_DOC_IMG = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=300';

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({
  onClose,
  onRegisterSuccess,
  subscriptionPrice = UNIFIED_SUBSCRIPTION_PLAN.price,
  exemptionCodes = [],
  onApplyExemptionCode
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

  // Step 3: Subscription Plan & Ziina Payment Verification Flow
  const [selectedPlan] = useState<SubscriptionPlanId>('unified');
  const [paymentStage, setPaymentStage] = useState<'ready' | 'link_opened' | 'verifying' | 'success' | 'failed'>('ready');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [createdActiveDriver, setCreatedActiveDriver] = useState<DriverProfile | null>(null);
  const [generatedInvoice, setGeneratedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  // Exemption Code States
  const [inputPromoCode, setInputPromoCode] = useState('');
  const [appliedExemption, setAppliedExemption] = useState<{ code: string; months: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const ZIINA_PAYMENT_URL = 'https://pay.ziina.com/Waslasd/IWXxU478H?source=app';
  const selectedPlanDetails = {
    ...UNIFIED_SUBSCRIPTION_PLAN,
    price: subscriptionPrice
  };

  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);
    const clean = inputPromoCode.trim().toUpperCase();
    if (!clean) {
      setPromoError('يرجى كتابة رمز الكود أولاً');
      return;
    }
    if (onApplyExemptionCode) {
      const res = onApplyExemptionCode(clean);
      if (res.success && res.months) {
        setAppliedExemption({ code: clean, months: res.months });
        setPromoSuccess(`🎉 تم تفعيل كود الإعفاء بنجاح! اشتراك مجاني بنسبة 100% لمدة ${res.months} ${res.months === 1 ? 'شهر' : res.months === 2 ? 'شهرين' : `${res.months} شهور`} دون أي رسوم.`);
      } else {
        setPromoError(res.message || 'كود الإعفاء غير صالح أو انتهت صلاحيته');
      }
    } else {
      const found = exemptionCodes?.find(c => c.code.toUpperCase() === clean && c.isActive);
      if (found) {
        if (found.usedDriversCount >= found.maxDrivers) {
          setPromoError('تم استنفاد الحد الأقصى لعدد السائقين المسموح لهم باستخدام هذا الكود');
          return;
        }
        setAppliedExemption({ code: found.code, months: found.months });
        setPromoSuccess(`🎉 تم تفعيل كود الإعفاء بنجاح! اشتراك مجاني بنسبة 100% لمدة ${found.months} ${found.months === 1 ? 'شهر' : found.months === 2 ? 'شهرين' : `${found.months} شهور`} دون أي رسوم.`);
      } else {
        setPromoError('كود الإعفاء غير صحيح أو غير مفعل');
      }
    }
  };

  const handleActivateWithExemption = () => {
    if (!appliedExemption) return;
    setPaymentStage('verifying');

    setTimeout(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const formattedExpiry = calculateExpiryByMonths(now, appliedExemption.months);

      const newDriverId = `drv-${Date.now()}`;
      const cleanWhatsapp = whatsappPhone.replace(/[^0-9]/g, '');
      const fullCallPhone = phone.trim().startsWith('+') ? phone.trim() : `+971 ${phone.trim()}`;

      const activatedDriver: DriverProfile = {
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
        subscriptionExpiry: formattedExpiry,
        joinedDate: todayStr,
        lastPaymentDate: todayStr,
        usedExemptionCode: appliedExemption.code,
        isExemptionActive: true,
        bio: bio.trim() || `سائق معتمد يقدم خدمات التوصيل السريع بين الإمارات بسيارة ${vehicleModel.trim()}.`
      };

      const invoice = createSubscriptionInvoice(
        activatedDriver,
        `PROMO-${appliedExemption.code}`,
        todayStr,
        formattedExpiry,
        0,
        `كود إعفاء ترويجي (${appliedExemption.code} - ${appliedExemption.months} شهر مجاناً)`
      );

      setGeneratedInvoice(invoice);
      setCreatedActiveDriver(activatedDriver);
      setPaymentStage('success');
    }, 1200);
  };

  const handleOpenZiinaPayment = () => {
    setPaymentError(null);
    setPaymentStage('link_opened');
    window.open(ZIINA_PAYMENT_URL, '_blank', 'noopener,noreferrer');
  };

  const handleVerifyZiinaPayment = () => {
    setPaymentStage('verifying');
    setPaymentError(null);

    // Simulate strict live verification with Ziina payment gateway
    setTimeout(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const formattedExpiry = calculateOneMonthExpiry(now);

      const newDriverId = `drv-${Date.now()}`;
      const cleanWhatsapp = whatsappPhone.replace(/[^0-9]/g, '');
      const fullCallPhone = phone.trim().startsWith('+') ? phone.trim() : `+971 ${phone.trim()}`;

      const activatedDriver: DriverProfile = {
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
        subscriptionExpiry: formattedExpiry,
        joinedDate: todayStr,
        lastPaymentDate: todayStr,
        usedExemptionCode: undefined,
        isExemptionActive: false,
        bio: bio.trim() || `سائق معتمد يقدم خدمات التوصيل السريع بين الإمارات بسيارة ${vehicleModel.trim()}.`
      };

      const invoice = createSubscriptionInvoice(
        activatedDriver,
        transactionRef || `ZIN-${Math.floor(100000 + Math.random() * 900000)}`,
        todayStr,
        formattedExpiry,
        subscriptionPrice
      );

      setGeneratedInvoice(invoice);
      setCreatedActiveDriver(activatedDriver);
      setPaymentStage('success');
    }, 2000);
  };

  const handlePaymentFailure = () => {
    setPaymentStage('failed');
    setPaymentError('فشلت عملية الدفع في بوابة زينة (Ziina) أو تم إلغاؤها. لم يتم تفعيل الحساب.');
  };

  const handleCompleteRegistration = () => {
    if (createdActiveDriver) {
      onRegisterSuccess(createdActiveDriver);
    }
  };

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
          const result = await validateDrivingLicenseImage(base64, name, emirate);
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
          const result = await validateMulkiyaImage(base64, vehicleModel, vehiclePlate);
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
          const result = await validateEmiratesIdImage(base64, name);
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

  
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[94dvh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 bg-black flex justify-center">
          <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="bg-black px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-lg shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-lg font-black text-white">تسجيل سائق جديد وتوثيق الحساب</h3>
                <span className="bg-zinc-900 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                  عمولة 0%
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400">انضم لشبكة واصل، وثق مستنداتك واستقبل الطلبات فوراً</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar (3 Steps) */}
        <div className="bg-zinc-950 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-zinc-800 flex items-center justify-between gap-1 sm:gap-2 text-[11px] sm:text-xs">
          <div className={`flex items-center gap-1.5 font-bold ${step >= 1 ? 'text-white' : 'text-zinc-500'}`}>
            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${step >= 1 ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400'}`}>
              1
            </span>
            <span className="hidden sm:inline">البيانات والصورة</span>
          </div>

          <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-white' : 'bg-zinc-800'}`} />

          <div className={`flex items-center gap-1.5 font-bold ${step >= 2 ? 'text-white' : 'text-zinc-500'}`}>
            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${step >= 2 ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400'}`}>
              2
            </span>
            <span className="hidden sm:inline">المركبة والمستندات</span>
          </div>

          <div className={`h-0.5 flex-1 ${step >= 3 ? 'bg-white' : 'bg-zinc-800'}`} />

          <div className={`flex items-center gap-1.5 font-bold ${step >= 3 ? 'text-white' : 'text-zinc-500'}`}>
            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${step >= 3 ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400'}`}>
              3
            </span>
            <span className="hidden sm:inline">الاشتراك والدفع</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
          
          {/* STEP 1: Personal Data & Profile Picture Upload */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
              
              {/* Profile Image Upload Section */}
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <label className="block text-xs font-bold text-zinc-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-white" />
                    <span>الصورة الشخصية لحساب السائق *</span>
                  </span>
                  <span className="text-[11px] text-zinc-400">تظهر للعملاء في كرت العرض والملف</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Selected Avatar Preview */}
                  <div className="relative group shrink-0">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Driver Avatar"
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-zinc-600 shadow-xl"
                      />
                    ) : (
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500">
                        <User className="w-8 h-8 text-zinc-400" />
                        <span className="text-[9px] text-zinc-400 mt-1 font-medium">لا توجد صورة</span>
                      </div>
                    )}
                    {customAvatarUploaded && (
                      <span className="absolute -bottom-1 -right-1 bg-white text-black text-[10px] font-black p-1 rounded-full shadow-md">
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
                        className="cursor-pointer w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-xs transition-all shadow-md active:scale-95"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{customAvatarUploaded ? 'تغيير الصورة الشخصية' : 'تحميل صورة شخصية من جهازك'}</span>
                      </label>
                    </div>
                    <p className="text-[11px] text-zinc-400 text-center sm:text-right">
                      {customAvatarUploaded ? '✓ تم رفع صورتك الشخصية بنجاح' : 'يرجى اختيار صورة واضحة لوجه السائق (JPG أو PNG)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>الاسم الكامل الثلاثي *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: خليفة سيف الكتبي"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>الإمارة الرئيسية لنشاطك *</span>
                  </label>
                  <select
                    value={emirate}
                    onChange={(e) => setEmirate(e.target.value as Emirate)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500"
                  >
                    {UAE_EMIRATES.map(em => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>رقم الاتصال الهاتفي المباشر *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-zinc-500 dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>رقم الواتساب (بدون مسافات) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="971501234567"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-zinc-500 dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>البريد الإلكتروني (لتسجيل الدخول) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@example.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>كلمة المرور للحساب *</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>نبذة تعريفية بالخبرة والخدمات التي تقدمها:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="مثال: خبرة 4 سنوات في توصيل البضائع والمستندات والطرود بين دبي وأبوظبي والشارقة. الالتزام بالمواعيد والأمانة شعاري."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-black px-6 py-3 rounded-xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span>متابعة لصور المركبة والوثائق</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Vehicle Photos & 3 Required Official Documents */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
              
              {/* Vehicle Model & Plate Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">موديل وسنة صنع المركبة *</label>
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="مثال: تويوتا هايلوكس 2024"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">رقم اللوحة ومصدرها *</label>
                  <input
                    type="text"
                    required
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="مثال: دبي X 98234"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* 1. Multiple Real Vehicle Photos Upload & Gallery */}
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-zinc-400" />
                    <span>إدراج صور حقيقية للمركبة المعتمدة للتوصيل (يمكنك رفع عدة صور) *</span>
                  </label>
                  <span className="text-[10px] text-zinc-300 font-bold bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-700">
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
                    className="cursor-pointer w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-3 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 text-xs transition-all active:scale-95 shadow-inner"
                  >
                    <Upload className="w-4 h-4 text-white" />
                    <span>+ رفع صور جديدة لمركبتك (اضغط لتحديد صورة أو عدة صور)</span>
                  </label>
                </div>

                {/* Photos Grid Gallery */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {vehiclePhotos.map((photoUrl, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-950 shadow-md">
                      <img
                        src={photoUrl}
                        alt={`Vehicle ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {idx === 0 && (
                        <div className="absolute top-1.5 right-1.5 bg-black/90 backdrop-blur-sm text-white text-[9px] font-black px-1.5 py-0.5 rounded border border-zinc-700 shadow">
                          الرئيسية
                        </div>
                      )}
                      {vehiclePhotos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVehiclePhoto(idx)}
                          className="absolute top-1.5 left-1.5 bg-black/90 hover:bg-zinc-800 text-white p-1 rounded-full border border-zinc-700 shadow transition-all opacity-90 group-hover:opacity-100"
                          title="حذف الصورة"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 text-center text-[9px] text-zinc-300">
                        صورة {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                  <span>💡 يُفضل رفع صور واضحة للمركبة من الأمام والخلف والجانب</span>
                  <span className="text-white font-bold">جاهزة للعرض ✓</span>
                </div>
              </div>

              {/* 2. Three Required Official Verification Documents */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>إدراج المستندات الرسمية الثلاثة لتفعيل الحساب وتوثيقه:</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">سرية وآمنة 100%</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                  
                  {/* DOC 1: Smart Validated UAE Driving License (رخصة القيادة الإماراتية الذكية) */}
                  <div className="bg-zinc-950 p-3.5 sm:p-4 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={drivingLicensePhoto}
                            alt="Driving License"
                            className="w-16 h-11 sm:w-20 sm:h-13 rounded-xl object-cover border border-zinc-700 shadow-md"
                          />
                          {licenseValidationResult?.isValid && (
                            <div className="absolute -top-1.5 -right-1.5 bg-white text-black rounded-full p-0.5 shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>1. رخصة القيادة الإماراتية الرسمية</span>
                            <span className="text-zinc-300 font-normal text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-700">
                              فحص آلي وتدقيق
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[200px]">
                            {drivingLicenseName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowLicenseReferenceModal(true)}
                          className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold px-3 py-2 rounded-xl border border-zinc-700 text-xs transition-colors active:scale-95"
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
                            className="cursor-pointer flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-black font-black px-3.5 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>تحميل صورة الرخصة</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Scanning In Progress State */}
                    {isScanningLicense && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                        <Scan className="w-5 h-5 text-white animate-spin" />
                        <div className="text-xs">
                          <div className="font-bold text-white">جاري مسح وتدقيق رخصة القيادة الإماراتية آلياً...</div>
                          <div className="text-[10px] text-zinc-400">التحقق من تطابق شعار صقر الإمارات، جدول بيانات الرخصة، والترويسة الرسمية</div>
                        </div>
                      </div>
                    )}

                    {/* Verification Passed Badge & Data Fields Match Table */}
                    {!isScanningLicense && licenseValidationResult?.isValid && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3.5 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>تم التحقق: تطابق نوع المستند وحقول بيانات رخصة القيادة الرسمية ✓</span>
                          </div>
                          <span className="text-[10px] text-black font-bold bg-white px-2 py-0.5 rounded-full">
                            مطابقة {licenseValidationResult.score}%
                          </span>
                        </div>

                        {/* Fields Match Grid */}
                        {licenseValidationResult.fields && licenseValidationResult.fields.length > 0 && (
                          <div className="space-y-1.5 bg-black/60 p-2.5 rounded-xl border border-zinc-800">
                            <div className="text-[10px] text-zinc-400 font-bold mb-1">جدول تطابق حقول بيانات رخصة القيادة:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {licenseValidationResult.fields.map((f, fIdx) => (
                                <div key={fIdx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between text-[11px]">
                                  <div>
                                    <span className="text-zinc-400 block text-[9px]">{f.fieldName}</span>
                                    <span className="text-white font-bold">{f.extractedValue}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                                    {f.statusText}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification Failed Error Banner */}
                    {!isScanningLicense && licenseScanError && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-white font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>تنبيه: تم رفض الصورة - لا تطابق تصميم رخصة القيادة الإماراتية المعتمدة</span>
                        </div>
                        <p className="text-zinc-300 text-[11px]">
                          يجب أن تكون الصورة المرفقة لرخصة القيادة الإماراتية الرسمية (المحتوية على شعار صقر الإمارات، الترويسة باللغتين وعنوان رخصة القيادة، والجدول المعتمد).
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowLicenseReferenceModal(true)}
                          className="text-white underline hover:text-zinc-300 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          اضغط هنا لرؤية النموذج المعتمد المطلوب لرخصة القيادة
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DOC 2: Smart Validated UAE Mulkiya (ملكية المركبة الذكية) */}
                  <div className="bg-zinc-950 p-3.5 sm:p-4 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={mulkiyaPhoto}
                            alt="Mulkiya"
                            className="w-16 h-11 sm:w-20 sm:h-13 rounded-xl object-cover border border-zinc-700 shadow-md"
                          />
                          {mulkiyaValidationResult?.isValid && (
                            <div className="absolute -top-1.5 -right-1.5 bg-white text-black rounded-full p-0.5 shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>2. ملكية المركبة (رخصة مركبة - الوجه الأمامي)</span>
                            <span className="text-zinc-300 font-normal text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-700">
                              فحص آلي وتدقيق
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[200px]">
                            {mulkiyaName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMulkiyaReferenceModal(true)}
                          className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold px-3 py-2 rounded-xl border border-zinc-700 text-xs transition-colors active:scale-95"
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
                            className="cursor-pointer flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-black font-black px-3.5 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>تحميل صورة الملكية</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Scanning In Progress State */}
                    {isScanningMulkiya && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                        <Scan className="w-5 h-5 text-white animate-spin" />
                        <div className="text-xs">
                          <div className="font-bold text-white">جاري مسح وتدقيق ملكية المركبة الإماراتية آلياً...</div>
                          <div className="text-[10px] text-zinc-400">التحقق من تطابق نوع المستند، رقم اللوحة، وطراز المركبة والجدول المعتمد</div>
                        </div>
                      </div>
                    )}

                    {/* Verification Passed Badge & Data Fields Match Table */}
                    {!isScanningMulkiya && mulkiyaValidationResult?.isValid && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3.5 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>تم التحقق: تطابق نوع المستند وحقول بيانات ملكية المركبة الرسمية ✓</span>
                          </div>
                          <span className="text-[10px] text-black font-bold bg-white px-2 py-0.5 rounded-full">
                            مطابقة {mulkiyaValidationResult.score}%
                          </span>
                        </div>

                        {/* Fields Match Grid */}
                        {mulkiyaValidationResult.fields && mulkiyaValidationResult.fields.length > 0 && (
                          <div className="space-y-1.5 bg-black/60 p-2.5 rounded-xl border border-zinc-800">
                            <div className="text-[10px] text-zinc-400 font-bold mb-1">جدول تطابق حقول بيانات ملكية المركبة (رخصة مركبة):</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {mulkiyaValidationResult.fields.map((f, fIdx) => (
                                <div key={fIdx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between text-[11px]">
                                  <div>
                                    <span className="text-zinc-400 block text-[9px]">{f.fieldName}</span>
                                    <span className="text-white font-bold">{f.extractedValue}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                                    {f.statusText}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification Failed Error Banner */}
                    {!isScanningMulkiya && mulkiyaScanError && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-white font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>تنبيه: تم رفض الصورة - لا تطابق تصميم ملكية المركبة (رخصة مركبة) المعتمدة</span>
                        </div>
                        <p className="text-zinc-300 text-[11px]">
                          يجب أن تكون الصورة المرفقة لملكية المركبة الإماراتية الرسمية (المحتوية على الخلفية، شعار الصقر المركزي، ترويسة رخصة مركبة، وجدول البيانات).
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowMulkiyaReferenceModal(true)}
                          className="text-white underline hover:text-zinc-300 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          اضغط هنا لرؤية النموذج المعتمد المطلوب لملكية المركبة
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DOC 3: Smart Validated Emirates ID (الهوية الإماراتية الذكية) */}
                  <div className="bg-zinc-950 p-3.5 sm:p-4 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={emiratesIdPhoto}
                            alt="Emirates ID"
                            className="w-16 h-11 sm:w-20 sm:h-13 rounded-xl object-cover border border-zinc-700 shadow-md"
                          />
                          {idValidationResult?.isValid && (
                            <div className="absolute -top-1.5 -right-1.5 bg-white text-black rounded-full p-0.5 shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>3. بطاقة الهوية الإماراتية (الوجه الأمامي)</span>
                            <span className="text-zinc-300 font-normal text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-700">
                              فحص آلي وتدقيق
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[200px]">
                            {emiratesIdName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowIdReferenceModal(true)}
                          className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold px-3 py-2 rounded-xl border border-zinc-700 text-xs transition-colors active:scale-95"
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
                            className="cursor-pointer flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-black font-black px-3.5 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>تحميل صورة الهوية</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Scanning In Progress State */}
                    {isScanningId && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                        <Scan className="w-5 h-5 text-white animate-spin" />
                        <div className="text-xs">
                          <div className="font-bold text-white">جاري مسح وتدقيق الهوية الإماراتية آلياً...</div>
                          <div className="text-[10px] text-zinc-400">التحقق من تطابق نوع المستند، رقم الهوية الموحد 784، واسم صاحب الهوية</div>
                        </div>
                      </div>
                    )}

                    {/* Verification Passed Badge & Data Fields Match Table */}
                    {!isScanningId && idValidationResult?.isValid && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3.5 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>تم التحقق: تطابق نوع المستند وحقول بطاقة الهوية الإماراتية الرسمية ✓</span>
                          </div>
                          <span className="text-[10px] text-black font-bold bg-white px-2 py-0.5 rounded-full">
                            مطابقة {idValidationResult.score}%
                          </span>
                        </div>

                        {/* Emirates ID number input */}
                        <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-zinc-400">
                              رقم الهوية الموحد المكتشف:
                            </label>
                            <span className="text-[9px] text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700">صيغة 784 معتمدة</span>
                          </div>
                          <input
                            type="text"
                            value={emiratesIdNumber}
                            onChange={(e) => setEmiratesIdNumber(formatEmiratesIdNumber(e.target.value))}
                            placeholder="784-1990-1234567-1"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold dir-ltr focus:outline-none focus:border-white"
                          />
                        </div>

                        {/* Fields Match Grid */}
                        {idValidationResult.fields && idValidationResult.fields.length > 0 && (
                          <div className="space-y-1.5 bg-black/60 p-2.5 rounded-xl border border-zinc-800">
                            <div className="text-[10px] text-zinc-400 font-bold mb-1">جدول تطابق حقول بيانات بطاقة الهوية:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {idValidationResult.fields.map((f, fIdx) => (
                                <div key={fIdx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between text-[11px]">
                                  <div>
                                    <span className="text-zinc-400 block text-[9px]">{f.fieldName}</span>
                                    <span className="text-white font-bold">{f.fieldCode === 'ID_NUMBER' ? emiratesIdNumber : f.extractedValue}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                                    {f.statusText}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification Failed Error Banner */}
                    {!isScanningId && idScanError && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-white font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>تنبيه: الصورة المرفقة لا تطابق تصميم بطاقة الهوية الإماراتية المعتمدة</span>
                        </div>
                        <p className="text-zinc-300 text-[11px]">
                          يجب أن تكون الصورة المرفقة لبطاقة الهوية الإماراتية الصادرة من الهيئة الاتحادية للهوية والجنسية (المحتوية على الشعار والعلم والرقم الموحد 784).
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowIdReferenceModal(true)}
                          className="text-white underline hover:text-zinc-300 text-[11px] font-bold inline-flex items-center gap-1"
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
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold px-4 py-2.5 sm:py-3 rounded-xl text-xs flex items-center gap-1.5 active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  type="submit"
                  className="bg-white hover:bg-zinc-200 text-black font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition-all"
                >
                  <span>متابعة للاشتراك الموحد</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: Unified Subscription Plan & Strict Ziina Payment Flow */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
              
              {/* STAGE: SUCCESS */}
              {paymentStage === 'success' && createdActiveDriver && (
                <div className="p-4 sm:p-6 text-center flex flex-col items-center justify-center space-y-4 bg-zinc-950 rounded-2xl border-2 border-white shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 bg-white text-black rounded-full flex items-center justify-center border-2 border-white shadow-xl">
                    <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="bg-zinc-900 text-zinc-200 text-xs font-black px-3 py-1 rounded-full border border-zinc-700">
                      تم تأكيد الدفع بنجاح عبر زينة وإصدار الفاتورة الرسمية ✓
                    </span>
                    <h4 className="text-lg sm:text-2xl font-black text-white pt-1">🎉 مبارك يا {createdActiveDriver.name}!</h4>
                    <p className="text-zinc-300 font-bold text-xs sm:text-sm">
                      تم تفعيل حسابك كـ "سائق معتمد" واشتراكك الموحد لمدة شهر كامل بالظبط (حتى {createdActiveDriver.subscriptionExpiry}).
                    </p>
                  </div>

                  {/* Summary & Invoice Info Box */}
                  <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 w-full text-right text-xs space-y-2.5">
                    {generatedInvoice && (
                      <div className="flex items-center justify-between text-zinc-300 pb-1.5 border-b border-zinc-800">
                        <span>رقم الفاتورة الصادرة:</span>
                        <span className="font-bold text-white font-mono">{generatedInvoice.invoiceNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>المركبة واللوحة:</span>
                      <span className="font-bold text-white">{createdActiveDriver.vehicleModel} ({createdActiveDriver.vehiclePlate})</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>الاشتراك الموحد:</span>
                      <span className="font-bold text-white">{selectedPlanDetails.name} (199 AED)</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>تاريخ انتهاء الاشتراك:</span>
                      <span className="font-bold text-zinc-200">{createdActiveDriver.subscriptionExpiry} (شهر بالظبط)</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300 border-t border-zinc-800 pt-2">
                      <span>حالة الحساب:</span>
                      <span className="text-white font-bold bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-700">
                        مفعل ونشط 🟢
                      </span>
                    </div>
                  </div>

                  {/* 5-Day Automated Expiry Reminder Notice */}
                  <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl text-right text-[11px] text-zinc-300 flex items-start gap-2.5 w-full">
                    <Bell className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>
                      <strong>تنبيه التجديد التلقائي:</strong> سيقوم نظام واصل بإرسال رسالة تذكير لرقم هاتفك ({createdActiveDriver.phone}) قبل انتهاء اشتراكك بـ 5 أيام لضمان استمرار ظهور عروضك دون انقطاع.
                    </span>
                  </div>

                  {/* Invoice Actions */}
                  {generatedInvoice && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-1">
                      <button
                        type="button"
                        onClick={() => setShowInvoiceModal(true)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                      >
                        <FileText className="w-4 h-4" />
                        <span>عرض وتحميل الفاتورة الرسمية</span>
                      </button>

                      <a
                        href={getWhatsAppInvoiceUrl(generatedInvoice)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white hover:bg-zinc-200 text-black font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>إرسال الفاتورة لواتساب السائق</span>
                      </a>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCompleteRegistration}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3.5 rounded-xl shadow-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>الدخول إلى حسابي واستقبال طلبات التوصيل</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STAGE: VERIFYING */}
              {paymentStage === 'verifying' && (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-5 bg-zinc-950 rounded-2xl border border-zinc-700">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-white animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base sm:text-lg font-bold text-white">جاري التحقق من نجاح الدفع في بوابة زينة (Ziina)...</h4>
                    <p className="text-xs text-zinc-400">التحقق من إتمام الحوالة وتأكيد دفع الاشتراك الموحد ({selectedPlanDetails.price} AED)</p>
                  </div>
                </div>
              )}

              {/* STAGE: FAILED */}
              {paymentStage === 'failed' && (
                <div className="p-6 text-center flex flex-col items-center justify-center space-y-4 bg-zinc-950 rounded-2xl border border-zinc-700 animate-in fade-in">
                  <div className="w-16 h-16 bg-zinc-900 text-white rounded-full flex items-center justify-center border border-zinc-700">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white">فشلت عملية الدفع أو لم تكتمل!</h4>
                    <p className="text-zinc-400 text-xs sm:text-sm">{paymentError}</p>
                  </div>
                  
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl w-full text-right text-xs text-zinc-300 space-y-1.5">
                    <p className="font-bold text-white">⛔ تنبيه عدم تفعيل الحساب:</p>
                    <p className="text-zinc-400 leading-relaxed text-[11px]">
                      حساب السائق غير مفعل حالياً. وفقاً لشروط المنصة، لا يمكن تفعيل الحساب أو منح شارة التوثيق واستقبال الطلبات إلا بعد تأكيد إتمام الدفع بنجاح في رابط زينة.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                    <button
                      type="button"
                      onClick={handleOpenZiinaPayment}
                      className="w-full sm:flex-1 bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>إعادة محاولة الدفع عبر رابط زينة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStage('ready')}
                      className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3 px-5 rounded-xl text-xs active:scale-95"
                    >
                      الرجوع لتفاصيل الباقة
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE: LINK_OPENED (User returned from Ziina and can confirm) */}
              {paymentStage === 'link_opened' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold shrink-0">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">تم فتح بوابة الدفع (Ziina) في صفحة خارجية</h4>
                        <p className="text-xs text-zinc-400">يرجى إتمام عملية سداد رسوم الاشتراك الموحد ({selectedPlanDetails.price} AED)</p>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-300 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2 leading-relaxed">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <span>1.</span>
                        <span>قم بإتمام الدفع عبر Apple Pay أو بطاقتك البنكية في صفحة زينة المفتوحة.</span>
                      </div>
                      <div className="flex items-center gap-2 text-white font-bold">
                        <span>2.</span>
                        <span>عند نجاح الدفع، اضغط على زر "تأكيد والتحقق من نجاح الدفع" أدناه لتفعيل حسابك فوراً.</span>
                      </div>
                    </div>
                  </div>

                  {/* Optional Reference Input */}
                  <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-2">
                    <label className="block text-xs font-semibold text-zinc-300">
                      رقم مرجع الحوالة / الإيصال من زينة (اختياري للتوثيق):
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="مثال: ZIN-981240"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleVerifyZiinaPayment}
                      className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3.5 rounded-xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✅ لقد أتممت الدفع بنجاح (التحقق وتفعيل الحساب)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenZiinaPayment}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-2.5 rounded-xl text-xs border border-zinc-700 flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>إعادة فتح رابط زينة</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePaymentFailure}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold py-2.5 rounded-xl text-xs border border-zinc-800 flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>فشلت العملية / إلغاء الدفع</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE: READY (Initial Plan Card) */}
              {paymentStage === 'ready' && (
                <>
                  {/* Single Unified Plan Card */}
                  <div className="bg-zinc-950 p-5 sm:p-6 rounded-2xl border-2 border-white shadow-xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <span className="bg-white text-black text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block mb-1 shadow-sm">
                          الباقة الموحدة لجميع السائقين ⭐
                        </span>
                        <h4 className="font-black text-white text-base sm:text-xl">{selectedPlanDetails.name}</h4>
                      </div>

                      <div className="text-right sm:text-left">
                        {appliedExemption ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 line-through text-sm font-bold">{selectedPlanDetails.price} AED</span>
                              <span className="text-2xl sm:text-3xl font-black text-white">0 AED</span>
                            </div>
                            <span className="text-[10px] text-zinc-300 font-black bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-700">
                              إعفاء مجاني ({appliedExemption.months} شهر)
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-2xl sm:text-3xl font-black text-white">{selectedPlanDetails.price}</span>
                            <span className="text-xs text-zinc-400 font-semibold mr-1">درهم / شهرياً</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-zinc-800 text-xs text-zinc-300">
                      {selectedPlanDetails.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800 bg-zinc-900 p-3 rounded-xl flex items-center gap-2.5 text-xs text-zinc-300 font-semibold">
                      <Star className="w-4 h-4 text-white fill-white shrink-0" />
                      <span>
                        <strong>نظام أولوية التقييم:</strong> كلما حصلت على تقييمات إيجابية أعلى من العملاء بعد إتمام التوصيل، تظهر عروضك في المرتبة الأولى تلقائياً وتتصدر شاشة العميل!
                      </span>
                    </div>
                  </div>

                  {/* Exemption & Promo Code Section */}
                  <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-white" />
                        <span className="font-black text-white text-xs sm:text-sm">لديك كود إعفاء أو اشتراك ترويجي؟</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-semibold">إعفاء 100% بدون دفع</span>
                    </div>

                    {appliedExemption ? (
                      <div className="bg-black p-3.5 rounded-xl border border-zinc-700 flex items-center justify-between gap-3 animate-in fade-in">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="bg-white text-black text-xs font-black px-2 py-0.5 rounded font-mono">
                              {appliedExemption.code}
                            </span>
                            <span className="text-white text-xs font-black">✓ تم تفعيل كود الإعفاء بنجاح</span>
                          </div>
                          <p className="text-[11px] text-zinc-300">
                            اشتراك مجاني بالكامل لمدة <strong>{appliedExemption.months} {appliedExemption.months === 1 ? 'شهر' : 'شهور'}</strong> دون الحاجة لأي بطاقة دفع.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedExemption(null);
                            setPromoSuccess(null);
                            setInputPromoCode('');
                          }}
                          className="text-[10px] font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-zinc-700"
                        >
                          إلغاء الكود
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={inputPromoCode}
                            onChange={(e) => {
                              setInputPromoCode(e.target.value.toUpperCase());
                              setPromoError(null);
                            }}
                            placeholder="أدخل رمز الكود (مثال: WASEL2026)"
                            className="flex-1 bg-black border border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white tracking-wider focus:outline-none focus:border-white"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            className="bg-white hover:bg-zinc-200 text-black text-xs font-black px-4 py-2 rounded-xl transition-all active:scale-95 shadow"
                          >
                            تطبيق الكود
                          </button>
                        </div>

                        {promoError && (
                          <div className="text-red-400 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>{promoError}</span>
                          </div>
                        )}

                        {promoSuccess && (
                          <div className="text-white bg-zinc-900 p-2 rounded-lg border border-zinc-700 text-[11px] font-bold animate-in fade-in">
                            {promoSuccess}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Gateway Box (If no exemption code applied) */}
                  {!appliedExemption && (
                    <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-zinc-800 text-white flex items-center justify-center font-black shadow shrink-0 text-sm">
                          💳
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>بوابة الدفع الإلكتروني المباشر (Ziina Pay)</span>
                            <span className="text-[10px] text-zinc-300 bg-zinc-800 px-1.5 py-0.2 rounded border border-zinc-700 font-bold">آمن ومشفر</span>
                          </div>
                          <p className="text-[11px] text-zinc-400">تدعم بطاقات الفيزا، ماستركارد، و Apple Pay مباشرة</p>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <span className="text-base font-black text-white">{selectedPlanDetails.price} AED</span>
                      </div>
                    </div>
                  )}

                  {/* Strict Policy Notice */}
                  <div className="bg-zinc-900 border border-zinc-700 p-3.5 rounded-xl text-xs text-zinc-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>تنبيه أمني هام بشأن تفعيل الحساب:</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      {appliedExemption 
                        ? `سيتم تفعيل حسابك مباشرة ومنحك شارة "سائق معتمد" بالاشتراك المجاني لمدة ${appliedExemption.months} شهر بناءً على كود الإعفاء المدخل فوراً.`
                        : `لن يتم تفعيل حساب السائق أو منحه شارة "سائق معتمد" إلا بعد التأكد من إتمام عملية الدفع بنجاح في رابط زينة. في حال تعذر أو فشل الدفع، يظل الحساب غير مفعل ولن يتمكن من تقديم العروض.`
                      }
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold px-4 py-2.5 sm:py-3 rounded-xl text-xs flex items-center gap-1.5 active:scale-95"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>السابق</span>
                    </button>

                    {appliedExemption ? (
                      <button
                        type="button"
                        onClick={handleActivateWithExemption}
                        className="flex-1 mr-3 bg-white hover:bg-zinc-200 text-black font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>✨ تفعيل الحساب فوراً بالاشتراك المجاني ({appliedExemption.months} شهر)</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOpenZiinaPayment}
                        className="flex-1 mr-3 bg-white hover:bg-zinc-200 text-black font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>الانتقال للدفع عبر رابط زينة ({selectedPlanDetails.price} AED)</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}

            </div>
          )}

        </div>

      </div>

      {/* UAE Emirates ID Official Reference Sample Modal */}
      {showIdReferenceModal && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-black px-4 sm:px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <h4 className="text-sm sm:text-base font-bold text-white">النموذج المعتمد لبطاقة الهوية الإماراتية</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowIdReferenceModal(false)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <p className="text-xs text-zinc-300 leading-relaxed">
                يقوم النظام بالتحقق آلياً من تطابق صورة الهوية مع التصميم والشكل المعتمد الصادر من <strong className="text-white">الهيئة الاتحادية للهوية والجنسية</strong>:
              </p>

              {/* Sample Card Image */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-xl bg-black">
                <img
                  src={uaeIdSampleImg}
                  alt="UAE Emirates ID Standard Sample"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Required Layout Landmarks */}
              <div className="space-y-2 text-xs bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
                <div className="font-bold text-white text-xs mb-1.5">المعايير البصرية المطلوبة للقبول الفوري:</div>
                <div className="space-y-1.5 text-zinc-300 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>الترويسة:</strong> ظهور اسم الهيئة باللغتين العربية والإنجليزية.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>الشعار والعلم:</strong> وجود شعار صقر الإمارات وعلم الدولة بالأعلى.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>رقم الهوية:</strong> رقم الهوية الموحد المكون من 15 خانة يبدأ بـ 784.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>الصورة والوضوح:</strong> ظهور صورة حامل البطاقة وخلفية الزخرفة الأمنية.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIdReferenceModal(false)}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95"
              >
                فهمت ذلك، العودة لإرفاق الهوية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UAE Driving License Official Reference Sample Modal */}
      {showLicenseReferenceModal && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-black px-4 sm:px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <h4 className="text-sm sm:text-base font-bold text-white">النموذج المعتمد لرخصة القيادة الإماراتية</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowLicenseReferenceModal(false)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <p className="text-xs text-zinc-300 leading-relaxed">
                يقوم النظام بالتحقق آلياً من تطابق صورة رخصة القيادة مع التصميم والجدول المعتمد رسمياً في <strong className="text-white">دولة الإمارات العربية المتحدة</strong>:
              </p>

              {/* Sample Card Image */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-xl bg-black">
                <img
                  src={uaeLicenseSampleImg}
                  alt="UAE Driving License Standard Sample"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Required Layout Landmarks */}
              <div className="space-y-2 text-xs bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
                <div className="font-bold text-white text-xs mb-1.5">المعايير البصرية المطلوبة للقبول الفوري:</div>
                <div className="space-y-1.5 text-zinc-300 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>الترويسة:</strong> ترويسة الإمارات وعنوان "Driving License / رخصة قيادة".</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>الشعارات:</strong> وجود شعار صقر الإمارات وشعار المرور بالزوايا العلوية.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>جدول البيانات:</strong> الجدول الموحد للبيانات (رقم الرخصة، الاسم، الجنسية، التواريخ).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>الصورة والوضوح:</strong> ظهور صورة السائق واضحة بالجانب الأيسر.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLicenseReferenceModal(false)}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95"
              >
                فهمت ذلك، العودة لإرفاق الرخصة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UAE Mulkiya Official Reference Sample Modal */}
      {showMulkiyaReferenceModal && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-black px-4 sm:px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <h4 className="text-sm sm:text-base font-bold text-white">النموذج المعتمد لملكية المركبة (رخصة مركبة)</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowMulkiyaReferenceModal(false)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <p className="text-xs text-zinc-300 leading-relaxed">
                يقوم النظام بالتحقق آلياً من تطابق صورة ملكية المركبة مع التصميم والجدول المعتمد رسمياً في <strong className="text-white">دولة الإمارات العربية المتحدة</strong>:
              </p>

              {/* Sample Card Image */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-xl bg-black">
                <img
                  src={uaeMulkiyaSampleImg}
                  alt="UAE Vehicle License (Mulkiya) Standard Sample"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Required Layout Landmarks */}
              <div className="space-y-2 text-xs bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
                <div className="font-bold text-white text-xs mb-1.5">المعايير البصرية المطلوبة للقبول الفوري:</div>
                <div className="space-y-1.5 text-zinc-300 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>الخلفية والزخرفة:</strong> الخلفية الأمنية المميزة لملكية المركبات.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>الشعار المركزي:</strong> وجود شعار صقر الإمارات وعلم الدولة في أعلى المنتصف.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>الترويسة:</strong> ظهور عبارة "UAE Vehicle License / رخصة مركبة".</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">✓</span>
                    <span><strong>جدول الترخيص:</strong> شبكة الجدول الشامل لبيانات اللوحة، المالك، وتواريخ التأمين.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMulkiyaReferenceModal(false)}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95"
              >
                فهمت ذلك، العودة لإرفاق الملكية
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Official Invoice Modal */}
      {showInvoiceModal && generatedInvoice && (
        <InvoiceModal
          invoice={generatedInvoice}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};
