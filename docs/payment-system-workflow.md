# Payment System Workflow Documentation

## Overview

The application uses **Przelewy24 (P24)** as the payment gateway for processing payments in PLN currency. The payment system handles three types of transactions related to ad management.

---

## Transaction Types

| Type | Code | Description | Effect |
|------|------|-------------|--------|
| **Activation** | `activation` | Initial ad publication payment | Activates ad, sets 30-day expiry, sends welcome email |
| **Extension** | `extension` | Extend ad validity | Adds 30 days to expiration date |
| **Bump/Promote** | `bump` | Move ad to top of listings | Updates `visible_at` to current time |

---

## Key Files & Components

### API Endpoints

| File | Purpose |
|------|---------|
| `app/api/payments/create/route.ts` | Creates transaction record and initiates P24 payment session |
| `app/api/payments/status/[sessionId]/route.ts` | Polls transaction status for frontend display |
| `app/api/payments/test-complete/route.ts` | Test mode endpoint (when P24 not configured) |
| `app/api/webhooks/p24/route.ts` | Receives and verifies P24 webhook notifications |

### Frontend Pages

| File | Purpose |
|------|---------|
| `app/payment/success/page.tsx` | Success page with status polling |
| `app/payment/error/page.tsx` | Error/failure page |
| `app/payment/test/page.tsx` | Test mode payment simulation page |

### UI Components

| File | Purpose |
|------|---------|
| `app/components/extend-ad-button.tsx` | Button to initiate extension payment |
| `app/components/promote-ad-button.tsx` | Button to initiate bump/promote payment |

### Email Templates

| File | Purpose |
|------|---------|
| `emails/payment-extend-email.tsx` | Confirmation email for extension |
| `emails/payment-bump-email.tsx` | Confirmation email for bump/promote |

### Configuration

| File | Purpose |
|------|---------|
| `lib/config.ts` | Contains `PAYMENT_CONFIG` with prices, currency, API URLs |

---

## Configuration (`lib/config.ts`)

```typescript
PAYMENT_CONFIG = {
  currency: 'PLN',
  country: 'PL',
  language: 'pl',
  prices: {
    activation: 1000,  // 10 PLN (in groszy)
    extension: 1000,   // 10 PLN
    bump: 1000,        // 10 PLN
  },
  sandbox: boolean,    // Based on P24_SANDBOX env
  apiUrl: string,      // sandbox or production URL
}
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `P24_MERCHANT_ID` | P24 merchant ID |
| `P24_POS_ID` | P24 POS ID |
| `P24_CRC` | P24 CRC key for signature |
| `P24_API_KEY` | P24 API key for authentication |
| `P24_SANDBOX` | Set to `"true"` for sandbox mode |
| `P24_API_URL` | Optional custom API URL |
| `PRICE_ACTIVATION` | Activation price in groszy (default: 1000) |
| `PRICE_EXTENSION` | Extension price in groszy (default: 1000) |
| `PRICE_BUMP` | Bump price in groszy (default: 1000) |

---

## Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PAYMENT FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER INITIATES PAYMENT
   ┌──────────────────┐
   │  User clicks     │
   │  "Extend" or     │──────────────────────────────────────┐
   │  "Promote" btn   │                                      │
   └──────────────────┘                                      │
                                                             ▼
2. CREATE TRANSACTION                          ┌─────────────────────────┐
   ┌──────────────────┐                        │ POST /api/payments/     │
   │  Frontend calls  │◄───────────────────────│ create                  │
   │  /api/payments/  │                        │                         │
   │  create          │                        │ Body:                   │
   └──────────────────┘                        │ - ad_id                 │
          │                                    │ - type (activation/     │
          ▼                                    │   extension/bump)       │
   ┌──────────────────┐                        │ - management_token      │
   │  Create pending  │                        └─────────────────────────┘
   │  transaction in  │
   │  'transactions'  │
   │  table           │
   └──────────────────┘
          │
          ▼
3. REGISTER WITH P24
   ┌──────────────────┐
   │  Generate SHA384 │
   │  signature       │
   │                  │
   │  POST to P24     │
   │  /api/v1/        │
   │  transaction/    │
   │  register        │
   └──────────────────┘
          │
          ▼
   ┌──────────────────┐
   │  Receive token   │
   │  from P24        │
   └──────────────────┘
          │
          ▼
4. REDIRECT USER
   ┌──────────────────┐
   │  Return redirect │
   │  URL to frontend │──────► User redirected to P24 payment page
   └──────────────────┘

          │
          ▼
5. USER COMPLETES PAYMENT ON P24
   ┌──────────────────┐
   │  User enters     │
   │  payment details │
   │  on P24 page     │
   └──────────────────┘
          │
          ├──────────────────────────────────────────┐
          │                                          │
          ▼                                          ▼
6A. P24 WEBHOOK                            6B. USER RETURN
   ┌──────────────────┐                    ┌──────────────────┐
   │  P24 sends POST  │                    │  User redirected │
   │  to /api/        │                    │  to /payment/    │
   │  webhooks/p24    │                    │  success?session=│
   └──────────────────┘                    └──────────────────┘
          │                                         │
          ▼                                         ▼
   ┌──────────────────┐                    ┌──────────────────┐
   │  Verify SHA384   │                    │  Poll status via │
   │  signature       │                    │  /api/payments/  │
   └──────────────────┘                    │  status/[id]     │
          │                                └──────────────────┘
          ▼
   ┌──────────────────┐
   │  Call RPC:       │
   │  complete_       │
   │  payment()       │
   └──────────────────┘
          │
          ▼
7. POST-PAYMENT ACTIONS (based on type)
   ┌───────────────────────────────────────────────────────────┐
   │                                                           │
   │  ACTIVATION:                                              │
   │  - Set ad status = 'active'                               │
   │  - Set expires_at = now + 30 days                         │
   │  - Hash and store phone number                            │
   │  - Send welcome email                                     │
   │                                                           │
   │  EXTENSION:                                               │
   │  - Add 30 days to expires_at                              │
   │  - Reset expiring_warning_sent_at                         │
   │  - Send extension confirmation email                      │
   │                                                           │
   │  BUMP:                                                    │
   │  - Set visible_at = now (moves to top of list)            │
   │  - Send bump confirmation email                           │
   │                                                           │
   └───────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `transactions` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (used as P24 sessionId) |
| `ad_id` | UUID | Foreign key to ads table |
| `type` | enum | `activation`, `extension`, `bump` |
| `amount` | decimal | Amount in PLN |
| `status` | enum | `pending`, `completed`, `failed` |
| `payment_provider` | string | Always `p24` |
| `payment_id` | string | P24 order ID (from webhook) |
| `payment_session_id` | string | P24 token |
| `error_message` | string | Error details if failed |
| `webhook_received_at` | timestamp | When webhook was processed |
| `created_at` | timestamp | Transaction creation time |

### Database Function: `complete_payment`

Called by webhook to atomically complete payment:
- Updates transaction status to `completed`
- Updates ad based on transaction type

---

## Signature Verification

P24 webhook uses SHA384 signature verification:

```typescript
const signData = {
  merchantId,
  posId,
  sessionId,
  amount,
  originAmount,
  currency,
  orderId,
  methodId,
  statement,
  crc: P24_CRC
};

