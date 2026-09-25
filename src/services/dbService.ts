import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_DRIVERS, INITIAL_CUSTOMERS, INITIAL_REQUESTS, INITIAL_EXEMPTION_CODES, UNIFIED_SUBSCRIPTION_PLAN } from '../data/mockData';
import type { DeliveryRequest, DriverProfile, CustomerProfile, DriverOffer, ExemptionCode } from '../types';
import { sortRequestsNewestFirst, getRequestTimestamp } from '../utils/requestUtils';

// Keys for local backup
const STORAGE_KEY_REQUESTS = 'wasel_requests_v3';
const STORAGE_KEY_DRIVERS = 'wasel_drivers_v2';
const STORAGE_KEY_CUSTOMERS = 'wasel_customers_v1';
const STORAGE_KEY_DELETED_DRIVERS = 'wasel_deleted_drivers_v2';
const STORAGE_KEY_SUBSCRIPTION_PRICE = 'wasel_subscription_price';
const STORAGE_KEY_EXEMPTION_CODES = 'wasel_exemption_codes';

// Broadcast channel for instantaneous cross-tab communication
let syncBroadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncBroadcastChannel = new BroadcastChannel('wasel_sync_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported:', e);
}

export interface WaselSyncEvent {
  type: 'NEW_REQUEST' | 'NEW_OFFER' | 'ACCEPT_OFFER' | 'RATE_DRIVER' | 'DRIVERS_UPDATED' | 'SYNC_ALL';
  payload?: any;
  timestamp: number;
}

export const broadcastSyncEvent = (type: WaselSyncEvent['type'], payload?: any) => {
  const event: WaselSyncEvent = { type, payload, timestamp: Date.now() };
  try {
    if (syncBroadcastChannel) {
      syncBroadcastChannel.postMessage(event);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wasel_local_sync', { detail: event }));
    }
  } catch (e) {
    console.error('Error broadcasting sync event:', e);
  }
};

export const onSyncEvent = (callback: (event: WaselSyncEvent) => void): (() => void) => {
  const handleBroadcastMessage = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      callback(e.data as WaselSyncEvent);
    }
  };

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<WaselSyncEvent>;
    if (customEvent.detail && customEvent.detail.type) {
      callback(customEvent.detail);
    }
  };

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_REQUESTS || e.key === STORAGE_KEY_DRIVERS) {
      callback({ type: 'SYNC_ALL', timestamp: Date.now() });
    }
  };

  if (syncBroadcastChannel) {
    syncBroadcastChannel.addEventListener('message', handleBroadcastMessage);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('wasel_local_sync', handleCustomEvent);
    window.addEventListener('storage', handleStorageChange);
  }

  return () => {
    if (syncBroadcastChannel) {
      syncBroadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('wasel_local_sync', handleCustomEvent);
      window.removeEventListener('storage', handleStorageChange);
    }
  };
};

