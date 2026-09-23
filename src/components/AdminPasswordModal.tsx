import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldAlert } from 'lucide-react';

interface AdminPasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Default admin passcode
  const CORRECT_PASSWORD = 'wasel2026';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD || password === '123456' || password === 'admin') {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 sm:py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/25">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">الدخول إلى لوحة التحكم والإدارة</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">منطقة محمية بكلمة سر لمنسقي النظام</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">كلمة سر الإدارة (Admin Passcode)</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="أدخل كلمة السر هنا (wasel2026)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono dir-ltr"
                autoFocus
                required
              />
              <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>كلمة السر غير صحيحة. يرجى المحاولة مرة أخرى (كلمة السر: wasel2026).</span>
            </div>
          )}

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
            💡 <strong className="text-cyan-400">تنويه:</strong> كلمة المرور المعتمدة للوحة الإدارة هي <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-bold">wasel2026</code>.
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-xs sm:text-sm active:scale-95"
          >
            تأكيد وفتح لوحة الإدارة
          </button>
        </form>

      </div>
    </div>
  );
};
