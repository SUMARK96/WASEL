// Push Notification and Sound Alert Service for WASEL Platform
// Supports Web Notification API, Service Worker Push, and Web Audio API synthesizer

export type NotificationSoundType = 'new_request' | 'new_offer' | 'general' | 'success';

interface PushNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  url?: string;
  soundType?: NotificationSoundType;
  data?: Record<string, unknown>;
}

export const STORAGE_KEY_PWA_INSTALLED = 'wasel_pwa_installed';
export const STORAGE_KEY_NOTIF_ENABLED = 'wasel_notifications_enabled';
export const STORAGE_KEY_BANNER_DISMISSED = 'wasel_notification_banner_dismissed';

// Check if notification features are supported
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Check if PWA is installed on Home Screen (standalone display mode or persistent flag)
export const isPwaInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true ||
    localStorage.getItem(STORAGE_KEY_PWA_INSTALLED) === 'true';
  return isStandalone;
};

// Set persistent PWA installed flag
export const setPwaInstalledFlag = (installed: boolean = true): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PWA_INSTALLED, installed ? 'true' : 'false');
    window.dispatchEvent(new Event('wasel-pwa-state-changed'));
  }
};

// Check if notifications are enabled/granted
export const isNotificationEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (isNotificationSupported() && Notification.permission === 'granted') return true;
  return localStorage.getItem(STORAGE_KEY_NOTIF_ENABLED) === 'true';
};

// Set persistent notification enabled flag
export const setNotificationEnabledFlag = (enabled: boolean = true): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_NOTIF_ENABLED, enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('wasel-notif-state-changed'));
  }
};

// Check if user dismissed banner permanently
export const isNotificationBannerDismissed = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_BANNER_DISMISSED) === 'true';
};

// Set persistent banner dismissed flag
export const setNotificationBannerDismissedFlag = (dismissed: boolean = true): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_BANNER_DISMISSED, dismissed ? 'true' : 'false');
    window.dispatchEvent(new Event('wasel-banner-dismissed-changed'));
  }
};

// Check if banner should be completely hidden on ALL pages
export const shouldHideNotificationBanner = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (isNotificationBannerDismissed()) return true;
  // If both notifications are activated AND app is installed, NEVER show banner again on any page
  if (isNotificationEnabled() && isPwaInstalled()) return true;
  return false;
};

// Get current permission status
export const getNotificationPermissionState = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

// Initialize Service Worker
let swRegistration: ServiceWorkerRegistration | null = null;

export const initNotificationService = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  // Initialize audio gesture unlock for mobile & desktop
  initAudioUnlock();

  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = registration;
    console.log('✅ Service Worker registered successfully for WASEL push notifications.');
    return registration;
  } catch (error) {
    console.warn('⚠️ Service Worker registration failed:', error);
    return null;
  }
};

// Global shared AudioContext instance for cross-device high performance
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    console.warn('Could not initialize AudioContext:', e);
    return null;
  }
};

