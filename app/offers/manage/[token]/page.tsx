import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditAdForm } from "@/app/components/edit-ad-form";
import { Navbar } from "@/app/components/navbar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Eye, Clock, Calendar, ExternalLink, ArrowUpCircle, RefreshCcw } from "lucide-react";
import { DeleteAdButton } from "@/app/components/delete-ad-button";
import { ExtendAdButton } from "@/app/components/extend-ad-button";
import { PromoteAdButton } from "@/app/components/promote-ad-button";

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
        case 'active': return 'bg-emerald-500';
        case 'expired': return 'bg-red-500';
        case 'disabled': return 'bg-slate-500';
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

    if (!ad || ad.status === 'deleted') {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <Navbar />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
                <div className="mx-auto max-w-5xl py-5 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Panel zarządzania</h1>
                            <p className="text-slate-500 text-sm truncate max-w-md">{ad.title}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={`${getStatusColor(ad.status)} text-white border-0 px-3 py-1`}>
                                {getStatusLabel(ad.status)}
                            </Badge>
                            <Button asChild variant="outline" size="sm" className="border-slate-200">
                                <Link href={`/offers/${ad.id}`} target="_blank">
                                    <ExternalLink className="size-4 mr-2" />
                                    Podgląd
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl py-6 px-4 sm:px-6 space-y-6">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Wyświetlenia</CardTitle>
                            <Eye className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{ad.views_count || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Data utworzenia</CardTitle>
                            <Calendar className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{formatDate(ad.created_at)}</div>
                        </CardContent>
                    </Card>

                    {ad.type !== 'search' ? (
                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Wygasa</CardTitle>
                                <Clock className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{formatDate(ad.expires_at)}</div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-red-700">Zakończ poszukiwania</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DeleteAdButton token={token} />
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-slate-200">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-slate-900">Edycja treści</CardTitle>
                                <CardDescription>Możesz edytować treść, ale typ i numer telefonu są stałe.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <EditAdForm ad={ad} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {ad.type !== 'search' && (
                            <>
                                <Card className="bg-indigo-600 text-white border-0">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-white">
                                            <ArrowUpCircle className="size-5" />
                                            Promocja
                                        </CardTitle>
                                        <CardDescription className="text-indigo-100">
                                            Zwiększ widoczność ogłoszenia.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <PromoteAdButton token={token} adId={ad.id} />
                                        <p className="text-xs text-indigo-200 text-center">
                                            Ogłoszenie trafi na górę listy.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-slate-900">
                                            <RefreshCcw className="size-5" />
                                            Przedłużenie
                                        </CardTitle>
                                        <CardDescription>
                                            Wygasa {formatDate(ad.expires_at)}.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ExtendAdButton token={token} adId={ad.id} />
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-900">Podgląd</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-500 mb-1">Tytuł</p>
                                    <p className="font-medium text-slate-900">{ad.title}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-500 mb-1">Opis</p>
                                    <p className="text-sm text-slate-600 line-clamp-4">{ad.description}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-500 mb-1">Lokalizacja</p>
                                    <p className="text-sm text-slate-600">{ad.location}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {ad.type === 'offer' && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="text-red-700">Zamknij ogłoszenie</CardTitle>
                                    <CardDescription className="text-red-600/80">
                                        Nie potrzebujesz więcej zgłoszeń?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DeleteAdButton token={token} />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
