import 'server-only';
import { PAYMENT_CONFIG } from '@/lib/config';
import type { P24Credentials } from '@/lib/bump-payment';

/** Dane P24 z env; null, gdy któregoś brakuje. */
export function getP24Credentials(): P24Credentials | null {
    const { P24_MERCHANT_ID, P24_POS_ID, P24_CRC, P24_API_KEY } = process.env;
    if (!P24_MERCHANT_ID || !P24_POS_ID || !P24_CRC || !P24_API_KEY) return null;
    return {
        merchantId: parseInt(P24_MERCHANT_ID, 10),
        posId: parseInt(P24_POS_ID, 10),
        apiKey: P24_API_KEY,
        crc: P24_CRC,
        apiUrl: PAYMENT_CONFIG.apiUrl,
    };
}
