# Stripe Integration Plan (Dual Provider Support)

> Add Stripe as alternative payment provider while keeping Przelewy24 (P24)  
> Remove test/simulation environment

---

## Overview

| Aspect | Approach |
|--------|----------|
| P24 Support | ✅ Keep existing implementation |
| Stripe Support | ✅ Add as new option |
| Provider Selection | Environment variable `PAYMENT_PROVIDER` |
| Test Environment | ❌ Remove completely |

---

## Architecture: Dual Provider

```
┌─────────────────────────────────────────────────────────────┐
│                    /api/payments/create                      │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  if (PAYMENT_PROVIDER === 'stripe')                 │   │
│   │      → Use Stripe Checkout                          │   │
│   │  else                                               │   │
│   │      → Use P24 (existing logic)                     │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Webhooks                                │
│                                                              │
│   /api/webhooks/p24     → Handles P24 callbacks             │
│   /api/webhooks/stripe  → Handles Stripe callbacks (NEW)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Configuration Changes

### 1.1 Install Stripe SDK

```bash
npm install stripe
```

### 1.2 Add New Environment Variables

**Keep existing P24 vars:**
```env
P24_MERCHANT_ID=...
P24_POS_ID=...
P24_CRC=...
P24_API_KEY=...
```

**Add Stripe vars:**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Add provider selector:**
```env
# Options: 'p24' | 'stripe'
PAYMENT_PROVIDER=p24
```

### 1.3 Update `lib/config.ts`

```typescript
// Add Stripe config alongside P24
export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
} as const;

// Add provider selector
export const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'p24';

// Helper function
export function isStripeEnabled(): boolean {
  return PAYMENT_PROVIDER === 'stripe' && !!STRIPE_CONFIG.secretKey;
}

export function isP24Enabled(): boolean {
  return PAYMENT_PROVIDER === 'p24' && 
    !!(process.env.P24_MERCHANT_ID && 
       process.env.P24_CRC && 
       process.env.P24_API_KEY);
}
```

---

## Phase 2: Remove Test Environment

### 2.1 Delete Test Files

| File | Action |
|------|--------|
| `app/api/payments/test-complete/route.ts` | **DELETE** |
| `app/payment/test/page.tsx` | **DELETE** |

### 2.2 Update `/api/payments/create/route.ts`

**Remove this block:**
```typescript
// DELETE THIS - no more test mode fallback
if (!P24_MERCHANT_ID || !P24_POS_ID || !P24_CRC || !P24_API_KEY) {
  console.warn('[P24] Credentials not configured - returning test mode response');
  return NextResponse.json({
    testMode: true,
    message: 'P24 credentials not configured...',
    redirectUrl: `${baseUrl}/payment/test?session=${tx.id}...`,
  });
}
```

**Replace with error:**
```typescript
// If no payment provider is configured, return error
if (!isP24Enabled() && !isStripeEnabled()) {
  console.error('[Payment] No payment provider configured');
  return NextResponse.json(
    { error: 'Payment system not configured' }, 
    { status: 503 }
  );
}
```

---

## Phase 3: Add Stripe Support to Payment Create

### 3.1 Refactor `/api/payments/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { 
  getBaseUrl, 
  getPrice, 
  PAYMENT_CONFIG, 
  APP_CONFIG,
  PAYMENT_PROVIDER,
  isStripeEnabled,
  isP24Enabled
} from '@/lib/config';
import crypto from 'crypto';
import Stripe from 'stripe';

// Initialize Stripe (only if configured)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

// ... existing P24 constants ...

type TransactionType = 'activation' | 'extension' | 'bump';

