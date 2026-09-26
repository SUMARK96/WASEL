import React, { useState } from 'react';
import type { CustomerProfile } from '../types';
import { LogIn, ArrowRight, Mail, Lock, AlertCircle, UserPlus, Eye, EyeOff } from 'lucide-react';

interface CustomerLoginViewProps {
  customers: CustomerProfile[];
  onLoginSuccess: (customer: CustomerProfile) => void;
  onGoToRegister: () => void;
  onBackToPortal: () => void;
}

export const CustomerLoginView: React.FC<CustomerLoginViewProps> = ({
  customers,
  onLoginSuccess,
  onGoToRegister,
  onBackToPortal
}) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = emailOrPhone.trim().toLowerCase();
    const cleanPhoneDigits = cleanInput.replace(/[^0-9]/g, '');
    const cleanPass = password.trim();

    if (!cleanInput || !cleanPass) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Find registered customer by email or phone
      const found = customers.find(c => {
        const matchEmail = c.email.toLowerCase() === cleanInput;
        const matchPhone = cleanPhoneDigits.length > 5 && c.phone.replace(/[^0-9]/g, '').includes(cleanPhoneDigits);
        return matchEmail || matchPhone;
      });

      if (!found) {
        setErrorMessage('❌ هذا الحساب غير مسجل مسبقاً. يمكنك إنشاء حساب عميل جديد خلال لحظات.');
        return;
      }

      // Check password
      const expectedPassword = found.password || '123456';
      if (cleanPass !== expectedPassword) {
        setErrorMessage('❌ كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مرة أخرى.');
        return;
      }

      onLoginSuccess(found);
    }, 350);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-4 sm:py-10 max-w-xl mx-auto w-full px-2 sm:px-4">
      
      {/* Back Button */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={onBackToPortal}
          className="flex items-center gap-2 bg-white hover:bg-[#F5F9FC] text-[#142F52] hover:text-[#159B7A] px-3.5 py-2 sm:py-2.5 rounded-2xl border border-[#E5EDF3] text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع لبوابة العملاء</span>
        </button>

        <span className="text-xs text-[#159B7A] font-bold bg-[#EAF6F1] px-3 py-1 rounded-full border border-[#159B7A]/20">
          تسجيل دخول العميل
        </span>
      </div>

      <div className="bg-white border border-[#E5EDF3] rounded-3xl p-5 sm:p-8 shadow-sm space-y-5 relative overflow-hidden">
        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-black mx-auto shadow-xs">
            <LogIn className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#142F52]">تسجيل الدخول إلى حساب العميل</h2>
          <p className="text-[#64748B] text-xs">أدخل بريدك الإلكتروني أو رقم هاتفك وكلمة المرور للانتقال إلى لوحة طلباتك</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-[#142F52] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#159B7A]" />
              <span>البريد الإلكتروني أو رقم الهاتف:</span>
            </label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="أدخل البريد الإلكتروني أو رقم الهاتف المسجل"
              className="w-full bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] focus:bg-white rounded-xl px-4 py-3 text-sm text-[#142F52] placeholder-[#94A3B8] focus:outline-none transition-colors dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#142F52] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#159B7A]" />
              <span>كلمة المرور:</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] focus:bg-white rounded-xl px-4 py-3 text-sm text-[#142F52] placeholder-[#94A3B8] focus:outline-none transition-colors dir-ltr text-right pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#142F52] p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'جاري التحقق والدخول...' : 'دخول لحساب العميل'}</span>
          </button>
        </form>

        {/* Switch to Register */}
        <div className="pt-4 border-t border-[#E5EDF3] text-center relative z-10 space-y-2">
          <p className="text-xs text-[#64748B]">ليس لديك حساب عميل حتى الآن؟</p>
          <button
            type="button"
            onClick={onGoToRegister}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#159B7A] hover:text-[#108466] transition-colors bg-[#EAF6F1] hover:bg-[#DEF0E8] px-4 py-2 rounded-xl border border-[#159B7A]/20 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إنشاء حساب عميل جديد مجاناً</span>
          </button>
        </div>

      </div>

    </div>
  );
};
