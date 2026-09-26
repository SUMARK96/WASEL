import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Smartphone, CheckCircle2, X } from 'lucide-react';
import { 
  getNotificationPermissionState, 
  requestNotificationPermission, 
  isPwaInstalled,
  setPwaInstalledFlag,
  isNotificationEnabled,
  setNotificationEnabledFlag,
  isNotificationBannerDismissed,
  setNotificationBannerDismissedFlag,
  shouldHideNotificationBanner
} from '../utils/pushNotificationService';

interface NotificationBannerProps {
  userRole?: 'customer' | 'driver' | 'general';
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ userRole = 'general' }) => {
  const [permission, setPermission] = useState<NotificationPermission>(() => getNotificationPermissionState());
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isPwaInstalled());
  const [isDismissed, setIsDismissed] = useState<boolean>(() => isNotificationBannerDismissed());
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const updateState = () => {
      setPermission(getNotificationPermissionState());
      setIsInstalled(isPwaInstalled());
      setIsDismissed(isNotificationBannerDismissed());
    };

    updateState();

    // Listen for beforeinstallprompt event on Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for native PWA installation completion
    const handleAppInstalled = () => {
      setPwaInstalledFlag(true);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('wasel-pwa-state-changed', updateState);
    window.addEventListener('wasel-notif-state-changed', updateState);
    window.addEventListener('wasel-banner-dismissed-changed', updateState);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('wasel-pwa-state-changed', updateState);
      window.removeEventListener('wasel-notif-state-changed', updateState);
      window.removeEventListener('wasel-banner-dismissed-changed', updateState);
    };
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermission('granted');
      setNotificationEnabledFlag(true);
    } else {
      setPermission(getNotificationPermissionState());
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setPwaInstalledFlag(true);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowPwaGuide(true);
    }
  };

  const handleDismissBanner = () => {
    setNotificationBannerDismissedFlag(true);
    setIsDismissed(true);
  };

  // NEVER show the banner if:
  // 1. User dismissed it permanently
  // 2. Both app is installed AND notifications are granted/enabled
  // 3. shouldHideNotificationBanner() evaluates to true
  if (isDismissed || shouldHideNotificationBanner() || (isInstalled && (permission === 'granted' || isNotificationEnabled()))) {
    return null;
  }

  return (
    <>
      <div className="bg-white border border-[#E5EDF3] rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              permission === 'granted' 
                ? 'bg-[#EAF6F1] text-[#159B7A] border-[#159B7A]/30' 
                : 'bg-[#EEF4FA] text-[#159B7A] border-[#E5EDF3] animate-pulse'
            }`}>
              {permission === 'granted' ? (
                <BellRing className="w-5 h-5 text-[#159B7A]" />
              ) : (
                <Bell className="w-5 h-5 text-[#159B7A]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#142F52]">
                  {userRole === 'driver' 
                    ? 'إشعارات الطلبات الجديدة الفورية كالتطبيقات' 
                    : userRole === 'customer'
                    ? 'إشعارات عروض السائقين اللحظية'
                    : 'إشعارات الهاتف وتطبيق واصل'}
                </span>
                {permission === 'granted' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#159B7A] bg-[#EAF6F1] px-2 py-0.5 rounded-full border border-[#159B7A]/20">
                    <CheckCircle2 className="w-3 h-3" /> مفعلة
                  </span>
                )}
              </div>
              <p className="text-[#64748B] text-[11px] sm:text-xs mt-0.5 max-w-xl leading-relaxed">
                {userRole === 'driver'
                  ? 'فعّل الإشعارات لتصلك تنبيهات صوتية ومباشرة على شاشة هاتفك فور نشر أي عميل لطلب توصيل جديد.'
                  : 'فعّل الإشعارات وثبت التطبيق على هاتفك لتصلك عروض السائقين كإشعارات انستقرام وفيسبوك.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            {permission !== 'granted' && (
              <button
                onClick={handleEnableNotifications}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#159B7A] hover:bg-[#108466] text-white font-black px-3.5 py-2 rounded-xl text-xs shadow-sm transition-all active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>تفعيل الإشعارات</span>
              </button>
            )}

            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#EEF4FA] hover:bg-[#E2EDF7] text-[#142F52] font-bold px-3 py-2 rounded-xl border border-[#E5EDF3] text-xs transition-all active:scale-95"
                title="إضافة واصل للشاشة الرئيسية لهاتفك"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#159B7A]" />
                <span>إضافة للشاشة الرئيسية</span>
              </button>
            )}

            <button
              onClick={handleDismissBanner}
              className="p-1.5 text-[#64748B] hover:text-[#142F52] rounded-lg hover:bg-[#F5F9FC] transition-colors"
              title="إغلاق وعدم العرض مرة أخرى"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* PWA Home Screen Installation Guide Modal */}
      {showPwaGuide && (
        <div className="fixed inset-0 z-50 bg-[#142F52]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5EDF3] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPwaGuide(false)}
              className="absolute top-4 left-4 text-[#64748B] hover:text-[#142F52] p-2 rounded-full hover:bg-[#F5F9FC]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF6F1] text-[#159B7A] flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-[#142F52]">
                تثبيت منصة واصل على شاشة هاتفك
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                لتصلك إشعارات الطلبات والعروض كإشعارات التطبيقات تماماً
              </p>
            </div>

            <div className="space-y-3.5 text-xs text-[#142F52] bg-[#F5F9FC] p-4 rounded-2xl border border-[#E5EDF3]">
              
              {/* iPhone (iOS) */}
              <div className="p-2.5 rounded-xl bg-white border border-[#E5EDF3]">
                <div className="font-bold text-[#142F52] mb-1 flex items-center gap-1.5">
                  <span>📱 لأجهزة آيفون (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[#64748B]">
                  <li>اضغط على زر المشاركة <span className="font-bold text-[#142F52]">Share (الأيقونة في الأسفل)</span>.</li>
                  <li>اختر <span className="font-bold text-[#142F52]">"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</span>.</li>
                  <li>اضغط <span className="font-bold text-[#142F52]">"إضافة" (Add)</span>.</li>
                </ol>
              </div>

              {/* Android */}
              <div className="p-2.5 rounded-xl bg-white border border-[#E5EDF3]">
                <div className="font-bold text-[#142F52] mb-1 flex items-center gap-1.5">
                  <span>🤖 لأجهزة أندرويد (Chrome):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[#64748B]">
                  <li>اضغط على قائمة النقاط الثلاث <span className="font-bold text-[#142F52]">⋮ في أعلى المتصفح</span>.</li>
                  <li>اختر <span className="font-bold text-[#142F52]">"تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</span>.</li>
                  <li>اضغط <span className="font-bold text-[#142F52]">"تثبيت" (Install)</span>.</li>
                </ol>
              </div>

            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  handleEnableNotifications();
                  setPwaInstalledFlag(true);
                  setIsInstalled(true);
                  setShowPwaGuide(false);
                }}
                className="flex-1 bg-[#159B7A] hover:bg-[#108466] text-white font-black py-3 rounded-xl text-xs shadow-sm transition-all"
              >
                تفعيل الإشعارات وتأكيد التثبيت
              </button>
              <button
                onClick={() => setShowPwaGuide(false)}
                className="px-4 bg-[#F5F9FC] hover:bg-[#EEF4FA] text-[#64748B] font-bold py-3 rounded-xl text-xs border border-[#E5EDF3]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
