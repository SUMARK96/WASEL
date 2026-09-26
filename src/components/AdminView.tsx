import React, { useState } from 'react';
import type { DriverProfile, DeliveryRequest, SubscriptionInvoice, ExemptionCode } from '../types';
import { 
  createSubscriptionInvoice, 
  getWhatsAppReminderUrl,
  getWhatsAppExemptionReminderUrl,
  getWhatsAppSuspendedUrl,
  checkDriverSubscriptionStatus
} from '../utils/subscriptionUtils';
import { InvoiceModal } from './InvoiceModal';
import { EmirateBadge } from './EmirateBadge';
import { UNIFIED_SUBSCRIPTION_PLAN, UAE_EMIRATES } from '../data/mockData';
import { 
  Package, 
  DollarSign, 
  Truck,
  FileText,
  Bell,
  Share2,
  Edit2,
  Check,
  X,
  Ticket,
  Plus,
  Trash2,
  Copy,
  Users,
  Calendar,
  ShieldCheck,
  Filter,
  MapPin,
  Power,
  PowerOff,
  AlertTriangle
} from 'lucide-react';

interface AdminViewProps {
  drivers: DriverProfile[];
  requests: DeliveryRequest[];
  onToggleVerifyDriver: (driverId: string) => void;
  onDeleteDriver?: (driverId: string) => void;
  onToggleDriverStatus?: (driverId: string, newStatus: 'active' | 'suspended') => void;
  subscriptionPrice?: number;
  onUpdateSubscriptionPrice?: (newPrice: number) => void;
  exemptionCodes?: ExemptionCode[];
  onCreateExemptionCode?: (code: Omit<ExemptionCode, 'id' | 'usedDriversCount' | 'usedDriverIds' | 'createdAt'>) => void;
  onDeleteExemptionCode?: (id: string) => void;
  onToggleExemptionCode?: (id: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  drivers,
  requests,
  onToggleVerifyDriver,
  onDeleteDriver,
  onToggleDriverStatus,
  subscriptionPrice = UNIFIED_SUBSCRIPTION_PLAN.price,
  onUpdateSubscriptionPrice,
  exemptionCodes = [],
  onCreateExemptionCode,
  onDeleteExemptionCode,
  onToggleExemptionCode
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<DriverProfile | null>(null);

  // Price Edit State
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState<string>(subscriptionPrice.toString());
  const [priceSaveMessage, setPriceSaveMessage] = useState<string | null>(null);

  // Exemption Code Creation Form State
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeMonths, setNewCodeMonths] = useState<number>(1);
  const [newCodeMaxDrivers, setNewCodeMaxDrivers] = useState<number>(10);
  const [newCodeNotes, setNewCodeNotes] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Drivers Registry Filter State
  const [selectedEmirateFilter, setSelectedEmirateFilter] = useState<string>('all');

  // Real-time KPI Stats Calculations
  const activeDriversCount = drivers.filter(d => d.subscriptionStatus === 'active').length;
  const verifiedDriversCount = drivers.filter(d => d.isVerified).length;
  const suspendedDriversCount = drivers.filter(d => d.subscriptionStatus === 'suspended' || d.subscriptionStatus === 'expired').length;
  const totalRevenue = activeDriversCount * subscriptionPrice;

  const openRequestsCount = requests.filter(r => r.status === 'open').length;
  const assignedRequestsCount = requests.filter(r => r.status === 'assigned').length;
  const deliveredRequestsCount = requests.filter(r => r.status === 'delivered').length;

  // Requests Details Modal State
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [requestsFilterStatus, setRequestsFilterStatus] = useState<'all' | 'open' | 'assigned' | 'delivered'>('all');

  const filteredModalRequests = requestsFilterStatus === 'all'
    ? requests
    : requests.filter(r => r.status === requestsFilterStatus);

  // Calculate drivers count per emirate
  const emirateCounts = UAE_EMIRATES.reduce((acc, emirate) => {
    acc[emirate] = drivers.filter(d => d.emirate === emirate).length;
    return acc;
  }, {} as Record<string, number>);

  const filteredDrivers = selectedEmirateFilter === 'all'
    ? drivers
    : drivers.filter(d => d.emirate === selectedEmirateFilter);

  const handleSavePrice = () => {
    const val = parseInt(tempPrice, 10);
    if (isNaN(val) || val < 0) {
      alert('يرجى إدخال سعر صحيح بالأرقام');
      return;
    }
    if (onUpdateSubscriptionPrice) {
      onUpdateSubscriptionPrice(val);
    }
    setIsEditingPrice(false);
    setPriceSaveMessage(`تم تحديث سعر الباقة إلى ${val} درهم بنجاح`);
    setTimeout(() => setPriceSaveMessage(null), 3500);
  };

  const handleGenerateRandomCode = () => {
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = newCodeMonths > 1 ? `WASEL${newCodeMonths}M` : 'FREE';
    setNewCodeName(`${prefix}-${randomStr}`);
  };

