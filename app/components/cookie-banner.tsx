'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';

const CONSENT_KEY = 'cookie_consent';

export function CookieBanner() {
    const [consent, setConsent] = useState<'accepted' | 'rejected' | null>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (stored === 'accepted') {
            setConsent('accepted');
        } else if (stored === 'rejected') {
            setConsent('rejected');
        } else {
            setShowBanner(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        setConsent('accepted');
        setShowBanner(false);
    };

    const reject = () => {
        localStorage.setItem(CONSENT_KEY, 'rejected');
        setConsent('rejected');
        setShowBanner(false);
    };

    return (
        <>
            {consent === 'accepted' && (
                <>
                    <Script
                        src="https://www.googletagmanager.com/gtag/js?id=G-XC9JGJEGBK"
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">{`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-XC9JGJEGBK');
                    `}</Script>
                </>
            )}

            {showBanner && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-xl">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <p className="text-sm text-slate-600 flex-1">
                            Używamy plików cookies do analizy ruchu (Google Analytics), aby lepiej rozumieć
                            jak korzystasz z serwisu. Więcej informacji w{' '}
                            <Link href="/polityka-prywatnosci" className="underline hover:text-slate-900">
                                Polityce Prywatności
                            </Link>.
                        </p>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={reject}
                                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Odrzuć
                            </button>
                            <button
                                onClick={accept}
                                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                            >
                                Akceptuj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
