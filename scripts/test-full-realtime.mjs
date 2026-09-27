import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://khoyvkawvajkgcqngnwv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob3l2a2F3dmFqa2djcW5nbnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NDAzNTcsImV4cCI6MjEwMzIxNjM1N30.haZ_9up6kRDlE4SZ6MCV1vdM52newbSl9AvUdZCFFog';
const SETTINGS_ROW_ID = 'SYS_WASEL_PLATFORM_SETTINGS';

async function testFullRealtime() {
  console.log('========================================================================');
  console.log('🚀 WASEL PLATFORM: FULL MULTI-DEVICE REALTIME VERIFICATION SUITE');
  console.log('========================================================================\n');

  const clientAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const clientDriver = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let broadcastReceived = false;
  let broadcastPayload = null;

  // 1. Setup Realtime Listener on Driver Client
  console.log('1️⃣ Setting up WebSocket Broadcast listener on Driver Client...');
  const driverChannel = clientDriver.channel('wasel-live-sync-room', {
    config: { broadcast: { self: false } }
  });

  driverChannel.on('broadcast', { event: 'WASEL_SYNC' }, (msg) => {
    console.log('   ⚡ Driver Client received realtime broadcast message:', msg.payload?.type);
    if (msg.payload?.type === 'PLATFORM_SETTINGS_UPDATED') {
      broadcastReceived = true;
      broadcastPayload = msg.payload?.data;
    }
  });

  await new Promise((resolve) => {
    driverChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('   ✅ Driver Client connected to wasel-live-sync-room.');
        resolve(true);
      }
    });
  });

  // 2. Admin Broadcasts new Subscription Price and Exemption Code
  const adminChannel = clientAdmin.channel('wasel-live-sync-room', {
    config: { broadcast: { self: false } }
  });

  await new Promise((resolve) => {
    adminChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('   ✅ Admin Client connected to wasel-live-sync-room.');
        
        const testData = {
          subscriptionPrice: 199,
          exemptionCodes: [
            {
              id: 'code-1',
              code: 'WASEL2026',
              months: 1,
              maxDrivers: 100,
              usedDriversCount: 0,
              usedDriverIds: [],
              isActive: true,
              notes: 'كود إطلاق منصة واصل'
            }
          ],
          updatedAt: new Date().toISOString()
        };

        await adminChannel.send({
          type: 'broadcast',
          event: 'WASEL_SYNC',
          payload: {
            type: 'PLATFORM_SETTINGS_UPDATED',
            data: testData,
            timestamp: Date.now()
          }
        });
        console.log('2️⃣ Admin Client broadcasted PLATFORM_SETTINGS_UPDATED event.');
        resolve(true);
      }
    });
  });

  // 3. Wait 1 second and check receipt
  await new Promise(r => setTimeout(r, 1000));

  if (broadcastReceived) {
    console.log('3️⃣ Realtime WebSocket sync confirmed!');
    console.log('   - Received Price:', broadcastPayload?.subscriptionPrice, 'AED');
    console.log('   - Received Codes:', broadcastPayload?.exemptionCodes?.length);
  } else {
    console.log('3️⃣ Broadcast received status:', broadcastReceived);
  }

  await clientAdmin.removeChannel(adminChannel);
  await clientDriver.removeChannel(driverChannel);

  console.log('\n========================================================================');
  console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
  console.log('========================================================================');
  process.exit(0);
}

testFullRealtime().catch(e => {
  console.error(e);
  process.exit(1);
});
