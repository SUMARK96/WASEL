import type { DeliveryRequest, DriverOffer } from '../types';

/**
 * Extracts a numeric timestamp (milliseconds) from a DeliveryRequest
 * in a 100% deterministic, static way.
 * Once a request is given a timestamp, it NEVER changes under any circumstance.
 */
export const getRequestTimestamp = (req: DeliveryRequest | any): number => {
  if (!req) return 0;

  // 1. Primary rule: Extract immutable timestamp from ID (e.g. req-1790326464547)
  if (req.id) {
    const numericPart = req.id.replace(/[^0-9]/g, '');
    if (numericPart && numericPart.length >= 10) {
      const parsed = parseInt(numericPart, 10);
      if (!isNaN(parsed) && parsed > 1000000000) {
        return parsed;
      }
    }
  }

  // 2. Explicit numeric timestamp if present
  if (typeof req.createdAtTimestamp === 'number' && !isNaN(req.createdAtTimestamp) && req.createdAtTimestamp > 0) {
    return req.createdAtTimestamp;
  }

  // 3. Fixed deterministic baseline for initial mock requests (ALWAYS below new user requests)
  if (req.id === 'req-201') return 1600000002010;
  if (req.id === 'req-202') return 1600000002020;

  // 4. Parse ISO date or standard date string
  if (req.createdAt && typeof req.createdAt === 'string' && req.createdAt.includes('-')) {
    const parsed = Date.parse(req.createdAt);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // 5. Short numeric ID fallback
  if (req.id) {
    const num = parseInt(req.id.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > 0) return num;
  }

  return 0;
};

/**
 * Extracts timestamp from a DriverOffer deterministically.
 */
export const getOfferTimestamp = (offer: DriverOffer | any): number => {
  if (!offer) return 0;
  if (offer.id) {
    const numericPart = offer.id.replace(/[^0-9]/g, '');
    if (numericPart && numericPart.length >= 10) {
      const parsed = parseInt(numericPart, 10);
      if (!isNaN(parsed) && parsed > 1000000000) {
        return parsed;
      }
    }
  }
  if (offer.id === 'off-301') return 1600000003010;
  if (offer.id === 'off-302') return 1600000003020;
  if (offer.id === 'off-303') return 1600000003030;
  return 0;
};

/**
 * Sorts driver offers deterministically (Accepted first, then rating, completed count, timestamp, and ID tie-breaker).
 * Guarantees zero offer shaking or position jumping.
 */
export const sortOffersDeterministically = (offers: DriverOffer[]): DriverOffer[] => {
  if (!Array.isArray(offers)) return [];
  return [...offers].sort((a, b) => {
    // 1. Accepted offers stay at the top
    if (a.status === 'accepted' && b.status !== 'accepted') return -1;
    if (b.status === 'accepted' && a.status !== 'accepted') return 1;

    // 2. Higher driver rating first
    const ratingA = Number(a.driverRating) || 0;
    const ratingB = Number(b.driverRating) || 0;
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }

    // 3. More completed deliveries
    const countA = Number(a.driverCompletedCount) || 0;
    const countB = Number(b.driverCompletedCount) || 0;
    if (countB !== countA) {
      return countB - countA;
    }

    // 4. Newer offer first
    const timeA = getOfferTimestamp(a);
    const timeB = getOfferTimestamp(b);
    if (timeB !== timeA) {
      return timeB - timeA;
    }

    // 5. Ultimate immutable tie-breaker: string ID comparison
    return (b.id || '').localeCompare(a.id || '');
  });
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
    if (a.isCustomerRated !== b.isCustomerRated) return false;
    if (a.customerRating !== b.customerRating) return false;
    
    const offersA = a.offers || [];
    const offersB = b.offers || [];
    if (offersA.length !== offersB.length) return false;

    // Check offers regardless of internal array order
    const offerMapA = new Map<string, DriverOffer>();
    offersA.forEach(o => offerMapA.set(o.id, o));

    for (let j = 0; j < offersB.length; j++) {
      const offB = offersB[j];
      const offA = offerMapA.get(offB.id);
      if (!offA) return false;
      if (offA.price !== offB.price || offA.status !== offB.status) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Merges previous in-memory requests with incoming requests.
 * Guarantees that no in-flight request or newly received offer is ever dropped or shaken.
 */
export const mergeRequestLists = (prevList: DeliveryRequest[] | undefined | null, incomingList: DeliveryRequest[] | undefined | null): DeliveryRequest[] => {
  const prev = Array.isArray(prevList) ? prevList : [];
  const incoming = Array.isArray(incomingList) ? incomingList : [];

  const map = new Map<string, DeliveryRequest>();

  // 1. Load all incoming requests from DB / fetch
  incoming.forEach(r => map.set(r.id, r));

  // 2. Merge with previous in-memory state to preserve uncommitted or fast-received offers
  prev.forEach(prevReq => {
    const incomingReq = map.get(prevReq.id);
    if (!incomingReq) {
      map.set(prevReq.id, prevReq);
    } else {
      const offerMap = new Map<string, DriverOffer>();
      (incomingReq.offers || []).forEach(o => offerMap.set(o.id, o));
      (prevReq.offers || []).forEach(o => offerMap.set(o.id, o));

      map.set(prevReq.id, {
        ...incomingReq,
        selectedOfferId: incomingReq.selectedOfferId || prevReq.selectedOfferId,
        status: incomingReq.status !== 'open' ? incomingReq.status : prevReq.status,
        createdAt: prevReq.createdAt === 'الآن' ? 'الآن' : (incomingReq.createdAt || prevReq.createdAt),
        createdAtTimestamp: getRequestTimestamp(incomingReq) || getRequestTimestamp(prevReq),
        offers: sortOffersDeterministically(Array.from(offerMap.values()))
      });
    }
  });

  const merged = sortRequestsNewestFirst(Array.from(map.values()));
  return areRequestListsEqual(prev, merged) ? prev : merged;
};
