import assert from 'node:assert/strict';

// Helper matching logic extracted directly from our codebase
function filterCustomerRequests(requests, customer) {
  if (!customer) return [];
  return requests.filter((r) => {
    // 1. Direct customer ID match
    if (r.customerId) {
      return r.customerId === customer.id;
    }

    // 2. Strict normalized 9-digit phone match (fallback for legacy records)
    const normPhone1 = (r.customerPhone || '').replace(/[^0-9]/g, '').slice(-9);
    const normPhone2 = (customer.phone || '').replace(/[^0-9]/g, '').slice(-9);
    if (normPhone1 && normPhone2 && normPhone1.length === 9 && normPhone2.length === 9) {
      return normPhone1 === normPhone2;
    }

    return false;
  });
}

function isOfferByDriver(offer, driver) {
  if (!offer || !driver) return false;
  if (offer.driverId && offer.driverId === driver.id) return true;

  // Strict 9-digit phone fallback only if driverId is missing
  if (!offer.driverId) {
    const phoneA = (offer.driverPhone || offer.driverWhatsappPhone || offer.driverCallPhone || '').replace(/[^0-9]/g, '').slice(-9);
    const phoneB = (driver.phone || driver.whatsappPhone || driver.callPhone || '').replace(/[^0-9]/g, '').slice(-9);
    if (phoneA && phoneB && phoneA.length === 9 && phoneB.length === 9) {
      return phoneA === phoneB;
    }
  }

  return false;
}

function getDriverAvailableRequests(requests, driver) {
  if (!driver) return [];
  return requests.filter(r => r.status === 'open' && (!driver.emirate || r.pickupEmirate === driver.emirate));
}

function getDriverBids(requests, driver) {
  if (!driver) return [];
  return requests.filter(r => (r.offers || []).some(o => isOfferByDriver(o, driver)));
}

function getDriverActiveJobs(requests, driver) {
  if (!driver) return [];
  return requests.filter(r => 
    r.selectedOfferId && 
    (r.offers || []).some(o => o.id === r.selectedOfferId && isOfferByDriver(o, driver))
  );
}

console.log('🧪 Starting Wasel User Dashboard Data Isolation Test Suite...\n');

// 1. Setup Mock System Requests
let systemRequests = [];

// 2. Customer A Registers
const customerA = {
  id: 'cust-1710000000001',
  name: 'أحمد المنصوري',
  phone: '0501234567',
  email: 'ahmed@test.ae',
  city: 'أبوظبي'
};

console.log('Test 1: New Customer A registers -> Dashboard must be 100% empty.');
const custAInitOrders = filterCustomerRequests(systemRequests, customerA);
assert.equal(custAInitOrders.length, 0, 'New Customer A should have 0 orders');
console.log('✅ PASS: Customer A dashboard is completely clean (0 orders).\n');

// 3. Customer A creates Order 1
const order1 = {
  id: 'req-1710000000100',
  title: 'طرد مستندات قانونية عاجلة',
  customerId: customerA.id,
  customerName: customerA.name,
  customerPhone: customerA.phone,
  pickupEmirate: 'أبوظبي',
  deliveryEmirate: 'دبي',
  packageType: 'مستندات',
  status: 'open',
  offers: []
};
systemRequests.push(order1);

console.log('Test 2: Customer A creates an order -> Order appears in Customer A dashboard.');
const custAOrdersAfterCreate = filterCustomerRequests(systemRequests, customerA);
assert.equal(custAOrdersAfterCreate.length, 1, 'Customer A should see exactly 1 order');
assert.equal(custAOrdersAfterCreate[0].id, order1.id);
console.log('✅ PASS: Customer A sees Order 1.\n');

// 4. Customer B (Same first name, different account ID & phone) Registers
const customerB = {
  id: 'cust-1710000000002',
  name: 'أحمد المنصوري', // Same name test!
  phone: '0559876543',
  email: 'ahmed2@test.ae',
  city: 'دبي'
};

console.log('Test 3: New Customer B registers (Same name "أحمد المنصوري") -> Dashboard MUST be empty (No name bleeding).');
const custBInitOrders = filterCustomerRequests(systemRequests, customerB);
assert.equal(custBInitOrders.length, 0, 'Customer B MUST have 0 orders despite having the same name');
console.log('✅ PASS: Customer B has 0 orders. Strict ID isolation verified!\n');

// 5. Customer B creates Order 2
const order2 = {
  id: 'req-1710000000200',
  title: 'شحنة قطع غيار إلكترونية',
  customerId: customerB.id,
  customerName: customerB.name,
  customerPhone: customerB.phone,
  pickupEmirate: 'دبي',
  deliveryEmirate: 'الشارقة',
  packageType: 'إلكترونيات',
  status: 'open',
  offers: []
};
systemRequests.push(order2);

