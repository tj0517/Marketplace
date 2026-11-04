import { test, expect } from '@playwright/test';
import { matchesFilters, matchesQuery, normalizeText, stemToken, tokenize, type SearchableAd } from './search';
import { LEVELS, SUBJECTS, parseLevel, parseSubject } from './ad-options';

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

    test('"język" is a stop word, so "jezyk angielski" matches "Angielski" ads', () => {
        expect(tokenize('język angielski')).toEqual(['angielski']);
        expect(find('jezyk angielski')).toEqual([englishLublin, englishWarsaw]);
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
        const sparse: SearchableAd = { title: null, description: null, subject: 'Chemia', subjects: null, location: null, education_level: null };
        expect(matchesQuery(sparse, 'chemia')).toBe(true);
        expect(matchesQuery(sparse, 'lublin')).toBe(false);
        expect(matchesQuery(sparse, '')).toBe(true);
    });
});

test.describe('LK-2.03 red proof – description is not searchable', () => {
    test('"matematyka" only in the description does not match the query "matematyka"', () => {
        const chemWithMathInDescription: SearchableAd = {
            title: 'Chemia dla licealistów',
            description: 'Pomagam też z matematyka, jeśli trzeba.',
            subject: 'Chemia',
            subjects: ['Chemia'],
            location: 'Gdańsk',
            education_level: ['Liceum / Technikum'],
        };
        expect(matchesQuery(chemWithMathInDescription, 'matematyka')).toBe(false);
    });
});

test.describe('LK-2.03 – only subject, level and city are searchable', () => {
    test('"konwersacje" only in the title does not match', () => {
        expect(englishLublin.title).toMatch(/konwersacje/i);
        expect(find('konwersacje')).toEqual([]);
    });
});

test.describe('LK-2.03 – queries from the brief', () => {
    const mathExtendedLublin: SearchableAd = {
        title: 'Matematyka – matura',
        description: 'Zadania maturalne krok po kroku.',
        subject: 'Matematyka',
        subjects: ['Matematyka'],
        location: 'Lublin',
        education_level: ['Liceum / Technikum', 'Matura rozszerzona'],
    };
    const mathBasicLublin: SearchableAd = {
        title: 'Matematyka – matura',
        description: 'Przygotowanie do matury rozszerzonej też możliwe.',
        subject: 'Matematyka',
        subjects: ['Matematyka'],
        location: 'Lublin',
        education_level: ['Matura podstawowa'],
    };
    const mathExtendedWarsaw: SearchableAd = {
        ...mathExtendedLublin,
        location: 'Warszawa',
    };
    // "podstawowa" and "rozszerzona" sit in DIFFERENT level values.
    const mathMixedLevels: SearchableAd = {
        ...mathExtendedLublin,
        location: 'Kraków',
        education_level: ['Szkoła Podstawowa', 'Matura rozszerzona'],
    };
    const polishLublin: SearchableAd = {
        title: 'Polski dla ósmoklasistów',
        description: 'Wypracowania, lektury.',
        subject: 'Język Polski',
        subjects: ['Język Polski'],
        location: 'Lublin',
        education_level: ['E8'],
    };
    const ads = [mathExtendedLublin, mathBasicLublin, mathExtendedWarsaw, mathMixedLevels, polishLublin, englishLublin];
    const search = (filters: Parameters<typeof matchesFilters>[1]) => ads.filter(ad => matchesFilters(ad, filters));

    test('matematyka + matura rozszerzona (text field)', () => {
        expect(search({ query: 'matematyka matura rozszerzona' })).toEqual([mathExtendedLublin, mathExtendedWarsaw, mathMixedLevels]);
    });

    test('matematyka + matura rozszerzona (select lists); "rozszerzona" only in the description does not count', () => {
        expect(search({ subject: 'Matematyka', level: 'Matura rozszerzona' })).toEqual([mathExtendedLublin, mathExtendedWarsaw, mathMixedLevels]);
        expect(matchesFilters(mathBasicLublin, { subject: 'Matematyka', level: 'Matura rozszerzona' })).toBe(false);
    });

    test('a level select matches within ONE stored level, not across two', () => {
        expect(matchesFilters(mathMixedLevels, { level: 'Matura podstawowa' })).toBe(false);
        expect(search({ level: 'Matura podstawowa' })).toEqual([mathBasicLublin]);
    });

    test('matematyka + Lublin (text field, and select + city)', () => {
        expect(search({ query: 'matematyka Lublin' })).toEqual([mathExtendedLublin, mathBasicLublin]);
        expect(search({ subject: 'Matematyka', city: 'Lublin' })).toEqual([mathExtendedLublin, mathBasicLublin]);
        expect(search({ query: 'korepetycje z matematyki w Lublinie' })).toEqual([mathExtendedLublin, mathBasicLublin]);
    });

    test('select lists + city + text field combine with AND', () => {
        expect(search({ subject: 'Matematyka', level: 'Matura rozszerzona', city: 'Lublin' })).toEqual([mathExtendedLublin]);
        expect(search({ query: 'matematyka', level: 'E8' })).toEqual([]);
        expect(search({ subject: 'Matematyka', city: 'Gdańsk' })).toEqual([]);
    });

    test('język polski – with and without Polish diacritics, text field and select', () => {
        expect(search({ query: 'język polski' })).toEqual([polishLublin]);
        expect(search({ query: 'jezyk polski' })).toEqual([polishLublin]);
        expect(search({ query: 'JĘZYK POLSKI' })).toEqual([polishLublin]);
        expect(search({ subject: 'Język Polski' })).toEqual([polishLublin]);
    });

    test('"E8" is kept as a token although it has 2 chars', () => {
        expect(tokenize('E8')).toEqual(['e8']);
        expect(search({ query: 'e8' })).toEqual([polishLublin]);
        expect(search({ level: 'E8' })).toEqual([polishLublin]);
    });

    test('older stored values still match: "Angielski" for the "Język Angielski" select, "Matura" for the text "matura"', () => {
        expect(matchesFilters(englishLublin, { subject: 'Język Angielski' })).toBe(true);
        expect(matchesFilters(mathLublin, { query: 'matura' })).toBe(true);
    });

    test('city is its own criterion: "Lublin" in the text field and in the city field give the same ads', () => {
        expect(search({ city: 'Lublin' })).toEqual(search({ query: 'Lublin' }));
        expect(search({ city: 'Lublinie' })).toEqual([mathExtendedLublin, mathBasicLublin, polishLublin, englishLublin]);
    });

    test('no criteria match everything', () => {
        expect(search({})).toEqual(ads);
    });
});

test.describe('LK-2.03 – shared lists and URL whitelist', () => {
    test('"Język Polski" is third; new levels are on the list', () => {
        expect(SUBJECTS[2]).toBe('Język Polski');
        expect(LEVELS).toEqual(expect.arrayContaining(['E8', 'Matura podstawowa', 'Matura rozszerzona']));
    });

    test('only exact list values pass', () => {
        expect(parseSubject('Matematyka')).toBe('Matematyka');
        expect(parseSubject('matematyka')).toBeUndefined();
        expect(parseSubject("Matematyka') or ('1'='1")).toBeUndefined();
        expect(parseSubject(['Matematyka'])).toBeUndefined();
        expect(parseSubject(undefined)).toBeUndefined();
        expect(parseLevel('Matura rozszerzona')).toBe('Matura rozszerzona');
        expect(parseLevel('Matura')).toBeUndefined();
        expect(parseLevel('Inne')).toBeUndefined();
    });
});
