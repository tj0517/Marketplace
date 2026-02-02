'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentTestContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const sessionId = searchParams.get('session');

    const [isProcessing, setIsProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSimulatePayment = async () => {
        if (!sessionId) return;

        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch('/api/payments/test-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });

            if (response.ok) {
                setCompleted(true);
                setTimeout(() => {
                    router.push(`/payment/success?session=${sessionId}`);
                }, 1500);
            } else {
                const data = await response.json();
                setError(data.error || 'Payment simulation failed');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!sessionId) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-xl font-bold text-slate-900">
                    Brak identyfikatora sesji
                </h1>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
            <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-amber-100 rounded-full mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">Tryb testowy</h1>
                <p className="text-slate-500 text-sm mt-2">
                    P24 nie jest skonfigurowane. Użyj tego przycisku, aby zasymulować płatność.
                </p>
            </div>

            <div className="p-4 bg-slate-100 rounded-lg text-sm mb-4">
                <p className="font-medium text-slate-700 mb-1">ID transakcji:</p>
                <code className="text-xs text-slate-600 break-all">{sessionId}</code>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            {completed ? (
                <div className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                    <span>✅</span>
                    <span>Płatność zasymulowana! Przekierowywanie...</span>
                </div>
            ) : (
                <button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
                >
                    {isProcessing ? 'Przetwarzanie...' : 'Symuluj płatność (TEST)'}
                </button>
            )}

            <p className="text-xs text-slate-500 text-center mt-4">
                Ten ekran jest widoczny tylko gdy zmienne środowiskowe P24 nie są ustawione.
            </p>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <div className="text-4xl animate-pulse mb-4">⏳</div>
            <h1 className="text-xl font-bold text-slate-900">Ładowanie...</h1>
        </div>
    );
}

export default function PaymentTestPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Suspense fallback={<LoadingFallback />}>
                <PaymentTestContent />
            </Suspense>
        </main>
    );
}