console.log('Test 4: Customer A & B cross-isolation verification.');
const custAOrdersFinal = filterCustomerRequests(systemRequests, customerA);
const custBOrdersFinal = filterCustomerRequests(systemRequests, customerB);
assert.equal(custAOrdersFinal.length, 1, 'Customer A should only see Order 1');
assert.equal(custAOrdersFinal[0].id, order1.id);
assert.equal(custBOrdersFinal.length, 1, 'Customer B should only see Order 2');
assert.equal(custBOrdersFinal[0].id, order2.id);
console.log('✅ PASS: Perfect bidirectional isolation between customer dashboards.\n');

// 6. Driver A Registers in Abu Dhabi
const driverA = {
  id: 'drv-1710000000001',
  name: 'سالم الكعبي',
  phone: '0521112233',
  whatsappPhone: '971521112233',
  callPhone: '0521112233',
  emirate: 'أبوظبي',
  vehicleModel: 'تويوتا هايس 2024',
  vehiclePlate: 'أبوظبي 54321',
  subscriptionStatus: 'active'
};

console.log('Test 5: New Driver A registers -> my_bids & active_jobs must be empty. Sees eligible order in available.');
const drvAInitBids = getDriverBids(systemRequests, driverA);
const drvAInitJobs = getDriverActiveJobs(systemRequests, driverA);
const drvAAvailable = getDriverAvailableRequests(systemRequests, driverA);
assert.equal(drvAInitBids.length, 0, 'Driver A my_bids must be empty');
assert.equal(drvAInitJobs.length, 0, 'Driver A active_jobs must be empty');
assert.equal(drvAAvailable.length, 1, 'Driver A should see Order 1 (Abu Dhabi pickup)');
assert.equal(drvAAvailable[0].id, order1.id);
console.log('✅ PASS: Driver A tabs are cleanly initialized and scoped to pickup emirate.\n');

// 7. Driver A Submits Offer on Order 1
const offer1 = {
  id: 'off-1710000000001',
  requestId: order1.id,
  driverId: driverA.id,
  driverName: driverA.name,
  driverPhone: driverA.phone,
  driverWhatsappPhone: driverA.whatsappPhone,
  price: 180,
  status: 'pending'
};
order1.offers.push(offer1);

console.log('Test 6: Driver A submits bid -> appears in Driver A my_bids.');
const drvABidsAfterOffer = getDriverBids(systemRequests, driverA);
assert.equal(drvABidsAfterOffer.length, 1);
assert.equal(drvABidsAfterOffer[0].id, order1.id);
console.log('✅ PASS: Driver A sees submitted bid in my_bids.\n');

// 8. Driver B Registers (Same name "سالم الكعبي" in Abu Dhabi)
const driverB = {
  id: 'drv-1710000000002',
  name: 'سالم الكعبي', // Same name collision test!
  phone: '0569998877',
  whatsappPhone: '971569998877',
  callPhone: '0569998877',
  emirate: 'أبوظبي',
  vehicleModel: 'نيسان باترول 2023',
  vehiclePlate: 'أبوظبي 98765',
  subscriptionStatus: 'active'
};

console.log('Test 7: New Driver B registers (Same name "سالم الكعبي") -> my_bids & active_jobs MUST be empty.');
const drvBInitBids = getDriverBids(systemRequests, driverB);
const drvBInitJobs = getDriverActiveJobs(systemRequests, driverB);
assert.equal(drvBInitBids.length, 0, 'Driver B must NOT inherit Driver A bids');
assert.equal(drvBInitJobs.length, 0, 'Driver B must NOT have any active jobs');
console.log('✅ PASS: Driver B has 0 bids and 0 jobs. Strict driver identity isolation verified!\n');

// 9. Customer A Accepts Driver A\'s Offer
order1.selectedOfferId = offer1.id;
offer1.status = 'accepted';
order1.status = 'assigned';

console.log('Test 8: Customer accepts Driver A offer -> appears in Driver A active_jobs, Driver B still has 0.');
const drvAFinalJobs = getDriverActiveJobs(systemRequests, driverA);
const drvBFinalJobs = getDriverActiveJobs(systemRequests, driverB);
assert.equal(drvAFinalJobs.length, 1, 'Driver A should have 1 active job');
assert.equal(drvAFinalJobs[0].id, order1.id);
assert.equal(drvBFinalJobs.length, 0, 'Driver B should still have 0 active jobs');
console.log('✅ PASS: Active jobs strictly assigned and isolated by driverId.\n');

console.log('🎉 ALL 8 ISOLATION & DATA INTEGRITY TESTS PASSED WITH 100% SUCCESS!');
