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

// Check if notification features are supported
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Check if PWA is installed on Home Screen
export const isPwaInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
};

// Get current permission status
export const getNotificationPermissionState = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

// Initialize Service Worker
let swRegistration: ServiceWorkerRegistration | null = null;

export const initNotificationService = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
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
      // Play a quick pleasant test chime
      playNotificationChime('general');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Synthesize pleasant crystal-clear audio notifications using Web Audio API
// Works guaranteed on all modern mobile and desktop browsers without loading external assets
export const playNotificationChime = (type: NotificationSoundType = 'general') => {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'new_offer') {
      // Modern 3-tone incoming offer alert (C5 -> E5 -> G5)
      const frequencies = [523.25, 659.25, 783.99];
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0.001, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.3, now + index * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.4);
      });
    } else if (type === 'new_request') {
      // Dynamic 2-tone broadcast driver alert (A5 -> D6)
      const notes = [880.0, 1174.66];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0.001, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.35, now + index * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.5);
      });
    } else if (type === 'success') {
      // High bright confirmation chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // General gentle notification
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (err) {
    console.warn('Web Audio chime not permitted or failed:', err);
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
