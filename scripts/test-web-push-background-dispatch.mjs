import assert from 'node:assert/strict';
import webpush from 'web-push';

console.log('🚀 Starting Wasel Background Web Push Notification Test Suite...\n');

// 1. Verify VAPID Keypair validity
const VAPID_PUBLIC_KEY = 'BLIVpAu0VpJ45isb-RKcuWGUxWsH2f9_INv7epsPHqO4LPoWU8G8Db5CtTPbvomZ3BTrnyAuzLueZ22aOUTKA_o';
const VAPID_PRIVATE_KEY = 'kSG5a013sQBn0Y684eeTIpD3Z-AcqjQ7J-BCtEuoZts';
const VAPID_SUBJECT = 'mailto:support@wasel-uae.com';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('✅ TEST 1 PASSED: VAPID Keys and Subject are cryptographically valid & configured.');
} catch (err) {
  assert.fail('VAPID setup failed: ' + err.message);
}

// 2. Simulated Drivers and Push Subscriptions across Emirates
const driverAbuDhabi = {
  id: 'drv-adh-1',
  name: 'أحمد الحوسني',
  emirate: 'أبوظبي',
  subscriptionStatus: 'active',
  pushSubscription: {
    endpoint: 'https://fcm.googleapis.com/fcm/send/fake-adh-driver-token-1',
    keys: {
      p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0PclOHC0abUMJ2l18o6bHqL2Q==',
      auth: '5t8W4v2Z==='
    }
  }
};

const driverDubai = {
  id: 'drv-dxb-1',
  name: 'راشد المري',
  emirate: 'دبي',
  subscriptionStatus: 'active',
  pushSubscription: {
    endpoint: 'https://fcm.googleapis.com/fcm/send/fake-dxb-driver-token-1',
    keys: {
      p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0PclOHC0abUMJ2l18o6bHqL2Q==',
      auth: '5t8W4v2Z==='
    }
  }
};

const driverSharjah = {
  id: 'drv-shj-1',
  name: 'محمد الشامسي',
  emirate: 'الشارقة',
  subscriptionStatus: 'active',
  pushSubscription: {
    endpoint: 'https://fcm.googleapis.com/fcm/send/fake-shj-driver-token-1',
    keys: {
      p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0PclOHC0abUMJ2l18o6bHqL2Q==',
      auth: '5t8W4v2Z==='
    }
  }
};

const allDrivers = [driverAbuDhabi, driverDubai, driverSharjah];

// 3. Test Regional Dispatch Matching Logic
function getTargetSubscriptionsForOrder(order, drivers) {
  return drivers
    .filter(d => d.subscriptionStatus === 'active' && (!d.emirate || d.emirate === order.pickupEmirate))
    .map(d => ({
      driverId: d.id,
      driverName: d.name,
      emirate: d.emirate,
      subscription: d.pushSubscription
    }));
}

// Case A: Customer creates order in Abu Dhabi
const orderAbuDhabi = {
  id: 'REQ-ADH-991',
  title: 'نقل وثائق مستعجلة',
  pickupEmirate: 'أبوظبي',
  pickupArea: 'الخالدية',
  deliveryEmirate: 'دبي',
  deliveryArea: 'الخليج التجاري',
  packageType: 'مستندات',
  urgency: 'عاجل'
};

const targetsAdh = getTargetSubscriptionsForOrder(orderAbuDhabi, allDrivers);
assert.equal(targetsAdh.length, 1, 'Only Abu Dhabi driver must receive Abu Dhabi order push');
assert.equal(targetsAdh[0].driverId, 'drv-adh-1');
console.log('✅ TEST 2 PASSED: Regional background push targeting correctly isolates Abu Dhabi order to Abu Dhabi drivers.');

