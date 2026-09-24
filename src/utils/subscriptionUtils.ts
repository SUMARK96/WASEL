import type { DriverProfile, SubscriptionInvoice } from '../types';
import { UNIFIED_SUBSCRIPTION_PLAN } from '../data/mockData';

/**
 * Calculates the exact remaining days until subscription expiry.
 */
export function getDaysUntilExpiry(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  
  const now = new Date();
  // Set to beginning of today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const expiry = new Date(expiryDateStr);
  const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  
  const diffTime = expiryDay.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks if subscription is expiring within threshold (default 5 days).
 */
export function isExpiringSoon(expiryDateStr: string, daysThreshold: number = 5): boolean {
  const daysRemaining = getDaysUntilExpiry(expiryDateStr);
  return daysRemaining >= 0 && daysRemaining <= daysThreshold;
}

/**
 * Checks if subscription is already expired.
 */
export function isSubscriptionExpired(expiryDateStr: string): boolean {
  return getDaysUntilExpiry(expiryDateStr) < 0;
}

/**
 * Computes expiry date string (YYYY-MM-DD) for given number of months.
 */
export function calculateExpiryByMonths(startDate: Date = new Date(), months: number = 1): string {
  const expiry = new Date(startDate);
  expiry.setMonth(expiry.getMonth() + months);
  return expiry.toISOString().split('T')[0];
}

/**
 * Computes exact 1 month expiry date string (YYYY-MM-DD).
 */
export function calculateOneMonthExpiry(startDate: Date = new Date()): string {
  return calculateExpiryByMonths(startDate, 1);
}

/**
 * Formats a date string to Arabic friendly date format.
 */
export function formatArabicDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generates an official WASEL subscription invoice.
 */
export function createSubscriptionInvoice(
  driver: DriverProfile,
  paymentRef?: string,
  customStartDate?: string,
  customExpiryDate?: string,
  customAmount?: number,
  customPaymentMethod?: string
): SubscriptionInvoice {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const expiryStr = customExpiryDate || calculateOneMonthExpiry(now);
  const invoiceNum = `INV-WSL-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const finalAmount = typeof customAmount === 'number' ? customAmount : UNIFIED_SUBSCRIPTION_PLAN.price;

  return {
    id: `inv-${Date.now()}`,
    invoiceNumber: invoiceNum,
    driverId: driver.id,
    driverName: driver.name,
    driverPhone: driver.phone,
    driverEmail: driver.email,
    driverEmirate: driver.emirate,
    driverVehicle: `${driver.vehicleModel} (${driver.vehiclePlate})`,
    planName: UNIFIED_SUBSCRIPTION_PLAN.name,
    amount: finalAmount,
    issueDate: todayStr,
    startDate: customStartDate || todayStr,
    expiryDate: expiryStr,
    paymentMethod: customPaymentMethod || (finalAmount === 0 ? 'كود إعفاء ترويجي (مجاني)' : 'بوابة زينة (Ziina Pay)'),
    paymentRef: paymentRef || (finalAmount === 0 ? 'EXEMPTION-PROMO' : `ZIN-${Math.floor(100000 + Math.random() * 900000)}`),
    status: 'paid'
  };
}

/**
 * Generates the official SMS / WhatsApp reminder text for upcoming expiry (within 5 days).
 */
export function getExpiryReminderMessage(driverName: string, daysRemaining: number, expiryDate: string): string {
  const daysText = daysRemaining === 0 
    ? 'اليوم' 
    : daysRemaining === 1 
      ? 'غداً' 
      : `خلال ${daysRemaining} أيام`;

  return `🔔 *تنبيه منصة واصل (WASEL)*
عزيزي الكابتن ${driverName}،
نود إحاطتكم علماً بأن اشتراككم في *باقة واصل الموحدة للسائقين* سينتهي ${daysText} (بتاريخ ${expiryDate}).

⚡ لضمان استمرار ظهور عروضكم في مقدمة طلبات العملاء وتلقي الإشعارات الفورية بدون انقطاع، يرجى تجديد الاشتراك عبر بوابة زينة:
https://pay.ziina.com/Waslasd/IWXxU478H?source=app

نتمنى لكم دوام التوفيق والنجاح.
فريق منصة واصل - الإمارات`;
}

/**
 * Creates a direct WhatsApp link to send the reminder message to driver's phone.
 */
export function getWhatsAppReminderUrl(phone: string, driverName: string, daysRemaining: number, expiryDate: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = getExpiryReminderMessage(driverName, daysRemaining, expiryDate);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Creates a WhatsApp link to send the official invoice summary to the driver.
 */
export function getWhatsAppInvoiceUrl(invoice: SubscriptionInvoice): string {
  const cleanPhone = invoice.driverPhone.replace(/[^0-9]/g, '');
  const message = `🧾 *فاتورة اشتراك رسمية - منصة واصل (WASEL)*
--------------------------------
📄 *رقم الفاتورة:* ${invoice.invoiceNumber}
👤 *السائق:* ${invoice.driverName}
🚗 *المركبة:* ${invoice.driverVehicle}
📍 *الإمارة:* ${invoice.driverEmirate}
--------------------------------
⭐ *الباقة:* ${invoice.planName}
💰 *المبلغ المدفوع:* ${invoice.amount} درهم إماراتي (AED)
💳 *طريقة الدفع:* ${invoice.paymentMethod}
🔢 *رقم المرجع:* ${invoice.paymentRef}
📅 *تاريخ الدفع:* ${invoice.issueDate}
⏳ *صلاحية الاشتراك:* شهر كامل (حتى ${invoice.expiryDate})
--------------------------------
✅ *الحالة:* مدفوعة بالكامل (PAID)
شكراً لانضمامكم إلى شبكة واصل المعتمدة في دولة الإمارات!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
