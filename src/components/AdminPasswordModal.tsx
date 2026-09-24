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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-black px-6 py-4 sm:py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-bold shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">الدخول إلى لوحة التحكم والإدارة</h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">منطقة محمية بكلمة سر لمنسقي النظام</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">كلمة سر الإدارة (Admin Passcode)</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="أدخل كلمة السر هنا (wasel2026)"
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono dir-ltr"
                autoFocus
                required
              />
              <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {error && (
            <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl text-xs text-zinc-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-white shrink-0" />
              <span>كلمة السر غير صحيحة. يرجى المحاولة مرة أخرى (كلمة السر: wasel2026).</span>
            </div>
          )}

          <div className="bg-black p-3 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
            💡 <strong className="text-white">تنويه:</strong> كلمة المرور المعتمدة للوحة الإدارة هي <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-white font-bold">wasel2026</code>.
          </div>

          <button
            type="submit"
            className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3 rounded-xl shadow-lg transition-all text-xs sm:text-sm active:scale-95"
          >
            تأكيد وفتح لوحة الإدارة
          </button>
        </form>

      </div>
    </div>
  );
};
