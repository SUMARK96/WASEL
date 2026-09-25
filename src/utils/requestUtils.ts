import type { DeliveryRequest } from '../types';

/**
 * Extracts a numeric timestamp (milliseconds) from a DeliveryRequest
 * in a 100% deterministic way to prevent list jumping/flickering during sorting.
 */
export const getRequestTimestamp = (req: DeliveryRequest): number => {
  if (req.createdAtTimestamp && !isNaN(req.createdAtTimestamp) && req.createdAtTimestamp > 0) {
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

  // Deterministic fallback for relative string labels (using fixed static timestamps to prevent jitter)
  if (req.createdAt === 'الآن') return 1750000000000;
  if (req.createdAt === 'منذ ساعتين') return 1740000000000;
  if (req.createdAt === 'منذ 4 ساعات') return 1730000000000;

  // Short mock numeric ID fallback (e.g. req-202, req-201)
  if (req.id) {
    const num = parseInt(req.id.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) return num;
  }

  return 0;
};

/**
 * Sorts delivery requests so that newest requests appear first (الطلبات الجديدة أولاً ثم الأقدم)
 * with a stable tie-breaker on req.id to ensure zero layout shift or flickering.
 */
export const sortRequestsNewestFirst = (requests: DeliveryRequest[]): DeliveryRequest[] => {
  return [...requests].sort((a, b) => {
    const diff = getRequestTimestamp(b) - getRequestTimestamp(a);
    if (diff !== 0) return diff;
    return (b.id || '').localeCompare(a.id || '');
  });
};
