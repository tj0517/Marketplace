'use client'

import { useActionState } from 'react'
import { createAd } from '@/app/actions/create-ad'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select'
import { Loader2 } from 'lucide-react'

const subjects = [
    "Matematyka", "Język Angielski", "Język Niemiecki", "Język Hiszpański",
    "Fizyka", "Chemia", "Biologia", "Geografia", "Historia", "Informatyka", "Muzyka"
]

const levels = ["Szkoła Podstawowa", "Liceum / Technikum", "Studia", "Dorośli"]

const units = [
    { value: '60 min', label: '60 min' },
    { value: '45 min', label: '45 min' },
    { value: '30 min', label: '30 min' },
]

export function AddOfferForm() {
    const [state, action, isPending] = useActionState(createAd, null)

    return (
        <form action={action} className="space-y-8">

            {/* Basic Info */}
            <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900">
                <h2 className="text-xl font-semibold">Podstawowe informacje</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Tytuł ogłoszenia</Label>
                        <Input id="title" name="title" placeholder="np. Korepetycje z matematyki - Tanio!" required minLength={5} />
                        {state?.errors?.title && <p className="text-sm text-red-500">{state.errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Przedmiot</Label>
                        <Select name="subject" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Wybierz przedmiot" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {state?.errors?.subject && <p className="text-sm text-red-500">{state.errors.subject}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Opis</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Opisz swoje doświadczenie, metody nauczania..."
                        className="min-h-[120px]"
                        required
                        minLength={20}
                    />
                    {state?.errors?.description && <p className="text-sm text-red-500">{state.errors.description}</p>}
                </div>

                <div className="space-y-2">
                    <Label>Poziom nauczania</Label>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {levels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                                <Checkbox id={`level-${level}`} name="education_level" value={level} />
                                <Label htmlFor={`level-${level}`} className="text-sm font-normal">{level}</Label>
                            </div>
                        ))}
                    </div>
                    {state?.errors?.education_level && <p className="text-sm text-red-500">{state.errors.education_level}</p>}
                </div>
            </div>

            {/* Details: Price & Location */}
            <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900">
                <h2 className="text-xl font-semibold">Szczegóły</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="price_amount">Cena (zł)</Label>
                        <Input id="price_amount" name="price_amount" type="number" placeholder="50" required min={1} />
                        {state?.errors?.price_amount && <p className="text-sm text-red-500">{state.errors.price_amount}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price_unit">Jednostka czasu</Label>
                        <Select name="price_unit" defaultValue="60 min">
                            <SelectTrigger>
                                <SelectValue placeholder="Wybierz jednostkę" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map(u => (
                                    <SelectItem key={u.value} value={u.value}>{u.value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {state?.errors?.price_unit && <p className="text-sm text-red-500">{state.errors.price_unit}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="location">Lokalizacja</Label>
                        <Input id="location" name="location" placeholder="np. Warszawa Praga / Online" required />
                        {state?.errors?.location && <p className="text-sm text-red-500">{state.errors.location}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="tutor_gender">Płeć (opcjonalne)</Label>
                        <Select name="tutor_gender">
                            <SelectTrigger>
                                <SelectValue placeholder="Wybierz" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Mężczyzna</SelectItem>
                                <SelectItem value="female">Kobieta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900">
                <h2 className="text-xl font-semibold">Kontakt</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="twoj@email.com" required />
                        {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone_contact">Telefon</Label>
                        <Input id="phone_contact" name="phone_contact" placeholder="123 456 789" required />
                        {state?.errors?.phone_contact && <p className="text-sm text-red-500">{state.errors.phone_contact}</p>}
                    </div>
                </div>
            </div>

            {state?.message && (
                <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {state.message}
                </div>
            )}

            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-6 text-lg font-semibold hover:from-indigo-700 hover:to-purple-700"
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Dodawanie...
                    </>
                ) : (
                    'Dodaj ogłoszenie'
                )}
            </Button>
        </form>
    )
}
