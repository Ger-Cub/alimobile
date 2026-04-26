
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Search,
    Filter,
    ExternalLink,
    CheckCheck,
    Smartphone,
    MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function Transactions() {
    const queryClient = useQueryClient();

    const { data: transactions, isLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => apiFetch("/admin/transactions"),
    });

    const activateMutation = useMutation({
        mutationFn: (id: string) => apiFetch(`/admin/transactions/${id}/activate`, { method: "PATCH" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
            toast.success("Transaction activée avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur d'activation");
        }
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVATED":
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Activé</Badge>;
            case "PAID":
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Payé</Badge>;
            default:
                return <Badge variant="outline" className="text-gray-400 border-gray-400/20">Attente</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Transactions</h1>
                <p className="text-gray-400">Gérez les abonnements et paiements entrants.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Rechercher par n° décodeur ou téléphone..."
                        className="pl-10 bg-white/5 border-white/10"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="bg-white/5 border-white/10 flex-1 sm:flex-none">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtres
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 font-semibold flex-1 sm:flex-none">
                        Exporter CSV
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-gray-400">Client / Canal</TableHead>
                            <TableHead className="text-gray-400">Décodeur</TableHead>
                            <TableHead className="text-gray-400">Montant</TableHead>
                            <TableHead className="text-gray-400">Statut</TableHead>
                            <TableHead className="text-gray-400">Date</TableHead>
                            <TableHead className="text-right text-gray-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <TableRow key={i} className="border-white/5">
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : transactions?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                    Aucune transaction trouvée.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions?.map((tx: any) => (
                                <TableRow key={tx.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                                                {tx.platform === 'WhatsApp' ? <MessageSquare className="w-4 h-4 text-green-500" /> : <Smartphone className="w-4 h-4 text-blue-500" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{tx.customerPhone}</p>
                                                <p className="text-xs text-gray-500">{tx.customerName || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{tx.decoderNumber}</TableCell>
                                    <TableCell className="font-semibold">${tx.amount.toFixed(2)}</TableCell>
                                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                    <TableCell className="text-sm text-gray-400">
                                        {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {tx.status === 'PAID' ? (
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => activateMutation.mutate(tx.id)}
                                                disabled={activateMutation.isPending}
                                            >
                                                <CheckCheck className="w-4 h-4 mr-2" />
                                                Activer
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" className="text-gray-400">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
