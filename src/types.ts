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
  | 'customer_portal' 
  | 'customer_register' 
  | 'customer_login' 
  | 'customer' 
  | 'driver_portal' 
  | 'driver_register' 
  | 'driver_login' 
  | 'driver' 
  | 'admin';

export interface CustomerProfile {
  id: string;
  name: string;
  emirate: Emirate;
  phone: string;
  email: string;
  password?: string;
  joinedDate: string;
}

export type VehicleType = 'sedan' | 'suv' | 'van' | 'pickup';

export type SubscriptionPlanId = 'unified' | 'starter' | 'pro' | 'unlimited';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: number; // in AED per month
  features: string[];
  recommended?: boolean;
}

export interface ExemptionCode {
  id: string;
  code: string; // e.g. 'WASEL2026'
  months: number; // Exemption duration in months (1, 2, 3, etc.)
  maxDrivers: number; // Max allowed driver usages
  usedDriversCount: number; // Current usages count
  usedDriverIds: string[]; // Driver IDs / phones who redeemed this code
  isActive: boolean;
  createdAt: string;
  notes?: string;
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
  vehicleType?: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  vehiclePhoto?: string;
  vehiclePhotos?: string[];
  licensePhoto?: string;
  mulkiyaPhoto?: string;
  emiratesIdPhoto?: string;
  rating: number;
  reviewsCount: number;
  completedDeliveries: number;
  isVerified: boolean;
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'suspended';
  subscriptionPlan: SubscriptionPlanId;
  subscriptionExpiry: string;
  joinedDate: string;
  lastPaymentDate?: string;
  usedExemptionCode?: string;
  isExemptionActive?: boolean;
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
  driverVehicleType?: VehicleType;
  driverVehiclePhotos?: string[];
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
  customerId?: string;
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
  createdAtTimestamp?: number;
  selectedOfferId?: string;
  isCustomerRated?: boolean;
  customerRating?: number;
  customerReviewNote?: string;
  offers: DriverOffer[];
}

export interface DriverNotification {
  id: string;
  requestId?: string;
  title: string;
  pickupEmirate?: Emirate;
  deliveryEmirate?: Emirate;
  timestamp: string;
  isRead: boolean;
  type?: 'request' | 'expiry_reminder' | 'exemption_reminder' | 'suspended_notice' | 'invoice';
  message?: string;
}

export interface CustomerNotification {
  id: string;
  requestId: string;
  requestTitle: string;
  offerId?: string;
  driverName: string;
  driverAvatar?: string;
  driverRating?: number;
  driverPhone?: string;
  driverWhatsappPhone?: string;
  price: number;
  timestamp: string;
  isRead: boolean;
  type?: 'new_offer' | 'status_update' | 'general';
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  driverEmirate: Emirate;
  driverVehicle: string;
  planName: string;
  amount: number;
  issueDate: string;
  startDate: string;
  expiryDate: string;
  paymentMethod: string;
  paymentRef: string;
  status: 'paid';
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
