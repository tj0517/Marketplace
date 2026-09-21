import { test, expect } from '@playwright/test';
import { matchesQuery, normalizeText, stemToken, tokenize, type SearchableAd } from './search';

const mathLublin: SearchableAd = {
    title: 'Korepetycje z matematyki',
    description: 'Korepetycje i przygotowanie do matury, poziom podstawowy i rozszerzony.',
    subject: 'Matematyka',
    subjects: ['Matematyka'],
    location: 'Lublin',
    education_level: ['Liceum', 'Matura'],
};

const mathKrakow: SearchableAd = {
    title: 'Matematyka dla licealistów',
    description: 'Doświadczony nauczyciel, dojazd do ucznia.',
    subject: 'Matematyka',
    subjects: ['Matematyka'],
    location: 'Kraków',
    education_level: ['Liceum'],
};

const englishLublin: SearchableAd = {
    title: 'Angielski konwersacje',
    description: 'Native speaker, zajęcia online lub stacjonarnie.',
    subject: 'Angielski',
    subjects: ['Angielski'],
    location: 'Lublin',
    education_level: ['Szkoła podstawowa', 'Liceum'],
};

const englishWarsaw: SearchableAd = {
    title: 'Język angielski',
    description: 'Przygotowanie do egzaminów Cambridge.',
    subject: 'Angielski',
    subjects: ['Angielski'],
    location: 'Warszawa',
    education_level: ['Liceum'],
};

const physicsLodz: SearchableAd = {
    title: 'Fizyka i matematyka',
    description: 'Studentka politechniki.',
    subject: 'Fizyka',
    subjects: ['Fizyka', 'Matematyka'],
    location: 'Łódź',
    education_level: ['Liceum'],
};

const all = [mathLublin, mathKrakow, englishLublin, englishWarsaw, physicsLodz];
const find = (query: string) => all.filter(ad => matchesQuery(ad, query));

test.describe('normalizeText', () => {
    test('lowercases and strips Polish diacritics, including ł', () => {
        expect(normalizeText('Łódź')).toBe('lodz');
        expect(normalizeText('Język Angielski')).toBe('jezyk angielski');
        expect(normalizeText('ZAŻÓŁĆ GĘŚLĄ JAŹŃ')).toBe('zazolc gesla jazn');
    });
});

test.describe('tokenize', () => {
    test('splits on whitespace and punctuation, drops empty tokens', () => {
        expect(tokenize('  matematyka   Lublin ')).toEqual(['matematyka', 'lublin']);
        expect(tokenize('matematyka, Lublin!')).toEqual(['matematyka', 'lublin']);
        expect(tokenize('   ')).toEqual([]);
        expect(tokenize('...')).toEqual([]);
    });

    test('drops tokens of 1–2 chars (prepositions) after normalization', () => {
        expect(tokenize('fizyka z matematyki w Lublinie')).toEqual(['fizyka', 'matematyki', 'lublinie']);
        expect(tokenize('na do od')).toEqual([]);
        expect(tokenize('w z')).toEqual([]);
    });
});

test.describe('matchesQuery – short tokens are ignored', () => {
    test('"korepetycje z matematyki w Lublinie" matches maths in Lublin whose description contains "korepetycje"', () => {
        expect(mathLublin.description).toMatch(/korepetycje/i);
        expect(matchesQuery(mathLublin, 'korepetycje z matematyki w Lublinie')).toBe(true);
        expect(find('korepetycje z matematyki w Lublinie')).toEqual([mathLublin]);
    });

    test('"matematyka w Lublinie" does NOT match maths in Kraków', () => {
        expect(matchesQuery(mathKrakow, 'matematyka w Lublinie')).toBe(false);
        expect(find('matematyka w Lublinie')).toEqual([mathLublin]);
    });

    test('"w z" behaves like an empty query', () => {
        expect(find('w z')).toEqual(all);
        expect(find('w z')).toEqual(find(''));
    });
});

