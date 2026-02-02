# Database, Caching & Optimization Review (MVP Focused)

**Review Date:** February 2, 2026
**Codebase:** korepetycje_marketplace (Tutoring Marketplace MVP)
**Focus:** MVP Stability & Scalability to >1000 users

---

## Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| Database Queries | 7/10 | Good with room for improvement |
| Caching Strategy | 8/10 | Well-implemented |
| Server Actions | 8/10 | Solid patterns |
| API Routes | 6/10 | Missing HTTP caching |
| RPC Functions | 9/10 | Excellent use |

**Overall Assessment:** The codebase demonstrates solid foundational patterns. The focus for MVP launch is ensuring stability (Transactions, Error Logging) and preventing early bottlenecks (N+1 queries, Cron timeouts) that would appear with ~1000 active users.

---

## 1. Critical Performance & Stability Issues

### A. N+1 Query Pattern in Ad Extensions/Promotions
**Files affected:** `extend-ad.ts`, `promote-ad.ts`, `activate-offer.ts`

**Problem:** Redundant database fetches. Each operation fetches the same ad twice.
**Relevance:** Even with 1000 users, doubling DB load on high-value actions (payments/activation) is wasteful and increases latency.
**Action:** Store data from initial fetch, reuse for email sending.

### B. Cron Route Loop Updates (Timeout Risk)
**File:** `app/api/cron/route.tsx`

**Problem:** Updates warning flags inside loops (N queries).
**Relevance:** Critical. With 1000 users, you might have 50-100 expiring ads per day. 100 sequential DB calls can cause the Serverless Function to timeout, breaking the notification system.
**Action:** Implementation of batch updates (`.in()`).

### C. Missing Database Transactions
**Risk:** Race conditions on rapid form submissions.

**Example:** A user double-clicks "Submit". Without transactions, two ads might be created, or a phone number marked as "used" for the wrong ad.
**Relevance:** Critical for Data Integrity. "Double-submit" is a common behavior regardless of user base size.
**Action:** Wrap multi-step operations in Supabase transactions.

### D. Silent Error Failures
**File:** `actions/public/ads.ts`

**Problem:** `if (error) return null;` without logging.
**Relevance:** Critical for MVP maintenance. If things break, we need to know why immediately.
**Action:** Add strict error logging.

---

## 2. Caching Strategy for Scale (>1000 users)

### A. Tag-Based Revalidation
**Current:** `revalidatePath('/offers')`
**Better:** `revalidateTag('ads')`

**Relevance:** As user activity grows to >1000, `revalidatePath` becomes a blunt instrument. `revalidateTag` allows for more precise cache control compatible with `unstable_cache` used in `fetchAllAds`. Ensures the "Thousands of ads" requirement (Spec 1.0) performs smoothly.

### B. HTTP Cache Headers for APIs
**Routes:** `/api/check-free-slot`

**Relevance:** This endpoint is hit on form blurred/typing. With 1000 users potentially adding ads, checking the exact same number repeatedly should be cached to protect the DB.
**Action:** Add `Cache-Control: private, max-age=600`.

---

## 3. Database Indexes (Required for Spec compliance)

Spec requires "Skaluje się do tysięcy ogłoszeń" (Scales to thousands of ads). To support filtering and sorting for 1000+ items, these indexes are mandatory:

| Table | Column(s) | Reason |
|-------|-----------|--------|
| `ads` | `status` | Every cron job + listing filter |
| `ads` | `expires_at` | Cron expiration checks |
| `ads` | `management_token` | Every user action |
| `ads` | `type` | Filter queries |
| `phone_hashes` | `phone_hash` | Lookup before pricing (Critical hot path) |

---

## 4. Discarded Optimizations (Not Critical for MVP)

The following were reviewed but deemed logical to **SKIP** for MVP:

- **Moved Filtering to Database:** Only necessary at >10,000 ads. In-memory filtering is faster and simpler for the <5,000 ad range.
- **Specific Column Selection:** `select('*')` overhead is negligible for <1000 users and allows for faster development iteration.

---

## 5. Implementation Action Plan

1.  **Fix N+1 Queries** (`extend-ad.ts`, `promote-ad.ts`, `activate-offer.ts`).
2.  **Refactor Cron to Batch Updates** (`app/api/cron/route.tsx`).
3.  **Add Indexes** in Supabase.
4.  **Add Error Logging** to `actions/public/ads.ts`.
5.  **Implement Transactions** for Ad Creation.
6.  **Add HTTP Caching** to `/api/check-free-slot`.
