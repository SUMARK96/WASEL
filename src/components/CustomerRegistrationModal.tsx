import React, { useState } from 'react';
import type { CustomerProfile, Emirate } from '../types';
import { UAE_EMIRATES } from '../data/mockData';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ChevronDown,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CustomerRegistrationModalProps {
  onClose: () => void;
  onRegisterSuccess: (customer: CustomerProfile) => void;
  onGoToLogin?: () => void;
  existingCustomers: CustomerProfile[];
}

export const CustomerRegistrationModal: React.FC<CustomerRegistrationModalProps> = ({
  onClose,
  onRegisterSuccess,
  onGoToLogin,
  existingCustomers
}) => {
  const [name, setName] = useState('');
  const [emirate, setEmirate] = useState<Emirate>('دبي');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Validations
    if (!cleanName) {
      setErrorMessage('يرجى إدخال الاسم الكامل.');
      return;
    }

    if (cleanName.length < 3) {
      setErrorMessage('يرجى إدخال اسم صحيح لا يقل عن 3 أحرف.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('يرجى إدخال رقم هاتف إماراتي صحيح (مثال: 0501234567).');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 5) {
      setErrorMessage('يرجى إدخال كلمة سر لا تقل عن 5 خانات.');
      return;
    }

    // Check if email or phone already registered
    const emailExists = existingCustomers.some(c => c.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      setErrorMessage('البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة.');
      return;
    }

    const phoneExists = existingCustomers.some(c => c.phone.replace(/[^0-9]/g, '') === cleanPhone);
    if (phoneExists) {
      setErrorMessage('رقم الهاتف مسجل مسبقاً، يمكنك تسجيل الدخول به مباشرة.');
      return;
    }

    setIsLoading(true);

    const newCustomer: CustomerProfile = {
      id: `cust-${Date.now()}`,
      name: cleanName,
      emirate,
      phone: cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`,
      email: cleanEmail,
      password: cleanPassword,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess(newCustomer);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      
      {/* Modal Card Box */}
      <div className="bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-black flex justify-center">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {/* Modal Top Header */}
        <div className="bg-black px-5 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-md">
              <User className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">إنشاء حساب عميل جديد</h3>
                <span className="text-[10px] font-bold text-black bg-white px-2 py-0.5 rounded-full">
                  مجاني 100% 🎁
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400">سجل بياناتك وانشر أول طلب توصيل خلال لحظات</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain touch-pan-y">
          
          {/* Quick Benefits Alert */}
          <div className="bg-black p-3 sm:p-3.5 rounded-2xl border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white shrink-0" />
              <span>نشر طلبات التوصيل مجاناً واستقبال عروض السائقين فوراً</span>
            </div>
            <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-lg font-bold shrink-0">عمولة 0%</span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-zinc-900 border border-zinc-700 text-zinc-200 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
              <span className="font-bold">{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Basic Profile Details */}
          <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-3.5">
            <div className="text-[11px] font-bold text-zinc-400 pb-1 border-b border-zinc-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-white" />
              <span>1. البيانات الأساسية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-white" />
                  <span>الاسم الكامل:</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: راشد المنصوري"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Emirate */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  <span>الإمارة:</span>
                </label>
                <div className="relative">
                  <select
                    value={emirate}
                    onChange={(e) => setEmirate(e.target.value as Emirate)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none transition-colors appearance-none font-bold"
                  >
                    {UAE_EMIRATES.map(em => (
                      <option key={em} value={em}>إمارة {em}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Login Credentials */}
          <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-3.5">
            <div className="text-[11px] font-bold text-zinc-400 pb-1 border-b border-zinc-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>2. بيانات التواصل والدخول</span>
            </div>

            <div className="space-y-3">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-white" />
                  <span>رقم الهاتف (للتواصل مع السائقين):</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute right-3.5 text-xs text-zinc-400 font-mono font-bold select-none dir-ltr">
                    +971
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0501234567"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl pr-14 pl-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-white" />
                  <span>البريد الإلكتروني:</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-white" />
                  <span>كلمة السر:</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="5 خانات على الأقل"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors dir-ltr text-right pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Area */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3.5 sm:py-4 px-6 rounded-2xl shadow-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <span>جاري إنشاء الحساب...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  <span>تأكيد وإنشاء حساب العميل</span>
                </>
              )}
            </button>

            {/* Switch to Login Link */}
            {onGoToLogin && (
              <div className="text-center pt-2">
                <p className="text-xs text-zinc-400">
                  لديك حساب عميل مسبقاً؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onGoToLogin();
                    }}
                    className="text-white hover:underline font-extrabold mr-1 active:scale-95 inline-flex items-center gap-1"
                  >
                    <span>تسجيل الدخول</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Footer Security Note */}
          <div className="pt-2 pb-1 text-center text-[10px] sm:text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            <span>بياناتك محمية ومؤمنة بالكامل على منصة واصل الإمارات</span>
          </div>

        </form>

      </div>
    </div>
  );
};
