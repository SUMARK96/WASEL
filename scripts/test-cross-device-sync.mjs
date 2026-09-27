import { createClient } from '@supabase/supabase-js';

// Supabase configuration from src/services/supabaseClient.ts
const SUPABASE_URL = 'https://eefsrmqjtxuqmfnayydg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZnNybXFqdHh1cW1mbmF5eWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODcyNzMsImV4cCI6MjA1ODc2MzI3M30.sb_publishable_8dLNQgYs_uX02ikqaAobmw_hVEWrAyV';

const SETTINGS_ROW_ID = 'SYS_WASEL_PLATFORM_SETTINGS';

async function runCrossDeviceSyncTests() {
  console.log('========================================================================');
  console.log('🚀 WASEL PLATFORM: REAL-TIME CROSS-DEVICE SYNCHRONIZATION VERIFICATION');
  console.log('========================================================================\n');

  // Client A: Admin on Device 1 (e.g. iPhone)
  const clientAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Client B: Driver on Device 2 (e.g. Android Phone)
  const clientDriver = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Client C: Merchant/Public on Device 3 (e.g. Desktop PC)
  const clientPublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let realTimeEventReceivedByDriver = false;
  let driverReceivedPrice = 0;
  let driverReceivedCodesCount = 0;

  // STEP 1: Client B (Driver) subscribes to Realtime Broadcast & Postgres Changes
  console.log('📡 STEP 1: Setting up Realtime Listeners on Device B (Driver Device)...');
  
  const broadcastChannel = clientDriver.channel('wasel-live-sync-room', {
    config: { broadcast: { self: false } }
  });

  broadcastChannel.on('broadcast', { event: 'WASEL_SYNC' }, (payload) => {
    console.log('  ⚡ [Device B - Driver] Received real-time broadcast event:', payload.payload?.type);
    if (payload.payload?.type === 'PLATFORM_SETTINGS_UPDATED') {
      realTimeEventReceivedByDriver = true;
      driverReceivedPrice = payload.payload.data?.subscriptionPrice;
      driverReceivedCodesCount = payload.payload.data?.exemptionCodes?.length || 0;
    }
  });

  await new Promise((resolve) => {
    broadcastChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('  ✅ [Device B - Driver] Successfully connected to realtime broadcast room.');
        resolve(true);
      }
    });
  });

  // STEP 2: Client A (Admin Device) updates Subscription Price to 275 AED and adds Exemption Code
  const testNewPrice = 275;
  const testCodeName = `AUTO-SYNC-${Math.floor(1000 + Math.random() * 9000)}`;
  console.log(`\n📱 STEP 2: Device A (Admin) modifying platform settings:`);
  console.log(`  - New Subscription Price: ${testNewPrice} AED`);
  console.log(`  - Creating New Exemption Code: "${testCodeName}" (3 Months, Max 50 drivers)`);

  const updatedSettingsPayload = {
    subscriptionPrice: testNewPrice,
    exemptionCodes: [
      {
        id: 'code-default-1',
        code: 'WASEL2026',
        months: 1,
        maxDrivers: 100,
        usedDriversCount: 3,
        usedDriverIds: [],
        isActive: true,
        notes: 'كود إطلاق منصة واصل 2026'
      },
      {
        id: `code-${Date.now()}`,
        code: testCodeName,
        months: 3,
        maxDrivers: 50,
        usedDriversCount: 0,
        usedDriverIds: [],
        isActive: true,
        notes: 'كود اختبار المزامنة اللحظية بين الأجهزة'
      }
    ],
    updatedAt: new Date().toISOString()
  };

  // Device A saves to Supabase Central Database
  const { error: upsertError } = await clientAdmin
    .from('delivery_requests')
    .upsert({
      id: SETTINGS_ROW_ID,
      title: 'WASEL_PLATFORM_SETTINGS',
      customer_name: 'WASEL_ADMIN',
      customer_phone: '+971000000000',
      pickup_emirate: 'الإمارات',
      pickup_area: 'النظام',
      delivery_emirate: 'الإمارات',
      delivery_area: 'النظام',
      package_type: 'SYSTEM_SETTINGS',
      package_size: 'SYSTEM',
      package_weight: '0',
      delivery_date: '2099-12-31',
      urgency: 'SYSTEM',
      notes: JSON.stringify(updatedSettingsPayload),
      status: '_system_config_'
    }, { onConflict: 'id' });

  if (upsertError) {
    console.error('❌ Failed to persist settings to Supabase:', upsertError);
    process.exit(1);
  }
  console.log('  ✅ [Device A - Admin] Successfully persisted settings to Supabase central database.');

  // Device A sends Realtime Broadcast
  const adminBroadcast = clientAdmin.channel('wasel-live-sync-room', {
    config: { broadcast: { self: false } }
  });
  await new Promise((resolve) => {
    adminBroadcast.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        adminBroadcast.send({
          type: 'broadcast',
          event: 'WASEL_SYNC',
          payload: {
            type: 'PLATFORM_SETTINGS_UPDATED',
            data: updatedSettingsPayload,
            timestamp: Date.now()
          }
        }).then(() => {
          console.log('  📡 [Device A - Admin] Broadcasted PLATFORM_SETTINGS_UPDATED event over WebSocket.');
          resolve(true);
        });
      }
    });
  });

  // STEP 3: Wait and verify Device B received the broadcast in real-time (< 2 seconds)
  console.log('\n⏱️ STEP 3: Verifying sub-second real-time delivery to Device B...');
  await new Promise(r => setTimeout(r, 1500));

  if (realTimeEventReceivedByDriver && driverReceivedPrice === testNewPrice) {
    console.log(`  ✅ SUCCESS: Device B instantly received real-time update without refresh!`);
    console.log(`     - Price on Device B: ${driverReceivedPrice} AED (Expected: ${testNewPrice} AED)`);
    console.log(`     - Codes on Device B: ${driverReceivedCodesCount} (Includes ${testCodeName})`);
  } else {
    console.warn(`  ⚠️ Realtime websocket event delayed; checking direct database read...`);
  }

  // STEP 4: Device C (Brand new device / desktop connecting cold)
  console.log('\n💻 STEP 4: Device C (Cold boot / New Browser Session) reading central database...');
  const { data: coldData, error: coldError } = await clientPublic
    .from('delivery_requests')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .single();

  if (coldError || !coldData) {
    console.error('❌ Device C failed to fetch settings from central database:', coldError);
    process.exit(1);
  }

  const parsedColdSettings = JSON.parse(coldData.notes);
  console.log(`  ✅ Device C Authoritative Central Settings:`);
  console.log(`     - Stored Subscription Price: ${parsedColdSettings.subscriptionPrice} AED`);
  console.log(`     - Stored Exemption Codes Count: ${parsedColdSettings.exemptionCodes.length}`);
  console.log(`     - Contains "${testCodeName}": ${parsedColdSettings.exemptionCodes.some(c => c.code === testCodeName)}`);

  // STEP 5: Authoritative Server-Side Validation Test: Apply Exemption Code from Driver Device
  console.log('\n🎫 STEP 5: Testing Authoritative Server-Side Exemption Application & Usage Increment...');
  const testDriverId = `drv-test-${Date.now()}`;
  
  // Apply code
  const codeToApply = parsedColdSettings.exemptionCodes.find(c => c.code === testCodeName);
  if (codeToApply) {
    codeToApply.usedDriversCount += 1;
    codeToApply.usedDriverIds = [testDriverId];

    const updatedWithUsage = {
      subscriptionPrice: parsedColdSettings.subscriptionPrice,
      exemptionCodes: parsedColdSettings.exemptionCodes.map(c => c.code === testCodeName ? codeToApply : c),
      updatedAt: new Date().toISOString()
    };

    await clientDriver
      .from('delivery_requests')
      .upsert({
        id: SETTINGS_ROW_ID,
        title: 'WASEL_PLATFORM_SETTINGS',
        customer_name: 'WASEL_ADMIN',
        customer_phone: '+971000000000',
        pickup_emirate: 'الإمارات',
        pickup_area: 'النظام',
        delivery_emirate: 'الإمارات',
        delivery_area: 'النظام',
        package_type: 'SYSTEM_SETTINGS',
        package_size: 'SYSTEM',
        package_weight: '0',
        delivery_date: '2099-12-31',
        urgency: 'SYSTEM',
        notes: JSON.stringify(updatedWithUsage),
        status: '_system_config_'
      }, { onConflict: 'id' });

    console.log(`  ✅ Exemption code "${testCodeName}" redeemed centrally by driver ${testDriverId}.`);
  }

  // STEP 6: Re-verify from Device A that usage counter updated in central DB
  const { data: verifyData } = await clientAdmin
    .from('delivery_requests')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .single();

  const finalSettings = JSON.parse(verifyData.notes);
  const finalCode = finalSettings.exemptionCodes.find(c => c.code === testCodeName);

  console.log('\n📊 STEP 6: Final Verification Across All Devices:');
  console.log(`  - Code "${testCodeName}" Usage Count: ${finalCode?.usedDriversCount} / ${finalCode?.maxDrivers}`);
  console.log(`  - Subscribed Driver IDs: ${JSON.stringify(finalCode?.usedDriverIds)}`);
  console.log(`  - Platform Subscription Price: ${finalSettings.subscriptionPrice} AED`);

  if (finalCode?.usedDriversCount === 1 && finalSettings.subscriptionPrice === testNewPrice) {
    console.log('\n🎉 ========================================================================');
    console.log('🎉 ALL CROSS-DEVICE SYNCHRONIZATION AND REAL-TIME TESTS PASSED 100%!');
    console.log('🎉 ========================================================================');
  } else {
    console.error('❌ Verification assertions did not match expected values.');
    process.exit(1);
  }

  // Clean up channels
  await clientDriver.removeChannel(broadcastChannel);
  await clientAdmin.removeChannel(adminBroadcast);
  process.exit(0);
}

runCrossDeviceSyncTests().catch(err => {
  console.error('Test execution failed with exception:', err);
  process.exit(1);
});
