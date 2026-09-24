import React, { useState } from 'react';
import type { DeliveryRequest, DriverProfile, DriverNotification } from '../types';
import { UAE_EMIRATES } from '../data/mockData';
import { 
  getWhatsAppInvoiceUrl, 
  createSubscriptionInvoice,
  checkDriverSubscriptionStatus 
} from '../utils/subscriptionUtils';
import { InvoiceModal } from './InvoiceModal';
import { EmirateBadge } from './EmirateBadge';
import { NotificationBanner } from './NotificationBanner';
import { 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Phone, 
  Bell, 
  ArrowRight,
  Star,
  ChevronDown,
  FileText,
  Share2,
  User,
  LogOut,
  Layers,
  Check,
  AlertTriangle
} from 'lucide-react';

export type DriverDashboardSection = 'profile' | 'new_requests' | 'subscription';

interface DriverViewProps {
  driver: DriverProfile;
  requests: DeliveryRequest[];
  notifications: DriverNotification[];
  onOpenSubscription?: () => void;
  onOpenSubmitOffer: (request: DeliveryRequest) => void;
  onMarkNotificationRead?: (id: string) => void;
  onLogout?: () => void;
  subscriptionPrice?: number;
}

export const DriverView: React.FC<DriverViewProps> = ({
  driver,
  requests,
  notifications: _notifications,
  onOpenSubscription,
  onOpenSubmitOffer,
  onMarkNotificationRead: _onMarkNotificationRead,
  onLogout,
  subscriptionPrice = 199
}) => {
  // Navigation Section State (only shows selected section)
  const [selectedSection, setSelectedSection] = useState<DriverDashboardSection>('new_requests');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filters for new delivery requests
  const [filterPickup, setFilterPickup] = useState<string>('all');
  const [filterDelivery, setFilterDelivery] = useState<string>('all');
  const [requestTab, setRequestTab] = useState<'available' | 'my_bids' | 'active_jobs'>('available');
  
  // State for invoice modal
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const subStatus = checkDriverSubscriptionStatus(driver);
  const daysRemaining = subStatus.daysRemaining;
  const isExpired = subStatus.isExpired || driver.subscriptionStatus === 'expired';
  const isSuspended = subStatus.isSuspended || driver.subscriptionStatus === 'suspended';

  // Driver current invoice object
  const currentInvoice = createSubscriptionInvoice(
    driver,
    `ZIN-${driver.id.replace(/[^0-9]/g, '').slice(-6) || '892134'}`,
    driver.joinedDate || '2026-09-01',
    driver.subscriptionExpiry,
    driver.isExemptionActive ? 0 : subscriptionPrice
  );

  const openRequests = requests.filter(r => r.status === 'open');

  const filteredRequests = openRequests.filter(r => {
    const matchPickup = filterPickup === 'all' || r.pickupEmirate === filterPickup;
    const matchDelivery = filterDelivery === 'all' || r.deliveryEmirate === filterDelivery;
    return matchPickup && matchDelivery;
  });

  const myBids = requests.filter(r => r.offers.some(o => o.driverId === driver.id));
  const activeJobs = requests.filter(r => r.selectedOfferId && r.offers.some(o => o.id === r.selectedOfferId && o.driverId === driver.id));

  const handleOfferClick = (req: DeliveryRequest) => {
    if (isSuspended) {
      alert('⛔ تم تعليق حسابك لانتهاء فترة كود الإعفاء وعدم سداد الاشتراك الشهري. يرجى سداد الاشتراك لتتمكن من تقديم عروض الأسعار للعملاء.');
      if (onOpenSubscription) onOpenSubscription();
      else setSelectedSection('subscription');
      return;
    }
    if (isExpired || driver.subscriptionStatus !== 'active') {
      alert('⚠️ حسابك غير مفعل أو انتهت صلاحية اشتراكك. يجب سداد وتأكيد الاشتراك عبر رابط زينة أولاً لتتمكن من تقديم عروض الأسعار للعملاء.');
      if (onOpenSubscription) onOpenSubscription();
      else setSelectedSection('subscription');
      return;
    }
    onOpenSubmitOffer(req);
  };

  const handleDropdownSelect = (sectionKey: 'profile' | 'new_requests' | 'subscription' | 'logout') => {
    setIsDropdownOpen(false);
    if (sectionKey === 'logout') {
      if (onLogout) {
        onLogout();
      }
      return;
    }
    setSelectedSection(sectionKey);
  };

  const getSectionTitle = (sec: DriverDashboardSection) => {
    switch (sec) {
      case 'profile':
        return 'الملف الشخصي';
      case 'new_requests':
        return 'الطلبات الجديدة';
      case 'subscription':
        return 'الاشتراك';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* PWA & System Notifications Enable Banner */}
      <NotificationBanner userRole="driver" />

      {/* 👑 DRIVER NAVIGATION DROPDOWN & CONTROL BAR */}
      <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Main Dropdown Button */}
          <div className="relative flex-1">
            <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-white" />
              <span>لوحة تحكم السائق (اختر القسم المطلوب لعرضه فقط):</span>
            </label>

            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-black border-2 border-white hover:border-zinc-300 text-white rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between font-black text-sm sm:text-base shadow-xl transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                {selectedSection === 'profile' && (
                  <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                )}
                {selectedSection === 'new_requests' && (
                  <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                )}
                {selectedSection === 'subscription' && (
                  <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
                
                <div className="text-right">
                  <div className="text-sm sm:text-base font-black flex items-center gap-2">
                    <span>{getSectionTitle(selectedSection)}</span>
                    {selectedSection === 'profile' && (
                      <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                        الكابتن {driver.name.split(' ')[0]}
                      </span>
                    )}
                    {selectedSection === 'new_requests' && (
                      <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                        {openRequests.length} متاح
                      </span>
                    )}
                    {selectedSection === 'subscription' && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        driver.subscriptionStatus === 'active' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {driver.subscriptionStatus === 'active' ? 'نشط 🟢' : 'غير مفعل ⚠️'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400 font-normal">اضغط للتنقل أو تسجيل الخروج</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-xs font-bold text-white hidden sm:inline">تغيير القسم</span>
                <ChevronDown className={`w-5 h-5 text-white transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu Popup */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute top-full right-0 left-0 mt-2 z-40 bg-zinc-950 border-2 border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 divide-y divide-zinc-800">
                  
                  {/* Option 1: الملف الشخصي */}
                  <button
                    type="button"
                    onClick={() => handleDropdownSelect('profile')}
                    className={`w-full text-right p-3.5 sm:p-4 flex items-center justify-between transition-colors ${
                      selectedSection === 'profile' ? 'bg-white text-black font-black' : 'hover:bg-zinc-900 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        selectedSection === 'profile' ? 'bg-black text-white' : 'bg-zinc-900 text-white border border-zinc-700'
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-black">الملف الشخصي</div>
                        <div className={`text-[11px] ${selectedSection === 'profile' ? 'text-zinc-800' : 'text-zinc-400'}`}>
                          بيانات السائق، صور المركبة، التقييمات، وأرقام التواصل
                        </div>
                      </div>
                    </div>
                    {selectedSection === 'profile' && <Check className="w-5 h-5" />}
                  </button>

                  {/* Option 2: الطلبات الجديدة */}
                  <button
                    type="button"
                    onClick={() => handleDropdownSelect('new_requests')}
                    className={`w-full text-right p-3.5 sm:p-4 flex items-center justify-between transition-colors ${
                      selectedSection === 'new_requests' ? 'bg-white text-black font-black' : 'hover:bg-zinc-900 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        selectedSection === 'new_requests' ? 'bg-black text-white' : 'bg-zinc-900 text-white border border-zinc-700'
                      }`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-black flex items-center gap-2">
                          <span>الطلبات الجديدة</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            selectedSection === 'new_requests' ? 'bg-black text-white' : 'bg-white text-black'
                          }`}>
                            {openRequests.length} طلب
                          </span>
                        </div>
                        <div className={`text-[11px] ${selectedSection === 'new_requests' ? 'text-zinc-800' : 'text-zinc-400'}`}>
                          استعراض طلبات العملاء بين الإمارات وتقديم عروض الأسعار
                        </div>
                      </div>
                    </div>
                    {selectedSection === 'new_requests' && <Check className="w-5 h-5" />}
                  </button>

                  {/* Option 3: الاشتراك */}
                  <button
                    type="button"
                    onClick={() => handleDropdownSelect('subscription')}
                    className={`w-full text-right p-3.5 sm:p-4 flex items-center justify-between transition-colors ${
                      selectedSection === 'subscription' ? 'bg-white text-black font-black' : 'hover:bg-zinc-900 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        selectedSection === 'subscription' ? 'bg-black text-white' : 'bg-zinc-900 text-white border border-zinc-700'
                      }`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-black flex items-center gap-2">
                          <span>الاشتراك</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            selectedSection === 'subscription' ? 'bg-black/10 border-black/20 text-black' : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                          }`}>
                            {driver.subscriptionStatus === 'active' ? '199 AED شهرياً' : 'غير نشط'}
                          </span>
                        </div>
                        <div className={`text-[11px] ${selectedSection === 'subscription' ? 'text-zinc-800' : 'text-zinc-400'}`}>
                          حالة الاشتراك، موعد التجديد، الفاتورة، ورابط السداد عبر زينة
                        </div>
                      </div>
                    </div>
                    {selectedSection === 'subscription' && <Check className="w-5 h-5" />}
                  </button>

                  {/* Option 4: تسجيل خروج */}
                  <button
                    type="button"
                    onClick={() => handleDropdownSelect('logout')}
                    className="w-full text-right p-3.5 sm:p-4 flex items-center justify-between text-white hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-700 flex items-center justify-center font-bold">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">تسجيل خروج</div>
                        <div className="text-[11px] text-zinc-400">الخروج من حساب السائق والرجوع للشاشة الرئيسية</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 rotate-180 text-zinc-400" />
                  </button>

                </div>
              </>
            )}
          </div>

          {/* Quick Segmented Switcher for Large Screens */}
          <div className="hidden lg:flex items-center gap-2 self-end">
            <button
              onClick={() => setSelectedSection('profile')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedSection === 'profile'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-black text-zinc-300 hover:text-white border border-zinc-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>الملف الشخصي</span>
            </button>

            <button
              onClick={() => setSelectedSection('new_requests')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedSection === 'new_requests'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-black text-zinc-300 hover:text-white border border-zinc-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>الطلبات الجديدة ({openRequests.length})</span>
            </button>

            <button
              onClick={() => setSelectedSection('subscription')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedSection === 'subscription'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-black text-zinc-300 hover:text-white border border-zinc-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>الاشتراك</span>
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SECTION: الملف الشخصي (PROFILE) */}
      {/* ========================================================================= */}
      {selectedSection === 'profile' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Main Driver Profile Card */}
          <div className="bg-zinc-950 border-2 border-white rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-zinc-800 pb-6">
              <div className="flex items-center gap-4">
                <img
                  src={driver.avatar}
                  alt={driver.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-white shadow-xl"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-white">{driver.name}</h2>
                    {driver.isVerified && (
                      <span className="bg-white text-black text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <ShieldCheck className="w-3.5 h-3.5 text-black" />
                        <span>سائق معتمد وموثق</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-white font-bold bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-700">
                      <Star className="w-3.5 h-3.5 fill-white text-white" />
                      {driver.rating} ({driver.reviewsCount} تقييم)
                    </span>
                    <span>• الإمارة: <strong className="text-white">{driver.emirate}</strong></span>
                    <span>• انضم في: <strong className="text-white">{driver.joinedDate}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSection('subscription')}
                  className="bg-white hover:bg-zinc-200 text-black font-bold px-4 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-md"
                >
                  إدارة الاشتراك 📄
                </button>
              </div>
            </div>

            {/* Direct Contact Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-black p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-400">رقم الاتصال الهاتفي:</div>
                    <div className="font-bold text-white text-sm font-mono dir-ltr">{driver.callPhone || driver.phone}</div>
                  </div>
                </div>
                <a
                  href={`tel:${driver.callPhone || driver.phone}`}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-xl border border-zinc-700"
                >
                  اتصال
                </a>
              </div>

              <div className="bg-black p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-400">رقم الواتساب:</div>
                    <div className="font-bold text-white text-sm font-mono dir-ltr">{driver.whatsappPhone}</div>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${driver.whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-zinc-200 text-black font-bold text-xs px-3 py-1.5 rounded-xl"
                >
                  واتساب
                </a>
              </div>
            </div>

            {/* Vehicle Details & Real Photos Gallery */}
            <div className="bg-black p-5 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    مركبة التوصيل: {driver.vehicleModel} ({driver.vehiclePlate})
                  </h3>
                </div>
                <span className="text-xs text-zinc-400 font-bold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
                  {driver.vehiclePhotos ? driver.vehiclePhotos.length : 1} صور
                </span>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(driver.vehiclePhotos && driver.vehiclePhotos.length > 0 ? driver.vehiclePhotos : [driver.vehiclePhoto]).map((photoUrl, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-900 group">
                    <img
                      src={photoUrl}
                      alt={`Vehicle Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 text-center text-[9px] text-zinc-300">
                      صورة {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Official Documents Checklist */}
            <div className="bg-black p-5 rounded-2xl border border-zinc-800 space-y-3">
              <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>حالة الوثائق والمستندات الرسمية الثلاثة:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <div>
                    <div className="font-bold text-white">رخصة القيادة الإماراتية</div>
                    <div className="text-[10px] text-zinc-400">مدققة ومطابقة رسمياً ✓</div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <div>
                    <div className="font-bold text-white">ملكية المركبة (رخصة مركبة)</div>
                    <div className="text-[10px] text-zinc-400">مدققة ومطابقة رسمياً ✓</div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <div>
                    <div className="font-bold text-white">بطاقة الهوية الإماراتية</div>
                    <div className="text-[10px] text-zinc-400">مدققة ومطابقة رسمياً ✓</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {driver.bio && (
              <div className="bg-black p-4 rounded-2xl border border-zinc-800 text-xs space-y-1">
                <div className="font-bold text-zinc-400">نبذة عن السائق:</div>
                <p className="text-white leading-relaxed">{driver.bio}</p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SECTION: الطلبات الجديدة (NEW REQUESTS) */}
      {/* ========================================================================= */}
      {selectedSection === 'new_requests' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Status Alert if account is suspended due to exemption expiration */}
          {isSuspended ? (
            <div className="bg-black border-2 border-white p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center font-black shrink-0 text-lg shadow">
                  ⛔
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-white text-sm sm:text-base">تم تعليق حساب السائق مؤقتاً (Suspended)</h4>
                    {driver.usedExemptionCode && (
                      <span className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                        انتهاء كود الإعفاء: {driver.usedExemptionCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    انتهت فترة كود الإعفاء المجاني ولم يتم سداد الاشتراك الشهري. يرجى سداد الاشتراك ({subscriptionPrice} AED) لإعادة تفعيل الحساب فوراً والبدء بتقديم عروض الأسعار للعملاء.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenSubscription) onOpenSubscription();
                  else setSelectedSection('subscription');
                }}
                className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-black px-5 py-2.5 rounded-xl text-xs shrink-0 active:scale-95 transition-all shadow-lg"
              >
                سداد الاشتراك الشهري وتنشيط الحساب ⚡
              </button>
            </div>
          ) : subStatus.isExemption && subStatus.isExpiringSoon ? (
            /* 5-Day Exemption Expiry Warning */
            <div className="bg-zinc-950 border-2 border-white p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-in zoom-in-95">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-black shrink-0">
                  <Bell className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-white text-sm sm:text-base">
                      تنبيه: متبقي {subStatus.daysRemaining} {subStatus.daysRemaining === 1 ? 'يوم' : 'أيام'} على انتهاء فترة كود الإعفاء
                    </h4>
                    {driver.usedExemptionCode && (
                      <span className="bg-zinc-900 text-white text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700">
                        {driver.usedExemptionCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    ينتهي الإعفاء بتاريخ {driver.subscriptionExpiry}. يرجى دفع الاشتراك الشهري ({subscriptionPrice} AED) لتجنب تعليق الحساب عند نهاية الفترة.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenSubscription) onOpenSubscription();
                  else setSelectedSection('subscription');
                }}
                className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-black px-5 py-2.5 rounded-xl text-xs shrink-0 active:scale-95 transition-all shadow"
              >
                سداد الاشتراك الشهري الآن ({subscriptionPrice} AED)
              </button>
            </div>
          ) : isExpired ? (
            /* General Expired Alert */
            <div className="bg-zinc-950 border-2 border-white p-4 sm:p-5 rounded-3xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-white shrink-0" />
                <div>
                  <h4 className="font-black text-white text-sm">حسابك غير مفعل حالياً أو انتهت صلاحية الاشتراك</h4>
                  <p className="text-xs text-zinc-400">يجب سداد وتأكيد الاشتراك الموحد ({subscriptionPrice} AED) أو إدخال كود إعفاء لتقديم عروض الأسعار للعملاء.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenSubscription) onOpenSubscription();
                  else setSelectedSection('subscription');
                }}
                className="bg-white hover:bg-zinc-200 text-black font-bold px-4 py-2.5 rounded-xl text-xs shrink-0"
              >
                تفعيل الاشتراك ⚡
              </button>
            </div>
          ) : null}

          {/* Subtabs for Requests: المتاحة / عروضي المقدمة / المهام النشطة */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setRequestTab('available')}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  requestTab === 'available'
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white bg-zinc-900'
                }`}
              >
                الطلبات المتاحة ({openRequests.length})
              </button>

              <button
                onClick={() => setRequestTab('my_bids')}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  requestTab === 'my_bids'
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white bg-zinc-900'
                }`}
              >
                عروضي المقدمة ({myBids.length})
              </button>

              <button
                onClick={() => setRequestTab('active_jobs')}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  requestTab === 'active_jobs'
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white bg-zinc-900'
                }`}
              >
                المهام المقبولة ({activeJobs.length})
              </button>
            </div>

            {/* Emirate Route Filters */}
            {requestTab === 'available' && (
              <div className="flex items-center gap-2">
                <select
                  value={filterPickup}
                  onChange={(e) => setFilterPickup(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">من: جميع الإمارات</option>
                  {UAE_EMIRATES.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>

                <select
                  value={filterDelivery}
                  onChange={(e) => setFilterDelivery(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">إلى: جميع الإمارات</option>
                  {UAE_EMIRATES.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* List of Requests */}
          {requestTab === 'available' && (
            filteredRequests.length === 0 ? (
              <div className="bg-zinc-950 rounded-3xl p-8 sm:p-12 text-center border border-zinc-800 space-y-3">
                <Truck className="w-14 h-14 text-zinc-600 mx-auto stroke-[1.5]" />
                <h3 className="text-base sm:text-lg font-bold text-white">لا توجد طلبات توصيل متاحة حالياً</h3>
                <p className="text-zinc-400 text-xs">سيتم تحديث القائمة تلقائياً فور قيام أي عميل بنشر طلب توصيل جديد.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((req) => {
                  const alreadySubmitted = req.offers.some(o => o.driverId === driver.id);

                  return (
                    <div
                      key={req.id}
                      className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-white font-extrabold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
                              {req.packageType}
                            </span>
                            <span className="text-xs text-zinc-400">{req.createdAt}</span>
                            <span className="text-[10px] text-zinc-400 bg-black px-2 py-0.5 rounded-full border border-zinc-800">
                              {req.offers.length} عروض مقدمة
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-white">{req.title}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          {alreadySubmitted ? (
                            <span className="bg-zinc-900 text-white border border-zinc-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                              <Check className="w-4 h-4 text-white" />
                              <span>تم تقديم عرضك</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOfferClick(req)}
                              className="bg-white hover:bg-zinc-200 text-black font-black px-5 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>تقديم عرض سعر</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Route Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black p-3.5 rounded-2xl border border-zinc-800 text-xs">
                        <div>
                          <div className="text-zinc-400 mb-1">من (الاستلام):</div>
                          <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                            <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                          </div>
                          <div className="text-zinc-300">{req.pickupArea}</div>
                        </div>

                        <div>
                          <div className="text-zinc-400 mb-1">إلى (التسليم):</div>
                          <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                            <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                          </div>
                          <div className="text-zinc-300">{req.deliveryArea}</div>
                        </div>

                        <div>
                          <div className="text-zinc-400 mb-1">موعد التوصيل:</div>
                          <div className="text-white font-bold mb-0.5">📅 {req.deliveryDate}</div>
                          <div className="text-zinc-400">الوزن: {req.packageWeight}</div>
                        </div>
                      </div>

                      {req.notes && (
                        <p className="text-xs text-zinc-300 bg-black p-3 rounded-xl border border-zinc-800">
                          💡 <strong className="text-white">ملاحظات العميل:</strong> {req.notes}
                        </p>
                      )}

                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* My Bids Tab */}
          {requestTab === 'my_bids' && (
            myBids.length === 0 ? (
              <div className="bg-zinc-950 rounded-3xl p-8 text-center border border-zinc-800 text-zinc-400 text-xs">
                لم تقم بتقديم عروض أسعار بعد. استعرض الطلبات المتاحة وقدم عروضك الآن.
              </div>
            ) : (
              <div className="space-y-4">
                {myBids.map((req) => {
                  const myOffer = req.offers.find(o => o.driverId === driver.id);
                  return (
                    <div key={req.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-base">{req.title}</h3>
                        {myOffer && (
                          <span className="bg-white text-black font-extrabold px-3 py-1 rounded-xl text-xs">
                            عرضك: {myOffer.price} AED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                        <span>⬅️</span>
                        <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Active Jobs Tab */}
          {requestTab === 'active_jobs' && (
            activeJobs.length === 0 ? (
              <div className="bg-zinc-950 rounded-3xl p-8 text-center border border-zinc-800 text-zinc-400 text-xs">
                لا توجد مهام توصيل مقبولة حالياً. فور قبول العميل لعرضك ستظهر هنا مع بيانات العميل.
              </div>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((req) => (
                  <div key={req.id} className="bg-zinc-950 border-2 border-white rounded-3xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-white text-base">{req.title}</h3>
                      <span className="bg-white text-black font-extrabold px-3 py-1 rounded-full text-xs">
                        مهمة قيد التنفيذ 🚚
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <EmirateBadge emirate={req.pickupEmirate} type="pickup" size="sm" />
                      <span>⬅️</span>
                      <EmirateBadge emirate={req.deliveryEmirate} type="delivery" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION: الاشتراك (SUBSCRIPTION) */}
      {/* ========================================================================= */}
      {selectedSection === 'subscription' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Subscription Status Card */}
          <div className="bg-zinc-950 border-2 border-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
              <div>
                <span className="bg-zinc-900 text-zinc-300 text-[10px] font-black px-3 py-1 rounded-full border border-zinc-700 inline-block mb-2">
                  الباقة الموحدة للسائقين المعتمدين ⭐
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">تفاصيل الاشتراك الرسمي والفاتورة</h2>
                <p className="text-xs text-zinc-400 mt-1">تجديد شهري شامل لجميع مميزات المنصة بدون أي عمولة إضافية</p>
              </div>

              <div className="text-right sm:text-left">
                <span className="text-3xl font-black text-white">{subscriptionPrice}</span>
                <span className="text-xs text-zinc-400 font-bold mr-1">درهم / شهرياً</span>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-1">
                <div className="text-zinc-400">حالة الاشتراك الحالية:</div>
                <div className="font-black text-sm text-white">
                  {isSuspended ? (
                    <span className="text-white font-extrabold flex items-center gap-1">
                      <span>⛔ معلق لانتهاء كود الإعفاء</span>
                    </span>
                  ) : subStatus.isExemption ? (
                    <span className="text-white font-extrabold flex items-center gap-1">
                      <span>🟢 إعفاء نشط ({driver.usedExemptionCode || 'كود ترويجي'})</span>
                    </span>
                  ) : driver.subscriptionStatus === 'active' ? (
                    '🟢 نشط ومفعل'
                  ) : (
                    '⚠️ غير نشط'
                  )}
                </div>
              </div>

              <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-1">
                <div className="text-zinc-400">تاريخ انتهاء الاشتراك:</div>
                <div className="font-bold text-sm text-white font-mono">{driver.subscriptionExpiry}</div>
              </div>

              <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-1">
                <div className="text-zinc-400">الأيام المتبقية:</div>
                <div className="font-bold text-sm text-white">
                  {isSuspended ? (
                    <span className="text-zinc-400">انتهت فترة الإعفاء (معلق)</span>
                  ) : daysRemaining > 0 ? (
                    `${daysRemaining} يوماً`
                  ) : (
                    'منتهي الصلاحية'
                  )}
                </div>
              </div>
            </div>

            {/* Suspended Notice Banner inside Subscription Section */}
            {isSuspended && (
              <div className="bg-black border-2 border-white p-4 rounded-2xl text-xs text-white space-y-2">
                <div className="flex items-center gap-2 font-black text-sm">
                  <span>⛔ تنبيه تعليق الحساب (Account Suspended):</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  تم تعليق حسابك نظراً لانتهاء فترة كود الإعفاء وعدم سداد الاشتراك الشهري. قم بسداد الاشتراك الشهري عبر بوابة زينة ({subscriptionPrice} AED) أو إدخال كود إعفاء جديد لتنشيط حسابك فوراً.
                </p>
              </div>
            )}

            {/* 5-Day Automated Expiry Reminder Notice */}
            {!isSuspended && (
              <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-2xl text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Bell className="w-4 h-4 text-white" />
                  <span>
                    {subStatus.isExemption
                      ? 'نظام التنبيه التلقائي قبل انتهاء كود الإعفاء بـ 5 أيام:'
                      : 'نظام التنبيه التلقائي قبل الانتهاء بـ 5 أيام:'
                    }
                  </span>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  {subStatus.isExemption
                    ? `يقوم نظام واصل بإرسال إشعار ورسالة تذكير لهاتفك (${driver.phone}) قبل انتهاء كود الإعفاء بـ 5 أيام لتتمكن من سداد الاشتراك الشهري وتجنب تعليق الحساب.`
                    : `يقوم نظام واصل بإرسال رسالة تذكير وفاتورة رسمية لرقم هاتفك المدرج (${driver.phone}) قبل انتهاء موعد اشتراكك بـ 5 أيام لضمان استمرار ظهور عروضك دون انقطاع.`
                  }
                </p>
              </div>
            )}

            {/* Actions: Invoice Preview, WhatsApp Invoice, Ziina Pay / Promo Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-2xl text-xs border border-zinc-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>عرض الفاتورة الرسمية</span>
              </button>

              <a
                href={getWhatsAppInvoiceUrl(currentInvoice)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-2xl text-xs border border-zinc-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>إرسال الفاتورة للواتساب</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (onOpenSubscription) onOpenSubscription();
                }}
                className="bg-white hover:bg-zinc-200 text-black font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
              >
                <span>
                  {isSuspended 
                    ? `⚡ تنشيط الحساب وسداد الاشتراك (${subscriptionPrice} AED)` 
                    : `⚡ تجديد الاشتراك / كود إعفاء (${subscriptionPrice} AED)`
                  }
                </span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Official Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          invoice={currentInvoice}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

    </div>
  );
};
