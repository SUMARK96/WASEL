export type Emirate = 
  | 'أبوظبي' 
  | 'دبي' 
  | 'الشارقة' 
  | 'عجمان' 
  | 'أم القيوين' 
  | 'رأس الخيمة' 
  | 'الفجيرة';

export type UserRole = 'customer' | 'driver' | 'admin';

export type AppScreen = 
  | 'landing' 
  | 'customer' 
  | 'driver_portal' 
  | 'driver_register' 
  | 'driver_login' 
  | 'driver' 
  | 'admin';

export type VehicleType = 'sedan' | 'suv' | 'van' | 'pickup';

export type SubscriptionPlanId = 'unified' | 'starter' | 'pro' | 'unlimited';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: number; // in AED per month
  features: string[];
  recommended?: boolean;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  whatsappPhone: string;
  callPhone: string;
  email: string;
  password?: string;
  avatar: string;
  emirate: Emirate;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  vehiclePhoto?: string;
  licensePhoto?: string;
  mulkiyaPhoto?: string;
  emiratesIdPhoto?: string;
  rating: number;
  reviewsCount: number;
  completedDeliveries: number;
  isVerified: boolean;
  subscriptionStatus: 'active' | 'trial' | 'expired';
  subscriptionPlan: SubscriptionPlanId;
  subscriptionExpiry: string;
  joinedDate: string;
  bio: string;
}

export interface DriverOffer {
  id: string;
  requestId: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  driverVehicle: string;
  driverVehicleType: VehicleType;
  driverPhone: string;
  driverWhatsappPhone: string;
  driverCallPhone: string;
  driverCompletedCount: number;
  driverVerified: boolean;
  price: number; // AED proposal from driver
  estimatedDeliveryTime: string;
  note: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface DeliveryRequest {
  id: string;
  title: string;
  customerName: string;
  customerPhone: string;
  pickupEmirate: Emirate;
  pickupArea: string;
  deliveryEmirate: Emirate;
  deliveryArea: string;
  packageType: string;
  packageSize: 'small' | 'medium' | 'large' | 'heavy';
  packageWeight: string;
  deliveryDate: string;
  urgency: 'standard' | 'express' | 'same_day';
  notes: string;
  status: 'open' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  selectedOfferId?: string;
  isCustomerRated?: boolean;
  customerRating?: number;
  customerReviewNote?: string;
  offers: DriverOffer[];
}

export interface DriverNotification {
  id: string;
  requestId: string;
  title: string;
  pickupEmirate: Emirate;
  deliveryEmirate: Emirate;
  timestamp: string;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'driver' | 'admin';
  text: string;
  timestamp: string;
}

