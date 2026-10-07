import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://khoyvkawvajkgcqngnwv.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob3l2a2F3dmFqa2djcW5nbnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NDAzNTcsImV4cCI6MjEwMzIxNjM1N30.haZ_9up6kRDlE4SZ6MCV1vdM52newbSl9AvUdZCFFog';

// In-memory subscription cache for ultra-fast fallback
const memorySubscriptions = new Map<string, {
  id: string;
  driverId: string;
  emirate: string;
  subscription: any;
  updatedAt: number;
}>();

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

  try {
    if (req.method === 'POST') {
      const { action = 'subscribe', driverId, emirate, subscription } = req.body || {};

      if (!driverId || !subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'driverId and valid subscription are required' });
      }

      const cleanEmirate = emirate ? String(emirate).trim() : 'أبوظبي';
      const endpoint = String(subscription.endpoint);
      const p256dh = subscription.keys?.p256dh || '';
      const auth = subscription.keys?.auth || '';
      const subId = `sub-${driverId}-${Buffer.from(endpoint).toString('base64').slice(-16)}`;

      if (action === 'unsubscribe') {
        memorySubscriptions.delete(endpoint);
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          await supabase.from('driver_push_subscriptions').delete().eq('endpoint', endpoint);
        } catch (e) {
          console.warn('Supabase unsubscribe error:', e);
        }
        return res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
      }

      // Save to memory cache
      memorySubscriptions.set(endpoint, {
        id: subId,
        driverId,
        emirate: cleanEmirate,
        subscription,
        updatedAt: Date.now()
      });

      // Save to Supabase
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        await supabase.from('driver_push_subscriptions').upsert({
          id: subId,
          driver_id: driverId,
          emirate: cleanEmirate,
          endpoint: endpoint,
          p256dh: p256dh,
          auth: auth,
          subscription_json: JSON.stringify(subscription),
          updated_at: new Date().toISOString()
        }, { onConflict: 'endpoint' });
      } catch (err) {
        console.warn('Could not persist subscription to Supabase, cached in memory:', err);
      }

      return res.status(200).json({
        success: true,
        message: 'Driver push subscription registered successfully',
        driverId,
        emirate: cleanEmirate
      });
    }

    if (req.method === 'GET') {
      const emirate = req.query.emirate ? String(req.query.emirate) : null;
      let subs = Array.from(memorySubscriptions.values());
      if (emirate) {
        subs = subs.filter(s => s.emirate === emirate);
      }
      return res.status(200).json({
        success: true,
        count: subs.length,
        subscriptions: subs
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Subscription handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
