import React, { useState } from 'react';
import type { DriverProfile } from '../types';
import { LogIn, ArrowRight, Mail, Lock, AlertCircle, UserCheck } from 'lucide-react';

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
      // Find driver by email or phone or match existing
      const found = drivers.find(
        d => d.email.toLowerCase() === cleanEmail || d.phone.includes(cleanEmail)
      );

      if (found) {
        if (found.password && found.password !== cleanPass && cleanPass !== '123456') {
          setErrorMessage('كلمة المرور غير صحيحة. كلمة المرور الافتراضية هي 123456');
          return;
        }
        onLoginSuccess(found);
      } else {
        const firstDriver = drivers[0];
        if (firstDriver) {
          onLoginSuccess({
            ...firstDriver,
            email: cleanEmail,
            name: cleanEmail.split('@')[0] || firstDriver.name
          });
        } else {
          setErrorMessage('لم يتم العثور على حساب سائق بهذا البريد.');
        }
      }
    }, 600);
  };

  const handleQuickLogin = (driver: DriverProfile) => {
    setEmail(driver.email);
    setPassword(driver.password || '123456');
    onLoginSuccess(driver);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-4 sm:py-10 max-w-xl mx-auto w-full px-2 sm:px-4">
      
      {/* Back Button */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={onBackToPortal}
          className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-2 sm:py-2.5 rounded-2xl border border-slate-800 text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع لبوابة السائقين</span>
        </button>

        <span className="text-xs text-teal-300 font-bold bg-teal-500/15 px-3 py-1 rounded-full border border-teal-500/30">
          تسجيل دخول السائق
        </span>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full filter blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-black mx-auto shadow-lg shadow-teal-500/25">
            <LogIn className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">تسجيل الدخول إلى حساب السائق</h2>
          <p className="text-slate-400 text-xs">أدخل بياناتك للانتقال إلى واجهة متابعة وتقديم العروض للعملاء</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-400" />
              <span>البريد الإلكتروني أو رقم الهاتف</span>
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="مثال: m.saeed@wasel.ae"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 font-medium transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>كلمة المرور</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 font-medium transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-teal-600/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
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

        {/* Quick Demo Accounts Selection */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>حسابات تجريبية سريعة للسائقين المسجلين:</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {drivers.slice(0, 4).map((drv) => (
              <button
                key={drv.id}
                type="button"
                onClick={() => handleQuickLogin(drv)}
                className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 p-2.5 rounded-xl text-right transition-all flex items-center gap-2.5 group active:scale-95"
              >
                <img
                  src={drv.avatar}
                  alt={drv.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                />
                <div className="truncate flex-1">
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{drv.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{drv.emirate} • {drv.vehicleModel.split(' ')[0]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center pt-2 border-t border-slate-800/60">
          <p className="text-xs text-slate-400">
            ليس لديك حساب سائق بعد؟{' '}
            <button
              onClick={onGoToRegister}
              className="text-cyan-400 hover:text-cyan-300 font-extrabold underline underline-offset-4 mr-1 active:scale-95"
            >
              سجل الآن وادفع الاشتراك
            </button>
          </p>
        </div>

      </div>

    </div>
  );
};