const expectedSign = crypto
  .createHash('sha384')
  .update(p24JsonStringify(signData))
  .digest('hex');
```

---

## Test Mode

When P24 credentials are not configured:

1. `/api/payments/create` returns `testMode: true` with redirect to `/payment/test`
2. User clicks "Simulate Payment" button
3. `/api/payments/test-complete` processes payment locally
4. User redirected to success page

> **Note:** Test endpoint is disabled when P24 is fully configured.

---

## Error Handling

| Scenario | Response |
|----------|----------|
| Missing required fields | 400 Bad Request |
| Ad not found / access denied | 404 Not Found |
| Invalid P24 signature | 401 Unauthorized |
| P24 API timeout | 504 Gateway Timeout |
| P24 API error | 502 Bad Gateway |
| Transaction already completed | 400 Bad Request |
| Database error | 500 Internal Error |

---

## Email Notifications

| Event | Email Type | Template |
|-------|------------|----------|
| Ad activated | Welcome email | (standard welcome template) |
| Ad extended | Extension confirmation | `payment-extend-email.tsx` |
| Ad bumped | Bump confirmation | `payment-bump-email.tsx` |

---

## Frontend Status Polling

The success page polls `/api/payments/status/[sessionId]` every 2 seconds:

- **Max attempts:** 30 (1 minute total)
- **Stops when:** Status is `completed`, `failed`, or max attempts reached

### Status Values

| Status | UI Display |
|--------|------------|
| `loading` | Spinner + "Sprawdzanie statusu..." |
| `pending` | Clock icon + "Oczekiwanie na płatność" |
| `completed` | Green check + "Płatność zakończona!" |
| `failed` | Red X + "Płatność nieudana" |
| `unknown` | Gray X + "Nieznany status" |

---

## Ad Management Page Integration

Users access payment features from `/offers/manage/[token]`:

- **ExtendAdButton** - Initiates extension payment
- **PromoteAdButton** - Initiates bump payment

Both buttons:
1. Show confirmation dialog with price
2. Call `/api/payments/create` on confirm
3. Redirect to P24 or show error toast

---

## Security Considerations

1. **Signature Verification** - All webhooks validated with SHA384
2. **Token-based Access** - Management actions require valid `management_token`
3. **UUID Validation** - Session IDs validated before database queries
4. **Admin Client** - Sensitive operations use admin Supabase client
5. **Test Mode Protection** - Test endpoint disabled in production with P24 configured
