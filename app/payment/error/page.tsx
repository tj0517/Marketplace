'use client';

import Link from 'next/link';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';

export default function PaymentErrorPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                    <XCircle className="size-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Płatność nie powiodła się
                    </h1>
                    <p className="text-slate-600 mb-6">
                        Coś poszło nie tak podczas przetwarzania płatności.
                        Spróbuj ponownie lub skontaktuj się z nami.
                    </p>
                    <div className="space-y-3">
                        <Button
                            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                            <RefreshCw className="mr-2 size-4" />
                            Spróbuj ponownie
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/">
                                <Home className="mr-2 size-4" />
                                Strona główna
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
