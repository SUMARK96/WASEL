import React, { useState } from 'react';
import type { CustomerProfile, DeliveryRequest, Emirate } from '../types';
import { UAE_EMIRATES } from '../data/mockData';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  LogOut, 
  Edit3, 
  Check, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

interface CustomerProfileModalProps {
  customer: CustomerProfile;
  requests?: DeliveryRequest[];
  onClose: () => void;
  onUpdateCustomer?: (updatedCustomer: CustomerProfile) => void;
  onLogout?: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customer,
  requests = [],
  onClose,
  onUpdateCustomer,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email);
  const [emirate, setEmirate] = useState<Emirate>(customer.emirate);
  const [password, setPassword] = useState(customer.password || '123456');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute stats for customer requests
  const customerRequests = requests.filter(
    r => r.customerPhone === customer.phone || r.customerName === customer.name
  );
  const openRequestsCount = customerRequests.filter(r => r.status === 'open').length;
  const assignedRequestsCount = customerRequests.filter(r => r.status === 'assigned' || r.status === 'delivered').length;
  const totalOffersReceived = customerRequests.reduce((acc, r) => acc + (r.offers ? r.offers.length : 0), 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage('يرجى كتابة الاسم');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    const updated: CustomerProfile = {
      ...customer,
      name: cleanName,
      phone: cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`,
      email: cleanEmail || customer.email,
      emirate,
      password: password.trim() || customer.password
    };

    if (onUpdateCustomer) {
      onUpdateCustomer(updated);
    }

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-black flex justify-center">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {/* Top Banner Header */}
        <div className="relative bg-zinc-900 h-24 sm:h-28 px-5 sm:px-6 pt-5 sm:pt-6 flex items-start justify-between shrink-0 border-b border-zinc-800">
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-zinc-700 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>حساب عميل معتمد</span>
          </div>
        </div>

        {/* Main Body */}
        <div className="px-5 sm:px-6 pb-6 relative -mt-10 sm:-mt-12 overflow-y-auto overscroll-contain space-y-4">
          
          {/* Avatar and Main Header */}
          <div className="flex items-end justify-between">
            <div className="relative">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white text-black border-4 border-zinc-950 shadow-xl flex items-center justify-center font-black text-2xl">
                {customer.name.charAt(0)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 text-xs font-bold transition-all active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل البيانات</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl border border-zinc-700 text-xs font-bold transition-all active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>إلغاء</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="bg-zinc-900 border border-white text-white p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-white" />
              <span>تم حفظ التعديلات بنجاح</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-zinc-900 border border-zinc-700 text-zinc-200 p-3 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-white" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isEditing ? (
            /* View Mode */
            <div className="space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">{customer.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>إمارة {customer.emirate}</span>
                  <span>•</span>
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>انضم في {customer.joinedDate || '2026'}</span>
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-black p-3 rounded-2xl border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400 font-bold mb-0.5">الطلبات الكلية</div>
                  <div className="text-base font-black text-white">{customerRequests.length || 0}</div>
                </div>
                <div className="bg-black p-3 rounded-2xl border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400 font-bold mb-0.5">طلبات جارية</div>
                  <div className="text-base font-black text-white">{openRequestsCount || 0}</div>
                </div>
                <div className="bg-black p-3 rounded-2xl border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400 font-bold mb-0.5">مكتملة / مقبولة</div>
                  <div className="text-base font-black text-white">{assignedRequestsCount || 0}</div>
                </div>
                <div className="bg-black p-3 rounded-2xl border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400 font-bold mb-0.5">عروض مستلمة</div>
                  <div className="text-base font-black text-white">{totalOffersReceived || 0}</div>
                </div>
              </div>

              {/* Contact Info Details */}
              <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-3 text-xs">
                <div className="text-[11px] font-bold text-zinc-400 pb-1 border-b border-zinc-900">بيانات الحساب الشخصي:</div>
                
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white" />
                    <span>رقم الهاتف:</span>
                  </span>
                  <span className="font-mono font-bold text-white dir-ltr">{customer.phone}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white" />
                    <span>البريد الإلكتروني:</span>
                  </span>
                  <span className="font-mono text-white dir-ltr">{customer.email}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white" />
                    <span>الإمارة:</span>
                  </span>
                  <span className="font-bold text-white">{customer.emirate}</span>
                </div>
              </div>

              {/* Logout Button */}
              {onLogout && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white py-3 px-4 rounded-2xl border border-zinc-800 text-xs font-bold transition-all active:scale-95 shadow-md"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج من الحساب</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSave} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">الإمارة:</label>
                <select
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value as Emirate)}
                  className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                >
                  {UAE_EMIRATES.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">رقم الهاتف:</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none font-mono dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">كلمة المرور:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-zinc-700 focus:border-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none dir-ltr text-right"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-3 px-4 rounded-xl text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-3 px-4 rounded-xl text-xs font-bold border border-zinc-700"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
