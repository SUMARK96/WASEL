import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_DRIVERS, INITIAL_REQUESTS, INITIAL_EXEMPTION_CODES, UNIFIED_SUBSCRIPTION_PLAN } from '../data/mockData';
import type { DeliveryRequest, DriverProfile, DriverOffer, ExemptionCode } from '../types';

// Keys for local backup
const STORAGE_KEY_REQUESTS = 'wasel_requests';
const STORAGE_KEY_DRIVERS = 'wasel_drivers';
const STORAGE_KEY_SUBSCRIPTION_PRICE = 'wasel_subscription_price';
const STORAGE_KEY_EXEMPTION_CODES = 'wasel_exemption_codes';

export const dbService = {
  // Check if active Supabase connection is available
  isConnected: () => isSupabaseConfigured(),

  // ==================== DRIVERS ====================
  async getDrivers(): Promise<DriverProfile[]> {
    if (this.isConnected()) {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .order('rating', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
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
            joinedDate: d.joined_date ? new Date(d.joined_date).toLocaleDateString('ar-AE') : '2026',
            bio: d.bio || 'سائق معتمد'
          }));
        }
      } catch (err) {
        console.warn('Supabase getDrivers error, using local fallback:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEY_DRIVERS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DRIVERS;
  },

  async registerDriver(driver: DriverProfile): Promise<boolean> {
    if (this.isConnected()) {
      try {
        const { error } = await supabase.from('drivers').insert({
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
          bio: driver.bio
        });
        if (error) console.error('Supabase registerDriver error:', error);
      } catch (err) {
        console.warn('Supabase registerDriver failed:', err);
      }
    }
    return true;
  },

  async updateDriverSubscription(driverId: string, planId: string, expiryDate: string, status: 'active' | 'trial' | 'expired' = 'active'): Promise<void> {
    if (this.isConnected()) {
      try {
        await supabase
          .from('drivers')
          .update({
            subscription_status: status,
            subscription_plan: planId,
            subscription_expiry: expiryDate
          })
          .eq('id', driverId);
      } catch (err) {
        console.warn('Supabase updateDriverSubscription failed:', err);
      }
    }
  },

  // ==================== DELIVERY REQUESTS ====================
  async getRequests(): Promise<DeliveryRequest[]> {
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
          return reqData.map((r: any) => ({
            id: r.id,
            title: r.title,
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
            createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString('ar-AE') : 'الآن',
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
              createdAt: o.created_at ? 'الآن' : 'منذ قليل',
              status: o.status || 'pending'
            }))
          }));
        }
      } catch (err) {
        console.warn('Supabase getRequests error, using local fallback:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_REQUESTS;
  },

  async createRequest(request: DeliveryRequest): Promise<void> {
    if (this.isConnected()) {
      try {
        await supabase.from('delivery_requests').insert({
          id: request.id,
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

        // Add initial notification for drivers
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
      } catch (err) {
        console.warn('Supabase acceptOffer failed:', err);
      }
    }
  },

  async rateDriver(requestId: string, driverId: string, rating: number, note: string): Promise<void> {
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

        // Update driver stats
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
              completed_deliveries: newDeliveries
            })
            .eq('id', driverId);
        }
      } catch (err) {
        console.warn('Supabase rateDriver failed:', err);
      }
    }
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
