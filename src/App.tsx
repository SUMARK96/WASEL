import { useState, useEffect } from 'react';
import type { AppScreen, DriverProfile, DeliveryRequest, DriverOffer, SubscriptionPlanId, DriverNotification, CustomerNotification } from './types';
import { INITIAL_DRIVERS, INITIAL_REQUESTS } from './data/mockData';
import { dbService } from './services/dbService';
import { initNotificationService, sendDeviceNotification } from './utils/pushNotificationService';

import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { DriverPortalGate } from './components/DriverPortalGate';
import { DriverLoginView } from './components/DriverLoginView';
import { CustomerView } from './components/CustomerView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';

import { NewRequestModal } from './components/NewRequestModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SubmitOfferModal } from './components/SubmitOfferModal';
import { DriverProfileModal } from './components/DriverProfileModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { DriverRegistrationModal } from './components/DriverRegistrationModal';
import { RateDriverModal } from './components/RateDriverModal';
import { Logo } from './components/Logo';

import { Lock, LogOut, Bell } from 'lucide-react';

export function App() {
  // Primary Screen State (Default is Landing with 2 options: Customer or Driver)
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  
  const [drivers, setDrivers] = useState<DriverProfile[]>(INITIAL_DRIVERS);
  const [activeDriverId, setActiveDriverId] = useState<string>(INITIAL_DRIVERS[0].id);
  const [requests, setRequests] = useState<DeliveryRequest[]>(INITIAL_REQUESTS);
  
  // Real-time Driver Notifications Broadcast Store
  const [notifications, setNotifications] = useState<DriverNotification[]>([
    {
      id: 'notif-1',
      requestId: 'req-201',
      title: 'توصيل طرد قطع غيار سيارات من أبوظبي إلى الشارقة',
      pickupEmirate: 'أبوظبي',
      deliveryEmirate: 'الشارقة',
      timestamp: 'منذ ساعتين',
      isRead: false
    },
    {
      id: 'notif-2',
      requestId: 'req-202',
      title: 'نقل طرد مستندات وعقود رسمية عاجلة من دبي إلى رأس الخيمة',
      pickupEmirate: 'دبي',
      deliveryEmirate: 'رأس الخيمة',
      timestamp: 'منذ 4 ساعات',
      isRead: true
    }
  ]);

  // Real-time Customer Notifications Store (When drivers submit offers)
  const [customerNotifications, setCustomerNotifications] = useState<CustomerNotification[]>([
    {
      id: 'cust-notif-1',
      requestId: 'req-201',
      requestTitle: 'توصيل طرد قطع غيار سيارات من أبوظبي إلى الشارقة',
      driverName: 'خالد المنصوري',
      driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      driverRating: 4.9,
      driverPhone: '0501234567',
      driverWhatsappPhone: '971501234567',
      price: 180,
      timestamp: 'منذ 30 دقيقة',
      isRead: false,
      type: 'new_offer'
    }
  ]);

  // Modals state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isDriverRegisterOpen, setIsDriverRegisterOpen] = useState(false);
  const [isAdminPasswordOpen, setIsAdminPasswordOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  const [selectedDriverForProfile, setSelectedDriverForProfile] = useState<DriverProfile | DriverOffer | null>(null);
  const [selectedRequestForOffer, setSelectedRequestForOffer] = useState<DeliveryRequest | null>(null);
  const [selectedRequestForRating, setSelectedRequestForRating] = useState<{ request: DeliveryRequest; offer: DriverOffer } | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Initial load from Supabase / DB Service and Service Worker initialization
  useEffect(() => {
    initNotificationService();
    
    const loadInitialData = async () => {
      try {
        const [loadedDrivers, loadedRequests] = await Promise.all([
          dbService.getDrivers(),
          dbService.getRequests()
        ]);
        if (loadedDrivers && loadedDrivers.length > 0) {
          setDrivers(loadedDrivers);
        }
        if (loadedRequests && loadedRequests.length > 0) {
          setRequests(loadedRequests);
        }
      } catch (err) {
        console.warn('Could not load from DB service:', err);
      }
    };
    loadInitialData();
  }, []);

  const currentDriver = drivers.find(d => d.id === activeDriverId) || drivers[0];

  // Admin Access Handler
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentScreen('admin');
    } else {
      setIsAdminPasswordOpen(true);
    }
  };

  const handleAdminSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminPasswordOpen(false);
    setCurrentScreen('admin');
    showToast('🔓 تم تأكيد كلمة السر والدخول إلى لوحة الإدارة بنجاح');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentScreen('landing');
    showToast('🔒 تم إغلاق لوحة الإدارة وتأمين الحساب');
  };

  // Customer creates a new request -> AUTOMATIC BROADCAST TO ALL DRIVERS (Device Push + Sound)
  const handleCreateRequest = async (reqData: Omit<DeliveryRequest, 'id' | 'createdAt' | 'offers' | 'status'>) => {
    const newId = `req-${Date.now()}`;
    const newReq: DeliveryRequest = {
      ...reqData,
      id: newId,
      status: 'open',
      createdAt: 'الآن',
      offers: []
    };

    // 1. Add new request in UI
    setRequests(prev => [newReq, ...prev]);

    // 2. Broadcast Instant Notification to all registered drivers
    const newNotif: DriverNotification = {
      id: `notif-${Date.now()}`,
      requestId: newId,
      title: newReq.title,
      pickupEmirate: newReq.pickupEmirate,
      deliveryEmirate: newReq.deliveryEmirate,
      timestamp: 'الآن',
      isRead: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    setIsNewRequestOpen(false);

    // 3. Dispatch Native System Web Notification & Audio Alert for all drivers
    await sendDeviceNotification({
      title: `🔔 طلب توصيل جديد: من ${newReq.pickupEmirate} إلى ${newReq.deliveryEmirate}`,
      body: `${newReq.title} (${newReq.packageWeight || 'طرد'}) - اضغط لتقديم عرض سعرك فوراً!`,
      tag: `new-req-${newId}`,
      soundType: 'new_request',
      url: '/?action=driver_portal'
    });

    // 4. Persist to Supabase Database
    await dbService.createRequest(newReq);

    showToast('📣 تم نشر طلب التوصيل بنجاح وإرسال إشعار فوري لجميع السائقين المسجلين بالموقع!');
  };

  // Driver submits an offer with WhatsApp & Call numbers -> AUTOMATIC ALERT TO CUSTOMER (Device Push + Sound)
  const handleSubmitOffer = async (price: number, estimatedDeliveryTime: string, note: string, whatsappPhone: string, callPhone: string) => {
    if (!selectedRequestForOffer) return;

    const newOffer: DriverOffer = {
      id: `off-${Date.now()}`,
      requestId: selectedRequestForOffer.id,
      driverId: currentDriver.id,
      driverName: currentDriver.name,
      driverAvatar: currentDriver.avatar,
      driverRating: currentDriver.rating,
      driverVehicle: `${currentDriver.vehicleModel} (${currentDriver.vehiclePlate})`,
      driverVehicleType: currentDriver.vehicleType,
      driverPhone: currentDriver.phone,
      driverWhatsappPhone: whatsappPhone.replace(/[^0-9]/g, ''),
      driverCallPhone: callPhone,
      driverCompletedCount: currentDriver.completedDeliveries,
      driverVerified: currentDriver.isVerified,
      price,
      estimatedDeliveryTime,
      note,
      createdAt: 'الآن',
      status: 'pending'
    };

    setRequests(prev => prev.map(req => {
      if (req.id === selectedRequestForOffer.id) {
        return {
          ...req,
          offers: [newOffer, ...req.offers]
        };
      }
      return req;
    }));

    // 1. Add Customer Notification
    const newCustomerNotif: CustomerNotification = {
      id: `cust-notif-${Date.now()}`,
      requestId: selectedRequestForOffer.id,
      requestTitle: selectedRequestForOffer.title,
      offerId: newOffer.id,
      driverName: currentDriver.name,
      driverAvatar: currentDriver.avatar,
      driverRating: currentDriver.rating,
      driverPhone: currentDriver.phone,
      driverWhatsappPhone: whatsappPhone.replace(/[^0-9]/g, ''),
      price,
      timestamp: 'الآن',
      isRead: false,
      type: 'new_offer'
    };
    setCustomerNotifications(prev => [newCustomerNotif, ...prev]);

    // 2. Dispatch Native System Web Notification & Audio Alert for Customer
    await sendDeviceNotification({
      title: `💬 عرض سعر جديد (${price} AED) من الكابتن ${currentDriver.name}`,
      body: `قدم عرض توصيل لطلبك: "${selectedRequestForOffer.title}". اضغط للمعاينة والتواصل المباشر عبر واتساب.`,
      tag: `offer-${newOffer.id}`,
      soundType: 'new_offer',
      url: '/?action=customer'
    });

    setSelectedRequestForOffer(null);

    // 3. Persist offer to Supabase
    await dbService.submitOffer(newOffer);

    showToast('👍 تم إرسال عرضك بنجاح! سينتقل العميل فوراً لمحادثة واتساب معك عند القبول.');
  };

  // Customer accepts an offer
  const handleAcceptOffer = async (requestId: string, offerId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          selectedOfferId: offerId,
          status: 'assigned',
          offers: req.offers.map(off => off.id === offerId ? { ...off, status: 'accepted' } : off)
        };
      }
      return req;
    }));

    await dbService.acceptOffer(requestId, offerId);
    showToast('✅ تم قبول عرض السائق بنجاح! يمكنك الآن التواصل معه فوراً عبر زر الواتساب والمكالمة.');
  };

  // Mark driver notification read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Mark customer notification read
  const handleMarkCustomerNotificationRead = (id: string) => {
    setCustomerNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Driver Subscription Update
  const handleSubscribeSuccess = async (planId: SubscriptionPlanId) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const formattedExpiry = expiryDate.toISOString().split('T')[0];

    setDrivers(prev => prev.map(drv => {
      if (drv.id === currentDriver.id) {
        return {
          ...drv,
          subscriptionStatus: 'active',
          subscriptionPlan: planId,
          subscriptionExpiry: formattedExpiry
        };
      }
      return drv;
    }));

    setIsSubscriptionOpen(false);
    await dbService.updateDriverSubscription(currentDriver.id, planId, formattedExpiry, 'active');
    showToast(`🌟 تم تجديد اشتراك السائق وتأكيد الدفع عبر زينة بنجاح حتى ${formattedExpiry}!`);
  };

  // New Driver Registration & Activation Success
  const handleDriverRegisterSuccess = async (newDriver: DriverProfile) => {
    setDrivers(prev => [newDriver, ...prev]);
    setActiveDriverId(newDriver.id);
    setCurrentScreen('driver');
    setIsDriverRegisterOpen(false);

    // Save to database
    await dbService.registerDriver(newDriver);

    showToast(`🎉 مرحباً بك يا ${newDriver.name}! تم تفعيل حسابك واشتراكك بنجاح.`);
  };

  // Driver Login Success
  const handleDriverLoginSuccess = (driver: DriverProfile) => {
    setActiveDriverId(driver.id);
    setCurrentScreen('driver');
    showToast(`👋 مرحباً بعودتك يا ${driver.name}! تم تسجيل الدخول بنجاح.`);
  };

  // Customer rates a driver after delivery / accepted offer
  const handleSubmitRating = async (requestId: string, driverId: string, ratingValue: number, reviewNote: string) => {
    // 1. Update Driver Profile Rating
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const newReviewsCount = d.reviewsCount + 1;
        const newRating = Math.round((((d.rating * d.reviewsCount) + ratingValue) / newReviewsCount) * 100) / 100;
        return {
          ...d,
          rating: newRating,
          reviewsCount: newReviewsCount
        };
      }
      return d;
    }));

    // 2. Update offers across requests & mark current request as rated
    setRequests(prev => prev.map(req => {
      const updatedOffers = req.offers.map(off => {
        if (off.driverId === driverId) {
          const targetDriver = drivers.find(d => d.id === driverId);
          const currentCount = targetDriver?.reviewsCount || 1;
          const currentRating = targetDriver?.rating || 4.8;
          const newReviewsCount = currentCount + 1;
          const newRating = Math.round((((currentRating * currentCount) + ratingValue) / newReviewsCount) * 100) / 100;
          return {
            ...off,
            driverRating: newRating
          };
        }
        return off;
      });

      if (req.id === requestId) {
        return {
          ...req,
          isCustomerRated: true,
          customerRating: ratingValue,
          customerReviewNote: reviewNote,
          offers: updatedOffers
        };
      }

      return {
        ...req,
        offers: updatedOffers
      };
    }));

    setSelectedRequestForRating(null);

    // Persist rating to Supabase
    await dbService.rateDriver(requestId, driverId, ratingValue, reviewNote);

    showToast(`⭐ شكراً لك! تم تسجيل تقييمك (${ratingValue} نجوم) وتحديث ترتيب السائق.`);
  };

  // Admin toggles verification
  const handleToggleVerifyDriver = (driverId: string) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, isVerified: !d.isVerified } : d));
    showToast('تم تحديث حالة توثيق السائق بنجاح.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-white selection:text-black">
      
      {/* Toast Notification Alert - Luxury Monochrome */}
      {toastMessage && (
        <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto z-50 bg-zinc-900 border-2 border-white text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <Bell className="w-5 h-5 text-white shrink-0 animate-bounce" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header Component */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenNewRequest={() => setIsNewRequestOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        currentDriver={currentDriver}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* 1. Landing Screen (2 options only: Customer or Driver) */}
        {currentScreen === 'landing' && (
          <LandingView
            onSelectCustomer={() => setCurrentScreen('customer')}
            onSelectDriver={() => setCurrentScreen('driver_portal')}
          />
        )}

        {/* 2. Driver Portal Gate (2 options: New Driver or I Have an Account) */}
        {currentScreen === 'driver_portal' && (
          <DriverPortalGate
            onSelectNewDriver={() => setIsDriverRegisterOpen(true)}
            onSelectExistingDriver={() => setCurrentScreen('driver_login')}
            onBackToLanding={() => setCurrentScreen('landing')}
          />
        )}

        {/* 3. Driver Login View (Email & Password) */}
        {currentScreen === 'driver_login' && (
          <DriverLoginView
            drivers={drivers}
            onLoginSuccess={handleDriverLoginSuccess}
            onGoToRegister={() => {
              setCurrentScreen('driver_portal');
              setIsDriverRegisterOpen(true);
            }}
            onBackToPortal={() => setCurrentScreen('driver_portal')}
          />
        )}

        {/* 4. Customer View */}
        {currentScreen === 'customer' && (
          <CustomerView
            requests={requests}
            drivers={drivers}
            customerNotifications={customerNotifications}
            onMarkCustomerNotificationRead={handleMarkCustomerNotificationRead}
            onOpenNewRequest={() => setIsNewRequestOpen(true)}
            onAcceptOffer={handleAcceptOffer}
            onViewDriverProfile={(driverOffer) => setSelectedDriverForProfile(driverOffer)}
            onOpenRateDriver={(req, offer) => setSelectedRequestForRating({ request: req, offer })}
          />
        )}

        {/* 5. Driver View */}
        {currentScreen === 'driver' && (
          <DriverView
            driver={currentDriver}
            requests={requests}
            notifications={notifications}
            onOpenSubscription={() => setIsSubscriptionOpen(true)}
            onOpenSubmitOffer={(req) => setSelectedRequestForOffer(req)}
            onMarkNotificationRead={handleMarkNotificationRead}
          />
        )}

        {/* 6. Protected Admin View */}
        {currentScreen === 'admin' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-1.5 text-zinc-300 hover:text-white font-bold bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-700 text-xs transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4 text-white" />
                خروج من الإدارة
              </button>
            </div>
            <AdminView
              drivers={drivers}
              requests={requests}
              onToggleVerifyDriver={handleToggleVerifyDriver}
            />
          </div>
        )}

      </main>

      {/* Footer with Protected Admin Entrance - Ultra Clean Monochrome */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-8 sm:py-10 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setCurrentScreen('landing')}
            >
              <Logo size="sm" />
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 font-semibold text-zinc-400 text-[11px] sm:text-xs">
              <span className="hover:text-white transition-colors cursor-pointer">أبوظبي</span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">دبي</span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">الشارقة</span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">عجمان</span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">أم القيوين</span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">رأس الخيمة</span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">الفجيرة</span>
            </div>
          </div>

          {/* Admin Dashboard Entrance at bottom of footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <p className="text-zinc-500 text-center sm:text-right text-[11px] sm:text-xs">
              جميع الحقوق محفوظة لمنصة واصل (WASEL) © 2026 • خدمة توصيل الطرود بين إمارات الدولة
            </p>
            
            <button
              onClick={handleOpenAdmin}
              className="flex items-center gap-2 bg-black hover:bg-zinc-900 text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl border border-zinc-800 hover:border-zinc-500 transition-all font-bold shadow-md active:scale-95 text-xs"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-300" />
              <span>لوحة تحكم الإدارة (محمية)</span>
            </button>
          </div>

        </div>
      </footer>

      {/* Modals */}
      {isNewRequestOpen && (
        <NewRequestModal
          onClose={() => setIsNewRequestOpen(false)}
          onSubmit={handleCreateRequest}
        />
      )}

      {isSubscriptionOpen && (
        <SubscriptionModal
          driver={currentDriver}
          onClose={() => setIsSubscriptionOpen(false)}
          onSubscribeSuccess={handleSubscribeSuccess}
        />
      )}

      {isAdminPasswordOpen && (
        <AdminPasswordModal
          onClose={() => setIsAdminPasswordOpen(false)}
          onSuccess={handleAdminSuccess}
        />
      )}

      {selectedRequestForOffer && (
        <SubmitOfferModal
          request={selectedRequestForOffer}
          driver={currentDriver}
          onClose={() => setSelectedRequestForOffer(null)}
          onSubmitOffer={handleSubmitOffer}
        />
      )}

      {selectedDriverForProfile && (
        <DriverProfileModal
          driver={selectedDriverForProfile}
          onClose={() => setSelectedDriverForProfile(null)}
        />
      )}

      {isDriverRegisterOpen && (
        <DriverRegistrationModal
          onClose={() => setIsDriverRegisterOpen(false)}
          onRegisterSuccess={handleDriverRegisterSuccess}
        />
      )}

      {selectedRequestForRating && (
        <RateDriverModal
          request={selectedRequestForRating.request}
          driverOffer={selectedRequestForRating.offer}
          onClose={() => setSelectedRequestForRating(null)}
          onSubmitRating={handleSubmitRating}
        />
      )}

    </div>
  );
}

export default App;
