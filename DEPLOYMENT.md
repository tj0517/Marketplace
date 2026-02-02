# Deployment Checklist

## Required Environment Variables

Set these in your production environment (Vercel, etc.):

### Core Application
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Production URL | `https://yourdomain.com` |
| `NEXT_PUBLIC_APP_NAME` | No | App name for UI | `Korepetycje` |
| `NEXT_PUBLIC_COMPANY_NAME` | No | Company name | `Lekcjo.pl` |

### Database (Supabase)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Service role key (admin) |

### Email (Resend)
| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | ✅ Yes | Resend API key | - |
| `RESEND_FROM_EMAIL` | ✅ Yes | Sender email | `onboarding@resend.dev` |
| `RESEND_FROM_NAME` | No | Sender name | `Korepetycje` |
| `RESEND_NOREPLY_EMAIL` | No | No-reply email | `noreply@resend.dev` |
| `RESEND_NOREPLY_NAME` | No | No-reply name | `Lekcjo.pl` |

### Payments (Przelewy24)
| Variable | Required | Description |
|----------|----------|-------------|
| `P24_MERCHANT_ID` | ✅ Yes | P24 Merchant ID |
| `P24_POS_ID` | ✅ Yes | P24 POS ID |
| `P24_CRC` | ✅ Yes | P24 CRC key |
| `P24_API_KEY` | ✅ Yes | P24 API key |
| `P24_SANDBOX` | No | Set to `true` for sandbox | `false` |
| `P24_API_URL` | No | Custom API URL | Auto-detected |

### Pricing (Optional)
| Variable | Default | Description |
|----------|---------|-------------|
| `PRICE_ACTIVATION` | `1000` | Activation price in groszy |
| `PRICE_EXTENSION` | `1000` | Extension price in groszy |
| `PRICE_BUMP` | `1000` | Bump/promote price in groszy |

### Ad Settings (Optional)
| Variable | Default | Description |
|----------|---------|-------------|
| `AD_VALIDITY_DAYS` | `30` | Days until ad expires |
| `AD_EXTENSION_DAYS` | `30` | Days added on extension |
| `AD_BUMP_DAYS` | `7` | Bump boost duration |
| `AD_EXPIRY_WARNING_DAYS` | `3` | Days before expiry warning |

---

## Pre-Deployment Steps

- [ ] Set all required environment variables
- [ ] Verify email domain in Resend dashboard
- [ ] Configure P24 webhook URL: `https://yourdomain.com/api/webhooks/p24`
- [ ] Run `npm run build` locally to verify no errors
- [ ] Test payment flow in sandbox mode first

## Post-Deployment Verification

- [ ] Homepage loads correctly
- [ ] Ad creation flow works
- [ ] Payment redirect works
- [ ] Webhook receives P24 callbacks
- [ ] Emails are delivered
- [ ] Cron job runs (check `/api/cron`)
