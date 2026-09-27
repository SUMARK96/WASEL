import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://khoyvkawvajkgcqngnwv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob3l2a2F3dmFqa2djcW5nbnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NDAzNTcsImV4cCI6MjEwMzIxNjM1N30.haZ_9up6kRDlE4SZ6MCV1vdM52newbSl9AvUdZCFFog';
const SETTINGS_ROW_ID = 'SYS_WASEL_PLATFORM_SETTINGS';

async function testDatabaseSync() {
  console.log('------------------------------------------------------------');
  console.log('⚡ WASEL CENTRAL DATABASE CONSISTENCY & VALIDATION TEST ⚡');
  console.log('------------------------------------------------------------\n');

  // Client 1: Admin Device
  const clientAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // Client 2: Driver Device
  const clientDriver = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // Client 3: Public / Customer Device
  const clientPublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Fetch current settings
  console.log('1️⃣ Device A (Admin) reading current settings from Supabase...');
  const { data: initialData, error: fetchErr } = await clientAdmin
    .from('delivery_requests')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .maybeSingle();

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    process.exit(1);
  }

  let currentSettings = {
    subscriptionPrice: 199,
    exemptionCodes: [
      {
        id: 'code-default-1',
        code: 'WASEL2026',
        months: 1,
        maxDrivers: 100,
        usedDriversCount: 0,
        usedDriverIds: [],
        isActive: true,
        notes: 'كود إطلاق منصة واصل'
      }
    ]
  };

  if (initialData?.notes) {
    try {
      currentSettings = JSON.parse(initialData.notes);
      console.log('   Current Settings found in DB:', currentSettings);
    } catch (e) {
      console.log('   Initializing default settings in DB...');
    }
  }

  // 2. Device A updates subscription price to 199 and adds a new promotional exemption code
  const testNewPrice = 199;
  const testCode = `SYNC-${Math.floor(1000 + Math.random() * 9000)}`;
  console.log(`\n2️⃣ Device A (Admin) modifying settings:`);
  console.log(`   - Subscription Price -> ${testNewPrice} AED`);
  console.log(`   - Adding New Exemption Code -> "${testCode}" (2 Months, Max 20 drivers)`);

  const updatedPayload = {
    subscriptionPrice: testNewPrice,
    exemptionCodes: [
      ...currentSettings.exemptionCodes.filter(c => c.code !== testCode),
      {
        id: `code-${Date.now()}`,
        code: testCode,
        months: 2,
        maxDrivers: 20,
        usedDriversCount: 0,
        usedDriverIds: [],
        isActive: true,
        notes: 'كود مزامنة فورية'
      }
    ],
    updatedAt: new Date().toISOString()
  };

  const { error: upsertErr } = await clientAdmin
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
      notes: JSON.stringify(updatedPayload),
      status: '_system_config_'
    }, { onConflict: 'id' });

  if (upsertErr) {
    console.error('❌ Admin save failed:', upsertErr);
    process.exit(1);
  }
  console.log('   ✅ Saved successfully to central Supabase DB.');

  // 3. Device B (Driver Device) fetches fresh data from DB
  console.log(`\n3️⃣ Device B (Driver Phone) querying central Supabase DB for settings...`);
  const { data: driverData, error: driverErr } = await clientDriver
    .from('delivery_requests')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .single();

  if (driverErr || !driverData) {
    console.error('❌ Driver query failed:', driverErr);
    process.exit(1);
  }

  const driverSettings = JSON.parse(driverData.notes);
  console.log(`   - Subscription price seen by Device B: ${driverSettings.subscriptionPrice} AED`);
  console.log(`   - Exemption codes count seen by Device B: ${driverSettings.exemptionCodes.length}`);
  const foundCode = driverSettings.exemptionCodes.find(c => c.code === testCode);
  console.log(`   - Found newly created code "${testCode}":`, Boolean(foundCode));

  if (!foundCode || driverSettings.subscriptionPrice !== testNewPrice) {
    console.error('❌ Settings on Device B do not match Admin updates!');
    process.exit(1);
  }

  // 4. Device B applies the exemption code
  console.log(`\n4️⃣ Device B (Driver drv-test-999) redeeming code "${testCode}"...`);
  foundCode.usedDriversCount += 1;
  foundCode.usedDriverIds = ['drv-test-999'];

  const updatedWithRedemption = {
    ...driverSettings,
    exemptionCodes: driverSettings.exemptionCodes.map(c => c.code === testCode ? foundCode : c),
    updatedAt: new Date().toISOString()
  };

  const { error: redeemErr } = await clientDriver
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
      notes: JSON.stringify(updatedWithRedemption),
      status: '_system_config_'
    }, { onConflict: 'id' });

  if (redeemErr) {
    console.error('❌ Redemption save failed:', redeemErr);
    process.exit(1);
  }
  console.log('   ✅ Redemption counter updated in Supabase.');

  // 5. Device C (Merchant / Public PC) verifies usage counter update
  console.log(`\n5️⃣ Device C (Merchant / Public PC) verifying authoritative state...`);
  const { data: publicData } = await clientPublic
    .from('delivery_requests')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .single();

  const publicSettings = JSON.parse(publicData.notes);
  const publicCode = publicSettings.exemptionCodes.find(c => c.code === testCode);
  console.log(`   - Device C sees Code "${testCode}" usage count: ${publicCode?.usedDriversCount} / ${publicCode?.maxDrivers}`);
  console.log(`   - Device C sees Redeemed Driver IDs:`, publicCode?.usedDriverIds);

  if (publicCode?.usedDriversCount === 1 && publicCode?.usedDriverIds?.includes('drv-test-999')) {
    console.log('\n============================================================');
    console.log('🏆 100% SUCCESS: CROSS-DEVICE DATA SYNCHRONIZATION VERIFIED!');
    console.log('============================================================');
  } else {
    console.error('❌ State verification mismatch on Device C.');
    process.exit(1);
  }
}

testDatabaseSync().catch(err => {
  console.error('Fatal error in sync test:', err);
  process.exit(1);
});
