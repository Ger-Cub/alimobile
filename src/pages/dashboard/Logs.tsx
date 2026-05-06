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
        <div className="flex-col md:flex space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Logs Système</h2>
                <p className="text-muted-foreground">
                    Supervisez les journaux d'erreurs d'API et les transactions en échec (SerdiPay, n8n, etc.).
                </p>
            </div>

            <Card className="bg-[#0c0c0e] border-white/5 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-white">Journaux d'événements</CardTitle>
                    <CardDescription className="text-gray-400">
                        Dernières erreurs capturées par le backend.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/5 bg-[#0c0c0e]">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-white/5">
                                    <TableHead className="text-gray-400">Date</TableHead>
                                    <TableHead className="text-gray-400">Niveau</TableHead>
                                    <TableHead className="text-gray-400">Source</TableHead>
                                    <TableHead className="text-gray-400">Message</TableHead>
                                    <TableHead className="text-gray-400">ID Transaction</TableHead>
                                    <TableHead className="text-gray-400 text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            Aucun log trouvé.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                                            <TableCell className="text-xs whitespace-nowrap text-gray-300">
                                                {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>{getLevelBadge(log.level)}</TableCell>
                                            <TableCell className="font-mono text-xs text-gray-300">{log.source}</TableCell>
                                            <TableCell className="max-w-md truncate text-gray-300" title={log.message}>
                                                {log.message}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-gray-500">
                                                {log.transactionId || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {log.details ? (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="bg-[#0c0c0e] border-white/10 text-white sm:max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Détails de l'erreur</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="mt-4 p-4 rounded-xl bg-black border border-white/5 overflow-auto max-h-[60vh] custom-scrollbar">
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
