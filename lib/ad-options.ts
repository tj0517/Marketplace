/**
 * Subjects and education levels offered in the add/edit ad forms and in the
 * search select lists (LK-2.03). One list for every place, so the forms and
 * the search filters cannot drift apart.
 *
 * Stored ads may hold values outside these lists (older versions of the form,
 * "Inne" with custom text). Those values are never migrated: the edit form
 * keeps them and search still matches them through the text field.
 */

/** Form option that reveals a free-text input; its text is stored instead of "Inne". */
export const OTHER_OPTION = 'Inne';

export const SUBJECTS = [
    'Matematyka', 'Język Angielski', 'Język Polski', 'Język Niemiecki', 'Język Hiszpański',
    'Fizyka', 'Chemia', 'Biologia', 'Geografia', 'Historia', 'Informatyka', 'Muzyka',
] as const;

export const LEVELS = [
    'Szkoła Podstawowa', 'E8', 'Liceum / Technikum', 'Matura podstawowa', 'Matura rozszerzona',
    'Studia', 'Dorośli',
] as const;

export type Subject = (typeof SUBJECTS)[number];
export type Level = (typeof LEVELS)[number];

/**
 * Older, broader stored levels that also count for a newer, narrower filter
 * value (decision D1, tj 2026-11-04). Only these; anything else is tj's call.
 */
export const LEVEL_EQUIVALENTS: Readonly<Partial<Record<Level, readonly string[]>>> = {
    'Matura podstawowa': ['Matura'],
    'Matura rozszerzona': ['Matura'],
    'Liceum / Technikum': ['Liceum'],
};

/** What the forms render: the list plus "Inne" at the end. */
export const SUBJECT_FORM_OPTIONS: readonly string[] = [...SUBJECTS, OTHER_OPTION];
export const LEVEL_FORM_OPTIONS: readonly string[] = [...LEVELS, OTHER_OPTION];

/** Whitelist for untrusted input (URL params): an exact list value or undefined. */
export function parseSubject(value: unknown): Subject | undefined {
    return typeof value === 'string' && (SUBJECTS as readonly string[]).includes(value)
        ? (value as Subject)
        : undefined;
}

export function parseLevel(value: unknown): Level | undefined {
    return typeof value === 'string' && (LEVELS as readonly string[]).includes(value)
        ? (value as Level)
        : undefined;
}
