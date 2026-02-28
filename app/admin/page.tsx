'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import Link from "next/link";
import { Badge } from "@/app/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { getAdminAds, updateAdStatus, deleteAd } from '@/actions/admin/ads';
import { getAdminTransactions } from '@/actions/admin/transactions';
import { getAdminStats } from '@/actions/admin/stats';
import { sendBulkEmail } from '@/actions/admin/email';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
    const [stats, setStats] = useState<any>(null);
    const [ads, setAds] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailContent, setEmailContent] = useState('');
    const [emailSegment, setEmailSegment] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [emailResult, setEmailResult] = useState<string | null>(null);

    const [adTypeFilter, setAdTypeFilter] = useState<'offer' | 'search'>('offer');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsData, adsData, txData] = await Promise.all([
                getAdminStats(),
                getAdminAds(),
                getAdminTransactions()
            ]);
            setStats(statsData);
            setAds(adsData || []);
            setTransactions(txData || []);
        } catch (err) {
            console.error('Failed to load admin data', err);
            setError('Nie udało się załadować danych. Odśwież stronę.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAdStatusChange = async (adId: string, status: 'active' | 'expired' | 'banned') => {
        setActionError(null);
        try {
            await updateAdStatus(adId, status);
            await loadData();
        } catch (err) {
            setActionError('Nie udało się zmienić statusu ogłoszenia.');
        }
    };

    const handleDeleteAd = async (adId: string, title: string) => {
        if (!window.confirm(`Czy na pewno chcesz usunąć ogłoszenie "${title}"?`)) return;
        setActionError(null);
        try {
            await deleteAd(adId);
            await loadData();
        } catch (err) {
            setActionError('Nie udało się usunąć ogłoszenia.');
        }
    };

    const handleSendEmail = async () => {
        const segmentLabels: Record<string, string> = {
            active: 'Aktywne ogłoszenia',
            expired: 'Wygasłe ogłoszenia',
            expiring_soon: 'Wygasające w ciągu 7 dni',
        };

        if (!window.confirm(`Czy na pewno chcesz wysłać e-mail do segmentu "${segmentLabels[emailSegment]}"?`)) return;

        setIsSending(true);
        setEmailResult(null);
        try {
            const result = await sendBulkEmail({
                segment: emailSegment as 'active' | 'expired' | 'expiring_soon',
                subject: emailSubject,
                content: emailContent,
            });
            setEmailResult(`✅ Wysłano ${result.sentCount} e-maili.`);
            setEmailSubject('');
            setEmailContent('');
            setEmailSegment('');
        } catch (err) {
            setEmailResult('❌ Błąd podczas wysyłania e-maili.');
        } finally {
            setIsSending(false);
        }
    };

    const filteredAds = ads.filter(ad => ad.type === adTypeFilter);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Panel Administratora</h1>
                <Button onClick={loadData} variant="outline" disabled={loading} size="sm">
                    <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Ładowanie...' : 'Odśwież'}
                </Button>
            </header>

            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                    <AlertTriangle className="size-4 shrink-0" />
                    {error}
                </div>
            )}

            {actionError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                    <AlertTriangle className="size-4 shrink-0" />
                    {actionError}
                </div>
            )}

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Przegląd</TabsTrigger>
                    <TabsTrigger value="ads">Ogłoszenia</TabsTrigger>
                    <TabsTrigger value="transactions">Transakcje</TabsTrigger>
                    <TabsTrigger value="email">Masowy e-mail</TabsTrigger>
                </TabsList>

                {/* ── OVERVIEW ── */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Wszystkie ogłoszenia</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.adsCount ?? '—'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Przychód łączny</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats?.totalRevenue != null ? `${stats.totalRevenue.toFixed(2)} PLN` : '—'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Zakończone płatności</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.successfulPaymentsCount ?? '—'}</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ── ADS ── */}
                <TabsContent value="ads">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Zarządzanie ogłoszeniami</CardTitle>
                                    <CardDescription>
                                        {filteredAds.length} ogłoszeń · typ: {adTypeFilter === 'offer' ? 'Oferuję' : 'Szukam'}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                                    <Button
                                        variant={adTypeFilter === 'offer' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setAdTypeFilter('offer')}
                                    >
                                        Oferuję
                                    </Button>
                                    <Button
                                        variant={adTypeFilter === 'search' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setAdTypeFilter('search')}
                                    >
                                        Szukam
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Tytuł</TableHead>
                                            <TableHead>E-mail</TableHead>
                                            <TableHead>Dodano</TableHead>
                                            <TableHead>Wygasa</TableHead>
                                            <TableHead>Wyświetlenia</TableHead>
                                            <TableHead>Kontakty</TableHead>
                                            <TableHead className="text-right">Akcje</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    Ładowanie...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredAds.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    Brak ogłoszeń typu „{adTypeFilter === 'offer' ? 'Oferuję' : 'Szukam'}"
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAds.map((ad) => (
                                                <TableRow key={ad.id}>
                                                    <TableCell>
                                                        <Badge variant={
                                                            ad.status === 'active' ? 'default' :
                                                                ad.status === 'banned' ? 'destructive' :
                                                                    'secondary'
                                                        }>
                                                            {ad.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium max-w-[180px] truncate">
                                                        <Link href={`/offers/${ad.id}`} className="hover:underline" target="_blank">
                                                            {ad.title || '(bez tytułu)'}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{ad.email}</TableCell>
                                                    <TableCell className="text-sm">{new Date(ad.created_at).toLocaleDateString('pl-PL')}</TableCell>
                                                    <TableCell className="text-sm">{ad.expires_at ? new Date(ad.expires_at).toLocaleDateString('pl-PL') : '—'}</TableCell>
                                                    <TableCell>{ad.views_count ?? 0}</TableCell>
                                                    <TableCell>{ad.contact_count ?? 0}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {ad.status === 'active' ? (
                                                                <Button size="sm" variant="outline" onClick={() => handleAdStatusChange(ad.id, 'banned')}>
                                                                    Zablokuj
                                                                </Button>
                                                            ) : (
                                                                <Button size="sm" variant="outline" onClick={() => handleAdStatusChange(ad.id, 'active')}>
                                                                    Aktywuj
                                                                </Button>
                                                            )}
                                                            <Button size="sm" variant="destructive" onClick={() => handleDeleteAd(ad.id, ad.title || '(bez tytułu)')}>
                                                                Usuń
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── TRANSACTIONS ── */}
                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transakcje</CardTitle>
                            <CardDescription>{transactions.length} transakcji łącznie</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Typ</TableHead>
                                            <TableHead>Ogłoszenie</TableHead>
                                            <TableHead>E-mail</TableHead>
                                            <TableHead>Kwota</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    Ładowanie...
                                                </TableCell>
                                            </TableRow>
                                        ) : transactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    Brak transakcji
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            transactions.map((tx) => (
                                                <TableRow key={tx.id}>
                                                    <TableCell className="text-sm">{new Date(tx.created_at).toLocaleDateString('pl-PL')}</TableCell>
                                                    <TableCell className="capitalize">{tx.type}</TableCell>
                                                    <TableCell className="max-w-[160px] truncate">{tx.ads?.title || '—'}</TableCell>
                                                    <TableCell className="text-sm">{tx.ads?.email || '—'}</TableCell>
                                                    <TableCell>{tx.amount.toFixed(2)} PLN</TableCell>
                                                    <TableCell>
                                                        <Badge variant={
                                                            tx.status === 'completed' ? 'default' :
                                                                tx.status === 'failed' ? 'destructive' :
                                                                    'outline'
                                                        }>
                                                            {tx.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── EMAIL ── */}
                <TabsContent value="email">
                    <Card>
                        <CardHeader>
                            <CardTitle>Masowy E-mail</CardTitle>
                            <CardDescription>Wyślij wiadomość do wybranej grupy ogłoszeniodawców.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Segment odbiorców</label>
                                <Select value={emailSegment} onValueChange={(v) => { setEmailSegment(v); setEmailResult(null); }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wybierz segment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Aktywne ogłoszenia</SelectItem>
                                        <SelectItem value="expired">Wygasłe ogłoszenia</SelectItem>
                                        <SelectItem value="expiring_soon">Wygasające w ciągu 7 dni</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Temat</label>
                                <Input
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                    placeholder="Temat wiadomości"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Treść (plain text)</label>
                                <Textarea
                                    value={emailContent}
                                    onChange={e => setEmailContent(e.target.value)}
                                    placeholder="Treść wiadomości..."
                                    rows={6}
                                />
                            </div>

                            {emailResult && (
                                <p className="text-sm font-medium">{emailResult}</p>
                            )}

                            <Button
                                onClick={handleSendEmail}
                                disabled={!emailSegment || !emailSubject || !emailContent || isSending}
                            >
                                {isSending ? 'Wysyłanie...' : 'Wyślij e-mail'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
