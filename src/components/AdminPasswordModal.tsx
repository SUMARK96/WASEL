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

  // Admin passcode
  const CORRECT_PASSWORD = 'admin123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5EDF3] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#F5F9FC] px-6 py-4 sm:py-5 border-b border-[#E5EDF3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-bold shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#142F52]">الدخول إلى لوحة التحكم والإدارة</h3>
              <p className="text-[11px] sm:text-xs text-[#64748B]">منطقة محمية بكلمة سر لمنسقي النظام</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142F52] mb-1">كلمة سر الإدارة (Admin Passcode)</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="أدخل كلمة المرور"
                className="w-full bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm text-[#142F52] placeholder-[#94A3B8] focus:outline-none font-mono dir-ltr"
                autoFocus
                required
              />
              <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>كلمة السر غير صحيحة. يرجى إعادة المحاولة.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm active:scale-95 cursor-pointer"
          >
            تأكيد وفتح لوحة الإدارة
          </button>
        </form>

      </div>
    </div>
  );
};
