'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'unknown' | 'loading';

const MAX_POLL_ATTEMPTS = 30;

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session');

    const [status, setStatus] = useState<PaymentStatus>('loading');
    const [adId, setAdId] = useState<string | null>(null);
    const pollCountRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const checkStatus = useCallback(async () => {
        if (!sessionId) return;

        try {
            const response = await fetch(`/api/payments/status/${sessionId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            setStatus(data.status);
            if (data.adId) setAdId(data.adId);

            // Stop polling if completed, failed, or max attempts reached
            if (data.status !== 'pending' || pollCountRef.current >= MAX_POLL_ATTEMPTS) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
            pollCountRef.current += 1;
        } catch (error) {
            console.error('Failed to check payment status:', error);
            setStatus('unknown');
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, [sessionId]);

    useEffect(() => {
        if (!sessionId) {
            setStatus('unknown');
            return;
        }

        // Initial check
        checkStatus();

        // Start polling
        intervalRef.current = setInterval(checkStatus, 2000);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [sessionId, checkStatus]);

    return (
        <Card className="w-full max-w-md border-0 shadow-xl">
            <CardContent className="p-8 text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="size-16 text-indigo-600 mx-auto mb-4 animate-spin" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Sprawdzanie statusu...
                        </h1>
                        <p className="text-slate-600">
                            Proszę czekać, weryfikujemy Twoją płatność.
                        </p>
                    </>
                )}

                {status === 'pending' && (
                    <>
                        <Clock className="size-16 text-amber-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Oczekiwanie na płatność
                        </h1>
                        <p className="text-slate-600 mb-6">
                            Twoja płatność jest przetwarzana. To może potrwać kilka sekund.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                            <Loader2 className="size-4 animate-spin" />
                            Sprawdzanie co 2 sekundy...
                        </div>
                    </>
                )}

                {status === 'completed' && (
                    <>
                        <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Płatność zakończona!
                        </h1>
                        <p className="text-slate-600 mb-6">
                            Dziękujemy! Twoja płatność została pomyślnie przetworzona.
                        </p>
                        <div className="space-y-3">
                            {adId && (
                                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                                    <Link href={`/offers/${adId}`}>
                                        Zobacz ogłoszenie
                                    </Link>
                                </Button>
                            )}
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/">
                                    Wróć do listy ogłoszeń
                                </Link>
                            </Button>
                        </div>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <XCircle className="size-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Płatność nieudana
                        </h1>
                        <p className="text-slate-600 mb-6">
                            Przepraszamy, wystąpił problem z płatnością. Spróbuj ponownie.
                        </p>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/offers">
                                Wróć do listy ogłoszeń
                            </Link>
                        </Button>
                    </>
                )}

                {status === 'unknown' && (
                    <>
                        <XCircle className="size-16 text-slate-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Nieznany status
                        </h1>
                        <p className="text-slate-600 mb-6">
                            Nie możemy znaleźć informacji o tej płatności.
                        </p>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/offers">
                                Wróć do listy ogłoszeń
                            </Link>
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function LoadingFallback() {
    return (
        <Card className="w-full max-w-md border-0 shadow-xl">
            <CardContent className="p-8 text-center">
                <Loader2 className="size-16 text-indigo-600 mx-auto mb-4 animate-spin" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Ładowanie...
                </h1>
            </CardContent>
        </Card>
    );
}

export default function PaymentSuccessPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Suspense fallback={<LoadingFallback />}>
                <PaymentSuccessContent />
            </Suspense>
        </main>
    );
}
