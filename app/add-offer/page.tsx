import { Navbar } from "@/app/components/navbar"
import { AddOfferForm } from "@/app/components/add-offer-form"

export default function AddOfferPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Dodaj nowe ogłoszenie
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Wypełnij formularz, aby dotrzeć do tysięcy uczniów
                    </p>
                </div>

                <AddOfferForm />
            </div>
        </main>
    )
}
