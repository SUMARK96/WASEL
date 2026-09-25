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
  ChevronDown
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

    if (!cleanName) {
      setErrorMessage('يرجى إدخال الاسم الكامل.');
      return;
    }

    if (cleanName.length < 3) {
      setErrorMessage('يرجى إدخال اسم صحيح لا يقل عن 3 أحرف.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('يرجى إدخال رقم هاتف صحيح (مثال: 0501234567).');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 5) {
      setErrorMessage('كلمة المرور يجب ألا تقل عن 5 خانات.');
      return;
    }

    const emailExists = existingCustomers.some(c => c.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      setErrorMessage('البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول.');
      return;
    }

    const phoneExists = existingCustomers.some(c => c.phone.replace(/[^0-9]/g, '') === cleanPhone);
    if (phoneExists) {
      setErrorMessage('رقم الهاتف مسجل مسبقاً، يمكنك تسجيل الدخول.');
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      {/* Compact Dialog Box */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-5 sm:p-7 text-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black shadow-md">
              <User className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">إنشاء حساب عميل جديد</h2>
              <p className="text-[11px] text-zinc-400">حساب مجاني بالكامل لنشر طلبات التوصيل</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors active:scale-95"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 bg-zinc-900 border border-zinc-700 text-zinc-200 p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Row 1: Name and Emirate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-white" />
                <span>الاسم الكامل:</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد راشد"
                className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>الإمارة:</span>
              </label>
              <div className="relative">
                <select
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value as Emirate)}
                  className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors appearance-none font-bold"
                >
                  {UAE_EMIRATES.map(em => (
                    <option key={em} value={em}>إمارة {em}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>رقم الهاتف:</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute right-3 text-xs text-zinc-400 font-mono font-bold select-none dir-ltr">
                +971
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0501234567"
                className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl pr-14 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono dir-ltr text-right"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-white" />
              <span>البريد الإلكتروني:</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors dir-ltr text-right"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>كلمة المرور:</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors dir-ltr text-right pl-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action Buttons: Confirm and Cancel */}
          <div className="pt-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-2.5 px-4 rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>تأكيد وإنشاء الحساب</span>
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-2.5 px-4 rounded-xl border border-zinc-700 transition-colors text-xs active:scale-95"
            >
              إلغاء
            </button>
          </div>

          {/* Switch to Login */}
          {onGoToLogin && (
            <div className="text-center pt-2 border-t border-zinc-900">
              <p className="text-[11px] text-zinc-400">
                لديك حساب عميل مسبقاً؟{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToLogin();
                  }}
                  className="text-white hover:underline font-extrabold mr-1 active:scale-95"
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