  const handleCreateCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCodeName.trim().toUpperCase();
    if (!cleanCode) {
      alert('يرجى إدخال اسم الكود أو توليده');
      return;
    }
    if (newCodeMonths <= 0) {
      alert('يرجى تحديد فترة إعفاء صالحة');
      return;
    }
    if (newCodeMaxDrivers <= 0) {
      alert('يرجى تحديد عدد السائقين المسموح لهم');
      return;
    }

    if (onCreateExemptionCode) {
      onCreateExemptionCode({
        code: cleanCode,
        months: newCodeMonths,
        maxDrivers: newCodeMaxDrivers,
        isActive: true,
        notes: newCodeNotes.trim() || `إعفاء لمدة ${newCodeMonths} شهر لـ ${newCodeMaxDrivers} سائق`
      });
    }

    // Reset Form
    setNewCodeName('');
    setNewCodeMonths(1);
    setNewCodeMaxDrivers(10);
    setNewCodeNotes('');
    setShowCreateCodeModal(false);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* 3 Interactive KPI Cards (Dynamic, Auto-Updating & Deeply Linked to Live Data) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CARD 1: REVENUE */}
        <div 
          onClick={() => {
            const el = document.getElementById('subscription-plan-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white p-5 rounded-3xl border border-[#E5EDF3] hover:border-[#159B7A] transition-all duration-200 space-y-3 shadow-xs hover:shadow-md cursor-pointer group active:scale-[0.99]"
          title="اضغط للانتقال إلى إدارة الباقة الموحدة وتعديل السعر"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#142F52]">إجمالي إيراد الاشتراكات الشهرية</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="متصل ومحدث ذاتياً" />
            </div>
            <div className="p-2.5 rounded-2xl bg-[#EAF6F1] text-[#159B7A] group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#159B7A] font-mono tracking-tight">
              {totalRevenue.toLocaleString()} <span className="text-xs font-bold text-[#142F52]">AED</span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium">
              محسوبة على أساس {activeDriversCount} كباتن نشطين × {subscriptionPrice} درهم
            </p>
          </div>

          <div className="pt-2 border-t border-[#E5EDF3] flex items-center justify-between text-[10px]">
            <span className="text-[#159B7A] font-bold bg-[#EAF6F1] px-2 py-0.5 rounded-full border border-[#159B7A]/20">
              ⚡ باقة {subscriptionPrice} AED/سائق
            </span>
            <span className="text-[#64748B] group-hover:text-[#159B7A] font-semibold transition-colors flex items-center gap-0.5">
              <span>تعديل السعر</span>
              <span>➔</span>
            </span>
          </div>
        </div>

        {/* CARD 2: DRIVERS */}
        <div 
          onClick={() => {
            const el = document.getElementById('drivers-registry-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white p-5 rounded-3xl border border-[#E5EDF3] hover:border-[#159B7A] transition-all duration-200 space-y-3 shadow-xs hover:shadow-md cursor-pointer group active:scale-[0.99]"
          title="اضغط للانتقال إلى جدول وسجل السائقين"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#142F52]">السائقين المسجلين والنشطين</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="متصل ومحدث ذاتياً" />
            </div>
            <div className="p-2.5 rounded-2xl bg-[#EEF4FA] text-[#142F52] group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5 text-[#159B7A]" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#142F52] font-mono tracking-tight">
              {activeDriversCount} <span className="text-xs text-[#64748B] font-normal">نشط من إجمالي</span> {drivers.length}
            </div>
            <p className="text-[11px] text-[#64748B] font-medium">
              نسبة السائقين النشطين: {drivers.length > 0 ? Math.round((activeDriversCount / drivers.length) * 100) : 0}%
            </p>
          </div>

          <div className="pt-2 border-t border-[#E5EDF3] flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#159B7A] font-bold bg-[#EAF6F1] px-2 py-0.5 rounded-full border border-[#159B7A]/20">
                🛡️ {verifiedDriversCount} موثق
              </span>
              {suspendedDriversCount > 0 && (
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  ⛔ {suspendedDriversCount} معلق
                </span>
              )}
            </div>
            <span className="text-[#64748B] group-hover:text-[#159B7A] font-semibold transition-colors flex items-center gap-0.5">
              <span>عرض السجل</span>
              <span>➔</span>
            </span>
          </div>
        </div>

        {/* CARD 3: DELIVERY REQUESTS */}
        <div 
          onClick={() => setShowRequestsModal(true)}
          className="bg-white p-5 rounded-3xl border border-[#E5EDF3] hover:border-[#159B7A] transition-all duration-200 space-y-3 shadow-xs hover:shadow-md cursor-pointer group active:scale-[0.99]"
          title="اضغط لفتح نافذة تفاصيل وحالات كافة الطلبات بالمنصة"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#142F52]">طلبات التوصيل بالمنصة</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="متصل ومحدث ذاتياً" />
            </div>
            <div className="p-2.5 rounded-2xl bg-[#EAF6F1] text-[#159B7A] group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#142F52] font-mono tracking-tight">
              {requests.length} <span className="text-xs font-bold text-[#64748B]">طلب منشور</span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium">
              تغطي كافة الإمارات السبعة مع عروض أسعار مباشرة
            </p>
          </div>

          <div className="pt-2 border-t border-[#E5EDF3] flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#142F52] font-bold bg-[#EEF4FA] px-2 py-0.5 rounded-full border border-[#E5EDF3]">
                ⏳ {openRequestsCount} مفتوحة
              </span>
              <span className="text-[#159B7A] font-bold bg-[#EAF6F1] px-2 py-0.5 rounded-full border border-[#159B7A]/20">
                ✅ {deliveredRequestsCount} مكتملة
              </span>
            </div>
            <span className="text-[#64748B] group-hover:text-[#159B7A] font-semibold transition-colors flex items-center gap-0.5">
              <span>معاينة (نافذة)</span>
              <span>➔</span>
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. EDITABLE UNIFIED SUBSCRIPTION PLAN SECTION */}
      {/* ========================================================================= */}
      <div id="subscription-plan-section" className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5EDF3] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-[#142F52] text-base sm:text-lg flex items-center gap-2">
              <span>الباقة الموحدة للسائقين</span>
              <span className="text-xs text-[#64748B] font-normal">(قابلة للتعديل الفوري من الإدارة)</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              تحديد سعر الاشتراك الشهري الموحد لجميع السائقين الجدد والحاليين، وينعكس السعر مباشرة في نافذة التسجيل والتجديد.
            </p>
          </div>

          {!isEditingPrice && (
            <button
              onClick={() => {
                setTempPrice(subscriptionPrice.toString());
                setIsEditingPrice(true);
              }}
              className="flex items-center gap-1.5 bg-[#159B7A] hover:bg-[#108466] text-white px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>تعديل سعر الباقة</span>
            </button>
          )}
        </div>

        {priceSaveMessage && (
          <div className="bg-[#EAF6F1] border border-[#159B7A]/30 text-[#159B7A] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-[#159B7A]" />
            <span>{priceSaveMessage}</span>
          </div>
        )}

        <div className="bg-[#F5F9FC] p-4 sm:p-5 rounded-2xl border border-[#E5EDF3] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#142F52] text-sm sm:text-base">{UNIFIED_SUBSCRIPTION_PLAN.name}</span>
              <span className="text-xs font-black text-[#159B7A] bg-[#EAF6F1] px-3 py-1 rounded-full border border-[#159B7A]/20">
                {subscriptionPrice} AED / شهر
              </span>
            </div>
            <p className="text-xs text-[#64748B]">باقة واحدة موحدة للجميع مع نظام الأولوية بالتقييم وعمولة 0%</p>
          </div>

          {isEditingPrice ? (
            <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-[#E5EDF3]">
              <span className="text-xs font-bold text-[#142F52]">السعر الجديد (AED):</span>
              <input
                type="number"
                min="0"
                step="1"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                className="w-24 bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] rounded-lg px-2.5 py-1.5 text-sm font-black text-[#142F52] text-center focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSavePrice}
                className="bg-[#159B7A] hover:bg-[#108466] text-white text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ</span>
              </button>
              <button
                onClick={() => setIsEditingPrice(false)}
                className="bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#64748B] text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>إلغاء</span>
              </button>
            </div>
          ) : (
            <div className="text-left sm:text-right flex items-center gap-4">
              <div>
                <span className="text-xs text-[#64748B] block">السائقين المشتركين:</span>
                <span className="text-base sm:text-lg font-black text-[#142F52]">{activeDriversCount} كباتن نشطين</span>
              </div>
              <div className="border-r border-[#E5EDF3] pr-4">
                <span className="text-xs text-[#64748B] block">سعر التجديد الحالي:</span>
                <span className="text-base sm:text-lg font-black text-[#159B7A]">{subscriptionPrice} درهم</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXEMPTION CODES MANAGEMENT SECTION (أكواد الإعفاء والاشتراكات المجانية) */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5EDF3] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#159B7A]" />
              <h3 className="font-black text-[#142F52] text-base sm:text-lg">أكواد الإعفاء والاشتراكات المجانية للسائقين</h3>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              إنشاء أكواد إعفاء مخصصة تمنح السائقين اشتراكاً مجانياً لفترة محددة (شهر، شهرين، أو أكثر) مع تحديد سقف لعدد السائقين المستفيدين.
            </p>
          </div>

          <button
            onClick={() => setShowCreateCodeModal(true)}
            className="flex items-center gap-1.5 bg-[#159B7A] hover:bg-[#108466] text-white px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء كود إعفاء جديد</span>
          </button>
        </div>

        {/* Exemption Codes List */}
        {exemptionCodes.length === 0 ? (
          <div className="bg-[#F5F9FC] rounded-2xl p-6 text-center border border-[#E5EDF3] space-y-2">
            <Ticket className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <p className="text-xs text-[#64748B] font-bold">لا توجد أكواد إعفاء منشأة حالياً.</p>
            <p className="text-[11px] text-[#94A3B8]">اضغط على زر "إنشاء كود إعفاء جديد" لإضافة أول كود للسائقين.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {exemptionCodes.map((item) => {
              const isExhausted = item.usedDriversCount >= item.maxDrivers;
              const percentUsed = Math.min(100, Math.round((item.usedDriversCount / item.maxDrivers) * 100));

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    item.isActive && !isExhausted
                      ? 'bg-white border-[#E5EDF3] hover:border-[#159B7A]'
                      : 'bg-[#F5F9FC] border-[#E5EDF3] opacity-80'
                  }`}
                >
                  {/* Top Bar: Code and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm sm:text-base text-[#142F52] bg-[#EEF4FA] px-3 py-1 rounded-xl border border-[#E5EDF3] tracking-wider">
                        {item.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(item.code, item.id)}
                        className="p-1.5 rounded-lg bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] transition-colors cursor-pointer"
                        title="نسخ الكود"
                      >
                        {copiedCodeId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-[#159B7A]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div>
                      {!item.isActive ? (
                        <span className="text-[10px] font-bold bg-[#F5F9FC] text-[#64748B] px-2 py-0.5 rounded-full border border-[#E5EDF3]">
                          معطل
                        </span>
                      ) : isExhausted ? (
                        <span className="text-[10px] font-bold bg-[#F5F9FC] text-[#142F52] px-2 py-0.5 rounded-full border border-[#E5EDF3]">
                          مستنفذ (مكتمل)
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20 px-2.5 py-0.5 rounded-full">
                          نشط ومتاح 🟢
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#F5F9FC] p-2.5 rounded-xl border border-[#E5EDF3]">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">فترة الإعفاء:</span>
                      <span className="font-bold text-[#142F52] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#159B7A]" />
                        <span>{item.months} {item.months === 1 ? 'شهر' : item.months === 2 ? 'شهرين' : `${item.months} شهور`} مجاناً</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748B] block">استخدام السائقين:</span>
                      <span className="font-bold text-[#142F52] flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-[#159B7A]" />
                        <span>{item.usedDriversCount} من {item.maxDrivers} سائق</span>
                      </span>
                    </div>
                  </div>

                  {/* Usage Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[#64748B] font-semibold">
                      <span>نسبة الاستهلاك:</span>
                      <span>{percentUsed}% ({item.maxDrivers - item.usedDriversCount} متبقي)</span>
                    </div>
                    <div className="w-full bg-[#E5EDF3] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#159B7A] h-full transition-all duration-300"
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-[#64748B] bg-[#F5F9FC] px-2.5 py-1.5 rounded-lg border border-[#E5EDF3] truncate">
                      💡 {item.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E5EDF3] text-xs">
                    {onToggleExemptionCode && (
                      <button
                        onClick={() => onToggleExemptionCode(item.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          item.isActive
                            ? 'bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#64748B] border border-[#E5EDF3]'
                            : 'bg-[#159B7A] text-white font-black'
                        }`}
                      >
                        {item.isActive ? 'تعطيل الكود' : 'تفعيل الكود'}
                      </button>
                    )}

                    {onDeleteExemptionCode && (
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف كود الإعفاء "${item.code}"؟`)) {
                            onDeleteExemptionCode(item.id);
                          }
                        }}
                        className="text-[#94A3B8] hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="حذف الكود"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. DRIVERS REGISTRY TABLE WITH EMIRATE FILTER */}
      {/* ========================================================================= */}
      <div id="drivers-registry-section" className="bg-white border border-[#E5EDF3] rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5EDF3] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#159B7A]" />
              <h3 className="font-black text-[#142F52] text-base sm:text-lg">سجل السائقين المستقلين وتراخيصهم</h3>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              استعراض وإدارة حسابات السائقين والتحقق من التوثيق وفلترة السائقين حسب الإمارة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#142F52] font-bold bg-[#EEF4FA] px-3 py-1.5 rounded-xl border border-[#E5EDF3]">
              المعروض: <strong className="text-[#159B7A]">{filteredDrivers.length}</strong> من <strong className="text-[#142F52]">{drivers.length}</strong> سائق
            </span>
          </div>
        </div>

        {/* Emirate Filter Buttons Bar with Counts */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#142F52]">
            <Filter className="w-3.5 h-3.5 text-[#159B7A]" />
            <span>فلترة السائقين حسب الإمارة (مع عرض عدد السائقين في كل إمارة):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* "All" Option */}
            <button
              onClick={() => setSelectedEmirateFilter('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer ${
                selectedEmirateFilter === 'all'
                  ? 'bg-[#159B7A] text-white shadow-sm border border-[#159B7A]'
                  : 'bg-[#F5F9FC] text-[#64748B] hover:text-[#142F52] hover:bg-[#EEF4FA] border border-[#E5EDF3]'
              }`}
            >
              <span>جميع الإمارات</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                selectedEmirateFilter === 'all'
                  ? 'bg-white text-[#159B7A]'
                  : 'bg-[#EEF4FA] text-[#142F52] border border-[#E5EDF3]'
              }`}>
                {drivers.length}
              </span>
            </button>

            {/* Each UAE Emirate Button with Count */}
            {UAE_EMIRATES.map((emirate) => {
              const count = emirateCounts[emirate] || 0;
              const isSelected = selectedEmirateFilter === emirate;

              return (
                <button
                  key={emirate}
                  onClick={() => setSelectedEmirateFilter(emirate)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-[#159B7A] text-white font-black shadow-sm border border-[#159B7A]'
                      : 'bg-[#F5F9FC] text-[#64748B] hover:text-[#142F52] hover:bg-[#EEF4FA] border border-[#E5EDF3]'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-[#159B7A]'}`} />
                  <span>{emirate}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white text-[#159B7A]'
                      : count > 0 
                        ? 'bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20'
                        : 'bg-[#EEF4FA] text-[#94A3B8]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drivers Table / Empty State */}
        {filteredDrivers.length === 0 ? (
          <div className="bg-[#F5F9FC] rounded-2xl p-8 sm:p-12 text-center border border-[#E5EDF3] space-y-3 animate-in fade-in">
            <Truck className="w-12 h-12 text-[#94A3B8] mx-auto stroke-[1.5]" />
            <h4 className="text-sm sm:text-base font-bold text-[#142F52]">
              لا يوجد سائقين مسجلين في إمارة "{selectedEmirateFilter}" حالياً
            </h4>
            <p className="text-xs text-[#64748B]">
              يمكنك اختيار إمارة أخرى أو استعراض كافة السائقين المسجلين في الدولة.
            </p>
            <button
              onClick={() => setSelectedEmirateFilter('all')}
              className="mt-2 bg-[#159B7A] hover:bg-[#108466] text-white font-black px-4 py-2 rounded-xl text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              عرض جميع السائقين ({drivers.length})
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F5F9FC] text-[#64748B] uppercase font-bold border-b border-[#E5EDF3]">
                <tr>
                  <th className="p-3">السائق</th>
                  <th className="p-3">الإمارة</th>
                  <th className="p-3">السيارة واللوحة</th>
                  <th className="p-3">الاشتراك وصلاحية الشهر</th>
                  <th className="p-3">الفاتورة والتذكير</th>
                  <th className="p-3">الرحلات</th>
                  <th className="p-3 text-center">التوثيق</th>
                  <th className="p-3 text-center">إدارة الحساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EDF3]">
                {filteredDrivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-[#F5F9FC] transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      <img src={drv.avatar} alt={drv.name} className="w-9 h-9 rounded-xl object-cover border border-[#E5EDF3]" />
                      <div>
                        <div className="font-bold text-[#142F52] text-sm">{drv.name}</div>
                        <div className="text-[10px] text-[#64748B]">{drv.phone}</div>
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-[#142F52]">{drv.emirate}</td>

                    <td className="p-3">
                      <div className="font-bold text-[#142F52]">{drv.vehicleModel}</div>
                      <div className="text-[10px] text-[#64748B] font-mono">{drv.vehiclePlate}</div>
                    </td>

                    {(() => {
                      const subStatus = checkDriverSubscriptionStatus(drv);
                      const isSuspended = subStatus.isSuspended || drv.subscriptionStatus === 'suspended';
                      const isExemption = subStatus.isExemption;
                      const isExpiring = subStatus.isExpiringSoon;
                      const daysRemaining = subStatus.daysRemaining;

                      const inv = createSubscriptionInvoice(
                        drv,
                        `ZIN-${drv.id.replace(/[^0-9]/g, '').slice(-6) || '892134'}`,
                        drv.joinedDate,
                        drv.subscriptionExpiry,
                        isExemption ? 0 : subscriptionPrice
                      );

                      return (
                        <>
                          <td className="p-3">
                            {isSuspended ? (
                              <div className="space-y-1">
                                <span className="bg-red-50 text-red-600 font-black px-2.5 py-0.5 rounded-lg border border-red-200 inline-flex items-center gap-1 shadow-xs">
                                  <span>معطل / معلق ⛔</span>
                                </span>
                                <div className="text-[10px] text-[#64748B]">
                                  الحالة: <strong className="text-red-600">غير متاح للطلبات</strong>
                                </div>
                              </div>
                            ) : isExemption ? (
                              <div className="space-y-1">
                                <span className="bg-[#EAF6F1] text-[#159B7A] font-extrabold px-2.5 py-0.5 rounded-lg border border-[#159B7A]/20 inline-flex items-center gap-1">
                                  <span>إعفاء ({drv.usedExemptionCode || 'كود'}) ✓</span>
                                </span>
                                <div className="text-[10px] text-[#64748B]">
                                  ينتهي: <strong className="text-[#142F52]">{drv.subscriptionExpiry}</strong>
                                </div>
                                {isExpiring && (
                                  <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1 w-fit animate-pulse">
                                    <Bell className="w-2.5 h-2.5" />
                                    <span>تنبيه إعفاء 5 أيام (متبقي {daysRemaining} يوم)</span>
                                  </span>
                                )}
                              </div>
                            ) : drv.subscriptionStatus === 'active' ? (
                              <div className="space-y-1">
                                <span className="bg-[#EAF6F1] text-[#159B7A] font-extrabold px-2.5 py-0.5 rounded-lg border border-[#159B7A]/20 inline-flex items-center gap-1">
                                  <span>مفعل ({subscriptionPrice} AED) ✓</span>
                                </span>
                                <div className="text-[10px] text-[#64748B]">
                                  ينتهي: <strong className="text-[#142F52]">{drv.subscriptionExpiry}</strong>
                                </div>
                                {isExpiring && (
                                  <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1 w-fit animate-pulse">
                                    <Bell className="w-2.5 h-2.5" />
                                    <span>تذكير 5 أيام (متبقي {daysRemaining} يوم)</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="bg-[#F5F9FC] text-[#64748B] font-extrabold px-2.5 py-1 rounded-lg border border-[#E5EDF3] flex items-center gap-1 w-fit">
                                <span>غير مفعل / بانتظار الدفع ⏳</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(inv)}
                                className="bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#142F52] p-1.5 rounded-lg border border-[#E5EDF3] transition-colors cursor-pointer"
                                title="عرض الفاتورة الرسمية"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#159B7A]" />
                              </button>

                              {isSuspended ? (
                                <a
                                  href={getWhatsAppSuspendedUrl(drv.phone, drv.name, drv.usedExemptionCode)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-200 transition-all shadow-xs"
                                  title="إرسال إشعار تعليق الحساب بالواتساب"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </a>
                              ) : isExemption && isExpiring ? (
                                <a
                                  href={getWhatsAppExemptionReminderUrl(drv.phone, drv.name, daysRemaining, drv.subscriptionExpiry, drv.usedExemptionCode)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-[#EAF6F1] hover:bg-[#DEF0E8] text-[#159B7A] p-1.5 rounded-lg border border-[#159B7A]/20 transition-all"
                                  title="إرسال تذكير قرب انتهاء الإعفاء بالواتساب (5 أيام)"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </a>
                              ) : isExpiring ? (
                                <a
                                  href={getWhatsAppReminderUrl(drv.phone, drv.name, daysRemaining, drv.subscriptionExpiry)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-[#EEF4FA] hover:bg-[#E2EDF7] text-[#142F52] p-1.5 rounded-lg border border-[#E5EDF3] transition-all"
                                  title="إرسال تذكير التجديد بالواتساب"
                                >
                                  <Share2 className="w-3.5 h-3.5 text-[#159B7A]" />
                                </a>
                              ) : null}
                            </div>
                          </td>
                        </>
                      );
                    })()}

                    <td className="p-3 font-bold text-[#142F52]">{drv.completedDeliveries} توصيلة</td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleVerifyDriver(drv.id)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all active:scale-95 text-[11px] cursor-pointer ${
                          drv.isVerified
                            ? 'bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20'
                            : 'bg-[#F5F9FC] text-[#64748B] border border-[#E5EDF3]'
                        }`}
                      >
                        {drv.isVerified ? '✓ موثق' : 'غير موثق'}
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Suspend / Reactivate Driver Button */}
                        {drv.subscriptionStatus === 'suspended' ? (
                          <button
                            type="button"
                            onClick={() => onToggleDriverStatus && onToggleDriverStatus(drv.id, 'active')}
                            className="bg-[#159B7A] hover:bg-[#108466] text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                            title="إعادة تنشيط وتفعيل حساب السائق"
                          >
                            <Power className="w-3 h-3 text-white" />
                            <span>تنشيط</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleDriverStatus && onToggleDriverStatus(drv.id, 'suspended')}
                            className="bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] font-bold px-2.5 py-1 rounded-lg text-[11px] border border-[#E5EDF3] flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                            title="تعطيل وتعليق حساب السائق مؤقتاً"
                          >
                            <PowerOff className="w-3 h-3 text-[#64748B]" />
                            <span>تعطيل</span>
                          </button>
                        )}

                        {/* Delete Driver Account Button */}
                        <button
                          type="button"
                          onClick={() => setDriverToDelete(drv)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-200 transition-colors active:scale-95 cursor-pointer"
                          title="حذف حساب السائق نهائياً من المنصة"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Invoice Preview Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Create Exemption Code Modal */}
      {showCreateCodeModal && (
        <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white border border-[#E5EDF3] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#F5F9FC] px-5 py-4 border-b border-[#E5EDF3] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-black">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-[#142F52] text-base">إنشاء كود إعفاء جديد</h4>
                  <p className="text-[11px] text-[#64748B]">تخصيص كود إعفاء مجاني للسائقين مع تحديد المدة والعدد</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateCodeModal(false)}
                className="p-1.5 rounded-lg bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCodeSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              
              {/* Code Name & Generate Button */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#142F52]">
                  رمز الكود (الكود الترويجي):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                    placeholder="مثال: WASEL2026 أو FREE1M"
                    className="flex-1 bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-mono font-black text-[#142F52] tracking-wider focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="bg-[#EEF4FA] hover:bg-[#E2EDF7] text-[#142F52] px-3 py-2 rounded-xl border border-[#E5EDF3] font-bold active:scale-95 cursor-pointer"
                  >
                    توليد تلقائي 🎲
                  </button>
                </div>
              </div>

              {/* Exemption Duration (Months) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#142F52]">
                  فترة الإعفاء المجاني (بالشهور):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 6].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewCodeMonths(m)}
                      className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs cursor-pointer ${
                        newCodeMonths === m
                          ? 'bg-[#159B7A] text-white border-[#159B7A] shadow-xs'
                          : 'bg-[#F5F9FC] text-[#64748B] border-[#E5EDF3] hover:text-[#142F52]'
                      }`}
                    >
                      {m === 1 ? 'شهر (1)' : m === 2 ? 'شهرين (2)' : `${m} شهور`}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-[#64748B]">أو عدد مخصص:</span>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={newCodeMonths}
                    onChange={(e) => setNewCodeMonths(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20 bg-[#F5F9FC] border border-[#E5EDF3] rounded-lg px-2.5 py-1 text-xs font-bold text-[#142F52] text-center"
                  />
                  <span className="text-[11px] text-[#64748B]">شهر</span>
                </div>
              </div>

              {/* Max Drivers Usage */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#142F52]">
                  عدد السائقين المسموح لهم باستخدام الكود:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setNewCodeMaxDrivers(count)}
                      className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs cursor-pointer ${
                        newCodeMaxDrivers === count
                          ? 'bg-[#159B7A] text-white border-[#159B7A] shadow-xs'
                          : 'bg-[#F5F9FC] text-[#64748B] border-[#E5EDF3] hover:text-[#142F52]'
                      }`}
                    >
                      {count} سائق
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-[#64748B]">أو عدد مخصص:</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={newCodeMaxDrivers}
                    onChange={(e) => setNewCodeMaxDrivers(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-24 bg-[#F5F9FC] border border-[#E5EDF3] rounded-lg px-2.5 py-1 text-xs font-bold text-[#142F52] text-center"
                  />
                  <span className="text-[11px] text-[#64748B]">سائق</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#142F52]">
                  ملاحظات أو مناسبة الكود (اختياري):
                </label>
                <input
                  type="text"
                  value={newCodeNotes}
                  onChange={(e) => setNewCodeNotes(e.target.value)}
                  placeholder="مثال: كود ترويجي لإطلاق الحملة الإعلانية"
                  className="w-full bg-[#F5F9FC] border border-[#E5EDF3] focus:border-[#159B7A] focus:bg-white rounded-xl px-3.5 py-2 text-xs text-[#142F52] focus:outline-none"
                />
              </div>

              {/* Preview Box */}
              <div className="bg-[#F5F9FC] p-3.5 rounded-2xl border border-[#E5EDF3] space-y-1">
                <div className="font-bold text-[#142F52] text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#159B7A]" />
                  <span>ملخص الكود الجديد:</span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  سيتمكن حتى <strong className="text-[#142F52]">{newCodeMaxDrivers} سائق</strong> من إدخال الكود للحصول على <strong className="text-[#159B7A]">اشتراك مجاني بالكامل لمدة {newCodeMonths} {newCodeMonths === 1 ? 'شهر' : 'شهور'}</strong> فور التسجيل أو التجديد.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 rounded-xl text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ وإنشاء الكود</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateCodeModal(false)}
                  className="bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] font-bold py-3 px-5 rounded-xl text-xs active:scale-95 border border-[#E5EDF3] cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Driver Confirmation Modal */}
      {driverToDelete && (
        <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5EDF3] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#F5F9FC] px-5 py-4 border-b border-[#E5EDF3] flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <Trash2 className="w-5 h-5 text-red-600" />
                <span className="text-sm sm:text-base">تأكيد حذف حساب السائق نهائياً</span>
              </div>
              <button
                onClick={() => setDriverToDelete(null)}
                className="p-1.5 rounded-lg bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-right">
              <div className="flex items-center gap-3 bg-[#F5F9FC] p-3 rounded-2xl border border-[#E5EDF3]">
                <img src={driverToDelete.avatar} alt={driverToDelete.name} className="w-12 h-12 rounded-xl object-cover border border-[#E5EDF3]" />
                <div>
                  <div className="font-bold text-[#142F52] text-sm sm:text-base">{driverToDelete.name}</div>
                  <div className="text-xs text-[#64748B]">{driverToDelete.phone} • {driverToDelete.emirate}</div>
                  <div className="text-[11px] text-[#64748B] font-mono">{driverToDelete.vehicleModel} ({driverToDelete.vehiclePlate})</div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-800 space-y-1.5">
                <p className="font-bold text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>تحذير أمني من إدارة المنصة:</span>
                </p>
                <p className="text-red-700 text-[11px] leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف حساب هذا السائق نهائياً؟ سيتم مسح بياناته ورقم هاتفه وسجل عروضه من قاعدة البيانات السحابية والتخزين المحلي فوراً ولا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteDriver) {
                      onDeleteDriver(driverToDelete.id);
                    }
                    setDriverToDelete(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 shadow-sm transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                  <span>تأكيد الحذف النهائي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDriverToDelete(null)}
                  className="flex-1 bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] font-bold py-2.5 rounded-xl text-xs border border-[#E5EDF3] active:scale-95 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Requests Details & Status Modal */}
      {showRequestsModal && (
        <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
          <div className="bg-white border-t sm:border border-[#E5EDF3] rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="bg-[#F5F9FC] px-4 sm:px-6 py-4 border-b border-[#E5EDF3] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center font-black shadow-xs shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#142F52]">سجل طلبات التوصيل بالمنصة (مباشر)</h3>
                  <p className="text-[11px] sm:text-xs text-[#64748B]">إجمالي {requests.length} طلب منشور يتحدث تلقائياً مع تفاعل العملاء والسائقين</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRequestsModal(false)}
                className="p-2 rounded-xl bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3] transition-colors active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Subtabs */}
            <div className="bg-white px-4 sm:px-6 py-2.5 border-b border-[#E5EDF3] flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setRequestsFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestsFilterStatus === 'all'
                    ? 'bg-[#159B7A] text-white shadow-xs'
                    : 'bg-[#F5F9FC] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3]'
                }`}
              >
                الكل ({requests.length})
              </button>
              <button
                type="button"
                onClick={() => setRequestsFilterStatus('open')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestsFilterStatus === 'open'
                    ? 'bg-[#159B7A] text-white shadow-xs'
                    : 'bg-[#F5F9FC] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3]'
                }`}
              >
                بانتظار العروض ({openRequestsCount})
              </button>
              <button
                type="button"
                onClick={() => setRequestsFilterStatus('assigned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestsFilterStatus === 'assigned'
                    ? 'bg-[#159B7A] text-white shadow-xs'
                    : 'bg-[#F5F9FC] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3]'
                }`}
              >
                قيد التوصيل ({assignedRequestsCount})
              </button>
              <button
                type="button"
                onClick={() => setRequestsFilterStatus('delivered')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestsFilterStatus === 'delivered'
                    ? 'bg-[#159B7A] text-white shadow-xs'
                    : 'bg-[#F5F9FC] text-[#64748B] hover:text-[#142F52] border border-[#E5EDF3]'
                }`}
              >
                مكتملة ومسلمة ({deliveredRequestsCount})
              </button>
            </div>

            {/* Scrollable Requests List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 text-right">
              {filteredModalRequests.length === 0 ? (
                <div className="bg-[#F5F9FC] rounded-2xl p-8 text-center border border-[#E5EDF3] space-y-2">
                  <Package className="w-10 h-10 text-[#94A3B8] mx-auto" />
                  <p className="text-xs text-[#64748B] font-bold">لا توجد طلبات مطابقة لهذا الفلتر حالياً.</p>
                </div>
              ) : (
                filteredModalRequests.map((req) => (
                  <div key={req.id} className="bg-[#F5F9FC] border border-[#E5EDF3] rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5EDF3] pb-2.5">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs text-[#142F52] font-extrabold bg-white px-2.5 py-0.5 rounded-full border border-[#E5EDF3]">
                            {req.packageType}
                          </span>
                          <span className="text-[11px] text-[#64748B]">{req.createdAt}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'delivered'
                              ? 'bg-[#EAF6F1] text-[#159B7A] border border-[#159B7A]/20'
                              : req.status === 'assigned'
                              ? 'bg-[#159B7A] text-white'
                              : 'bg-white text-[#64748B] border border-[#E5EDF3]'
                          }`}>
                            {req.status === 'delivered' ? 'مكتمل ومسلم ✓' : req.status === 'assigned' ? 'قيد التوصيل 🚚' : 'بانتظار العروض ⏳'}
                          </span>
                        </div>
                        <h4 className="font-black text-[#142F52] text-sm">{req.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                        <span className="text-[#94A3B8] text-xs">➔</span>
                        <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-[#E5EDF3]">
                      <div>
                        <span className="text-[#64748B] block">العميل:</span>
                        <span className="font-bold text-[#142F52]">{req.customerName || 'عميل واصل'} ({req.customerPhone || 'بدون هاتف'})</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">العروض المقدمة:</span>
                        <span className="font-bold text-[#159B7A]">{req.offers?.length || 0} عروض مقدمة</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">موعد التوصيل:</span>
                        <span className="font-bold text-[#142F52]">{req.deliveryDate}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#F5F9FC] p-4 sm:px-6 border-t border-[#E5EDF3] shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRequestsModal(false)}
                className="w-full sm:w-auto bg-white hover:bg-[#EEF4FA] text-[#64748B] hover:text-[#142F52] font-bold py-2.5 px-6 rounded-xl border border-[#E5EDF3] transition-all text-xs active:scale-95 cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