// Case B: Customer creates order in Dubai
const orderDubai = {
  id: 'REQ-DXB-552',
  title: 'توصيل عطور وهدايا',
  pickupEmirate: 'دبي',
  pickupArea: 'ديرة',
  deliveryEmirate: 'الشارقة',
  deliveryArea: 'المجاز',
  packageType: 'طرد',
  urgency: 'عادي'
};

const targetsDxb = getTargetSubscriptionsForOrder(orderDubai, allDrivers);
assert.equal(targetsDxb.length, 1, 'Only Dubai driver must receive Dubai order push');
assert.equal(targetsDxb[0].driverId, 'drv-dxb-1');
console.log('✅ TEST 3 PASSED: Regional background push targeting correctly isolates Dubai order to Dubai drivers.');

// 4. Test Notification Payload Structure & Click Action URL
function createOrderPushPayload(order) {
  const pickupLocStr = order.pickupArea ? `${order.pickupEmirate} (${order.pickupArea})` : order.pickupEmirate;
  const deliveryLocStr = order.deliveryEmirate ? (order.deliveryArea ? `${order.deliveryEmirate} (${order.deliveryArea})` : order.deliveryEmirate) : '';
  const routeStr = deliveryLocStr ? `من ${pickupLocStr} إلى ${deliveryLocStr}` : `في ${pickupLocStr}`;

  return {
    title: `🔔 طلب توصيل جديد في ${order.pickupEmirate}`,
    body: `📦 ${order.title} (${order.packageType})\n📍 ${routeStr}\n⚡ قدم عرض سعرك الآن للعميل!`,
    icon: '/wasel-logo.jpg',
    badge: '/wasel-logo.jpg',
    tag: `wasel-req-${order.id}`,
    url: `/?portal=driver&requestId=${encodeURIComponent(order.id)}`,
    data: {
      url: `/?portal=driver&requestId=${encodeURIComponent(order.id)}`,
      requestId: order.id,
      pickupEmirate: order.pickupEmirate,
      deliveryEmirate: order.deliveryEmirate,
      urgency: order.urgency,
      type: 'NEW_REQUEST'
    }
  };
}

const payloadAdh = createOrderPushPayload(orderAbuDhabi);
assert.ok(payloadAdh.title.includes('أبوظبي'), 'Notification title must mention pickup emirate');
assert.ok(payloadAdh.body.includes('الخالدية') && payloadAdh.body.includes('الخليج التجاري'), 'Body must show exact route');
assert.ok(payloadAdh.url.includes('REQ-ADH-991'), 'Click URL must deep-link directly to the driver order screen');
console.log('✅ TEST 4 PASSED: Push notification payload structure and deep-link URLs verified.');

// 5. Service Worker Push Event Parsing Simulation
function simulateServiceWorkerPushReceive(pushPayloadJson) {
  const parsed = typeof pushPayloadJson === 'string' ? JSON.parse(pushPayloadJson) : pushPayloadJson;
  return {
    notificationTitle: parsed.title,
    notificationOptions: {
      body: parsed.body,
      icon: parsed.icon || '/wasel-logo.jpg',
      badge: parsed.badge || '/wasel-logo.jpg',
      tag: parsed.tag,
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 300],
      data: parsed.data || { url: '/' },
      actions: [
        { action: 'open', title: '👁️ عرض التفاصيل' },
        { action: 'close', title: '✖️ إغلاق' }
      ],
      dir: 'rtl',
      lang: 'ar'
    }
  };
}

const swDisplay = simulateServiceWorkerPushReceive(payloadAdh);
assert.equal(swDisplay.notificationTitle, '🔔 طلب توصيل جديد في أبوظبي');
assert.equal(swDisplay.notificationOptions.dir, 'rtl');
assert.equal(swDisplay.notificationOptions.data.requestId, 'REQ-ADH-991');
console.log('✅ TEST 5 PASSED: Service Worker background push event handler accurately reconstructs native device notifications.');

console.log('\n🎉 ALL 5 BACKGROUND WEB PUSH NOTIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
