import { Navbar } from "@/app/components/navbar"
import { AddOfferForm } from "@/app/components/add-offer-form"

export default async function AddOfferPage({ searchParams }: {
    searchParams: Promise<{ query: string }>
}) {
    const { query: rawQuery } = await searchParams
    const type = rawQuery === 'search' ? 'search' : 'offer';

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                        {type === 'search' ? 'Znajdź korepetytora' : 'Dodaj nowe ogłoszenie'}
                    </h1>
                    <p className="text-slate-600">
                        {type === 'search'
                            ? 'Opisz czego szukasz, a korepetytorzy się z Tobą skontaktują'
                            : 'Wypełnij formularz, aby dotrzeć do tysięcy uczniów'
                        }
                    </p>
                </div>

                <AddOfferForm type={type} key={type} />
            </div>
        </main>
    )
}
