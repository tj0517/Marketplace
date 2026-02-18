

const isProduction = process.env.NODE_ENV === 'production';

// =============================================================================
// APP CONFIGURATION
// =============================================================================

export const APP_CONFIG = {
    /** Application name used in emails and UI */
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Korepetycje',

    /** Company/brand name for formal communications */
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Lekcjo.pl',

    /** Base URL - REQUIRED in production */
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || (isProduction ? '' : 'http://localhost:3000'),
} as const;

// Validate critical config in production
if (isProduction && !process.env.NEXT_PUBLIC_APP_URL) {
    console.error('CRITICAL: NEXT_PUBLIC_APP_URL is required in production');
}

// =============================================================================
// EMAIL CONFIGURATION
// =============================================================================

export const EMAIL_CONFIG = {
    /** Sender email for transactional emails */
    fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',

    /** Sender name for transactional emails */
    fromName: process.env.RESEND_FROM_NAME || 'Korepetycje',

    /** No-reply sender email for admin communications */
    noreplyEmail: process.env.RESEND_NOREPLY_EMAIL || 'noreply@resend.dev',

    /** No-reply sender name */
    noreplyName: process.env.RESEND_NOREPLY_NAME || 'Lekcjo.pl',

    /** Full "from" address for transactional emails */
    get from() {
        return `${this.fromName} <${this.fromEmail}>`;
    },

    /** Full "from" address for no-reply emails */
    get noreplyFrom() {
        return `${this.noreplyName} <${this.noreplyEmail}>`;
    },
} as const;

// =============================================================================
// PAYMENT CONFIGURATION
// =============================================================================

/** Payment provider selector: 'p24' or 'stripe' */
export const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER || 'p24') as 'p24' | 'stripe';

export const PAYMENT_CONFIG = {
    /** Currency for payments */
    currency: process.env.PAYMENT_CURRENCY || 'PLN',

    /** Country code */
    country: process.env.PAYMENT_COUNTRY || 'PL',

    /** Language for payment page */
    language: process.env.PAYMENT_LANGUAGE || 'pl',

    /** Prices in groszy (1 PLN = 100 groszy) */
    prices: {
        activation: parseInt(process.env.PRICE_ACTIVATION || '1000', 10),
        extension: parseInt(process.env.PRICE_EXTENSION || '1000', 10),
        bump: parseInt(process.env.PRICE_BUMP || '1000', 10),
    },

    /** P24 sandbox mode */
    sandbox: process.env.P24_SANDBOX === 'true',

    /** P24 API URL based on environment */
    get apiUrl() {
        if (process.env.P24_API_URL) {
            return process.env.P24_API_URL;
        }
        return this.sandbox
            ? 'https://sandbox.przelewy24.pl'
            : 'https://secure.przelewy24.pl';
    },
} as const;

// =============================================================================
// STRIPE CONFIGURATION
// =============================================================================

export const STRIPE_CONFIG = {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
} as const;

// =============================================================================
// PAYMENT PROVIDER HELPERS
// =============================================================================

/**
 * Check if Stripe is enabled and configured
 */
export function isStripeEnabled(): boolean {
    return PAYMENT_PROVIDER === 'stripe' && !!STRIPE_CONFIG.secretKey;
}

/**
 * Check if P24 is enabled and configured
 */
export function isP24Enabled(): boolean {
    return PAYMENT_PROVIDER === 'p24' &&
        !!(process.env.P24_MERCHANT_ID &&
            process.env.P24_CRC &&
            process.env.P24_API_KEY);
}

// =============================================================================
// BUSINESS LOGIC CONFIGURATION
// =============================================================================

export const AD_CONFIG = {
    /** Ad validity period in days after activation */
    validityDays: parseInt(process.env.AD_VALIDITY_DAYS || '30', 10),

    /** Extension period in days */
    extensionDays: parseInt(process.env.AD_EXTENSION_DAYS || '30', 10),

    /** Days before expiry to send warning email */
    expiryWarningDays: parseInt(process.env.AD_EXPIRY_WARNING_DAYS || '3', 10),

    /** Transaction timeout in hours (for abandoned payments) */
    transactionTimeoutHours: parseInt(process.env.TRANSACTION_TIMEOUT_HOURS || '1', 10),

    // Computed values in milliseconds
    get validityMs() {
        return this.validityDays * 24 * 60 * 60 * 1000;
    },
    get extensionMs() {
        return this.extensionDays * 24 * 60 * 60 * 1000;
    },
    get transactionTimeoutMs() {
        return this.transactionTimeoutHours * 60 * 60 * 1000;
    },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get base URL with validation. Throws in production if not configured.
 */
export function getBaseUrl(): string {
    const url = APP_CONFIG.baseUrl;
    if (!url && isProduction) {
        throw new Error('NEXT_PUBLIC_APP_URL is required in production');
    }
    return url || 'http://localhost:3000';
}

/**
 * Get price for a transaction type in groszy
 */
export function getPrice(type: 'activation' | 'extension' | 'bump'): number {
    return PAYMENT_CONFIG.prices[type];
}

/**
 * Get price for a transaction type in PLN (or configured currency)
 */
export function getPriceInCurrency(type: 'activation' | 'extension' | 'bump'): number {
    return PAYMENT_CONFIG.prices[type] / 100;
}
