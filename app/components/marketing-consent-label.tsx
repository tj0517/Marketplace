import { Label } from '@/app/components/ui/label'
import { MARKETING_CONSENT } from '@/lib/marketing-consent'

// Treść zgody v2 przy checkboxie (LK-2.05). Link w etykiecie otwiera nową kartę, jak linki do regulaminu;
// kliknięcie w link nie zaznacza checkboxa (link to treść interaktywna, więc etykieta go nie przełącza).
export function MarketingConsentLabel({ htmlFor }: { htmlFor: string }) {
    return (
        <Label htmlFor={htmlFor} className="block text-sm font-normal leading-snug cursor-pointer">
            <span className="block font-semibold text-slate-900">{MARKETING_CONSENT.heading}</span>
            <span className="mt-1 block text-slate-700">
                {MARKETING_CONSENT.bodyBeforeLink}
                <a
                    href={MARKETING_CONSENT.linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                >
                    {MARKETING_CONSENT.linkText}
                </a>
                {MARKETING_CONSENT.bodyAfterLink}
            </span>
        </Label>
    )
}
