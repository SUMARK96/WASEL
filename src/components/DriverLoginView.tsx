import React, { useState } from 'react';
import type { DriverProfile } from '../types';
import { LogIn, ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';

interface DriverLoginViewProps {
  drivers: DriverProfile[];
  onLoginSuccess: (driver: DriverProfile) => void;
  onGoToRegister: () => void;
  onBackToPortal: () => void;
}

export const DriverLoginView: React.FC<DriverLoginViewProps> = ({
  drivers,
  onLoginSuccess,
  onGoToRegister,
  onBackToPortal
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Strict check: find registered driver by email or phone
      const found = drivers.find(
        d => d.email.toLowerCase() === cleanEmail || d.phone.replace(/[^0-9]/g, '') === cleanEmail.replace(/[^0-9]/g, '')
      );

      if (!found) {
        setErrorMessage('❌ هذا الحساب غير مسجل مسبقاً في المنصة. يرجى التسجيل كسائق جديد وتفعيل الاشتراك.');
        return;
      }

      // Check password
      const expectedPassword = found.password || '123456';
      if (cleanPass !== expectedPassword) {
        setErrorMessage('❌ كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مرة أخرى.');
        return;
      }

      onLoginSuccess(found);
    }, 400);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-4 sm:py-10 max-w-xl mx-auto w-full px-2 sm:px-4">
      
      {/* Back Button */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={onBackToPortal}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3.5 py-2 sm:py-2.5 rounded-2xl border border-zinc-800 text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع لبوابة السائقين</span>
        </button>

        <span className="text-xs text-white font-bold bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700">
          تسجيل دخول السائق
        </span>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white text-black flex items-center justify-center font-black mx-auto shadow-lg">
            <LogIn className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">تسجيل الدخول إلى حساب السائق</h2>
          <p className="text-zinc-400 text-xs">أدخل بياناتك للانتقال إلى واجهة متابعة وتقديم العروض للعملاء</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-zinc-900 border border-zinc-700 text-zinc-200 p-3 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-white" />
              <span>البريد الإلكتروني أو رقم الهاتف</span>
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="مثال: m.saeed@wasel.ae أو 0501234567"
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white font-medium transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>كلمة المرور</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white font-medium transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3.5 px-6 rounded-2xl shadow-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isLoading ? (
              <span>جاري التحقق والدخول...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول ومتابعة الطلبات</span>
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center pt-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-400">
            ليس لديك حساب سائق بعد؟{' '}
            <button
              onClick={onGoToRegister}
              className="text-white hover:underline font-extrabold underline-offset-4 mr-1 active:scale-95"
            >
              سجل الآن وادفع الاشتراك
            </button>
          </p>
        </div>

      </div>

    </div>
  );
};
