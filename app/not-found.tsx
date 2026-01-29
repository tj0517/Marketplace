import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-slate-50">
            <div className="mb-6 rounded-2xl bg-slate-100 p-6">
                <FileQuestion className="h-12 w-12 text-slate-400" />
            </div>

            <h1 className="text-5xl font-bold text-indigo-600 sm:text-6xl">
                404
            </h1>

            <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
                Strona nie znaleziona
            </h2>

            <p className="mt-3 max-w-md text-slate-600">
                Przykro nam, ale strona której szukasz nie istnieje lub została przeniesiona.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/">
                    <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold sm:w-auto">
                        Wróć do strony głównej
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="outline" size="lg" className="w-full font-semibold border-slate-200 sm:w-auto">
                        Przeglądaj ogłoszenia
                    </Button>
                </Link>
            </div>
        </div>
    )
}
