
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
    ArrowDownRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Overview() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["stats"],
        queryFn: () => apiFetch("/admin/stats"),
        refetchInterval: 30000, // Refresh every 30s
    });

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Bonjour, Gérard 👋</h1>
                    <p className="text-gray-400">Voici ce qui se passe sur AliMobile aujourd'hui.</p>
                </div>
                <div className="hidden sm:flex gap-3">
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

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
