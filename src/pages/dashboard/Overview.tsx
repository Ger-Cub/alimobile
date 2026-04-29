
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    DollarSign,
    CheckCircle2,
    Clock,
    TrendingUp,
    ArrowUpRight,
    MessageSquare,
    Send,
    Plus,
    CreditCard
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

const chartData = [
    { name: "Lun", total: 1200 },
    { name: "Mar", total: 2100 },
    { name: "Mer", total: 1800 },
    { name: "Jeu", total: 2400 },
    { name: "Ven", total: 3200 },
    { name: "Sam", total: 2800 },
    { name: "Dim", total: 3500 },
];

export default function Overview() {
    const { toast } = useToast();
    const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [testData, setTestData] = useState({
        transactionId: "TX-TEST-001",
        customerPhone: "243",
        customerName: "Gérard Test",
        platform: "WhatsApp",
        decoderNumber: "12345678901",
        status: "ACTIVATED"
    });

    const [paymentData, setPaymentData] = useState({
        customerPhone: "243",
        customerName: "",
        platform: "Dashboard",
        decoderNumber: "",
        amount: 10,
        isTest: false
    });

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ["stats"],
        queryFn: () => apiFetch("/admin/stats"),
        refetchInterval: 30000,
    });

    const { data: recentData, isLoading: isLoadingTransactions, error: transactionsError } = useQuery({
        queryKey: ["recent-transactions"],
        queryFn: () => apiFetch("/admin/transactions"),
    });

    const recentTransactions = Array.isArray(recentData) ? recentData : (recentData?.transactions || []);

    const isLoading = isLoadingStats || isLoadingTransactions;

    const handleInitiatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentLoading(true);
        try {
            const endpoint = paymentData.isTest ? "/payment/initiate-test" : "/payment/initiate";
            const response = await apiFetch(endpoint, {
                method: "POST",
                body: JSON.stringify({
                    customerPhone: paymentData.customerPhone,
                    customerName: paymentData.customerName,
                    platform: paymentData.platform,
                    decoderNumber: paymentData.decoderNumber,
                    amount: parseFloat(paymentData.amount.toString())
                })
            });

            toast({
                title: "Succès",
                description: paymentData.isTest 
                    ? "Paiement de test initié avec succès." 
                    : `Paiement initié. URL SerdiPay: ${response.paymentUrl || 'N/A'}`,
            });
            
            if (!paymentData.isTest && response.paymentUrl) {
                window.open(response.paymentUrl, '_blank');
            }
            
            setIsPaymentDialogOpen(false);
            setPaymentData({
                customerPhone: "243",
                customerName: "",
                platform: "Dashboard",
                decoderNumber: "",
                amount: 10,
                isTest: false
            });
            // Invalider les requêtes pour rafraîchir la liste
            queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Échec de l'initiation du paiement.",
                variant: "destructive"
            });
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleTestWhatsApp = async (e: React.FormEvent) => {
        e.preventDefault();
        setTestLoading(true);
        try {
            // Transformer les données pour correspondre à la structure attendue par l'API
            const payload = {
                transactionId: testData.transactionId,
                phone: testData.customerPhone, // L'API demande 'phone' pas 'customerPhone'
                name: testData.customerName,
                platform: testData.platform,
                decoderNumber: testData.decoderNumber,
                status: testData.status
            };
            
            await apiFetch("/admin/test-whatsapp", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            toast({
                title: "Succès",
                description: "La notification de test a été envoyée.",
            });
            setIsTestDialogOpen(false);
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Échec de l'envoi de la notification.",
                variant: "destructive"
            });
        } finally {
            setTestLoading(false);
        }
    };

    const cards = [
        {
            title: "Revenus Totaux",
            value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0",
            description: "Paiements confirmés",
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Transactions",
            value: stats?.totalTransactions || 0,
            description: "Total des commandes",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Activations",
            value: stats?.activatedTransactions || 0,
            description: `${stats?.activationRate?.toFixed(1) || 0}% de conversion`,
            icon: CheckCircle2,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "En Attente",
            value: stats?.pendingTransactions || 0,
            description: "Paiements à valider",
            icon: Clock,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Bonjour, Gérard 👋</h1>
                    <p className="text-gray-400">Voici ce qui se passe sur AliMobile aujourd'hui.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-white/5 bg-white/5">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Bonjour, Gérard 👋</h1>
                    <p className="text-gray-400">Voici ce qui se passe sur AliMobile aujourd'hui.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                                <Plus className="w-4 h-4" />
                                Nouveau Paiement
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] border-white/10">
                            <form onSubmit={handleInitiatePayment}>
                                <DialogHeader>
                                    <DialogTitle>Initier un Paiement</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Créer une nouvelle transaction (Live ou Test).
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="payPhone">Téléphone Client</Label>
                                            <Input
                                                id="payPhone"
                                                value={paymentData.customerPhone}
                                                onChange={(e) => setPaymentData({ ...paymentData, customerPhone: e.target.value })}
                                                placeholder="243XXXXXXXXX"
                                                className="bg-white/5 border-white/10"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="payAmount">Montant ($)</Label>
                                            <Input
                                                id="payAmount"
                                                type="number"
                                                step="0.01"
                                                value={paymentData.amount}
                                                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                                                className="bg-white/5 border-white/10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="payName">Nom du Client</Label>
                                        <Input
                                            id="payName"
                                            value={paymentData.customerName}
                                            onChange={(e) => setPaymentData({ ...paymentData, customerName: e.target.value })}
                                            placeholder="Ex: Jean Dupont"
                                            className="bg-white/5 border-white/10"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="payDecoder">N° Décodeur</Label>
                                        <Input
                                            id="payDecoder"
                                            value={paymentData.decoderNumber}
                                            onChange={(e) => setPaymentData({ ...paymentData, decoderNumber: e.target.value })}
                                            placeholder="Ex: 1234567890"
                                            className="bg-white/5 border-white/10"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="isTest"
                                            checked={paymentData.isTest}
                                            onChange={(e) => setPaymentData({ ...paymentData, isTest: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-600"
                                        />
                                        <Label htmlFor="isTest" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Mode TEST (Simuler sans frais)
                                        </Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={paymentLoading} className="bg-red-600 hover:bg-red-700 text-white gap-2 w-full">
                                        {paymentLoading ? "Traitement..." : (
                                            <>
                                                <CreditCard className="w-4 h-4" />
                                                {paymentData.isTest ? "Initier Test" : "Initier Paiement Live"}
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-green-600/20 bg-green-600/5 hover:bg-green-600/10 text-green-500 gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Test WhatsApp
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] border-white/10">
                            <form onSubmit={handleTestWhatsApp}>
                                <DialogHeader>
                                    <DialogTitle>Tester WhatsApp</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Envoyer une notification de test via n8n.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="txId">ID Transaction</Label>
                                            <Input
                                                id="txId"
                                                value={testData.transactionId}
                                                onChange={(e) => setTestData({ ...testData, transactionId: e.target.value })}
                                                className="bg-white/5 border-white/10"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Téléphone</Label>
                                            <Input
                                                id="phone"
                                                value={testData.customerPhone}
                                                onChange={(e) => setTestData({ ...testData, customerPhone: e.target.value })}
                                                placeholder="243XXXXXXXXX"
                                                className="bg-white/5 border-white/10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nom du Client</Label>
                                        <Input
                                            id="name"
                                            value={testData.customerName}
                                            onChange={(e) => setTestData({ ...testData, customerName: e.target.value })}
                                            className="bg-white/5 border-white/10"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="platform">Plateforme</Label>
                                            <Input
                                                id="platform"
                                                value={testData.platform}
                                                onChange={(e) => setTestData({ ...testData, platform: e.target.value })}
                                                className="bg-white/5 border-white/10"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="decoder">N° Décodeur</Label>
                                            <Input
                                                id="decoder"
                                                value={testData.decoderNumber}
                                                onChange={(e) => setTestData({ ...testData, decoderNumber: e.target.value })}
                                                className="bg-white/5 border-white/10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Statut</Label>
                                        <Input
                                            id="status"
                                            value={testData.status}
                                            onChange={(e) => setTestData({ ...testData, status: e.target.value })}
                                            className="bg-white/5 border-white/10"
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={testLoading} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                        {testLoading ? "Envoi..." : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Envoyer le test
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Card className="bg-red-600/10 border-red-600/20 px-4 py-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Live System</span>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.title} className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">{card.title}</CardTitle>
                            <div className={cn("p-2 rounded-lg", card.bg)}>
                                <card.icon className={cn("w-4 h-4", card.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4 border-white/5 bg-white/5">
                    <CardHeader>
                        <CardTitle>Performance Récente</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] border-t border-white/5 pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1f2937",
                                        border: "1px solid #374151",
                                        borderRadius: "8px",
                                        color: "#fff"
                                    }}
                                    itemStyle={{ color: "#ef4444" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 border-white/5 bg-white/5">
                    <CardHeader>
                        <CardTitle>Activités Récentes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Dernières Transactions</p>
                        <div className="space-y-4">
                            {transactionsError ? (
                                <p className="text-sm text-red-400 italic">Erreur: {(transactionsError as Error).message}</p>
                            ) : !recentTransactions || recentTransactions.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">Aucune activité récente.</p>
                            ) : (
                                recentTransactions.slice(0, 5).map((tx: any) => (
                                    <div key={tx.id || Math.random()} className="flex gap-4 items-start">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                            tx.status === 'PAID' || tx.status === 'ACTIVATED' ? "bg-green-500/10" : "bg-orange-500/10"
                                        )}>
                                            <ArrowUpRight className={cn(
                                                "w-4 h-4",
                                                tx.status === 'PAID' || tx.status === 'ACTIVATED' ? "text-green-500" : "text-orange-500"
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate font-medium">{tx.customerName || tx.name || tx.customerPhone || tx.phone || 'Inconnu'}</p>
                                            <p className="text-xs text-gray-500">
                                                {tx.status === 'ACTIVATED' ? 'Abonnement activé' : tx.status === 'PAID' ? 'Paiement reçu' : 'En attente'}
                                            </p>
                                        </div>
                                        <div className="font-mono text-sm font-semibold">${(tx.amount || 0).toFixed(2)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
