import type { DeliveryRequest } from '../types';

/**
 * Extracts a numeric timestamp (milliseconds) from a DeliveryRequest
 * to enable accurate descending chronological sorting (Newest to Oldest).
 */
export const getRequestTimestamp = (req: DeliveryRequest): number => {
  if (req.createdAtTimestamp && !isNaN(req.createdAtTimestamp)) {
    return req.createdAtTimestamp;
  }

  // Extract timestamp from ID if generated as req-<timestamp> (e.g. req-1727250000000)
  if (req.id) {
    const numericPart = req.id.replace(/[^0-9]/g, '');
    if (numericPart && numericPart.length >= 10) {
      const parsed = parseInt(numericPart, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  // Parse ISO date or standard date string
  if (req.createdAt && req.createdAt !== 'الآن' && req.createdAt !== 'منذ ساعتين' && req.createdAt !== 'منذ 4 ساعات') {
    const parsed = new Date(req.createdAt).getTime();
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // Relative Arabic mock timestamps fallback
  if (req.createdAt === 'الآن') return Date.now();
  if (req.createdAt === 'منذ ساعتين') return Date.now() - 2 * 3600 * 1000;
  if (req.createdAt === 'منذ 4 ساعات') return Date.now() - 4 * 3600 * 1000;

  // Short mock numeric ID fallback (e.g. req-202, req-201)
  if (req.id) {
    const num = parseInt(req.id.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) return num;
  }

  return 0;
};

/**
 * Sorts delivery requests so that newest requests appear first (الطلبات الجديدة أولاً ثم الأقدم).
 */
export const sortRequestsNewestFirst = (requests: DeliveryRequest[]): DeliveryRequest[] => {
  return [...requests].sort((a, b) => getRequestTimestamp(b) - getRequestTimestamp(a));
};
