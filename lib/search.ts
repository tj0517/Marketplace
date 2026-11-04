/**
 * Text matching and filters for the public ads listing.
 *
 * Pure functions, no I/O — used by `filterAds` in `actions/public/ads.ts`
 * (and therefore by both `getAds` and `getAdsCount`) so results and counts
 * always agree. Kept in its own module so it can be unit-tested.
 *
 * `matchesFilters` adds the "Przedmiot" / "Poziom" select lists and the city
 * field; all criteria are combined with AND.
 *
 * Matching rules:
 * - the query is split into tokens on whitespace and punctuation; tokens of
 *   1–2 chars (prepositions: "w", "z", "na", "do"…) are ignored,
 * - EVERY remaining token must match (AND between tokens),
 * - a token matches if it matches ANY searchable field (OR between fields),
 * - searchable fields are subject(s), education level(s) and location only;
 *   title and description are NOT searched (LK-2.03),
 * - word order in the query does not matter,
 * - both sides are normalized: lowercase, Polish diacritics removed,
 * - a token matches a field if some WORD of that field starts with the
 *   token's stem (see `stemToken`), which gives a cheap approximation of
 *   Polish inflection ("matematyki" → "matematyka", "Lublinie" → "Lublin").
 */

/**
 * The subset of an ad that takes part in search. Title and description are
 * accepted so whole ads can be passed in, but they are never matched.
 */
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

/** Short tokens with a digit are kept anyway: the "E8" level. */
function isMeaningfulToken(token: string): boolean {
    return token.length >= MIN_TOKEN_LENGTH || /\d/.test(token);
}

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
    // "Język Angielski" and older "Angielski" are the same subject; "język" alone says nothing.
    'jezyk',
];

const STOP_STEMS: string[] = Array.from(new Set(STOP_WORDS.map(w => stemToken(normalizeText(w)))));

/** Is this (normalized) token one of the generic words we ignore? */
function isStopWord(token: string): boolean {
    return STOP_STEMS.some(stem => token.startsWith(stem));
}

/**
 * Normalize a raw query and split it into tokens.
 * Tokens shorter than 3 chars (prepositions like "w" or "na", but not "e8")
 * and generic stop words (see `STOP_WORDS`) are dropped, so they do not have
 * to appear in the ad. If nothing is left, the query counts as empty.
 */
export function tokenize(query: string): string[] {
    return splitWords(normalizeText(query))
        .filter(isMeaningfulToken)
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

function subjectValues(ad: SearchableAd): Array<string | null | undefined> {
    return [ad.subject, ...(ad.subjects ?? [])];
}

/** Collect every word from all searchable fields of an ad, normalized. */
function collectWords(ad: SearchableAd): string[] {
    const fields: Array<string | null | undefined> = [
        ...subjectValues(ad),
        ...(ad.education_level ?? []),
        ad.location,
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
 * Does ONE of the given values contain every stem of `wanted`?
 * Per value, so "Matura podstawowa" does not match an ad tagged
 * "Szkoła Podstawowa" + "Matura rozszerzona".
 */
function someValueMatches(values: Array<string | null | undefined>, wanted: string): boolean {
    const stems = tokenize(wanted).map(stemToken);
    if (stems.length === 0) {
        return true;
    }
    return values.some(value => {
        if (!value) {
            return false;
        }
        const words = splitWords(normalizeText(value));
        return stems.every(stem => words.some(word => word.startsWith(stem)));
    });
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

export type SearchFilters = {
    /** Free text, matched against subject(s), level(s) and city. */
    query?: string | null;
    /** A value from `SUBJECTS` (lib/ad-options.ts); whitelisted by the caller. */
    subject?: string | null;
    /** A value from `LEVELS` (lib/ad-options.ts); whitelisted by the caller. */
    level?: string | null;
    city?: string | null;
};

/**
 * Does the ad match every given criterion (AND)? Missing criteria match everything.
 * Subject and level match like the text field (normalized, stemmed), so older
 * stored values such as "Angielski" still match "Język Angielski".
 */
export function matchesFilters(ad: SearchableAd, filters: SearchFilters): boolean {
    return matchesQuery(ad, filters.query)
        && (!filters.subject || someValueMatches(subjectValues(ad), filters.subject))
        && (!filters.level || someValueMatches(ad.education_level ?? [], filters.level))
        && (!filters.city || someValueMatches([ad.location], filters.city));
}
