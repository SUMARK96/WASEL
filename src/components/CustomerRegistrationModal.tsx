import React, { useState } from 'react';
import type { CustomerProfile, Emirate } from '../types';
import { UAE_EMIRATES } from '../data/mockData';
import { X, User, Phone, Mail, Lock, MapPin, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface CustomerRegistrationModalProps {
  onClose: () => void;
  onRegisterSuccess: (customer: CustomerProfile) => void;
  existingCustomers: CustomerProfile[];
}

export const CustomerRegistrationModal: React.FC<CustomerRegistrationModalProps> = ({
  onClose,
  onRegisterSuccess,
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
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-zinc-950 border-2 border-white rounded-3xl max-w-xl w-full p-5 sm:p-8 text-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black mx-auto shadow-lg">
            <User className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            إنشاء حساب عميل جديد
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            سجل بياناتك للبدء بنشر طلبات التوصيل واستقبال عروض الأسعار من السائقين المعتمدين مجاناً
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 bg-zinc-900 border border-zinc-700 text-zinc-200 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in shake">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-white" />
              <span>الاسم الكامل:</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد راشد المنصوري"
              className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Emirate Selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>الإمارة التي تقيم بها:</span>
            </label>
            <select
              value={emirate}
              onChange={(e) => setEmirate(e.target.value as Emirate)}
              className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
            >
              {UAE_EMIRATES.map(em => (
                <option key={em} value={em}>{em}</option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>رقم الهاتف:</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 0501234567"
              className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono dir-ltr text-right"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-white" />
              <span>البريد الإلكتروني:</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors dir-ltr text-right"
            />
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
                placeholder="••••••••"
                className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors dir-ltr text-right pl-10"
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

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 px-6 rounded-2xl shadow-xl transition-all text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>{isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب عميل'}</span>
            </button>
          </div>

        </form>

        {/* Footer Note */}
        <div className="mt-5 pt-4 border-t border-zinc-900 text-center text-[11px] text-zinc-500">
          بالتسجيل فإنك توافق على شروط وسياسات منصة واصل للتوصيل المباشر بين الإمارات
        </div>

      </div>
    </div>
  );
};
