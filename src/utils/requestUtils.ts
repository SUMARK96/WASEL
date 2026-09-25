import type { DeliveryRequest } from '../types';

/**
 * Extracts a numeric timestamp (milliseconds) from a DeliveryRequest
 * in a 100% deterministic, static way.
 * Once a request is given a timestamp, it NEVER changes under any circumstance.
 */
export const getRequestTimestamp = (req: DeliveryRequest): number => {
  if (!req) return 0;

  // 1. Explicit numeric timestamp if present
  if (typeof req.createdAtTimestamp === 'number' && !isNaN(req.createdAtTimestamp) && req.createdAtTimestamp > 0) {
    return req.createdAtTimestamp;
  }

  // 2. Extract timestamp from ID if generated as req-<timestamp> (e.g. req-1727251234567)
  if (req.id) {
    const numericPart = req.id.replace(/[^0-9]/g, '');
    if (numericPart && numericPart.length >= 10) {
      const parsed = parseInt(numericPart, 10);
      if (!isNaN(parsed) && parsed > 1000000000) {
        return parsed;
      }
    }
  }

  // 3. Parse ISO date or standard date string
  if (req.createdAt && typeof req.createdAt === 'string' && req.createdAt.includes('-')) {
    const parsed = Date.parse(req.createdAt);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // 4. Fixed deterministic baseline for initial mock requests (ALWAYS below new user requests)
  if (req.id === 'req-201') return 1600000002010;
  if (req.id === 'req-202') return 1600000002020;

  // 5. Short numeric ID fallback
  if (req.id) {
    const num = parseInt(req.id.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > 0) return num;
  }

  return 0;
};

/**
 * Sorts delivery requests so that newest requests appear first (الطلبات الجديدة أولاً ثم الأقدم)
 * with a strictly stable tie-breaker on req.id to guarantee ZERO layout shift or flickering.
 */
export const sortRequestsNewestFirst = (requests: DeliveryRequest[]): DeliveryRequest[] => {
  if (!Array.isArray(requests)) return [];
  return [...requests].sort((a, b) => {
    const timeA = getRequestTimestamp(a);
    const timeB = getRequestTimestamp(b);
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    return (b.id || '').localeCompare(a.id || '');
  });
};

/**
 * Checks deep structural equality between two request lists.
 * Prevents unnecessary React state updates and re-renders if no actual change occurred.
 */
export const areRequestListsEqual = (listA: DeliveryRequest[] | null | undefined, listB: DeliveryRequest[] | null | undefined): boolean => {
  if (listA === listB) return true;
  if (!listA || !listB) return false;
  if (listA.length !== listB.length) return false;

  for (let i = 0; i < listA.length; i++) {
    const a = listA[i];
    const b = listB[i];
    if (a.id !== b.id) return false;
    if (a.status !== b.status) return false;
    if (a.selectedOfferId !== b.selectedOfferId) return false;
    if (a.title !== b.title) return false;
    
    const offersA = a.offers || [];
    const offersB = b.offers || [];
    if (offersA.length !== offersB.length) return false;

    for (let j = 0; j < offersA.length; j++) {
      const offA = offersA[j];
      const offB = offersB[j];
      if (offA.id !== offB.id || offA.price !== offB.price || offA.status !== offB.status) {
        return false;
      }
    }
  }

  return true;
};
