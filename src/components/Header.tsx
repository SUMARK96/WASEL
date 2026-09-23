import React from 'react';
import type { UserRole, DriverProfile } from '../types';
import { Truck, UserCheck, Plus, Sparkles, ShieldCheck, UserPlus } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNewRequest: () => void;
  onOpenSubscription: () => void;
  onOpenDriverRegister: () => void;
  currentDriver: DriverProfile;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenNewRequest,
  onOpenSubscription,
  onOpenDriverRegister,
  currentDriver
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onRoleChange('customer')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-2xl">
              <Truck className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-white">واصـل</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                  WASEL UAE
                </span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-bold tracking-wide mt-0.5">أمان . سرعة . إحترافية</p>
            </div>
          </div>

          {/* Main User Navigation Pills (Customer / Driver Only) */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <button
              onClick={() => onRoleChange('customer')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                currentRole === 'customer'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>حساب العميل</span>
            </button>

            <button
              onClick={() => onRoleChange('driver')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                currentRole === 'driver'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>حساب السائق</span>
            </button>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Register as Driver CTA */}
            <button
              onClick={onOpenDriverRegister}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold px-3 sm:px-4 py-2.5 rounded-xl border border-amber-500/30 text-xs transition-all shadow-md shadow-amber-500/5 hover:border-amber-500/60"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">تسجيل سائق جديد</span>
              <span className="sm:hidden">تسجيل سائق</span>
            </button>

            {currentRole === 'customer' && (
              <button
                onClick={onOpenNewRequest}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                <span className="hidden md:inline">نشر طلب توصيل جديد</span>
                <span className="md:hidden">طلب جديد</span>
              </button>
            )}

            {currentRole === 'driver' && (
              <button
                onClick={onOpenSubscription}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all shadow-md ${
                  currentDriver.subscriptionStatus === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {currentDriver.subscriptionStatus === 'active'
                    ? `اشتراك (${currentDriver.subscriptionPlan.toUpperCase()})`
                    : 'تجديد الاشتراك'}
                </span>
                <span className="sm:hidden">الاشتراك</span>
              </button>
            )}

            {currentRole === 'admin' && (
              <div className="flex items-center gap-2 text-xs bg-slate-800 text-amber-400 px-3 py-1.5 rounded-xl border border-slate-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">لوحة الإدارة</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