test.describe('matchesQuery – generic stop words are ignored', () => {
    // Maths in Lublin with the word "korepetycje" nowhere in the ad.
    const mathLublinPlain: SearchableAd = {
        title: 'Matematyka – liceum i matura',
        description: 'Tłumaczę spokojnie i od podstaw. Dojazd na terenie miasta.',
        subject: 'Matematyka',
        subjects: ['Matematyka'],
        location: 'Lublin',
        education_level: ['Liceum'],
    };

    test('stop words are dropped by stem, including inflected forms', () => {
        expect(tokenize('korepetycje matematyka Lublin')).toEqual(['matematyka', 'lublin']);
        expect(tokenize('korepetycji z matematyki')).toEqual(['matematyki']);
        expect(tokenize('szukam nauczyciela angielskiego online')).toEqual(['angielskiego']);
        expect(tokenize('lekcje lekcja zajęcia korki korepetytorka')).toEqual([]);
    });

    test('"korepetycje matematyka Lublin" matches maths in Lublin with no "korepetycje" anywhere in the ad', () => {
        expect(JSON.stringify(mathLublinPlain).toLowerCase()).not.toContain('korepet');
        expect(matchesQuery(mathLublinPlain, 'korepetycje matematyka Lublin')).toBe(true);
        expect(matchesQuery(mathKrakow, 'korepetycje matematyka Lublin')).toBe(false);
    });

    test('"korepetytor angielski Warszawa" matches English in Warsaw with no "korepetytor" in the ad', () => {
        expect(JSON.stringify(englishWarsaw).toLowerCase()).not.toContain('korepetytor');
        expect(find('korepetytor angielski Warszawa')).toEqual([englishWarsaw]);
    });

    test('"korepetycje" alone behaves like an empty query', () => {
        expect(find('korepetycje')).toEqual(all);
        expect(find('korepetycje')).toEqual(find(''));
        expect(matchesQuery(mathLublinPlain, 'korepetycje')).toBe(true);
    });
});

test.describe('stemToken', () => {
    test('keeps short tokens as-is', () => {
        expect(stemToken('lodz')).toBe('lodz');
        expect(stemToken('abc')).toBe('abc');
    });

    test('trims up to 3 chars from tokens of length >= 5 but keeps at least 4', () => {
        expect(stemToken('jezyk')).toBe('jezy');
        expect(stemToken('lublin')).toBe('lubl');
        expect(stemToken('lublinie')).toBe('lubli');
        expect(stemToken('matematyki')).toBe('matemat');
        expect(stemToken('angielskiego')).toBe('angielski');
    });
});

test.describe('matchesQuery – multi-word queries (AND between tokens, OR between fields)', () => {
    test('"matematyka Lublin" matches only maths in Lublin', () => {
        expect(matchesQuery(mathLublin, 'matematyka Lublin')).toBe(true);
        expect(matchesQuery(mathKrakow, 'matematyka Lublin')).toBe(false);
        expect(matchesQuery(englishLublin, 'matematyka Lublin')).toBe(false);
        expect(find('matematyka Lublin')).toEqual([mathLublin]);
    });

    test('"Lublin matematyka" – word order does not matter', () => {
        expect(find('Lublin matematyka')).toEqual([mathLublin]);
    });

    test('"angielski Warszawa" matches only English in Warsaw', () => {
        expect(find('angielski Warszawa')).toEqual([englishWarsaw]);
    });

    test('query with double spaces behaves like a single space', () => {
        expect(find('matematyka  Lublin')).toEqual(find('matematyka Lublin'));
        expect(find('  Lublin   matematyka  ')).toEqual([mathLublin]);
    });

    test('single word matches across ads', () => {
        expect(find('Lublin')).toEqual([mathLublin, englishLublin]);
        expect(find('matematyka')).toEqual([mathLublin, mathKrakow, physicsLodz]);
    });
});

test.describe('matchesQuery – inflection and diacritics', () => {
    test('"matematyki" → "matematyka"', () => {
        expect(matchesQuery(mathKrakow, 'matematyki')).toBe(true);
    });

    test('"angielskiego" → "angielski"', () => {
        expect(matchesQuery(englishLublin, 'angielskiego')).toBe(true);
    });

    test('"Lublinie" → "Lublin"', () => {
        expect(matchesQuery(mathLublin, 'Lublinie')).toBe(true);
        expect(matchesQuery(mathKrakow, 'Lublinie')).toBe(false);
    });

    test('"jezyk" → "język"', () => {
        expect(matchesQuery(englishWarsaw, 'jezyk')).toBe(true);
        expect(matchesQuery(englishLublin, 'jezyk')).toBe(false);
    });

    test('"lodz" → "Łódź"', () => {
        expect(find('lodz')).toEqual([physicsLodz]);
        expect(find('Łódź')).toEqual([physicsLodz]);
    });

    test('inflected multi-word query: "matematyki Lublinie"', () => {
        expect(find('matematyki Lublinie')).toEqual([mathLublin]);
    });

    test('matches on education level and subjects array', () => {
        expect(find('matura')).toEqual([mathLublin]);
        expect(find('fizyka')).toEqual([physicsLodz]);
    });
});

test.describe('matchesQuery – empty query', () => {
    test('empty, undefined, null, whitespace-only and punctuation-only queries match everything', () => {
        for (const q of ['', undefined, null, '   ', ' , . ']) {
            expect(all.every(ad => matchesQuery(ad, q))).toBe(true);
        }
    });

    test('ads with missing optional fields do not throw', () => {
        const sparse: SearchableAd = { title: 'Chemia', description: null, subject: null, subjects: null, location: null, education_level: null };
        expect(matchesQuery(sparse, 'chemia')).toBe(true);
        expect(matchesQuery(sparse, 'lublin')).toBe(false);
        expect(matchesQuery(sparse, '')).toBe(true);
    });
});
