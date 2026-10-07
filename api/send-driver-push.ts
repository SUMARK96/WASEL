import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// VAPID Configuration for WASEL Platform
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || 'BLIVpAu0VpJ45isb-RKcuWGUxWsH2f9_INv7epsPHqO4LPoWU8G8Db5CtTPbvomZ3BTrnyAuzLueZ22aOUTKA_o';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'kSG5a013sQBn0Y684eeTIpD3Z-AcqjQ7J-BCtEuoZts';
const VAPID_SUBJECT = 'mailto:support@wasel-uae.com';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn('VAPID setup warning:', e);
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://khoyvkawvajkgcqngnwv.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob3l2a2F3dmFqa2djcW5nbnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NDAzNTcsImV4cCI6MjEwMzIxNjM1N30.haZ_9up6kRDlE4SZ6MCV1vdM52newbSl9AvUdZCFFog';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      requestId,
      title = 'طلب توصيل جديد',
      pickupEmirate = 'أبوظبي',
      pickupArea = '',
      deliveryEmirate = '',
      deliveryArea = '',
      packageType = 'طرد',
      urgency = 'عادي',
      customBody
    } = req.body || {};

    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required' });
    }

    const cleanPickupEmirate = pickupEmirate ? String(pickupEmirate).trim() : 'أبوظبي';

    // 1. Fetch matching push subscriptions for drivers in the pickup emirate
    let subscriptions: any[] = [];
    let supabase: any = null;

    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from('driver_push_subscriptions')
        .select('*')
        .eq('emirate', cleanPickupEmirate);

      if (!error && Array.isArray(data)) {
        subscriptions = data.map((item: any) => {
          if (item.subscription_json) {
            try {
              return JSON.parse(item.subscription_json);
            } catch (e) {
              // fallback to individual fields
            }
          }
          return {
            endpoint: item.endpoint,
            keys: {
              p256dh: item.p256dh,
              auth: item.auth
            }
          };
        });
      }
    } catch (dbErr) {
      console.warn('Could not query subscriptions from Supabase:', dbErr);
    }

    // Build notification content
    const pickupLocStr = pickupArea ? `${cleanPickupEmirate} (${pickupArea})` : cleanPickupEmirate;
    const deliveryLocStr = deliveryEmirate ? (deliveryArea ? `${deliveryEmirate} (${deliveryArea})` : deliveryEmirate) : '';
    const routeStr = deliveryLocStr ? `من ${pickupLocStr} إلى ${deliveryLocStr}` : `في ${pickupLocStr}`;

    const notificationPayload = JSON.stringify({
      title: `🔔 طلب توصيل جديد في ${cleanPickupEmirate}`,
      body: customBody || `📦 ${title} (${packageType})\n📍 ${routeStr}\n⚡ قدم عرض سعرك الآن للعميل!`,
      icon: '/wasel-logo.jpg',
      badge: '/wasel-logo.jpg',
      tag: `wasel-req-${requestId}`,
      url: `/?portal=driver&requestId=${encodeURIComponent(requestId)}`,
      data: {
        url: `/?portal=driver&requestId=${encodeURIComponent(requestId)}`,
        requestId,
        pickupEmirate: cleanPickupEmirate,
        deliveryEmirate,
        urgency,
        type: 'NEW_REQUEST'
      }
    });

    if (subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: `Order broadcast created. No push subscriptions currently registered for emirate: ${cleanPickupEmirate}.`,
        targetEmirate: cleanPickupEmirate,
        deliveredCount: 0,
        failedCount: 0
      });
    }

    // 2. Dispatch Push Notifications concurrently to all matching driver devices
    const expiredEndpoints: string[] = [];
    let deliveredCount = 0;
    let failedCount = 0;

    const pushPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, notificationPayload, {
          TTL: 86400, // 24 hours
          urgency: 'high'
        });
        deliveredCount++;
      } catch (err: any) {
        failedCount++;
        // If subscription is 404 or 410 (Gone), mark for cleanup
        if (err.statusCode === 404 || err.statusCode === 410) {
          if (sub.endpoint) {
            expiredEndpoints.push(sub.endpoint);
          }
        }
      }
    });

    await Promise.allSettled(pushPromises);

    // 3. Clean up expired subscriptions if any
    if (expiredEndpoints.length > 0 && supabase) {
      try {
        await supabase
          .from('driver_push_subscriptions')
          .delete()
          .in('endpoint', expiredEndpoints);
      } catch (cleanErr) {
        console.warn('Could not clean expired subscriptions:', cleanErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Push notifications dispatched to drivers in ${cleanPickupEmirate}`,
      targetEmirate: cleanPickupEmirate,
      totalMatched: subscriptions.length,
      deliveredCount,
      failedCount,
      cleanedExpired: expiredEndpoints.length
    });
  } catch (error: any) {
    console.error('Send push handler error:', error);
    return res.status(500).json({ error: error.message || 'Failed to dispatch push notifications' });
  }
}
