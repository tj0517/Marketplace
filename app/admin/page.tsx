'use client';

import { useState, useEffect } from 'react';
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

export default function AdminPage() {
    const [stats, setStats] = useState<any>(null);
    const [ads, setAds] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailContent, setEmailContent] = useState('');
    const [emailSegment, setEmailSegment] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const [adTypeFilter, setAdTypeFilter] = useState<'offer' | 'search'>('offer');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, adsData, txData] = await Promise.all([
                getAdminStats(),
                getAdminAds(),
                getAdminTransactions()
            ]);
            setStats(statsData);
            setAds(adsData || []);
            setTransactions(txData || []);
        } catch (error) {
            console.error('Failed to load admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdStatusChange = async (adId: string, status: 'active' | 'expired' | 'banned') => {
        try {
            await updateAdStatus(adId, status);
            loadData(); // Reload to reflect changes
        } catch (error) {
        }
    };

    const handleDeleteAd = async (adId: string) => {
        if (confirm('Are you sure you want to delete this ad?')) {
            try {
                await deleteAd(adId);
                loadData();
            } catch (error) {
                console.error('[Client] handleDeleteAd failed:', error);
                alert('Failed to delete ad. Check console for details.');
            }
        }
    };

    const handleSendEmail = async () => {
        const segmentLabels: Record<string, string> = {
            active: 'Aktywne ogłoszenia',
            expired: 'Wygasłe ogłoszenia',
            expiring_soon: 'Wygasające w ciągu 7 dni',
        };

        if (!confirm(`Czy na pewno chcesz wysłać e-mail do segmentu "${segmentLabels[emailSegment]}"?`)) {
            return;
        }

        setIsSending(true);
        try {
            const result = await sendBulkEmail({
                segment: emailSegment as 'active' | 'expired' | 'expiring_soon',
                subject: emailSubject,
                content: emailContent,
            });
            alert(`Wysłano ${result.sentCount} e-maili.`);
            setEmailSubject('');
            setEmailContent('');
            setEmailSegment('');
        } catch (error) {
            alert('Błąd podczas wysyłania.');
        } finally {
            setIsSending(false);
        }
    };

    const filteredAds = ads.filter(ad => ad.type === adTypeFilter);

    return (
        <div className="container mx-auto p-6 space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <Button onClick={loadData} variant="outline" disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </Button>
            </header>

            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="ads">Ads Management</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="email">Email Center</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.adsCount ?? '-'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats?.totalRevenue ? `${(stats.totalRevenue).toFixed(2)} PLN` : '-'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.successfulPaymentsCount ?? '-'}</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="ads">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Ads Management</CardTitle>
                                    <CardDescription>Manage all ads in the system.</CardDescription>
                                </div>
                                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                                    <Button
                                        variant={adTypeFilter === 'offer' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setAdTypeFilter('offer')}
                                    >
                                        Offers (Lekcjo)
                                    </Button>
                                    <Button
                                        variant={adTypeFilter === 'search' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setAdTypeFilter('search')}
                                    >
                                        Search (Szukam)
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
                                            <TableHead>Title</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Expired</TableHead>
                                            <TableHead>Views</TableHead>
                                            <TableHead>Kontakty</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAds.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    No ads found for type: {adTypeFilter}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAds.map((ad) => (
                                                <TableRow key={ad.id}>
                                                    <TableCell>
                                                        <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                                                            {ad.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium"> <Link href={"/offers/" + ad.id}>{ad.title.slice(0, 20) + "..."}</Link></TableCell>
                                                    <TableCell>{ad.email}</TableCell>
                                                    <TableCell>{new Date(ad.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell>{ad.expires_at ? new Date(ad.expires_at).toLocaleDateString() : '-'}</TableCell>
                                                    <TableCell>{ad.views_count ?? 0}</TableCell>
                                                    <TableCell>{ad.contact_count ?? 0}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {ad.status === 'active' ? (
                                                                <Button size="sm" variant="outline" onClick={() => handleAdStatusChange(ad.id, 'banned')}>
                                                                    Disable
                                                                </Button>
                                                            ) : (
                                                                <Button size="sm" variant="outline" onClick={() => handleAdStatusChange(ad.id, 'active')}>
                                                                    Enable
                                                                </Button>
                                                            )}
                                                            <Button size="sm" variant="destructive" onClick={() => handleDeleteAd(ad.id)}>
                                                                Delete
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

                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Ad</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="capitalize">{tx.type}</TableCell>
                                                <TableCell>{tx.ads?.title || 'Unknown Ad'}</TableCell>
                                                <TableCell>{tx.ads?.email || '-'}</TableCell>
                                                <TableCell>{(tx.amount).toFixed(2)} PLN</TableCell>
                                                <TableCell>
                                                    <Badge variant={tx.status === 'completed' ? 'default' : 'outline'}>
                                                        {tx.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="email">
                    <Card>
                        <CardHeader>
                            <CardTitle>Wyślij E-mail</CardTitle>
                            <CardDescription>Wysyłka e-maili do wybranych segmentów.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Segment odbiorców</label>
                                <Select value={emailSegment} onValueChange={setEmailSegment}>
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
                                <label className="text-sm font-medium">Treść</label>
                                <Textarea
                                    value={emailContent}
                                    onChange={e => setEmailContent(e.target.value)}
                                    placeholder="Treść wiadomości..."
                                    rows={6}
                                />
                            </div>

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
