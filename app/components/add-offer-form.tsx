'use client'

import { useActionState, useState } from 'react'
import { createOffer } from '@/actions/user/create-offer'
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

const subjects = [
    "Matematyka", "Język Angielski", "Język Niemiecki", "Język Hiszpański",
    "Fizyka", "Chemia", "Biologia", "Geografia", "Historia", "Informatyka", "Muzyka", "Inne"
]

const levels = ["Szkoła Podstawowa", "Liceum / Technikum", "Studia", "Dorośli", "Inne"]

const units = [
    { value: '60 min', label: '60 min' },
    { value: '45 min', label: '45 min' },
    { value: '30 min', label: '30 min' },
]

export function AddOfferForm({ type }: { type: 'offer' | 'search' }) {
    const [state, formAction, isPending] = useActionState(createOffer, null)

    const [isRemote, setIsRemote] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [otherLevelText, setOtherLevelText] = useState('')
    const [customSubject, setCustomSubject] = useState('')
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

    const [formData, setFormData] = useState({
        type,
        title: '',
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
        setFormData(prev => updater(prev))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        updateFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        updateFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (value: string, checked: boolean) => {
        updateFormData(prev => {
            const levels = checked
                ? [...prev.education_level, value]
                : prev.education_level.filter(l => l !== value)
            return { ...prev, education_level: levels }
        })
    }

    const errors = state?.errors
    const message = state?.message

    const placeholders = {
        offer: {
            title: "np. Matematyka dla licealistów - Tanio!",
            description: "Opisz swoje doświadczenie, metody nauczania..."
        },
        search: {
            title: "np. Szukam korepetytora z matematyki",
            description: "Opisz czego szukasz, na jakim poziomie..."
        }
    }

    const currentPlaceholders = type === 'search' ? placeholders.search : placeholders.offer

    return (
        <form className="space-y-6" onReset={(e) => e.preventDefault()} noValidate>
            <input type="hidden" name="type" value={type} />
            {/* subjects hidden inputs */}
            {selectedSubjects.map((s) => {
                if (s === 'Inne') return null;
                return <input key={s} type="hidden" name="subjects" value={s} />;
            })}
            {selectedSubjects.includes('Inne') && customSubject.trim() && (
                <input type="hidden" name="subjects" value={customSubject.trim()} />
            )}
            {formData.education_level.map((level) => {
                if (level === 'Inne' && otherLevelText.trim()) return null;
                return (
                    <input
                        key={level}
                        type="hidden"
                        name="education_level"
                        value={level}
                    />
                );
            })}
            {otherLevelText.trim() && (
                <input
                    type="hidden"
                    name="education_level"
                    value={otherLevelText.trim()}
                />
            )}

            <div className="space-y-6">
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

                        <div className="space-y-2 md:col-span-2">
                            <Label>Przedmioty</Label>
                            <div className="flex flex-wrap gap-2">
                                {subjects.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => {
                                            setSelectedSubjects(prev =>
                                                prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                                            )
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-sm font-medium transition-all text-center",
                                            selectedSubjects.includes(s)
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-slate-700 border-slate-300 hover:border-indigo-300"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            {selectedSubjects.includes('Inne') && (
                                <Input
                                    placeholder="Wpisz nazwę przedmiotu (max 50 znaków)"
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value.slice(0, 50))}
                                    maxLength={50}
                                    className="mt-2"
                                />
                            )}
                            {errors?.subjects && <p className="text-sm text-red-500">{errors.subjects}</p>}
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
                        <div className="flex flex-wrap gap-2">
                            {levels.map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => handleCheckboxChange(level, !formData.education_level.includes(level))}
                                    className={cn(
                                        "px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-sm font-medium transition-all text-center",
                                        formData.education_level.includes(level)
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white text-slate-700 border-slate-300 hover:border-indigo-300"
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>

                        {formData.education_level.includes('Inne') && (
                            <div className="mt-3">
                                <Input
                                    placeholder="Opisz poziom (max 50 znaków)"
                                    value={otherLevelText}
                                    onChange={(e) => setOtherLevelText(e.target.value.slice(0, 50))}
                                    maxLength={50}
                                />
                                <p className="text-xs text-slate-500 mt-1">{otherLevelText.length}/50 znaków</p>
                            </div>
                        )}

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
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
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
                            {errors?.phone_contact && <p className="text-sm text-red-500">{errors.phone_contact}</p>}
                        </div>
                    </div>

                    {/* Terms acceptance */}
                    <div className="flex items-start space-x-3 pt-4 border-t border-slate-200">
                        <Checkbox
                            id="terms"
                            checked={acceptedTerms}
                            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                            required
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                                Akceptuję{' '}
                                <a href="/regulamin" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                    regulamin serwisu
                                </a>{' '}
                                oraz{' '}
                                <a href="/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                    politykę prywatności
                                </a>
                            </Label>
                        </div>
                    </div>
                </div>
            </div>

            {message && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
                    {message}
                </div>
            )}

            <Button
                formAction={formAction}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold"
                disabled={isPending || !acceptedTerms}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Tworzenie...
                    </>
                ) : (
                    'Dodaj ogłoszenie'
                )}
            </Button>
        </form>
    )
}