export const dbService = {
  // Check if active Supabase connection is available
  isConnected: () => isSupabaseConfigured(),

  getDeletedDriverIds(): Set<string> {
    try {
      const deleted = localStorage.getItem(STORAGE_KEY_DELETED_DRIVERS);
      if (deleted) {
        const parsed = JSON.parse(deleted);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    return new Set();
  },

  addDeletedDriverId(id: string): void {
    try {
      const deletedSet = this.getDeletedDriverIds();
      deletedSet.add(id);
      localStorage.setItem(STORAGE_KEY_DELETED_DRIVERS, JSON.stringify(Array.from(deletedSet)));
    } catch (e) {
      console.error(e);
    }
  },

  // ==================== DRIVERS PERSISTENCE ====================
  // Instant synchronous local read for zero-flicker UI initialization
  getLocalDrivers(): DriverProfile[] {
    const deletedIds = this.getDeletedDriverIds();
    try {
      const local = localStorage.getItem(STORAGE_KEY_DRIVERS);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validLocal = parsed.filter(d => !deletedIds.has(d.id));
          // Merge with initial drivers to ensure baseline accounts exist alongside new registered drivers
          const existingIds = new Set(validLocal.map(d => d.id));
          const missingInitial = INITIAL_DRIVERS.filter(d => !existingIds.has(d.id) && !deletedIds.has(d.id));
          return [...validLocal, ...missingInitial];
        }
      }
    } catch (e) {
      console.error('Error reading local drivers:', e);
    }
    return INITIAL_DRIVERS.filter(d => !deletedIds.has(d.id));
  },

  // Save drivers list directly to local storage
  saveLocalDrivers(drivers: DriverProfile[]): void {
    const deletedIds = this.getDeletedDriverIds();
    try {
      if (Array.isArray(drivers)) {
        const filtered = drivers.filter(d => !deletedIds.has(d.id));
        localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('Error saving local drivers:', e);
    }
  },

  async getDrivers(): Promise<DriverProfile[]> {
    const deletedIds = this.getDeletedDriverIds();
    const localDrivers = this.getLocalDrivers();
    let cloudDrivers: DriverProfile[] = [];

    if (this.isConnected()) {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .order('rating', { ascending: false });

        if (!error && data && data.length > 0) {
          cloudDrivers = data
            .filter((d: any) => !deletedIds.has(d.id))
            .map((d: any) => ({
              id: d.id,
              name: d.name,
              phone: d.phone,
              whatsappPhone: d.whatsapp_phone,
              callPhone: d.call_phone,
              email: d.email,
              password: d.password,
              avatar: d.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
              emirate: d.emirate,
              vehicleType: d.vehicle_type,
              vehicleModel: d.vehicle_model,
              vehiclePlate: d.vehicle_plate,
              vehiclePhoto: d.vehicle_photo,
              vehiclePhotos: Array.isArray(d.vehicle_photos) ? d.vehicle_photos : (d.vehicle_photo ? [d.vehicle_photo] : []),
              licensePhoto: d.license_photo,
              mulkiyaPhoto: d.mulkiya_photo,
              emiratesIdPhoto: d.emirates_id_photo,
              rating: Number(d.rating) || 5.0,
              reviewsCount: d.reviews_count || 0,
              completedDeliveries: d.completed_deliveries || 0,
              isVerified: Boolean(d.is_verified),
              subscriptionStatus: d.subscription_status || 'active',
              subscriptionPlan: d.subscription_plan || 'unified',
              subscriptionExpiry: d.subscription_expiry || '2026-12-31',
              joinedDate: d.joined_date ? (d.joined_date.includes('T') ? new Date(d.joined_date).toLocaleDateString('ar-AE') : d.joined_date) : '2026',
              lastPaymentDate: d.last_payment_date,
              usedExemptionCode: d.used_exemption_code,
              isExemptionActive: Boolean(d.is_exemption_active),
              bio: d.bio || 'سائق معتمد'
            }));
        }
      } catch (err) {
        console.warn('Supabase getDrivers error, relying on local storage:', err);
      }
    }

    // Merge strategy: combine cloud drivers with local drivers so no driver account is ever deleted
    const driverMap = new Map<string, DriverProfile>();
    
    // 1. Add baseline mock drivers (if not explicitly deleted)
    INITIAL_DRIVERS.filter(d => !deletedIds.has(d.id)).forEach(d => driverMap.set(d.id, d));
    
    // 2. Add local storage drivers (overrides initial if modified)
    localDrivers.filter(d => !deletedIds.has(d.id)).forEach(d => driverMap.set(d.id, d));
    
    // 3. Add cloud drivers (most up to date from database)
    cloudDrivers.filter(d => !deletedIds.has(d.id)).forEach(d => driverMap.set(d.id, d));

    const merged = Array.from(driverMap.values());
    this.saveLocalDrivers(merged);

    // If there are drivers in local storage not yet in cloud, sync them to Supabase in background
    if (this.isConnected() && cloudDrivers.length > 0) {
      const cloudIds = new Set(cloudDrivers.map(c => c.id));
      const pendingSync = merged.filter(d => !cloudIds.has(d.id));
      for (const d of pendingSync) {
        this.registerDriver(d).catch(console.error);
      }
    }

    return merged;
  },

  async deleteDriver(driverId: string): Promise<boolean> {
    // 1. Record ID in deleted set so it's never re-seeded
    this.addDeletedDriverId(driverId);

    // 2. Remove from local storage
    const current = this.getLocalDrivers();
    const updated = current.filter(d => d.id !== driverId);
    this.saveLocalDrivers(updated);
    broadcastSyncEvent('DRIVERS_UPDATED');

    // 3. Remove from Supabase
    if (this.isConnected()) {
      try {
        await supabase.from('driver_offers').delete().eq('driver_id', driverId);
        const { error } = await supabase.from('drivers').delete().eq('id', driverId);
        if (error) console.error('Supabase deleteDriver error:', error);
      } catch (err) {
        console.warn('Supabase deleteDriver failed:', err);
      }
    }
    return true;
  },

  async toggleDriverSuspension(driverId: string, targetStatus: 'active' | 'suspended'): Promise<void> {
    const current = this.getLocalDrivers();
    const updated = current.map(d => d.id === driverId ? { ...d, subscriptionStatus: targetStatus } : d);
    this.saveLocalDrivers(updated);
    broadcastSyncEvent('DRIVERS_UPDATED');

    if (this.isConnected()) {
      try {
        await supabase
          .from('drivers')
          .update({ subscription_status: targetStatus, updated_at: new Date().toISOString() })
          .eq('id', driverId);
      } catch (err) {
        console.warn('Supabase toggleDriverSuspension failed:', err);
      }
    }
  },

  async registerDriver(driver: DriverProfile): Promise<boolean> {
    // 1. Immediately persist locally
    const current = this.getLocalDrivers();
    const updated = [driver, ...current.filter(d => d.id !== driver.id)];
    this.saveLocalDrivers(updated);
    broadcastSyncEvent('DRIVERS_UPDATED');

    // 2. Persist to Supabase
    if (this.isConnected()) {
      try {
        const { error } = await supabase.from('drivers').upsert({
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          whatsapp_phone: driver.whatsappPhone,
          call_phone: driver.callPhone,
          email: driver.email,
          password: driver.password,
          avatar: driver.avatar,
          emirate: driver.emirate,
          vehicle_type: driver.vehicleType,
          vehicle_model: driver.vehicleModel,
          vehicle_plate: driver.vehiclePlate,
          vehicle_photo: driver.vehiclePhoto,
          vehicle_photos: driver.vehiclePhotos || [],
          license_photo: driver.licensePhoto,
          mulkiya_photo: driver.mulkiyaPhoto,
          emirates_id_photo: driver.emiratesIdPhoto,
          rating: driver.rating,
          reviews_count: driver.reviewsCount,
          completed_deliveries: driver.completedDeliveries,
          is_verified: driver.isVerified,
          subscription_status: driver.subscriptionStatus,
          subscription_plan: driver.subscriptionPlan,
          subscription_expiry: driver.subscriptionExpiry,
          joined_date: driver.joinedDate,
          last_payment_date: driver.lastPaymentDate,
          used_exemption_code: driver.usedExemptionCode,
          is_exemption_active: driver.isExemptionActive,
          bio: driver.bio
        }, { onConflict: 'id' });
        
        if (error) console.error('Supabase registerDriver upsert error:', error);
      } catch (err) {
        console.warn('Supabase registerDriver failed:', err);
      }
    }
    return true;
  },

  async updateDriverSubscription(
    driverId: string, 
    planId: string, 
    expiryDate: string, 
    status: 'active' | 'trial' | 'expired' | 'suspended' = 'active',
    lastPaymentDate?: string,
    usedExemptionCode?: string,
    isExemptionActive?: boolean
  ): Promise<void> {
    // 1. Update local storage
    const current = this.getLocalDrivers();
    const updated = current.map(d => {
      if (d.id === driverId) {
        return {
          ...d,
          subscriptionStatus: status,
          subscriptionPlan: planId as any,
          subscriptionExpiry: expiryDate,
          lastPaymentDate: lastPaymentDate || d.lastPaymentDate,
          usedExemptionCode: usedExemptionCode !== undefined ? usedExemptionCode : d.usedExemptionCode,
          isExemptionActive: isExemptionActive !== undefined ? isExemptionActive : d.isExemptionActive
        };
      }
      return d;
    });
    this.saveLocalDrivers(updated);
    broadcastSyncEvent('DRIVERS_UPDATED');

    // 2. Update Supabase
    if (this.isConnected()) {
      try {
        await supabase
          .from('drivers')
          .update({
            subscription_status: status,
            subscription_plan: planId,
            subscription_expiry: expiryDate,
            last_payment_date: lastPaymentDate,
            used_exemption_code: usedExemptionCode,
            is_exemption_active: isExemptionActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', driverId);
      } catch (err) {
        console.warn('Supabase updateDriverSubscription failed:', err);
      }
    }
  },

  // ==================== DELIVERY REQUESTS ====================
  getLocalRequests(): DeliveryRequest[] {
    try {
      const local = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading local requests:', e);
    }
    return INITIAL_REQUESTS;
  },

  saveLocalRequests(requests: DeliveryRequest[]): void {
    try {
      if (Array.isArray(requests)) {
        const current = localStorage.getItem(STORAGE_KEY_REQUESTS);
        const nextJson = JSON.stringify(requests);
        if (current !== nextJson) {
          localStorage.setItem(STORAGE_KEY_REQUESTS, nextJson);
        }
      }
    } catch (e) {
      console.error('Error saving local requests:', e);
    }
  },

  async getRequests(): Promise<DeliveryRequest[]> {
    let cloudRequests: DeliveryRequest[] = [];
    if (this.isConnected()) {
      try {
        const { data: reqData, error: reqErr } = await supabase
          .from('delivery_requests')
          .select(`
            *,
            offers:driver_offers(*)
          `)
          .order('created_at', { ascending: false });

        if (!reqErr && reqData) {
          cloudRequests = reqData.map((r: any) => {
            const parsedTime = r.created_at ? new Date(r.created_at).getTime() : 0;
            const numericIdTime = r.id ? parseInt(r.id.replace(/[^0-9]/g, ''), 10) : 0;
            const finalTimestamp = parsedTime > 0 ? parsedTime : (numericIdTime > 1000000000 ? numericIdTime : getRequestTimestamp(r));

            return {
              id: r.id,
              title: r.title,
              customerId: r.customer_id,
              customerName: r.customer_name,
              customerPhone: r.customer_phone,
              pickupEmirate: r.pickup_emirate,
              pickupArea: r.pickup_area,
              deliveryEmirate: r.delivery_emirate,
              deliveryArea: r.delivery_area,
              packageType: r.package_type,
              packageSize: r.package_size,
              packageWeight: r.package_weight,
              deliveryDate: r.delivery_date,
              urgency: r.urgency,
              notes: r.notes || '',
              status: r.status || 'open',
              createdAt: r.created_at ? (r.created_at.includes('T') ? new Date(r.created_at).toLocaleDateString('ar-AE') : r.created_at) : 'الآن',
              createdAtTimestamp: finalTimestamp,
              selectedOfferId: r.selected_offer_id,
              isCustomerRated: Boolean(r.is_customer_rated),
              customerRating: r.customer_rating,
              customerReviewNote: r.customer_review_note,
              offers: (r.offers || []).map((o: any) => ({
                id: o.id,
                requestId: o.request_id,
                driverId: o.driver_id,
                driverName: o.driver_name,
                driverAvatar: o.driver_avatar,
                driverRating: Number(o.driver_rating) || 5.0,
                driverVehicle: o.driver_vehicle,
                driverVehicleType: o.driver_vehicle_type,
                driverPhone: o.driver_phone,
                driverWhatsappPhone: o.driver_whatsapp_phone,
                driverCallPhone: o.driver_call_phone,
                driverCompletedCount: o.driver_completed_count || 0,
                driverVerified: Boolean(o.driver_verified),
                price: Number(o.price),
                estimatedDeliveryTime: o.estimated_delivery_time,
                note: o.note || '',
                createdAt: o.created_at ? (o.created_at.includes('T') ? new Date(o.created_at).toLocaleTimeString('ar-AE', { hour: '2-digit', minute: '2-digit' }) : o.created_at) : 'الآن',
                status: o.status || 'pending'
              }))
            };
          });
        }
      } catch (err) {
        console.warn('Supabase getRequests error, using local fallback:', err);
      }
    }

    const localRequests = this.getLocalRequests();

    if (cloudRequests.length > 0) {
      // Merge strategy: map by id to combine any local pending requests
      const requestMap = new Map<string, DeliveryRequest>();
      localRequests.forEach(r => requestMap.set(r.id, r));
      cloudRequests.forEach(r => requestMap.set(r.id, r));
      const merged = sortRequestsNewestFirst(Array.from(requestMap.values()));
      this.saveLocalRequests(merged);
      return merged;
    }

    return sortRequestsNewestFirst(localRequests);
  },

  async createRequest(request: DeliveryRequest): Promise<void> {
    const reqWithTimestamp: DeliveryRequest = {
      ...request,
      createdAtTimestamp: request.createdAtTimestamp || Date.now()
    };
    // 1. Immediately persist locally (sorted newest-first)
    const current = this.getLocalRequests();
    const updated = sortRequestsNewestFirst([reqWithTimestamp, ...current.filter(r => r.id !== request.id)]);
    this.saveLocalRequests(updated);
    broadcastSyncEvent('NEW_REQUEST', reqWithTimestamp);

    // 2. Persist to Supabase
    if (this.isConnected()) {
      try {
        await supabase.from('delivery_requests').insert({
          id: request.id,
          customer_id: request.customerId || null,
          title: request.title,
          customer_name: request.customerName,
          customer_phone: request.customerPhone,
          pickup_emirate: request.pickupEmirate,
          pickup_area: request.pickupArea,
          delivery_emirate: request.deliveryEmirate,
          delivery_area: request.deliveryArea,
          package_type: request.packageType,
          package_size: request.packageSize,
          package_weight: request.packageWeight,
          delivery_date: request.deliveryDate,
          urgency: request.urgency,
          notes: request.notes,
          status: request.status
        });

        // Add initial notification for drivers in Supabase
        await supabase.from('driver_notifications').insert({
          id: `notif-${Date.now()}`,
          request_id: request.id,
          title: request.title,
          pickup_emirate: request.pickupEmirate,
          delivery_emirate: request.deliveryEmirate,
          is_read: false
        });
      } catch (err) {
        console.warn('Supabase createRequest failed:', err);
      }
    }
  },

  // ==================== DRIVER OFFERS ====================
  async submitOffer(offer: DriverOffer): Promise<void> {
    // 1. Immediately persist locally
    const current = this.getLocalRequests();
    const updated = current.map(req => {
      if (req.id === offer.requestId) {
        const existingOffers = req.offers || [];
        return {
          ...req,
          offers: [offer, ...existingOffers.filter(o => o.id !== offer.id)]
        };
      }
      return req;
    });
    this.saveLocalRequests(updated);
    broadcastSyncEvent('NEW_OFFER', offer);

    // 2. Persist to Supabase
    if (this.isConnected()) {
      try {
        await supabase.from('driver_offers').insert({
          id: offer.id,
          request_id: offer.requestId,
          driver_id: offer.driverId,
          driver_name: offer.driverName,
          driver_avatar: offer.driverAvatar,
          driver_rating: offer.driverRating,
          driver_vehicle: offer.driverVehicle,
          driver_vehicle_type: offer.driverVehicleType,
          driver_phone: offer.driverPhone,
          driver_whatsapp_phone: offer.driverWhatsappPhone,
          driver_call_phone: offer.driverCallPhone,
          driver_completed_count: offer.driverCompletedCount,
          driver_verified: offer.driverVerified,
          price: offer.price,
          estimated_delivery_time: offer.estimatedDeliveryTime,
          note: offer.note,
          status: offer.status
        });
      } catch (err) {
        console.warn('Supabase submitOffer failed:', err);
      }
    }
  },

  // ==================== UPDATE STATUS & RATING ====================
  async acceptOffer(requestId: string, offerId: string): Promise<void> {
    // 1. Update locally
    const current = this.getLocalRequests();
    const updated: DeliveryRequest[] = current.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          selectedOfferId: offerId,
          status: 'assigned' as const,
          offers: (req.offers || []).map(o => o.id === offerId ? { ...o, status: 'accepted' as const } : o)
        };
      }
      return req;
    });
    this.saveLocalRequests(updated);
    broadcastSyncEvent('ACCEPT_OFFER', { requestId, offerId });

    // 2. Update Supabase
    if (this.isConnected()) {
      try {
        await supabase
          .from('delivery_requests')
          .update({ status: 'assigned', selected_offer_id: offerId })
          .eq('id', requestId);

        await supabase
          .from('driver_offers')
          .update({ status: 'accepted' })
          .eq('id', offerId);

        // Add accepted offer notification for driver
        const targetReq = updated.find(r => r.id === requestId);
        const acceptedOffer = targetReq?.offers?.find(o => o.id === offerId);
        await supabase.from('driver_notifications').insert({
          id: `notif-${Date.now()}`,
          request_id: requestId,
          title: `🎉 مبروك! قبل العميل (${targetReq?.customerName || 'العميل'}) عرضك${acceptedOffer?.price ? ` بقيمة (${acceptedOffer.price} AED)` : ''} لتوصيل: ${targetReq?.title || 'طرد'}`,
          pickup_emirate: targetReq?.pickupEmirate,
          delivery_emirate: targetReq?.deliveryEmirate,
          is_read: false
        });
      } catch (err) {
        console.warn('Supabase acceptOffer failed:', err);
      }
    }
  },

  async rateDriver(requestId: string, driverId: string, rating: number, note: string): Promise<void> {
    // 1. Update local storage
    const currentDrivers = this.getLocalDrivers();
    const updatedDrivers = currentDrivers.map(d => {
      if (d.id === driverId) {
        const currentCount = d.reviewsCount || 0;
        const currentRating = d.rating || 5.0;
        const newCount = currentCount + 1;
        const newRating = Number(((currentRating * currentCount + rating) / newCount).toFixed(2));
        const newDeliveries = (d.completedDeliveries || 0) + 1;
        return {
          ...d,
          rating: newRating,
          reviewsCount: newCount,
          completedDeliveries: newDeliveries
        };
      }
      return d;
    });
    this.saveLocalDrivers(updatedDrivers);

    const currentReqs = this.getLocalRequests();
    const updatedReqs = currentReqs.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          isCustomerRated: true,
          customerRating: rating,
          customerReviewNote: note,
          status: 'delivered' as const
        };
      }
      return r;
    });
    this.saveLocalRequests(updatedReqs);
    broadcastSyncEvent('RATE_DRIVER', { requestId, driverId, rating });

    // 2. Update Supabase
    if (this.isConnected()) {
      try {
        await supabase
          .from('delivery_requests')
          .update({
            is_customer_rated: true,
            customer_rating: rating,
            customer_review_note: note,
            status: 'delivered'
          })
          .eq('id', requestId);

        // Update driver stats in database
        const { data: driver } = await supabase
          .from('drivers')
          .select('rating, reviews_count, completed_deliveries')
          .eq('id', driverId)
          .single();

        if (driver) {
          const currentCount = driver.reviews_count || 0;
          const currentRating = Number(driver.rating) || 5.0;
          const newCount = currentCount + 1;
          const newRating = Number(((currentRating * currentCount + rating) / newCount).toFixed(2));
          const newDeliveries = (driver.completed_deliveries || 0) + 1;

          await supabase
            .from('drivers')
            .update({
              rating: newRating,
              reviews_count: newCount,
              completed_deliveries: newDeliveries,
              updated_at: new Date().toISOString()
            })
            .eq('id', driverId);
        }
      } catch (err) {
        console.warn('Supabase rateDriver failed:', err);
      }
    }
  },

  async updateDriverVerification(driverId: string, isVerified: boolean): Promise<void> {
    // 1. Local update
    const current = this.getLocalDrivers();
    const updated = current.map(d => d.id === driverId ? { ...d, isVerified } : d);
    this.saveLocalDrivers(updated);
    broadcastSyncEvent('DRIVERS_UPDATED');

    // 2. Supabase update
    if (this.isConnected()) {
      try {
        await supabase
          .from('drivers')
          .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
          .eq('id', driverId);
      } catch (err) {
        console.warn('Supabase updateDriverVerification failed:', err);
      }
    }
  },

  // ==================== CUSTOMERS PERSISTENCE ====================
  getLocalCustomers(): CustomerProfile[] {
    try {
      const local = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(c => c.id));
          const missingInitial = INITIAL_CUSTOMERS.filter(c => !existingIds.has(c.id));
          return [...parsed, ...missingInitial];
        }
      }
    } catch (e) {
      console.error('Error reading local customers:', e);
    }
    return INITIAL_CUSTOMERS;
  },

  saveLocalCustomers(customers: CustomerProfile[]): void {
    try {
      if (Array.isArray(customers)) {
        localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
      }
    } catch (e) {
      console.error('Error saving local customers:', e);
    }
  },

  async getCustomers(): Promise<CustomerProfile[]> {
    const localCustomers = this.getLocalCustomers();
    let cloudCustomers: CustomerProfile[] = [];

    if (this.isConnected()) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          cloudCustomers = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            emirate: c.emirate,
            phone: c.phone,
            email: c.email,
            password: c.password,
            joinedDate: c.joined_date || (c.created_at ? new Date(c.created_at).toLocaleDateString('ar-AE') : '2026')
          }));
        }
      } catch (err) {
        console.warn('Supabase getCustomers error:', err);
      }
    }

    const customerMap = new Map<string, CustomerProfile>();
    INITIAL_CUSTOMERS.forEach(c => customerMap.set(c.id, c));
    localCustomers.forEach(c => customerMap.set(c.id, c));
    cloudCustomers.forEach(c => customerMap.set(c.id, c));

    const merged = Array.from(customerMap.values());
    this.saveLocalCustomers(merged);

    // Sync local customers to cloud in background if any pending
    if (this.isConnected() && cloudCustomers.length > 0) {
      const cloudIds = new Set(cloudCustomers.map(c => c.id));
      const pendingSync = merged.filter(c => !cloudIds.has(c.id));
      for (const c of pendingSync) {
        this.registerCustomer(c).catch(console.error);
      }
    }

    return merged;
  },

  async registerCustomer(customer: CustomerProfile): Promise<boolean> {
    // 1. Save locally
    const current = this.getLocalCustomers();
    const updated = [customer, ...current.filter(c => c.id !== customer.id)];
    this.saveLocalCustomers(updated);
    broadcastSyncEvent('SYNC_ALL');

    // 2. Save to Supabase
    if (this.isConnected()) {
      try {
        const { error } = await supabase.from('customers').upsert({
          id: customer.id,
          name: customer.name,
          emirate: customer.emirate,
          phone: customer.phone,
          email: customer.email,
          password: customer.password,
          joined_date: customer.joinedDate
        }, { onConflict: 'id' });
        if (error) console.error('Supabase registerCustomer upsert error:', error);
      } catch (err) {
        console.warn('Supabase registerCustomer failed:', err);
      }
    }
    return true;
  },

  async updateCustomer(customer: CustomerProfile): Promise<boolean> {
    // 1. Save locally
    const current = this.getLocalCustomers();
    const updated = current.map(c => c.id === customer.id ? customer : c);
    this.saveLocalCustomers(updated);
    broadcastSyncEvent('SYNC_ALL');

    // 2. Save to Supabase
    if (this.isConnected()) {
      try {
        const { error } = await supabase.from('customers').upsert({
          id: customer.id,
          name: customer.name,
          emirate: customer.emirate,
          phone: customer.phone,
          email: customer.email,
          password: customer.password,
          joined_date: customer.joinedDate
        }, { onConflict: 'id' });
        if (error) console.error('Supabase updateCustomer error:', error);
      } catch (err) {
        console.warn('Supabase updateCustomer failed:', err);
      }
    }
    return true;
  },

  // ==================== SUBSCRIPTION PRICE & EXEMPTION CODES ====================
  getSubscriptionPrice(): number {
    const local = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION_PRICE);
    if (local) {
      const parsed = parseInt(local, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return UNIFIED_SUBSCRIPTION_PLAN.price;
  },

  setSubscriptionPrice(price: number): void {
    localStorage.setItem(STORAGE_KEY_SUBSCRIPTION_PRICE, price.toString());
  },

  getExemptionCodes(): ExemptionCode[] {
    const local = localStorage.getItem(STORAGE_KEY_EXEMPTION_CODES);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse exemption codes:', e);
      }
    }
    return INITIAL_EXEMPTION_CODES;
  },

  saveExemptionCodes(codes: ExemptionCode[]): void {
    localStorage.setItem(STORAGE_KEY_EXEMPTION_CODES, JSON.stringify(codes));
  }
};
