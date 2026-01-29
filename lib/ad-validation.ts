import { z } from 'zod'

export const adSchema = z.object({
    type: z.string().min(1, 'Wybierz typ ogłoszenia'),
    title: z.string().min(5, 'Tytuł musi mieć minimum 5 znaków'),
    description: z.string().min(20, 'Opis musi mieć minimum 20 znaków'),
    subject: z.string().min(1, 'Wybierz przedmiot'),
    location: z.string().min(1, 'Podaj lokalizację'),
    education_level: z.array(z.coerce.string()),
    price_amount: z.coerce.number().optional().nullable(),
    price_unit: z.string().optional().nullable(),
    email: z.string().email('Nieprawidłowy adres email'),
    phone_contact: z.string().min(9, 'Podaj numer telefonu'),
    tutor_gender: z.string().optional().or(z.literal('')).nullable(),
}).superRefine((data, ctx) => {
    if (data.type !== 'search') {
        if (!data.education_level || data.education_level.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Wybierz przynajmniej jeden poziom",
                path: ["education_level"]
            })
        }
        if (!data.price_amount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Podaj cenę",
                path: ["price_amount"]
            })
        }
        if (!data.price_unit) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Wybierz jednostkę",
                path: ["price_unit"]
            })
        }
    }
})