export async function POST(request: NextRequest) {
  try {
    const { ad_id, type, management_token } = await request.json();

    // ... existing validation ...

    const supabase = createAdminClient();

    // ... existing ad lookup ...

    const amount = getPrice(type as TransactionType);
    const baseUrl = getBaseUrl();

    // Create transaction with selected provider
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert({
        ad_id,
        type,
        amount: amount / 100,
        status: 'pending',
        payment_provider: PAYMENT_PROVIDER, // 'stripe' or 'p24'
      })
      .select()
      .single();

    if (txError || !tx) {
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }

    // Route to appropriate provider
    if (PAYMENT_PROVIDER === 'stripe' && stripe) {
      return await createStripeSession(tx, ad, amount, type, baseUrl, supabase);
    } else if (isP24Enabled()) {
      return await createP24Session(tx, ad, amount, type, baseUrl, supabase);
    } else {
      return NextResponse.json({ error: 'No payment provider configured' }, { status: 503 });
    }

  } catch (error) {
    console.error('[Payment] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// NEW: Stripe session creation
async function createStripeSession(tx, ad, amount, type, baseUrl, supabase) {
  const description = `${APP_CONFIG.name} - ${type} - ${ad.title?.substring(0, 30) || 'Ogłoszenie'}`;

  const session = await stripe!.checkout.sessions.create({
    payment_method_types: ['card', 'p24', 'blik'],
    line_items: [{
      price_data: {
        currency: 'pln',
        product_data: { name: description },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${baseUrl}/payment/success?session=${tx.id}`,
    cancel_url: `${baseUrl}/payment/error`,
    customer_email: ad.email,
    metadata: {
      transaction_id: tx.id,
      ad_id: ad.id,
      type: type,
    },
  });

  await supabase
    .from('transactions')
    .update({ payment_session_id: session.id })
    .eq('id', tx.id);

  return NextResponse.json({
    redirectUrl: session.url,
    transactionId: tx.id,
  });
}

// EXISTING: P24 session creation (move existing code into this function)
async function createP24Session(tx, ad, amount, type, baseUrl, supabase) {
  // ... existing P24 logic stays here ...
}
```

---

## Phase 4: Add Stripe Webhook

### 4.1 Create `/api/webhooks/stripe/route.ts` (NEW FILE)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBaseUrl } from '@/lib/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const transactionId = session.metadata?.transaction_id;

    if (!transactionId) {
      console.error('[Stripe Webhook] Missing transaction_id in metadata');
      return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Use existing RPC to complete payment
    const { error } = await supabase.rpc('complete_payment', {
      p_transaction_id: transactionId,
      p_payment_id: session.payment_intent as string,
    });

    if (error) {
      console.error('[Stripe Webhook] RPC error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    await supabase
      .from('transactions')
      .update({ webhook_received_at: new Date().toISOString() })
      .eq('id', transactionId);

    // Handle post-payment actions (same as P24)
    const { data: tx } = await supabase
      .from('transactions')
      .select('type, ad_id')
      .eq('id', transactionId)
      .single();

    if (tx?.type === 'activation') {
      // Phone hash + welcome email (copy from P24 webhook)
      const { data: ad } = await supabase
        .from('ads')
        .select('email, title, management_token, id, phone_contact')
        .eq('id', tx.ad_id)
        .single();

      if (ad) {
        if (ad.phone_contact) {
          try {
            const { normalizeAndHashPhone } = await import('@/actions/user/hash_phone');
            const { hash } = normalizeAndHashPhone(ad.phone_contact);
            await supabase
              .from('ads')
              .update({ phone_hash: hash })
              .eq('id', ad.id);
          } catch (e) {
            console.error('[Stripe Webhook] Failed to hash phone:', e);
          }
        }

        try {
          const { sendEmail } = await import('@/actions/emails');
          const baseUrl = getBaseUrl();
          await sendEmail({
            to: ad.email,
            type: 'welcome',
            props: {
              adTitle: ad.title,
              manageLink: `${baseUrl}/offers/manage/${ad.management_token}`,
              publicLink: `${baseUrl}/offers/${ad.id}`
            }
          });
        } catch (e) {
          console.error('[Stripe Webhook] Failed to send email:', e);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ status: 'Stripe webhook endpoint active' });
}
```

---

## Phase 5: File Summary

### Files to CREATE

| File | Purpose |
|------|---------|
| `app/api/webhooks/stripe/route.ts` | Stripe webhook handler |

### Files to MODIFY

| File | Changes |
|------|---------|
| `lib/config.ts` | Add `STRIPE_CONFIG`, `PAYMENT_PROVIDER`, helper functions |
| `app/api/payments/create/route.ts` | Add Stripe support, remove test mode fallback |

### Files to DELETE

| File | Reason |
|------|--------|
| `app/api/payments/test-complete/route.ts` | No more test environment |
| `app/payment/test/page.tsx` | No more test environment |

### Files to KEEP (no changes)

| File | Reason |
|------|--------|
| `app/api/webhooks/p24/route.ts` | Still needed for P24 |
| `app/payment/success/page.tsx` | Works with both providers |
| `app/payment/error/page.tsx` | Works with both providers |
| All frontend components | Provider-agnostic |

---

## Phase 6: Testing

### 6.1 Test P24 Mode

```env
PAYMENT_PROVIDER=p24
```

- [ ] All existing tests pass
- [ ] Activation flow works
- [ ] Extension flow works
- [ ] Bump flow works

### 6.2 Test Stripe Mode

```env
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

```bash
# Forward Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

- [ ] Activation flow works
- [ ] Extension flow works
- [ ] Bump flow works
- [ ] Webhook processes correctly
- [ ] Emails sent after payment

### 6.3 Test No Provider Configured

```env
PAYMENT_PROVIDER=stripe
# No STRIPE_SECRET_KEY
```

- [ ] Returns 503 error "Payment system not configured"
- [ ] No crash or test mode fallback

---

## Phase 7: Deployment

### 7.1 Stripe Dashboard Setup

1. Add webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`

2. Get webhook secret (`whsec_...`)

### 7.2 Environment Setup

**For P24 (default/current):**
```env
PAYMENT_PROVIDER=p24
P24_MERCHANT_ID=...
P24_POS_ID=...
P24_CRC=...
P24_API_KEY=...
```

**For Stripe:**
```env
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 7.3 Switching Providers

Just change one env variable:
```env
PAYMENT_PROVIDER=stripe  # or 'p24'
```

No code changes needed!

---

## Estimated Effort

| Task | Time |
|------|------|
| Install Stripe SDK | 1 min |
| Update config.ts | 15 min |
| Modify payments/create | 45 min |
| Create Stripe webhook | 45 min |
| Delete test files | 5 min |
| Testing | 60 min |
| **Total** | **~3 hours** |

---

## Questions to Decide

1. **Default provider?**
   - Keep P24 as default (`PAYMENT_PROVIDER=p24`)
   - Or switch to Stripe?

2. **Stripe payment methods?**
   - Cards only?
   - Cards + P24 + BLIK? (recommended for Polish market)
   - Add Apple Pay / Google Pay?

3. **Keep both webhooks active?**
   - Yes (recommended) - allows switching without redeployment
   - Only active provider's webhook responds to real events
