import { createAdminClient } from "@/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditAdForm } from "@/app/components/edit-ad-form";
import { Navbar } from "@/app/components/navbar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Eye, Clock, Calendar, ExternalLink, ArrowUpCircle, RefreshCcw } from "lucide-react";
import { DeleteAdButton } from "@/app/components/delete-ad-button";

function formatDate(dateString: string | null): string {
    if (!dateString) return "Brak daty";
    return new Date(dateString).toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function getStatusColor(status: string) {
    switch (status) {
        case 'active': return 'bg-green-500 hover:bg-green-600';
        case 'expired': return 'bg-red-500 hover:bg-red-600';
        case 'disabled': return 'bg-gray-500 hover:bg-gray-600';
        default: return 'bg-slate-500';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'active': return 'Aktywne';
        case 'expired': return 'Wygasłe';
        case 'disabled': return 'Nieaktywne';
        default: return status;
    }
}

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
        <main className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
            <Navbar />

            <div className="bg-white border-b border-slate-200 sticky top-16 z-40 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto max-w-5xl py-6 px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Panel zarządzania</h1>
                            <p className="text-slate-500 text-sm truncate max-w-md">{ad.title}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={`${getStatusColor(ad.status)} text-white border-0 px-3 py-1`}>
                                {getStatusLabel(ad.status)}
                            </Badge>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/offers/${ad.id}`} target="_blank">
                                    <ExternalLink className="size-4 mr-2" />
                                    Podgląd publiczny
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Liczba wyświetleń</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ad.views_count || 0}</div>
                            <p className="text-xs text-muted-foreground">Obejrzenia oferty</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Data utworzenia</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatDate(ad.created_at)}</div>
                            <p className="text-xs text-muted-foreground">Start kampanii</p>
                        </CardContent>
                    </Card>

                    {ad.type !== 'search' ? (<Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Data wygaśnięcia</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatDate(ad.expires_at)}</div>
                            <p className="text-xs text-muted-foreground">Do tego dnia oferta jest promowana</p>
                        </CardContent>
                    </Card>)
                        :
                        (<Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-red-700 flex items-center gap-2">
                                    Zakończ poszukiwania
                                </CardTitle>
                                <CardDescription className="text-red-600/80">
                                    Jeśli zakończyłeś poszukiwania, możesz usunąć ogłoszenie.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DeleteAdButton token={token} />
                            </CardContent>
                        </Card>)
                    }
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column: Actions & Edit Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Edit Form */}
                        <Card className="border-indigo-100 shadow-md pt-0">
                            <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pt-6">
                                <CardTitle className="text-indigo-900">Edycja treści ogłoszenia</CardTitle>
                                <CardDescription>Możesz edytować treść, ale typ i numer telefonu są stałe.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <EditAdForm ad={ad} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Key Actions & Info */}
                    <div className="space-y-6">
                        {ad.type !== 'search' && (
                            <>
                                <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-0 shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ArrowUpCircle className="size-5" />
                                            Promocja oferty
                                        </CardTitle>
                                        <CardDescription className="text-indigo-100">
                                            Zwiększ widoczność swojego ogłoszenia.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-semibold" variant="secondary">
                                            Podbij ogłoszenie (19 zł)
                                        </Button>
                                        <p className="text-xs text-indigo-200 text-center">
                                            Ogłoszenie trafi na górę listy wyszukiwania.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <RefreshCcw className="size-5" />
                                            Przedłużenie
                                        </CardTitle>
                                        <CardDescription>
                                            Twoje ogłoszenie wygasa {formatDate(ad.expires_at)}.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button className="w-full" variant="outline">
                                            Przedłuż o 30 dni (29 zł)
                                        </Button>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Podgląd treści</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-500">Tytuł</p>
                                    <p className="font-medium">{ad.title}</p>
                                </div>
                                <div className="line-clamp-6">
                                    <p className="text-xs font-bold uppercase text-slate-500">Opis</p>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{ad.description}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-500">Lokalizacja</p>
                                    <p className="text-sm">{ad.location}</p>
                                </div>
                            </CardContent>
                        </Card>
                        {ad.type === 'offer' && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="text-red-700 flex items-center gap-2">
                                        Zamknij ogłoszenie
                                    </CardTitle>
                                    <CardDescription className="text-red-600/80">
                                        Nie potrzebujesz już więcej zgłoszeń?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DeleteAdButton token={token} />
                                </CardContent>
                            </Card>)}

                    </div>
                </div>
            </div>
        </main>
    );
}