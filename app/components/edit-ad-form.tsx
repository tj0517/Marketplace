'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateAd } from '@/actions/user/update-ad'
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
import { cn } from '@/lib/utils'
import { Database } from '@/types/supabase'

type Ad = Database['public']['Tables']['ads']['Row']

const subjects = [
    "Matematyka", "Język Angielski", "Język Niemiecki", "Język Hiszpański",
    "Fizyka", "Chemia", "Biologia", "Geografia", "Historia", "Informatyka", "Muzyka"
]

const levels = ["Szkoła Podstawowa", "Liceum / Technikum", "Studia", "Dorośli", "Inne"]

const units = [
    { value: '60 min', label: '60 min' },
    { value: '45 min', label: '45 min' },
    { value: '30 min', label: '30 min' },
]

interface EditAdFormProps {
    ad: Ad
}

export function EditAdForm({ ad }: EditAdFormProps) {
    const updateAdWithToken = updateAd.bind(null, ad.management_token!)
    const [state, action, isPending] = useActionState(updateAdWithToken, null)
    const [selectedLevels, setSelectedLevels] = useState<string[]>(ad.education_level || [])

    const toggleLevel = (level: string) => {
        setSelectedLevels(prev =>
            prev.includes(level)
                ? prev.filter(l => l !== level)
                : [...prev, level]
        )
    }

    const [remoteChecked, setRemoteChecked] = useState(ad.location?.toLowerCase().includes('zdalnie') || false)
    const [cityTextValue, setCityTextValue] = useState(ad.location?.replace(/,?\s*zdalnie/gi, '').trim() || '')

    const router = useRouter()
    const [isReloading, setIsReloading] = useState(false)

    // Full page reload after successful save to reinitialize component with fresh data
    useEffect(() => {
        if (state?.success) {
            setIsReloading(true)
            window.location.reload()
        }
    }, [state?.success])

    const placeholders = {
        offer: {
            title: "np. Korepetycje z matematyki - Tanio!",
            description: "Opisz swoje doświadczenie, metody nauczania..."
        },
        search: {
            title: "np. Szukam korepetytora z matematyki",
            description: "Opisz czego szukasz, na jakim poziomie..."
        }
    }

    const currentPlaceholders = ad.type === 'search' ? placeholders.search : placeholders.offer

    return (
        <form action={action} className="space-y-6 relative">
            {isReloading && (
                <div className="absolute -inset-1 bg-white/90 z-[100] flex flex-col items-center justify-center rounded-xl backdrop-blur-sm transition-all duration-300">
                    <Loader2 className="size-10 animate-spin text-indigo-600 mb-2" />
                    <p className="text-sm font-medium text-slate-600">Odświeżanie...</p>
                </div>
            )}
            <input type="hidden" name="type" value={ad.type} />

            {/* Basic Info */}
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Tytuł ogłoszenia</Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={ad.title}
                            placeholder={currentPlaceholders.title}
                            required
                            minLength={5}
                        />
                        {state?.errors?.title && <p className="text-sm text-red-500">{state.errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Przedmiot</Label>
                        <Select name="subject" defaultValue={ad.subject} required>
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
                        defaultValue={ad.description}
                        placeholder={currentPlaceholders.description}
                        className="min-h-[120px]"
                        required
                        minLength={20}
                    />
                    {state?.errors?.description && <p className="text-sm text-red-500">{state.errors.description}</p>}
                </div>

                {ad.type !== 'search' && (
                    <div className="space-y-2">
                        <Label>Poziom nauczania</Label>
                        <div className="flex flex-wrap gap-2">
                            {levels.map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => toggleLevel(level)}
                                    className={cn(
                                        "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                                        selectedLevels.includes(level)
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white text-slate-700 border-slate-300 hover:border-indigo-300"
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        {/* Hidden inputs for form submission */}
                        {selectedLevels.map(level => (
                            <input key={level} type="hidden" name="education_level" value={level} />
                        ))}
                        {state?.errors?.education_level && <p className="text-sm text-red-500">{state.errors.education_level}</p>}
                    </div>
                )}
            </div>

            {/* Details: Price & Location */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">Szczegóły</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {ad.type !== 'search' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="price_amount">Cena (zł)</Label>
                                <Input
                                    id="price_amount"
                                    name="price_amount"
                                    type="number"
                                    defaultValue={ad.price_amount ?? ''}
                                    placeholder="50"
                                    required
                                    min={1}
                                />
                                {state?.errors?.price_amount && <p className="text-sm text-red-500">{state.errors.price_amount}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price_unit">Jednostka czasu</Label>
                                <Select name="price_unit" defaultValue={ad.price_unit || "60 min"}>
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
                        </>
                    )}

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="location">Lokalizacja</Label>
                        <div className="flex gap-3 items-center">
                            <div className="flex-1">
                                <Input
                                    id="city_text"
                                    name="city_text"
                                    value={cityTextValue}
                                    onChange={(e) => setCityTextValue(e.target.value)}
                                    placeholder="np. Warszawa Praga"
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <Checkbox
                                    id="remote_mode"
                                    name="is_remote"
                                    checked={remoteChecked}
                                    onCheckedChange={(checked) => setRemoteChecked(checked as boolean)}
                                />
                                <Label htmlFor="remote_mode" className="cursor-pointer font-medium text-slate-700 text-sm">Zdalnie</Label>
                            </div>
                        </div>
                        {state?.errors?.location && <p className="text-sm text-red-500">{state.errors.location}</p>}
                    </div>

                    {ad.type !== 'search' && (
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="tutor_gender">Płeć (opcjonalne)</Label>
                            <Select name="tutor_gender" defaultValue={ad.tutor_gender || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Mężczyzna</SelectItem>
                                    <SelectItem value="female">Kobieta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">Kontakt</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={ad.email}
                            placeholder="twoj@email.com"
                            required
                        />
                        {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone_contact">Telefon</Label>
                        <Input
                            id="phone_contact"
                            name="phone_contact"
                            defaultValue={ad.phone_contact}
                            placeholder="123 456 789"
                            required
                            readOnly
                            className="bg-slate-50 text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500">Zmiana numeru możliwa przez kontakt z administratorem.</p>
                        {state?.errors?.phone_contact && <p className="text-sm text-red-500">{state.errors.phone_contact}</p>}
                    </div>
                </div>
            </div>

            {/* Messages */}
            {state?.message && (
                <div className={`rounded-lg p-4 ${state.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                    {state.message}
                </div>
            )}

            <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold"
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Zapisywanie...
                    </>
                ) : (
                    'Zapisz zmiany'
                )}
            </Button>
        </form>
    )
}
