import { createAdminClient } from "@/supabase/admin";
import { notFound } from "next/navigation";
import { EditAdForm } from "@/app/components/edit-ad-form";
import { Navbar } from "@/app/components/navbar";

export default async function ManageAdPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const supabase = createAdminClient();


    const { data: ad } = await supabase
        .from("ads")
        .select("*")
        .eq("management_token", token)
        .single();

    if (!ad) {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <div className="container mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-2">Edytuj ogłoszenie</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{ad.title}</p>
                </div>

                <EditAdForm ad={ad} />
            </div>
        </main>
    );
}