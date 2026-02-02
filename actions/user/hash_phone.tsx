import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import crypto from 'crypto';

const SECRET_KEY = process.env.PHONE_HASH_SECRET;

if (!SECRET_KEY && process.env.NODE_ENV === 'production') {
    throw new Error('PHONE_HASH_SECRET environment variable is required in production');
}

const EFFECTIVE_SECRET: string = SECRET_KEY || 'default-dev-secret';

export function normalizeAndHashPhone(rawPhone: string | null | undefined): {
    hash: string;
    formatted: string;
    isValid: boolean
} {
    if (!rawPhone || typeof rawPhone !== 'string' || rawPhone.trim() === '') {
        return { hash: '', formatted: '', isValid: false };
    }

    if (!isValidPhoneNumber(rawPhone, 'PL')) {
        return { hash: '', formatted: '', isValid: false };
    }

    const phoneNumber = parsePhoneNumber(rawPhone, 'PL');
    const normalized = phoneNumber.number as string;
    const formatted = phoneNumber.formatNational();

    const hash = crypto
        .createHmac('sha256', EFFECTIVE_SECRET)
        .update(normalized)
        .digest('hex');

    return { hash, formatted, isValid: true };
}