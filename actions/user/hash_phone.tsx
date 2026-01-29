import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import crypto from 'crypto';

const SECRET_KEY = process.env.PHONE_HASH_SECRET || 'default-dev-secret';

export function normalizeAndHashPhone(rawPhone: string): {
    hash: string;
    formatted: string;
    isValid: boolean
} {
    if (!isValidPhoneNumber(rawPhone, 'PL')) {
        return { hash: '', formatted: '', isValid: false };
    }

    const phoneNumber = parsePhoneNumber(rawPhone, 'PL');
    const normalized = phoneNumber.number as string;
    const formatted = phoneNumber.formatNational();

    const hash = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(normalized)
        .digest('hex');

    return { hash, formatted, isValid: true };
}