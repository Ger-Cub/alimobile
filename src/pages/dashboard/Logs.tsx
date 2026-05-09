import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ServerCrash, AlertCircle, Info, Eye } from "lucide-react";

export default function Logs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/admin/logs");
            if (Array.isArray(data)) {
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case "ERROR":
                return <Badge variant="destructive" className="flex gap-1 items-center"><ServerCrash className="w-3 h-3" /> ERROR</Badge>;
            case "WARN":
                return <Badge variant="secondary" className="bg-yellow-600 text-white hover:bg-yellow-700 flex gap-1 items-center"><AlertCircle className="w-3 h-3" /> WARN</Badge>;
            default:
                return <Badge variant="secondary" className="flex gap-1 items-center"><Info className="w-3 h-3" /> INFO</Badge>;
        }
    };

    return (
        <div className="flex-col md:flex space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Logs Système</h2>
                <p className="text-muted-foreground">
                    Supervisez les journaux d'erreurs d'API et les transactions en échec (SerdiPay, n8n, etc.).
                </p>
            </div>

            <Card className="bg-card border-border shadow-xl overflow-hidden">
                <CardHeader className="border-b border-border bg-muted/30">
                    <CardTitle className="text-foreground">Journaux d'événements</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Dernières erreurs capturées par le backend.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground">Date</TableHead>
                                    <TableHead className="text-muted-foreground">Niveau</TableHead>
                                    <TableHead className="text-muted-foreground">Source</TableHead>
                                    <TableHead className="text-muted-foreground">Message</TableHead>
                                    <TableHead className="text-muted-foreground">ID Transaction</TableHead>
                                    <TableHead className="text-muted-foreground text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20">
                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                                                <p className="text-sm text-muted-foreground">Chargement des journaux...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">
                                            Aucun log trouvé.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="border-border hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs whitespace-nowrap text-foreground">
                                                {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>{getLevelBadge(log.level)}</TableCell>
                                            <TableCell className="font-mono text-xs text-foreground">{log.source}</TableCell>
                                            <TableCell className="max-w-md truncate text-foreground" title={log.message}>
                                                {log.message}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {log.transactionId || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {log.details ? (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="bg-popover border-border text-popover-foreground sm:max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Détails de l'erreur</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="mt-4 p-4 rounded-xl bg-background border border-border overflow-auto max-h-[60vh]">
                                                                <pre className="text-xs font-mono text-red-400">
                                                                    {JSON.stringify(log.details, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
