
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
    Send
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

export default function Overview() {
    const { toast } = useToast();
    const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [testData, setTestData] = useState({
        phone: "243",
        name: "Gérard Test"
    });

    const { data: stats, isLoading } = useQuery({
        queryKey: ["stats"],
        queryFn: () => apiFetch("/admin/stats"),
        refetchInterval: 30000, // Refresh every 30s
    });

    const handleTestWhatsApp = async (e: React.FormEvent) => {
        e.preventDefault();
        setTestLoading(true);
        try {
            await apiFetch("/admin/test-whatsapp", {
                method: "POST",
                body: JSON.stringify(testData)
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
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Numéro de téléphone</Label>
                                        <Input
                                            id="phone"
                                            value={testData.phone}
                                            onChange={(e) => setTestData({ ...testData, phone: e.target.value })}
                                            placeholder="243XXXXXXXXX"
                                            className="bg-white/5 border-white/10 focus:border-green-500/50 focus:ring-green-500/20"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nom</Label>
                                        <Input
                                            id="name"
                                            value={testData.name}
                                            onChange={(e) => setTestData({ ...testData, name: e.target.value })}
                                            placeholder="Nom du client"
                                            className="bg-white/5 border-white/10 focus:border-green-500/50 focus:ring-green-500/20"
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
                    <CardContent className="h-[300px] flex items-center justify-center border-t border-white/5">
                        <div className="text-center">
                            <p className="text-gray-500 text-sm italic">Graphique de progression (Prochain sprint)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 border-white/5 bg-white/5">
                    <CardHeader>
                        <CardTitle>Activités Récentes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Aujourd'hui</p>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm">Nouvelle commande payée</p>
                                        <p className="text-xs text-gray-500">Il y a {i * 15} minutes</p>
                                    </div>
                                    <div className="ml-auto font-mono text-sm">+$24.00</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
