
import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
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

// static chart removed, computed inside component

export default function Overview() {
    const { toast } = useToast();
    const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const { user } = useAuth();
    const [testLoading, setTestLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Read default test status from localStorage (set in Settings)
    const [isTestDefault] = useState(() => (localStorage.getItem("paymentEnv") || "test") === "test");

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
        platform: "WhatsApp",
        chatId: "",
        decoderNumber: "",
        amount: 10,
        isTest: isTestDefault
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

    const computedChartData = useMemo(() => {
        // Last 7 days
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = subDays(new Date(), 6 - i);
            let dayName = format(d, "EEE", { locale: fr });
            // Capitalize first letter (lun -> Lun)
            dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
            return {
                date: d,
                name: dayName,
                total: 0
            };
        });

        recentTransactions.forEach((tx: any) => {
            if (!tx.createdAt) return;
            const txDate = new Date(tx.createdAt);
            const day = last7Days.find(d =>
                d.date.getDate() === txDate.getDate() &&
                d.date.getMonth() === txDate.getMonth() &&
                d.date.getFullYear() === txDate.getFullYear()
            );
            if (day) {
                if (tx.status === "PAID" || tx.status === "ACTIVATED") {
                    day.total += (tx.amount || 0);
                }
            }
        });

        return last7Days;
    }, [recentTransactions]);

    const isLoading = isLoadingStats || isLoadingTransactions;
    const queryClient = useQueryClient();

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
                    chatId: paymentData.chatId,
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
                chatId: "",
                decoderNumber: "",
                amount: 10,
                isTest: isTestDefault
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

    const adminDisplayName = user?.name || user?.email?.split('@')[0] || "Admin";

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Bonjour admin {adminDisplayName} 👋</h1>
                    <p className="text-muted-foreground">Voici ce qui se passe sur AliMobile aujourd'hui.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="bg-card border-border shadow-md">
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
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Bonjour admin {adminDisplayName} 👋</h1>
                    <p className="text-muted-foreground">Voici ce qui se passe sur AliMobile aujourd'hui.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 px-3 sm:px-4">
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nouveau Paiement</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] border-border bg-card">
                            <form onSubmit={handleInitiatePayment}>
                                <DialogHeader>
                                    <DialogTitle>Initier un Paiement</DialogTitle>
                                    <DialogDescription className="text-muted-foreground">
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
                                                className="bg-background border-border"
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
                                                className="bg-background border-border"
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
                                            className="bg-background border-border"
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
                                            className="bg-background border-border"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="payPlatform">Plateforme</Label>
                                            <select
                                                id="payPlatform"
                                                value={paymentData.platform}
                                                onChange={(e) => setPaymentData({ ...paymentData, platform: e.target.value })}
                                                className="bg-background border border-border text-sm rounded-md px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-red-600/20"
                                                required
                                            >
                                                <option value="WhatsApp">WhatsApp</option>
                                                <option value="Telegram">Telegram</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="payChatId">Chat ID (Telegram)</Label>
                                            <Input
                                                id="payChatId"
                                                value={paymentData.chatId || ''}
                                                onChange={(e) => setPaymentData({ ...paymentData, chatId: e.target.value })}
                                                placeholder="Laisser vide si WhatsApp"
                                                className="bg-background border-border"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="isTest"
                                            checked={paymentData.isTest}
                                            onChange={(e) => setPaymentData({ ...paymentData, isTest: e.target.checked })}
                                            className="w-4 h-4 rounded border-border bg-background text-red-600 focus:ring-red-600"
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
                            <Button variant="outline" className="border-green-600/20 bg-green-600/5 hover:bg-green-600/10 text-green-500 gap-2 px-3 sm:px-4">
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">Notifier</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] border-border bg-card">
                            <form onSubmit={handleTestWhatsApp}>
                                <DialogHeader>
                                    <DialogTitle>Notifier un client</DialogTitle>
                                    <DialogDescription className="text-muted-foreground">
                                        Envoyer une notification via WhatsApp (n8n).
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
                                                className="bg-background border-border"
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
                                                className="bg-background border-border"
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
                                            className="bg-background border-border"
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
                                                className="bg-background border-border"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="decoder">N° Décodeur</Label>
                                            <Input
                                                id="decoder"
                                                value={testData.decoderNumber}
                                                onChange={(e) => setTestData({ ...testData, decoderNumber: e.target.value })}
                                                className="bg-background border-border"
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
                                            className="bg-background border-border"
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={testLoading} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                        {testLoading ? "Envoi..." : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Envoyer
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.title} className="bg-card border-border shadow-md hover:shadow-lg transition-all duration-300 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                            <div className={cn("p-2 rounded-lg", card.bg)}>
                                <card.icon className={cn("w-4 h-4", card.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{card.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4 bg-card border-border shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground">Performance Récente</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] border-t border-border pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={computedChartData}>
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

                <Card className="md:col-span-3 bg-card border-border shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground">Activités Récentes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Dernières Transactions</p>
                        <div className="space-y-4">
                            {transactionsError ? (
                                <p className="text-sm text-red-400 italic">Erreur: {(transactionsError as Error).message}</p>
                            ) : !recentTransactions || recentTransactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Aucune activité récente.</p>
                            ) : (
                                recentTransactions.slice(0, 5).map((tx: any) => (
                                    <div key={tx.id || Math.random()} className="flex gap-4 items-start p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border",
                                            tx.status === 'PAID' || tx.status === 'ACTIVATED' ? "bg-green-500/10" : "bg-orange-500/10"
                                        )}>
                                            <ArrowUpRight className={cn(
                                                "w-4 h-4",
                                                tx.status === 'PAID' || tx.status === 'ACTIVATED' ? "text-green-500" : "text-orange-500"
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate font-medium text-foreground">{tx.customerName || tx.name || tx.customerPhone || tx.phone || 'Inconnu'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {tx.status === 'ACTIVATED' ? 'Abonnement activé' : tx.status === 'PAID' ? 'Paiement reçu' : 'En attente'}
                                            </p>
                                        </div>
                                        <div className="font-mono text-sm font-semibold text-foreground">${(tx.amount || 0).toFixed(2)}</div>
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
