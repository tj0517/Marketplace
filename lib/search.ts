/**
 * Text matching for the public ads listing.
 *
 * Pure functions, no I/O — used by `filterAds` in `actions/public/ads.ts`
 * (and therefore by both `getAds` and `getAdsCount`) so results and counts
 * always agree. Kept in its own module so it can be unit-tested.
 *
 * Matching rules:
 * - the query is split into tokens on whitespace and punctuation; tokens of
 *   1–2 chars (prepositions: "w", "z", "na", "do"…) are ignored,
 * - EVERY remaining token must match (AND between tokens),
 * - a token matches if it matches ANY searchable field (OR between fields),
 * - word order in the query does not matter,
 * - both sides are normalized: lowercase, Polish diacritics removed,
 * - a token matches a field if some WORD of that field starts with the
 *   token's stem (see `stemToken`), which gives a cheap approximation of
 *   Polish inflection ("matematyki" → "matematyka", "Lublinie" → "Lublin").
 */

/** The subset of an ad that takes part in text search. */
export type SearchableAd = {
    title?: string | null;
    description?: string | null;
    subject?: string | null;
    subjects?: string[] | null;
    location?: string | null;
    education_level?: string[] | null;
};

/** Tokens at least this long get their ending trimmed. */
const STEM_MIN_TOKEN_LENGTH = 5;
/** How many trailing characters may be trimmed from a long token. */
const STEM_MAX_TRIM = 3;
/** A stem never gets shorter than this. */
const STEM_MIN_LENGTH = 4;

/**
 * Lowercase and strip diacritics.
 * NFD splits e.g. "ó" into "o" + combining acute, which we drop.
 * "ł"/"Ł" has no canonical decomposition, so it is mapped by hand.
 */
export function normalizeText(input: string): string {
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ł/g, 'l');
}

/** Split normalized text into words (letters/digits only). */
function splitWords(normalized: string): string[] {
    return normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/** Tokens this short (after normalization) are ignored: "w", "z", "na", "do", "od"… */
const MIN_TOKEN_LENGTH = 3;

/**
 * Generic words people type that carry no information about WHICH ad they
 * want ("korepetycje matematyka Lublin" is really "matematyka Lublin").
 * Compared by stem, like the rest of the matching, so inflected forms
 * ("korepetycji", "lekcji", "nauczyciela") are dropped too.
 */
const STOP_WORDS = [
    'korepetycje',
    'korepetytor',
    'korepetytorka',
    'korki',
    'lekcje',
    'lekcja',
    'zajecia',
    'nauczyciel',
    'nauczycielka',
    'szukam',
    'online',
];

const STOP_STEMS: string[] = Array.from(new Set(STOP_WORDS.map(w => stemToken(normalizeText(w)))));

/** Is this (normalized) token one of the generic words we ignore? */
function isStopWord(token: string): boolean {
    return STOP_STEMS.some(stem => token.startsWith(stem));
}

/**
 * Normalize a raw query and split it into tokens.
 * Tokens shorter than 3 chars (prepositions like "w" or "na") and generic
 * stop words (see `STOP_WORDS`) are dropped, so they do not have to appear
 * in the ad. If nothing is left, the query counts as empty.
 */
export function tokenize(query: string): string[] {
    return splitWords(normalizeText(query))
        .filter(token => token.length >= MIN_TOKEN_LENGTH)
        .filter(token => !isStopWord(token));
}

/**
 * Reduce a (normalized) token to a prefix that is likely shared by its
 * inflected forms. Tokens shorter than 5 chars are used as-is.
 * For longer tokens up to 3 trailing chars are removed, but at least
 * 4 chars are always kept.
 */
export function stemToken(token: string): string {
    if (token.length < STEM_MIN_TOKEN_LENGTH) {
        return token;
    }
    const keep = Math.max(STEM_MIN_LENGTH, token.length - STEM_MAX_TRIM);
    return token.slice(0, keep);
}

/** Collect every word from all searchable fields of an ad, normalized. */
function collectWords(ad: SearchableAd): string[] {
    const fields: Array<string | null | undefined> = [
        ad.title,
        ad.description,
        ad.subject,
        ad.location,
        ...(ad.subjects ?? []),
        ...(ad.education_level ?? []),
    ];

    const words: string[] = [];
    for (const field of fields) {
        if (field) {
            words.push(...splitWords(normalizeText(field)));
        }
    }
    return words;
}

/**
 * Does the ad match the free-text query?
 * An empty / whitespace-only / punctuation-only query matches everything.
 */
export function matchesQuery(ad: SearchableAd, query: string | undefined | null): boolean {
    if (!query) {
        return true;
    }

    const stems = tokenize(query).map(stemToken);
    if (stems.length === 0) {
        return true;
    }

    const words = collectWords(ad);
    return stems.every(stem => words.some(word => word.startsWith(stem)));
}
