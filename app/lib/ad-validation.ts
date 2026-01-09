import { z } from 'zod'

export const adSchema = z.object({
    title: z.string().min(5, 'Tytuł musi mieć minimum 5 znaków'),
    description: z.string().min(20, 'Opis musi mieć minimum 20 znaków'),
    subject: z.string().min(1, 'Wybierz przedmiot'),
    location: z.string().min(1, 'Podaj lokalizację'),
    education_level: z.array(z.coerce.string()).min(1, 'Wybierz przynajmniej jeden poziom'),
    price_amount: z.coerce.number().min(1, 'Podaj cenę'),
    price_unit: z.string().min(1, 'Wybierz jednostkę'),
    email: z.string().email('Nieprawidłowy adres email'),
    phone_contact: z.string().min(9, 'Podaj numer telefonu'),
    tutor_gender: z.string().optional().or(z.literal('')).nullable(),
})