// Automatic audio unlock on first user gesture for mobile and desktop browsers
export const initAudioUnlock = () => {
  if (typeof window === 'undefined') return;
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('click', unlock, { once: true, passive: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
};

// Request User Permission for Native System Notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported on this browser/device.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('🔔 Notifications permission granted by user.');
      setNotificationEnabledFlag(true);
      // Play crisp high-volume test chime
      playNotificationChime('general');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Synthesize loud, ultra-crisp, Messenger / WhatsApp style audio notifications
// Uses dual-harmonic synthesis, fast attack transients, and dynamic compression for maximum perceived loudness & clarity
export const playNotificationChime = (type: NotificationSoundType = 'general') => {
  if (typeof window === 'undefined') return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Dynamics Compressor / Limiter (maximizes volume & loudness punch without digital clipping)
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, now);
    compressor.knee.setValueAtTime(12, now);
    compressor.ratio.setValueAtTime(16, now);
    compressor.attack.setValueAtTime(0.001, now);
    compressor.release.setValueAtTime(0.12, now);
    compressor.connect(ctx.destination);

    // 2. Master Gain (High volume boost)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(compressor);

    // Helper: Play a bright, punchy bell tone with fundamental + harmonic overtone
    const playTone = (
      freq: number, 
      startTime: number, 
      duration: number, 
      peakGain = 0.95, 
      hasOverTone = true
    ) => {
      // Primary Oscillator (Fundamental)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      gain1.gain.setValueAtTime(0.0001, startTime);
      gain1.gain.linearRampToValueAtTime(peakGain, startTime + 0.004); // Snappy instant attack (4ms)
      gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.connect(gain1);
      gain1.connect(masterGain);

      osc1.start(startTime);
      osc1.stop(startTime + duration + 0.05);

      // Secondary Harmonic Oscillator (High-frequency sparkle & presence like Messenger)
      if (hasOverTone) {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, startTime); // Octave overtone

        gain2.gain.setValueAtTime(0.0001, startTime);
        gain2.gain.linearRampToValueAtTime(peakGain * 0.4, startTime + 0.003);
        gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.65);

        osc2.connect(gain2);
        gain2.connect(masterGain);

        osc2.start(startTime);
        osc2.stop(startTime + duration + 0.05);
      }
    };

    if (type === 'new_offer') {
      // 💬 Messenger-Style Iconic Crisp Tri-Tone Chime (F6 -> A6 -> C7 / 1396.9Hz -> 1760Hz -> 2093Hz)
      const notes = [1396.91, 1760.00, 2093.00];
      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.085;
        playTone(freq, noteStart, 0.35, 0.95, true);
      });
    } else if (type === 'new_request') {
      // 🚚 Driver High-Priority Attention Alert (A5 -> D6 -> A6 / 880Hz -> 1174.6Hz -> 1760Hz)
      const driverNotes = [880.00, 1174.66, 1760.00];
      driverNotes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.11;
        playTone(freq, noteStart, 0.45, 1.0, true);
      });
    } else if (type === 'success') {
      // ✨ Crisp Double Bright Confirmation Ping (1318Hz -> 1975Hz)
      playTone(1318.51, now, 0.25, 0.9, true);
      playTone(1975.53, now + 0.09, 0.38, 0.95, true);
    } else {
      // 🔔 Classic Messenger Pop-Ding (Snappy 1396Hz -> 1760Hz)
      playTone(1396.91, now, 0.18, 0.88, true);
      playTone(1760.00, now + 0.07, 0.35, 0.98, true);
    }
  } catch (err) {
    console.warn('Web Audio notification sound failed:', err);
  }
};

// Vibrate device if supported
export const vibrateDevice = (pattern: number[] = [200, 100, 200]) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
};

// Dispatch Native System Web Notification (Mobile Home-Screen / Desktop)
export const sendDeviceNotification = async ({
  title,
  body,
  tag = `wasel-${Date.now()}`,
  icon = '/wasel-logo.jpg',
  badge = '/wasel-logo.jpg',
  url = '/',
  soundType = 'general',
  data = {}
}: PushNotificationOptions): Promise<boolean> => {
  // 1. Play Audio & Device Vibration immediately
  playNotificationChime(soundType);
  vibrateDevice([200, 100, 200, 100, 300]);

  // 2. Check Notification Permission
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const notificationOptions = {
    body,
    icon,
    badge,
    tag,
    renotify: true,
    requireInteraction: true,
    data: { ...data, url },
    actions: [
      { action: 'open', title: '👁️ عرض الطلب' },
      { action: 'close', title: '✖️ إغلاق' }
    ],
    dir: 'rtl' as NotificationDirection,
    lang: 'ar'
  };

  try {
    // A. Preferred method: ServiceWorker registration showNotification (works on Mobile Home-Screen PWA!)
    if (swRegistration && 'showNotification' in swRegistration) {
      await swRegistration.showNotification(title, notificationOptions);
      return true;
    }

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    }

    // B. Fallback to standard Window Notification
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (error) {
    console.warn('Could not display system notification:', error);
    return false;
  }
};
