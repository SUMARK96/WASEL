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
import { UNIFIED_SUBSCRIPTION_PLAN, UAE_EMIRATES } from '../data/mockData';
import { 
  Package, 
  DollarSign, 
  Sparkles, 
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

  const activeDriversCount = drivers.filter(d => d.subscriptionStatus === 'active').length;
  const totalRevenue = activeDriversCount * subscriptionPrice;
  const totalOffersCount = requests.reduce((acc, r) => acc + r.offers.length, 0);

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
      
      {/* Hero Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-white bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700 mb-2 inline-block">
              لوحة تحكم منصة واصل (WASEL Admin)
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">إحصائيات المنصة واشتراكات السائقين المستقلين</h1>
            <p className="text-xs text-zinc-400 mt-1">
              نموذج الإيرادات: اشتراك شهري موحد ({subscriptionPrice} AED) للسائقين للتوصيل بين إمارات الدولة
            </p>
          </div>

          <div className="text-left bg-black px-5 py-3 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-400 font-semibold block">إجمالي الدخل الشهري المتوقع</span>
            <span className="text-xl sm:text-2xl font-black text-white">{totalRevenue.toLocaleString()} AED</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold">إجمالي إيراد الاشتراكات</span>
            <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalRevenue.toLocaleString()} AED</div>
          <span className="text-[10px] text-zinc-400 font-bold block">↑ اشتراكات شهرية نشطة ({subscriptionPrice} AED/سائق)</span>
        </div>

        <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold">السائقين المشتركين والنشطين</span>
            <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{activeDriversCount} سائقين</div>
          <span className="text-[10px] text-zinc-400 font-bold block">100% تم التوثيق برخصة الإمارات</span>
        </div>

        <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold">طلبات التوصيل المنشورة</span>
            <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{requests.length} طلبات</div>
          <span className="text-[10px] text-zinc-400 font-bold block">بين كافة إمارات الدولة</span>
        </div>

        <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold">عروض الأسعار المقدمة</span>
            <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalOffersCount} عروض</div>
          <span className="text-[10px] text-zinc-400 font-bold block">متوسط العروض المتوفرة</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. EDITABLE UNIFIED SUBSCRIPTION PLAN SECTION */}
      {/* ========================================================================= */}
      <div className="bg-zinc-950 p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
              <span>الباقة الموحدة للسائقين</span>
              <span className="text-xs text-zinc-400 font-normal">(قابلة للتعديل الفوري من الإدارة)</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              تحديد سعر الاشتراك الشهري الموحد لجميع السائقين الجدد والحاليين، وينعكس السعر مباشرة في نافذة التسجيل والتجديد.
            </p>
          </div>

          {!isEditingPrice && (
            <button
              onClick={() => {
                setTempPrice(subscriptionPrice.toString());
                setIsEditingPrice(true);
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md self-start sm:self-auto"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>تعديل سعر الباقة</span>
            </button>
          )}
        </div>

        {priceSaveMessage && (
          <div className="bg-zinc-900 border border-zinc-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-white" />
            <span>{priceSaveMessage}</span>
          </div>
        )}

        <div className="bg-black p-4 sm:p-5 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:text-base">{UNIFIED_SUBSCRIPTION_PLAN.name}</span>
              <span className="text-xs font-black text-white bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700">
                {subscriptionPrice} AED / شهر
              </span>
            </div>
            <p className="text-xs text-zinc-400">باقة واحدة موحدة للجميع مع نظام الأولوية بالتقييم وعمولة 0%</p>
          </div>

          {isEditingPrice ? (
            <div className="flex flex-wrap items-center gap-2 bg-zinc-900 p-2.5 rounded-xl border border-zinc-700">
              <span className="text-xs font-bold text-zinc-300">السعر الجديد (AED):</span>
              <input
                type="number"
                min="0"
                step="1"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                className="w-24 bg-black border border-zinc-600 rounded-lg px-2.5 py-1.5 text-sm font-black text-white text-center focus:outline-none focus:border-white"
                autoFocus
              />
              <button
                onClick={handleSavePrice}
                className="bg-white hover:bg-zinc-200 text-black text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ</span>
              </button>
              <button
                onClick={() => setIsEditingPrice(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>إلغاء</span>
              </button>
            </div>
          ) : (
            <div className="text-left sm:text-right flex items-center gap-4">
              <div>
                <span className="text-xs text-zinc-400 block">السائقين المشتركين:</span>
                <span className="text-base sm:text-lg font-black text-white">{activeDriversCount} كباتن نشطين</span>
              </div>
              <div className="border-r border-zinc-800 pr-4">
                <span className="text-xs text-zinc-400 block">سعر التجديد الحالي:</span>
                <span className="text-base sm:text-lg font-black text-white">{subscriptionPrice} درهم</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXEMPTION CODES MANAGEMENT SECTION (أكواد الإعفاء والاشتراكات المجانية) */}
      {/* ========================================================================= */}
      <div className="bg-zinc-950 p-5 sm:p-6 rounded-3xl border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-white" />
              <h3 className="font-black text-white text-base sm:text-lg">أكواد الإعفاء والاشتراكات المجانية للسائقين</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              إنشاء أكواد إعفاء مخصصة تمنح السائقين اشتراكاً مجانياً لفترة محددة (شهر، شهرين، أو أكثر) مع تحديد سقف لعدد السائقين المستفيدين.
            </p>
          </div>

          <button
            onClick={() => setShowCreateCodeModal(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء كود إعفاء جديد</span>
          </button>
        </div>

        {/* Exemption Codes List */}
        {exemptionCodes.length === 0 ? (
          <div className="bg-black rounded-2xl p-6 text-center border border-zinc-800 space-y-2">
            <Ticket className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400 font-bold">لا توجد أكواد إعفاء منشأة حالياً.</p>
            <p className="text-[11px] text-zinc-500">اضغط على زر "إنشاء كود إعفاء جديد" لإضافة أول كود للسائقين.</p>
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
                      ? 'bg-black border-zinc-700 hover:border-white'
                      : 'bg-zinc-900/40 border-zinc-800 opacity-80'
                  }`}
                >
                  {/* Top Bar: Code and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm sm:text-base text-white bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-700 tracking-wider">
                        {item.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(item.code, item.id)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="نسخ الكود"
                      >
                        {copiedCodeId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div>
                      {!item.isActive ? (
                        <span className="text-[10px] font-bold bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                          معطل
                        </span>
                      ) : isExhausted ? (
                        <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full border border-zinc-700">
                          مستنفذ (مكتمل)
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-white text-black px-2.5 py-0.5 rounded-full">
                          نشط ومتاح 🟢
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">فترة الإعفاء:</span>
                      <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        <span>{item.months} {item.months === 1 ? 'شهر' : item.months === 2 ? 'شهرين' : `${item.months} شهور`} مجاناً</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 block">استخدام السائقين:</span>
                      <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-zinc-400" />
                        <span>{item.usedDriversCount} من {item.maxDrivers} سائق</span>
                      </span>
                    </div>
                  </div>

                  {/* Usage Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                      <span>نسبة الاستهلاك:</span>
                      <span>{percentUsed}% ({item.maxDrivers - item.usedDriversCount} متبقي)</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="bg-white h-full transition-all duration-300"
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-zinc-400 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800 truncate">
                      💡 {item.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-xs">
                    {onToggleExemptionCode && (
                      <button
                        onClick={() => onToggleExemptionCode(item.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                          item.isActive
                            ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                            : 'bg-white text-black font-black'
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
                        className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
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
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-white" />
              <h3 className="font-black text-white text-base sm:text-lg">سجل السائقين المستقلين وتراخيصهم</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              استعراض وإدارة حسابات السائقين والتحقق من التوثيق وفلترة السائقين حسب الإمارة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-300 font-bold bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-700">
              المعروض: <strong className="text-white">{filteredDrivers.length}</strong> من <strong className="text-white">{drivers.length}</strong> سائق
            </span>
          </div>
        </div>

        {/* Emirate Filter Buttons Bar with Counts */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
            <Filter className="w-3.5 h-3.5 text-white" />
            <span>فلترة السائقين حسب الإمارة (مع عرض عدد السائقين في كل إمارة):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* "All" Option */}
            <button
              onClick={() => setSelectedEmirateFilter('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                selectedEmirateFilter === 'all'
                  ? 'bg-white text-black shadow-lg border border-white'
                  : 'bg-black text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800'
              }`}
            >
              <span>جميع الإمارات</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                selectedEmirateFilter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-white text-black font-black shadow-lg border border-white'
                      : 'bg-black text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-black' : 'text-zinc-500'}`} />
                  <span>{emirate}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-black text-white'
                      : count > 0 
                        ? 'bg-zinc-900 text-white border border-zinc-700'
                        : 'bg-zinc-900/60 text-zinc-600 border border-zinc-800'
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
          <div className="bg-black rounded-2xl p-8 sm:p-12 text-center border border-zinc-800 space-y-3 animate-in fade-in">
            <Truck className="w-12 h-12 text-zinc-600 mx-auto stroke-[1.5]" />
            <h4 className="text-sm sm:text-base font-bold text-white">
              لا يوجد سائقين مسجلين في إمارة "{selectedEmirateFilter}" حالياً
            </h4>
            <p className="text-xs text-zinc-400">
              يمكنك اختيار إمارة أخرى أو استعراض كافة السائقين المسجلين في الدولة.
            </p>
            <button
              onClick={() => setSelectedEmirateFilter('all')}
              className="mt-2 bg-white hover:bg-zinc-200 text-black font-black px-4 py-2 rounded-xl text-xs active:scale-95 transition-all shadow"
            >
              عرض جميع السائقين ({drivers.length})
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-black text-zinc-400 uppercase font-bold border-b border-zinc-800">
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
              <tbody className="divide-y divide-zinc-800">
                {filteredDrivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      <img src={drv.avatar} alt={drv.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-700" />
                      <div>
                        <div className="font-bold text-white text-sm">{drv.name}</div>
                        <div className="text-[10px] text-zinc-400">{drv.phone}</div>
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-zinc-300">{drv.emirate}</td>

                    <td className="p-3">
                      <div className="font-bold text-zinc-200">{drv.vehicleModel}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{drv.vehiclePlate}</div>
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
                                <span className="bg-black text-white font-black px-2.5 py-0.5 rounded-lg border border-white inline-flex items-center gap-1 shadow">
                                  <span>معطل / معلق ⛔</span>
                                </span>
                                <div className="text-[10px] text-zinc-400">
                                  الحالة: <strong className="text-zinc-300">غير متاح للطلبات</strong>
                                </div>
                              </div>
                            ) : isExemption ? (
                              <div className="space-y-1">
                                <span className="bg-zinc-900 text-white font-extrabold px-2.5 py-0.5 rounded-lg border border-zinc-700 inline-flex items-center gap-1">
                                  <span>إعفاء ({drv.usedExemptionCode || 'كود'}) ✓</span>
                                </span>
                                <div className="text-[10px] text-zinc-400">
                                  ينتهي: <strong className="text-white">{drv.subscriptionExpiry}</strong>
                                </div>
                                {isExpiring && (
                                  <span className="bg-zinc-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-zinc-700 flex items-center gap-1 w-fit animate-pulse">
                                    <Bell className="w-2.5 h-2.5" />
                                    <span>تنبيه إعفاء 5 أيام (متبقي {daysRemaining} يوم)</span>
                                  </span>
                                )}
                              </div>
                            ) : drv.subscriptionStatus === 'active' ? (
                              <div className="space-y-1">
                                <span className="bg-zinc-900 text-white font-extrabold px-2.5 py-0.5 rounded-lg border border-zinc-700 inline-flex items-center gap-1">
                                  <span>مفعل ({subscriptionPrice} AED) ✓</span>
                                </span>
                                <div className="text-[10px] text-zinc-400">
                                  ينتهي: <strong className="text-white">{drv.subscriptionExpiry}</strong>
                                </div>
                                {isExpiring && (
                                  <span className="bg-zinc-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-zinc-700 flex items-center gap-1 w-fit animate-pulse">
                                    <Bell className="w-2.5 h-2.5" />
                                    <span>تذكير 5 أيام (متبقي {daysRemaining} يوم)</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="bg-zinc-900 text-zinc-400 font-extrabold px-2.5 py-1 rounded-lg border border-zinc-700 flex items-center gap-1 w-fit">
                                <span>غير مفعل / بانتظار الدفع ⏳</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(inv)}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white p-1.5 rounded-lg border border-zinc-700 transition-colors"
                                title="عرض الفاتورة الرسمية"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {isSuspended ? (
                                <a
                                  href={getWhatsAppSuspendedUrl(drv.phone, drv.name, drv.usedExemptionCode)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-black hover:bg-zinc-900 text-white p-1.5 rounded-lg border border-zinc-700 transition-all shadow"
                                  title="إرسال إشعار تعليق الحساب بالواتساب"
                                >
                                  <Share2 className="w-3.5 h-3.5 text-white" />
                                </a>
                              ) : isExemption && isExpiring ? (
                                <a
                                  href={getWhatsAppExemptionReminderUrl(drv.phone, drv.name, daysRemaining, drv.subscriptionExpiry, drv.usedExemptionCode)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-zinc-900 hover:bg-zinc-800 text-white p-1.5 rounded-lg border border-zinc-700 transition-all"
                                  title="إرسال تذكير قرب انتهاء الإعفاء بالواتساب (5 أيام)"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </a>
                              ) : isExpiring ? (
                                <a
                                  href={getWhatsAppReminderUrl(drv.phone, drv.name, daysRemaining, drv.subscriptionExpiry)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-zinc-900 hover:bg-zinc-800 text-white p-1.5 rounded-lg border border-zinc-700 transition-all"
                                  title="إرسال تذكير التجديد بالواتساب"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </a>
                              ) : null}
                            </div>
                          </td>
                        </>
                      );
                    })()}

                    <td className="p-3 font-bold text-zinc-200">{drv.completedDeliveries} توصيلة</td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleVerifyDriver(drv.id)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all active:scale-95 text-[11px] ${
                          drv.isVerified
                            ? 'bg-white text-black border border-white'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
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
                            className="bg-white hover:bg-zinc-200 text-black font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 active:scale-95 transition-all shadow"
                            title="إعادة تنشيط وتفعيل حساب السائق"
                          >
                            <Power className="w-3 h-3 text-black" />
                            <span>تنشيط</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleDriverStatus && onToggleDriverStatus(drv.id, 'suspended')}
                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold px-2.5 py-1 rounded-lg text-[11px] border border-zinc-700 flex items-center gap-1 active:scale-95 transition-all"
                            title="تعطيل وتعليق حساب السائق مؤقتاً"
                          >
                            <PowerOff className="w-3 h-3 text-zinc-400" />
                            <span>تعطيل</span>
                          </button>
                        )}

                        {/* Delete Driver Account Button */}
                        <button
                          type="button"
                          onClick={() => setDriverToDelete(drv)}
                          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white p-1.5 rounded-lg border border-zinc-700 transition-colors active:scale-95"
                          title="حذف حساب السائق نهائياً من المنصة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-black px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base">إنشاء كود إعفاء جديد</h4>
                  <p className="text-[11px] text-zinc-400">تخصيص كود إعفاء مجاني للسائقين مع تحديد المدة والعدد</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateCodeModal(false)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCodeSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              
              {/* Code Name & Generate Button */}
              <div className="space-y-1.5">
                <label className="block font-bold text-zinc-300">
                  رمز الكود (الكود الترويجي):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                    placeholder="مثال: WASEL2026 أو FREE1M"
                    className="flex-1 bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-black text-white tracking-wider focus:outline-none focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-2 rounded-xl border border-zinc-700 font-bold active:scale-95"
                  >
                    توليد تلقائي 🎲
                  </button>
                </div>
              </div>

              {/* Exemption Duration (Months) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-zinc-300">
                  فترة الإعفاء المجاني (بالشهور):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 6].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewCodeMonths(m)}
                      className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                        newCodeMonths === m
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {m === 1 ? 'شهر (1)' : m === 2 ? 'شهرين (2)' : `${m} شهور`}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-zinc-400">أو عدد مخصص:</span>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={newCodeMonths}
                    onChange={(e) => setNewCodeMonths(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20 bg-black border border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white text-center"
                  />
                  <span className="text-[11px] text-zinc-400">شهر</span>
                </div>
              </div>

              {/* Max Drivers Usage */}
              <div className="space-y-1.5">
                <label className="block font-bold text-zinc-300">
                  عدد السائقين المسموح لهم باستخدام الكود:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setNewCodeMaxDrivers(count)}
                      className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                        newCodeMaxDrivers === count
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {count} سائق
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-zinc-400">أو عدد مخصص:</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={newCodeMaxDrivers}
                    onChange={(e) => setNewCodeMaxDrivers(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-24 bg-black border border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white text-center"
                  />
                  <span className="text-[11px] text-zinc-400">سائق</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block font-bold text-zinc-300">
                  ملاحظات أو مناسبة الكود (اختياري):
                </label>
                <input
                  type="text"
                  value={newCodeNotes}
                  onChange={(e) => setNewCodeNotes(e.target.value)}
                  placeholder="مثال: كود ترويجي لإطلاق الحملة الإعلانية"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              {/* Preview Box */}
              <div className="bg-black p-3.5 rounded-2xl border border-zinc-800 space-y-1">
                <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>ملخص الكود الجديد:</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  سيتمكن حتى <strong className="text-white">{newCodeMaxDrivers} سائق</strong> من إدخال الكود للحصول على <strong className="text-white">اشتراك مجاني بالكامل لمدة {newCodeMonths} {newCodeMonths === 1 ? 'شهر' : 'شهور'}</strong> فور التسجيل أو التجديد.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-3 rounded-xl text-xs active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ وإنشاء الكود</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateCodeModal(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold py-3 px-5 rounded-xl text-xs active:scale-95"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border-2 border-zinc-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-black px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <Trash2 className="w-5 h-5 text-white" />
                <span className="text-sm sm:text-base">تأكيد حذف حساب السائق نهائياً</span>
              </div>
              <button
                onClick={() => setDriverToDelete(null)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-right">
              <div className="flex items-center gap-3 bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                <img src={driverToDelete.avatar} alt={driverToDelete.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-700" />
                <div>
                  <div className="font-bold text-white text-sm sm:text-base">{driverToDelete.name}</div>
                  <div className="text-xs text-zinc-400">{driverToDelete.phone} • {driverToDelete.emirate}</div>
                  <div className="text-[11px] text-zinc-400 font-mono">{driverToDelete.vehicleModel} ({driverToDelete.vehiclePlate})</div>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl text-xs text-zinc-300 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-white shrink-0" />
                  <span>تحذير أمني من إدارة المنصة:</span>
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
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
                  className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 shadow transition-all"
                >
                  <Trash2 className="w-4 h-4 text-black" />
                  <span>تأكيد الحذف النهائي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDriverToDelete(null)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl text-xs border border-zinc-700 active:scale-95 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
