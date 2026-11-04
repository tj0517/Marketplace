-- Lokalny seed (LK-1.04). Tylko dane syntetyczne: e-maile w domenie seed.test,
-- numery telefonów z zakresu +48 000 000 0xx (nieistniejące). Żadnych danych z produkcji.
-- Ładowany przez `supabase db reset` (config.toml: [db.seed]). Nigdy nie uruchamiaj na prod.

-- Ogłoszenia: po jednym w każdym statusie ad_status.
insert into public.ads (id, type, status, management_token, email, phone_contact, title, description, subject, subjects, location, education_level, price_amount, expires_at)
values
  ('11111111-1111-4111-8111-000000000001', 'offer',  'active',   '00000000-0000-4000-8000-00000000c0de', 'active@seed.test',   '+48000000001', 'Korepetycje z matematyki', 'Przygotowanie do matury, poziom podstawowy i rozszerzony.', 'Matematyka', '{Matematyka}', 'Lublin',   '{Liceum,Matura}', 80.00, now() + interval '30 days'),
  ('11111111-1111-4111-8111-000000000002', 'offer',  'expired',  default, 'expired@seed.test',  '+48000000002', 'Angielski konwersacje',     'Konwersacje dla dorosłych i młodzieży.',                    'Angielski',  '{Angielski}',  'Kraków',   '{Dorośli}',       70.00, now() - interval '1 day'),
  ('11111111-1111-4111-8111-000000000003', 'offer',  'banned',   default, 'banned@seed.test',   '+48000000003', 'Fizyka dla licealistów',    'Zadania z fizyki krok po kroku.',                           'Fizyka',     '{Fizyka}',     'Warszawa', '{Liceum}',        90.00, now() + interval '20 days'),
  ('11111111-1111-4111-8111-000000000004', 'search', 'inactive', default, 'inactive@seed.test', '+48000000004', 'Szukam nauczyciela chemii', 'Uczeń klasy 8 szuka pomocy z chemii.',                      'Chemia',     '{Chemia}',     'Gdańsk',   '{Podstawówka}',   null,  now() + interval '30 days'),
  ('11111111-1111-4111-8111-000000000005', 'offer',  'archived', default, 'archived@seed.test', '+48000000005', 'Biologia rozszerzona',      'Materiały i powtórki przed egzaminem.',                     'Biologia',   '{Biologia}',   'Poznań',   '{Liceum,Matura}', 85.00, now() - interval '40 days'),
  ('11111111-1111-4111-8111-000000000006', 'offer',  'deleted',  default, 'deleted@seed.test',  '+48000000006', 'Historia online',           'Lekcje online z historii.',                                 'Historia',   '{Historia}',   'Online',   '{Liceum}',        60.00, now() + interval '10 days');

-- Transakcje przykładowe (po jednej w każdym statusie i typie). amount w pełnych złotych,
-- tak jak zapisuje app/api/payments/create/route.ts (Math.round(grosze / 100)).
insert into public.transactions (id, ad_id, payment_id, amount, status, type, payment_provider, payment_session_id)
values
  ('22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-000000000001', 'seed-pay-1', 10,   'completed', 'activation', 'p24', 'seed-session-1'),
  ('22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-000000000001', null,         10,   'pending',   'bump',       'p24', 'seed-session-2'),
  ('22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-000000000002', null,         10,   'failed',    'extension',  'p24', 'seed-session-3');

-- LK-2.03: ogłoszenie „po staremu” (przedmiot i poziom ze starej wersji formularza, sprzed E8/matur),
-- do sprawdzenia wyświetlania i edycji bez utraty danych. Znany token do strony zarządzania.
insert into public.ads (id, type, status, management_token, email, phone_contact, title, description, subject, subjects, location, education_level, price_amount, expires_at)
values
  ('11111111-1111-4111-8111-000000000007', 'offer', 'active', '00000000-0000-4000-8000-0000000c0de7', 'muzyka@seed.test', '+48000000007', 'Lekcje gry na pianinie', 'Nauka gry na pianinie od podstaw, teoria muzyki.', 'Muzyka', '{Muzyka}', 'Lublin', '{"Liceum / Technikum"}', 75.00, now() + interval '30 days');

-- LK-2.03: zgody marketingowe do kolumny „Zgoda” w /admin. active@seed.test → TAK (aktywna zgoda);
-- expired@seed.test → NIE (zgoda wycofana, więc nie liczy się jako aktywna).
insert into public.marketing_consents (email, status, withdrawn_at, source, content_version)
values
  ('active@seed.test',  'active',    null,  'form', 'seed'),
  ('expired@seed.test', 'withdrawn', now(), 'form', 'seed');
