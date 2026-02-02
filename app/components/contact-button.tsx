'use client';

import { useState, useEffect } from 'react';
import { Phone, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { revealContact } from '@/actions/public/reveal-contact';
import { toast } from 'sonner';

interface ContactButtonProps {
    adId: string;
    initialPhone?: string;
}

export function ContactButton({ adId, initialPhone }: ContactButtonProps) {
    const [revealed, setRevealed] = useState(false);
    const [phone, setPhone] = useState<string | null>(initialPhone || null);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
    }, []);

    const handleClick = async () => {
        setLoading(true);
        try {
            try {
                await fetch('/api/analytics/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adId }),
                });
            } catch (error) {
                console.error('Failed to track contact:', error);
            }

            let currentPhone = phone;
            if (!currentPhone) {
                const fetchedPhone = await revealContact(adId);
                if (!fetchedPhone) {
                    toast.error('Nie udało się pobrać numeru telefonu.');
                    setLoading(false);
                    return;
                }
                currentPhone = fetchedPhone;
                setPhone(currentPhone);
            }

            const currentlyMobile = /Mobi|Android/i.test(navigator.userAgent);

            if (currentlyMobile && currentPhone) {
                window.location.href = `tel:${currentPhone}`;
                setLoading(false);
            } else {
                setRevealed(true);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error in contact flow:', error);
            toast.error('Wystąpił błąd.');
            setLoading(false);
        }
    };

    if (revealed && phone) {
        return (
            <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
                <Phone className="w-4 h-4" />
                {phone}
            </a>
        );
    }

    return (
        <Button
            onClick={handleClick}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Pobieranie...
                </>
            ) : isMobile === null ? (
                <>
                    <Eye className="w-4 h-4 mr-2" />
                    Pokaż numer
                </>
            ) : isMobile ? (
                <>
                    <Phone className="w-4 h-4 mr-2" />
                    Zadzwoń / SMS
                </>
            ) : (
                <>
                    <Eye className="w-4 h-4 mr-2" />
                    Pokaż numer
                </>
            )}
        </Button>
    );
}
