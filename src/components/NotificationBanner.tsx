import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Smartphone, CheckCircle2, X } from 'lucide-react';
import { 
  getNotificationPermissionState, 
  requestNotificationPermission, 
  isPwaInstalled 
} from '../utils/pushNotificationService';

interface NotificationBannerProps {
  userRole?: 'customer' | 'driver' | 'general';
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ userRole = 'general' }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setPermission(getNotificationPermissionState());
    setIsInstalled(isPwaInstalled());

    // Listen for beforeinstallprompt event on Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermission('granted');
    } else {
      setPermission(getNotificationPermissionState());
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowPwaGuide(true);
    }
  };

  if (isDismissed) return null;

  return (
    <>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xl relative overflow-hidden animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              permission === 'granted' 
                ? 'bg-white/10 text-white border-white/30' 
                : 'bg-zinc-900 text-white border-zinc-700 animate-pulse'
            }`}>
              {permission === 'granted' ? (
                <BellRing className="w-5 h-5 text-white" />
              ) : (
                <Bell className="w-5 h-5 text-zinc-300" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-white">
                  {userRole === 'driver' 
                    ? 'إشعارات الطلبات الجديدة الفورية كالتطبيقات' 
                    : userRole === 'customer'
                    ? 'إشعارات عروض السائقين اللحظية'
                    : 'إشعارات الهاتف وتطبيق واصل'}
                </span>
                {permission === 'granted' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                    <CheckCircle2 className="w-3 h-3" /> مفعلة
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-[11px] sm:text-xs mt-0.5 max-w-xl leading-relaxed">
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
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-black font-black px-3.5 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>تفعيل الإشعارات</span>
              </button>
            )}

            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-3 py-2 rounded-xl border border-zinc-700 text-xs transition-all active:scale-95"
                title="إضافة واصل للشاشة الرئيسية لهاتفك"
              >
                <Smartphone className="w-3.5 h-3.5 text-zinc-300" />
                <span>إضافة للشاشة الرئيسية</span>
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="إخفاء مؤقت"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* PWA Home Screen Installation Guide Modal */}
      {showPwaGuide && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPwaGuide(false)}
              className="absolute top-4 left-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">
                تثبيت منصة واصل على شاشة هاتفك
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                لتصلك إشعارات الطلبات والعروض كإشعارات التطبيقات تماماً
              </p>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-200 bg-black p-4 rounded-2xl border border-zinc-800">
              
              {/* iPhone (iOS) */}
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <span>📱 لأجهزة آيفون (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                  <li>اضغط على زر المشاركة <span className="font-bold text-white">Share (الأيقونة في الأسفل)</span>.</li>
                  <li>اختر <span className="font-bold text-white">"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</span>.</li>
                  <li>اضغط <span className="font-bold text-white">"إضافة" (Add)</span>.</li>
                </ol>
              </div>

              {/* Android */}
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <span>🤖 لأجهزة أندرويد (Chrome):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                  <li>اضغط على قائمة النقاط الثلاث <span className="font-bold text-white">⋮ في أعلى المتصفح</span>.</li>
                  <li>اختر <span className="font-bold text-white">"تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</span>.</li>
                  <li>اضغط <span className="font-bold text-white">"تثبيت" (Install)</span>.</li>
                </ol>
              </div>

            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  handleEnableNotifications();
                  setShowPwaGuide(false);
                }}
                className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-3 rounded-xl text-xs shadow-md transition-all"
              >
                تفعيل الإشعارات والبدء
              </button>
              <button
                onClick={() => setShowPwaGuide(false)}
                className="px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl text-xs border border-zinc-800"
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
