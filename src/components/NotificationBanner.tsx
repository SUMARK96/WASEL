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
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/30 rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md relative overflow-hidden animate-in fade-in duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full filter blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              permission === 'granted' 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
            }`}>
              {permission === 'granted' ? (
                <BellRing className="w-5 h-5 text-emerald-400" />
              ) : (
                <Bell className="w-5 h-5 text-cyan-300" />
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
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> مفعلة
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-[11px] sm:text-xs mt-0.5 max-w-xl leading-relaxed">
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
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>تفعيل الإشعارات</span>
              </button>
            )}

            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold px-3 py-2 rounded-xl border border-slate-700 text-xs transition-all active:scale-95"
                title="إضافة واصل للشاشة الرئيسية لهاتفك"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>إضافة للشاشة الرئيسية</span>
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
              title="إخفاء مؤقت"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* PWA Home Screen Installation Guide Modal */}
      {showPwaGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPwaGuide(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3 border border-cyan-500/40">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">
                تثبيت منصة واصل على شاشة هاتفك
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                لتصلك إشعارات الطلبات والعروض كإشعارات التطبيقات تماماً
              </p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-200 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              
              {/* iPhone (iOS) */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                  <span>📱 لأجهزة آيفون (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>اضغط على زر المشاركة <span className="font-bold text-white">Share (الأيقونة في الأسفل)</span>.</li>
                  <li>اختر <span className="font-bold text-cyan-300">"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</span>.</li>
                  <li>اضغط <span className="font-bold text-emerald-400">"إضافة" (Add)</span>.</li>
                </ol>
              </div>

              {/* Android */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                  <span>🤖 لأجهزة أندرويد (Chrome):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>اضغط على قائمة النقاط الثلاث <span className="font-bold text-white">⋮ في أعلى المتصفح</span>.</li>
                  <li>اختر <span className="font-bold text-blue-300">"تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</span>.</li>
                  <li>اضغط <span className="font-bold text-emerald-400">"تثبيت" (Install)</span>.</li>
                </ol>
              </div>

            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  handleEnableNotifications();
                  setShowPwaGuide(false);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all"
              >
                تفعيل الإشعارات والبدء
              </button>
              <button
                onClick={() => setShowPwaGuide(false)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs"
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
