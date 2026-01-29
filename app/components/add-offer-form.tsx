'use client'

import { useActionState, useEffect, useState } from 'react'
import { createInactiveOffer } from '@/actions/user/create-inactive-offer'
import { activateOffer } from '@/actions/user/activate-offer'
import { createInformalOffer } from '@/actions/user/create-informational-offer'
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
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function AddOfferForm({ type }: { type: 'offer' | 'search' }) {
    const [step, setStep] = useState<1 | 2>(1)

    const [tempOfferData, setTempOfferData] = useState<{
        offerId: string;
        priceInfo: { amount: number; label: string; description: string };
        phoneExists: boolean;
    } | null>(null)

    const [searchState, searchAction, isSearching] = useActionState(createInformalOffer, null)
    const [createState, createAction, isCreating] = useActionState(createInactiveOffer, null)
    const [activateState, activateAction, isActivating] = useActionState(activateOffer, null)

    const [isRemote, setIsRemote] = useState(false)

    const [formData, setFormData] = useState({
        type,
        title: '',
        subject: '',
        description: '',
        education_level: [] as string[],
        price_amount: '',
        price_unit: '60 min',
        location: '',
        city_text: '',
        tutor_gender: '',
        email: '',
        phone_contact: ''
    })

    const updateFormData = (updater: (prev: typeof formData) => typeof formData) => {
        setFormData(prev => {
            const next = updater(prev)
            return next
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (step !== 1) return
        const { name, value } = e.target
        updateFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        if (step !== 1) return
        updateFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (value: string, checked: boolean) => {
        if (step !== 1) return
        updateFormData(prev => {
            const levels = checked
                ? [...prev.education_level, value]
                : prev.education_level.filter(l => l !== value)
            return { ...prev, education_level: levels }
        })
    }

    useEffect(() => {
        if (createState?.success && createState?.offerId && createState?.priceInfo) {
            setTempOfferData({
                offerId: createState.offerId,
                priceInfo: createState.priceInfo,
                phoneExists: createState.phoneExists || false
            })
            setStep(2)
        }
    }, [createState])

    const errors = step === 1 ? (type === 'offer' ? createState?.errors : searchState?.errors) : null
    const message = step === 1 ? (type === 'offer' ? createState?.message : searchState?.message) : activateState?.message

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

    const currentPlaceholders = type === 'search' ? placeholders.search : placeholders.offer

    return (
        <form className="space-y-6" onReset={(e) => e.preventDefault()}>
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="offerId" value={tempOfferData?.offerId || ''} />
            {formData.education_level.map((level) => (
                <input key={level} type="hidden" name="education_level" value={level} />
            ))}

            {/* Step 1: Data Entry */}
            <div className={cn("space-y-6", step === 2 && "hidden")}>
                {/* Basic Info */}
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Podstawowe informacje</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Tytuł ogłoszenia</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder={currentPlaceholders.title}
                                required
                                minLength={5}
                            />
                            {errors?.title && <p className="text-sm text-red-500">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Przedmiot</Label>
                            <Select name="subject" value={formData.subject} onValueChange={(val) => handleSelectChange('subject', val)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz przedmiot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors?.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Opis</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder={currentPlaceholders.description}
                            className="min-h-[120px]"
                            required
                            minLength={20}
                        />
                        {errors?.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Poziom nauczania</Label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {levels.map((level) => (
                                <div key={level} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`level-${level}`}
                                        value={level}
                                        checked={formData.education_level.includes(level)}
                                        onCheckedChange={(checked) => handleCheckboxChange(level, checked as boolean)}
                                    />
                                    <Label htmlFor={`level-${level}`} className="text-sm font-normal">{level}</Label>
                                </div>
                            ))}
                        </div>
                        {errors?.education_level && <p className="text-sm text-red-500">{errors.education_level}</p>}
                    </div>
                </div>

                {/* Details: Price & Location */}
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Szczegóły</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {type !== 'search' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="price_amount">Cena (zł)</Label>
                                    <Input
                                        id="price_amount"
                                        name="price_amount"
                                        type="number"
                                        value={formData.price_amount}
                                        onChange={handleChange}
                                        placeholder="50"
                                        required
                                        min={1}
                                    />
                                    {errors?.price_amount && <p className="text-sm text-red-500">{errors.price_amount}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price_unit">Jednostka czasu</Label>
                                    <Select name="price_unit" value={formData.price_unit} onValueChange={(val) => handleSelectChange('price_unit', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Wybierz jednostkę" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map(u => (
                                                <SelectItem key={u.value} value={u.value}>{u.value}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors?.price_unit && <p className="text-sm text-red-500">{errors.price_unit}</p>}
                                </div>
                            </>
                        )}

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="location">Lokalizacja</Label>
                            <div className="flex gap-3 items-center">
                                <div className="flex-1">
                                    <Input
                                        id="location"
                                        name="city_text"
                                        value={formData.city_text || ''}
                                        onChange={handleChange}
                                        placeholder="np. Warszawa Praga"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                    <Checkbox
                                        id="remote_mode"
                                        checked={isRemote}
                                        onCheckedChange={(checked) => setIsRemote(checked as boolean)}
                                    />
                                    <Label htmlFor="remote_mode" className="cursor-pointer font-medium text-slate-700 text-sm">Zdalnie</Label>
                                </div>
                            </div>
                            <input type="hidden" name="location" value={(formData.city_text || '') + (isRemote ? (formData.city_text ? ', Zdalnie' : 'Zdalnie') : '')} />
                            {errors?.location && <p className="text-sm text-red-500">{errors.location}</p>}
                        </div>

                        {type !== 'search' && (
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="tutor_gender">Płeć (opcjonalne)</Label>
                                <Select name="tutor_gender" value={formData.tutor_gender} onValueChange={(val) => handleSelectChange('tutor_gender', val)}>
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
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Kontakt</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="twoj@email.com"
                                required
                            />
                            {errors?.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone_contact">Telefon</Label>
                            <Input
                                id="phone_contact"
                                name="phone_contact"
                                value={formData.phone_contact}
                                onChange={handleChange}
                                placeholder="123 456 789"
                                required
                            />
                            <p className="text-xs text-slate-500">Numer zostanie zweryfikowany w następnym kroku.</p>
                            {errors?.phone_contact && <p className="text-sm text-red-500">{errors.phone_contact}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 2: Summary & Payment Info */}
            {step === 2 && tempOfferData && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                        <div className="mb-6 flex items-center justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                            </div>
                        </div>

                        <div className="text-center space-y-2 mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Ogłoszenie utworzone</h2>
                            <p className="text-slate-600">Dokonaj aktywacji, aby stało się widoczne.</p>
                        </div>

                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{tempOfferData.priceInfo.label}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{tempOfferData.priceInfo.description}</p>

                                    {tempOfferData.phoneExists ? (
                                        <div className="flex items-center gap-2 mt-3 text-amber-600 text-sm font-medium">
                                            <AlertCircle className="h-4 w-4" />
                                            Znaleziono aktywny numer w bazie
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-3 text-emerald-600 text-sm font-medium">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Nowy numer - stawka promocyjna
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-900">
                                        {tempOfferData.priceInfo.amount.toFixed(2)} zł
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <input type="hidden" name="offerId" value={tempOfferData.offerId} />

                            {activateState?.message && (
                                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
                                    {activateState.message}
                                </div>
                            )}

                            <Button
                                formAction={activateAction}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold"
                                disabled={isActivating}
                            >
                                {isActivating ? (
                                    <>
                                        <Loader2 className="mr-2 size-5 animate-spin" />
                                        Aktywowanie...
                                    </>
                                ) : (
                                    'Potwierdź i Aktywuj'
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="mt-3 w-full text-sm text-slate-500 hover:text-slate-700"
                                disabled={isActivating}
                            >
                                Wróć do edycji
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {message && !step && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
                    {message}
                </div>
            )}

            {step === 1 && (
                type === 'offer' ? (
                    <Button
                        formAction={createAction}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold"
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="mr-2 size-5 animate-spin" />
                                Tworzenie...
                            </>
                        ) : (
                            'Dalej'
                        )}
                    </Button>
                ) : (
                    <Button
                        formAction={searchAction}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold"
                        disabled={isSearching}
                    >
                        {isSearching ? (
                            <>
                                <Loader2 className="mr-2 size-5 animate-spin" />
                                Tworzenie...
                            </>
                        ) : (
                            'Dodaj ogłoszenie'
                        )}
                    </Button>
                )
            )}
        </form>
    )
}
